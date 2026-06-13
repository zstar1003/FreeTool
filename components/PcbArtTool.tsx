import React, { useCallback, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
    ArtColor,
    clonePalette,
    MaterialKey,
    PCB_PALETTE_PRESETS,
    QuantizeMode,
    quantizeImageData,
    renderArtwork,
    renderBinaryMask,
} from '../utils/pcbArt';

type PreviewKey = 'artwork' | 'original' | 'copper' | 'solderMaskOpening' | 'silkscreen';

interface ProcessedResult {
    width: number;
    height: number;
    urls: Record<Exclude<PreviewKey, 'original'> | `color${number}`, string>;
    blobs: Record<Exclude<PreviewKey, 'original'> | `color${number}`, Blob>;
    distribution: number[];
}

const PREVIEW_TABS: { id: PreviewKey; label: string; icon: string }[] = [
    { id: 'artwork', label: '四色效果', icon: 'palette' },
    { id: 'original', label: '原图', icon: 'image' },
    { id: 'copper', label: '铜皮', icon: 'layers' },
    { id: 'solderMaskOpening', label: '阻焊开窗', icon: 'crop_free' },
    { id: 'silkscreen', label: '丝印', icon: 'format_paint' },
];

const MATERIALS: { key: MaterialKey; label: string; shortLabel: string }[] = [
    { key: 'copper', label: '包含铜皮', shortLabel: '铜' },
    { key: 'solderMask', label: '覆盖阻焊', shortLabel: '阻焊' },
    { key: 'silkscreen', label: '包含丝印', shortLabel: '丝印' },
];

const OUTPUT_SIZES = [
    { value: 800, label: '快速预览', hint: '最长边 800 px' },
    { value: 1400, label: '标准输出', hint: '最长边 1400 px' },
    { value: 2200, label: '精细制版', hint: '最长边 2200 px' },
    { value: 3600, label: '高精制版', hint: '最长边 3600 px' },
];

const canvasToBlob = (imageData: ImageData): Promise<Blob> =>
    new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const context = canvas.getContext('2d');

        if (!context) {
            reject(new Error('无法创建画布上下文'));
            return;
        }

        context.putImageData(imageData, 0, 0);
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('无法生成 PNG 文件'));
        }, 'image/png');
    });

const loadImage = (source: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('图片加载失败'));
        image.src = source;
    });

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

const safeFilename = (name: string) =>
    name.replace(/\.[^/.]+$/, '').replace(/[^\w\u4e00-\u9fa5-]+/g, '_') || 'pcb_art';

const PcbArtTool: React.FC = () => {
    const defaultPreset = PCB_PALETTE_PRESETS[0];
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sourceUrl, setSourceUrl] = useState('');
    const [sourceSize, setSourceSize] = useState({ width: 0, height: 0 });
    const [presetId, setPresetId] = useState(defaultPreset.id);
    const [palette, setPalette] = useState<ArtColor[]>(clonePalette(defaultPreset.colors));
    const [mode, setMode] = useState<QuantizeMode>('tone');
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(110);
    const [smoothing, setSmoothing] = useState(2);
    const [maxDimension, setMaxDimension] = useState(1400);
    const [activePreview, setActivePreview] = useState<PreviewKey>('artwork');
    const [result, setResult] = useState<ProcessedResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPackaging, setIsPackaging] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const sourceUrlRef = useRef('');
    const resultRef = useRef<ProcessedResult | null>(null);
    const jobIdRef = useRef(0);

    const clearResultUrls = useCallback((processed: ProcessedResult | null) => {
        if (!processed) return;
        Object.values(processed.urls).forEach(url => URL.revokeObjectURL(url));
    }, []);

    useEffect(() => {
        resultRef.current = result;
    }, [result]);

    useEffect(() => () => {
        if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
        clearResultUrls(resultRef.current);
    }, [clearResultUrls]);

    const setImageFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('请选择 JPG、PNG、WEBP 等图片文件');
            return;
        }

        if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
        const nextUrl = URL.createObjectURL(file);
        sourceUrlRef.current = nextUrl;
        setSelectedFile(file);
        setSourceUrl(nextUrl);
        setError('');
        setActivePreview('artwork');

        try {
            const image = await loadImage(nextUrl);
            if (sourceUrlRef.current === nextUrl) {
                setSourceSize({ width: image.naturalWidth, height: image.naturalHeight });
            }
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : '图片加载失败');
        }
    }, []);

    const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setImageFile(file);
        event.target.value = '';
    }, [setImageFile]);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const item = Array.from(event.clipboardData?.items || [])
                .find(candidate => candidate.type.startsWith('image/'));
            const file = item?.getAsFile();
            if (file) setImageFile(file);
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [setImageFile]);

    const processImage = useCallback(async () => {
        if (!sourceUrl) return;

        const currentJobId = ++jobIdRef.current;
        setIsProcessing(true);
        setError('');

        try {
            const image = await loadImage(sourceUrl);
            const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
            const width = Math.max(1, Math.round(image.naturalWidth * scale));
            const height = Math.max(1, Math.round(image.naturalHeight * scale));
            const sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = width;
            sourceCanvas.height = height;
            const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });

            if (!sourceContext) throw new Error('无法创建图片处理画布');

            sourceContext.imageSmoothingEnabled = true;
            sourceContext.imageSmoothingQuality = 'high';
            sourceContext.drawImage(image, 0, 0, width, height);

            await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
            const sourceData = sourceContext.getImageData(0, 0, width, height);
            const quantized = quantizeImageData(sourceData, palette, {
                mode,
                brightness: brightness / 100,
                contrast: contrast / 100,
                smoothing,
            });

            const blobs = {} as ProcessedResult['blobs'];
            blobs.artwork = await canvasToBlob(
                renderArtwork(quantized.labels, width, height, palette)
            );
            blobs.copper = await canvasToBlob(
                renderBinaryMask(
                    quantized.labels,
                    width,
                    height,
                    label => palette[label].recipe.copper
                )
            );
            blobs.solderMaskOpening = await canvasToBlob(
                renderBinaryMask(
                    quantized.labels,
                    width,
                    height,
                    label => !palette[label].recipe.solderMask
                )
            );
            blobs.silkscreen = await canvasToBlob(
                renderBinaryMask(
                    quantized.labels,
                    width,
                    height,
                    label => palette[label].recipe.silkscreen
                )
            );

            for (let index = 0; index < palette.length; index += 1) {
                blobs[`color${index}`] = await canvasToBlob(
                    renderBinaryMask(
                        quantized.labels,
                        width,
                        height,
                        label => label === index
                    )
                );
            }

            if (currentJobId !== jobIdRef.current) return;

            const urls = Object.fromEntries(
                Object.entries(blobs).map(([key, blob]) => [key, URL.createObjectURL(blob)])
            ) as ProcessedResult['urls'];
            const nextResult: ProcessedResult = {
                width,
                height,
                urls,
                blobs,
                distribution: quantized.distribution,
            };

            clearResultUrls(resultRef.current);
            resultRef.current = nextResult;
            setResult(nextResult);
        } catch (processingError) {
            if (currentJobId === jobIdRef.current) {
                setError(processingError instanceof Error ? processingError.message : '图片处理失败');
            }
        } finally {
            if (currentJobId === jobIdRef.current) setIsProcessing(false);
        }
    }, [
        brightness,
        clearResultUrls,
        contrast,
        maxDimension,
        mode,
        palette,
        smoothing,
        sourceUrl,
    ]);

    useEffect(() => {
        if (!sourceUrl) return;
        const timer = window.setTimeout(processImage, 220);
        return () => window.clearTimeout(timer);
    }, [processImage, sourceUrl]);

    const selectPreset = useCallback((nextPresetId: string) => {
        const preset = PCB_PALETTE_PRESETS.find(item => item.id === nextPresetId);
        if (!preset) return;
        setPresetId(preset.id);
        setPalette(clonePalette(preset.colors));
    }, []);

    const updateColor = useCallback((index: number, patch: Partial<ArtColor>) => {
        setPresetId('custom');
        setPalette(current =>
            current.map((color, colorIndex) =>
                colorIndex === index ? { ...color, ...patch } : color
            )
        );
    }, []);

    const toggleMaterial = useCallback((colorIndex: number, material: MaterialKey) => {
        setPresetId('custom');
        setPalette(current =>
            current.map((color, index) =>
                index === colorIndex
                    ? {
                        ...color,
                        recipe: {
                            ...color.recipe,
                            [material]: !color.recipe[material],
                        },
                    }
                    : color
            )
        );
    }, []);

    const resetImage = useCallback(() => {
        jobIdRef.current += 1;
        if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
        sourceUrlRef.current = '';
        clearResultUrls(resultRef.current);
        resultRef.current = null;
        setSelectedFile(null);
        setSourceUrl('');
        setSourceSize({ width: 0, height: 0 });
        setResult(null);
        setError('');
        setIsProcessing(false);
    }, [clearResultUrls]);

    const packageDownloads = useCallback(async () => {
        if (!result || !selectedFile) return;

        setIsPackaging(true);
        setError('');

        try {
            const zip = new JSZip();
            const baseName = safeFilename(selectedFile.name);
            zip.file(`${baseName}_四色预览.png`, result.blobs.artwork);

            const manufacturing = zip.folder('01_制版图');
            manufacturing?.file(`${baseName}_顶层铜皮.png`, result.blobs.copper);
            manufacturing?.file(`${baseName}_阻焊开窗.png`, result.blobs.solderMaskOpening);
            manufacturing?.file(`${baseName}_顶层丝印.png`, result.blobs.silkscreen);

            const separations = zip.folder('02_四色分离');
            palette.forEach((color, index) => {
                separations?.file(
                    `${index + 1}_${color.name.replace(/[^\w\u4e00-\u9fa5-]+/g, '_')}.png`,
                    result.blobs[`color${index}`]
                );
            });

            const recipeLines = palette.map((color, index) => {
                const layers = MATERIALS
                    .filter(material => color.recipe[material.key])
                    .map(material => material.label)
                    .join(' + ') || '仅基材';
                return `${index + 1}. ${color.name} ${color.hex}: ${layers}`;
            });

            zip.file(
                'README_制版说明.txt',
                [
                    '四色 PCB 艺术画制版包',
                    '',
                    `源文件: ${selectedFile.name}`,
                    `输出尺寸: ${result.width} x ${result.height} px`,
                    '',
                    '黑白图约定:',
                    '- 白色表示该层需要保留的铜皮、需要开窗的阻焊或需要印刷的丝印。',
                    '- 黑色表示该层不处理。',
                    '- 阻焊文件导出的是开窗图，不是阻焊覆盖图。',
                    '',
                    '四色材料配方:',
                    ...recipeLines,
                    '',
                    '送厂前请根据板厂的 Gerber 极性、最小线宽和最小间距要求再次检查。',
                ].join('\n')
            );

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 },
            });
            downloadBlob(zipBlob, `${baseName}_四色PCB艺术画.zip`);
        } catch (packagingError) {
            setError(packagingError instanceof Error ? packagingError.message : '打包失败');
        } finally {
            setIsPackaging(false);
        }
    }, [palette, result, selectedFile]);

    const previewSource = activePreview === 'original'
        ? sourceUrl
        : result?.urls[activePreview] || '';
    const baseName = selectedFile ? safeFilename(selectedFile.name) : 'pcb_art';

    return (
        <div className="flex w-full flex-col items-center px-4 py-5 sm:px-6 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:px-0 lg:py-0">
            <div className="mb-3 flex w-full max-w-6xl flex-none flex-col items-center gap-1 text-center">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    四色 PCB 艺术画
                </p>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    图片四色简化与铜皮、阻焊、丝印制版图生成
                </p>
            </div>

            {error && (
                <div className="mb-3 flex w-full max-w-6xl flex-none items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <span>{error}</span>
                </div>
            )}

            {!sourceUrl ? (
                <div className="flex w-full max-w-6xl flex-1 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-background-dark">
                    <div
                        onDragEnter={event => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragOver={event => event.preventDefault()}
                        onDragLeave={event => {
                            if (event.currentTarget === event.target) setIsDragging(false);
                        }}
                        onDrop={event => {
                            event.preventDefault();
                            setIsDragging(false);
                            const file = event.dataTransfer.files?.[0];
                            if (file) setImageFile(file);
                        }}
                        className={`m-5 flex min-h-[360px] flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 text-center transition-colors ${
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-primary dark:border-gray-700 dark:hover:border-primary'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">
                            developer_board
                        </span>
                        <div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">拖拽或粘贴图片至此</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                支持 JPG、PNG、WEBP、BMP，建议图片最长边不低于 1200 px
                            </p>
                        </div>
                        <span className="flex h-10 items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-bold text-gray-800 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                            点击选择文件
                        </span>
                    </div>
                </div>
            ) : (
                <div className="grid w-full max-w-6xl flex-1 gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-background-dark lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_350px]">
                    <section className="flex min-w-0 flex-col border-b border-gray-200 dark:border-gray-700/50 lg:min-h-0 lg:border-b-0 lg:border-r">
                        <div className="flex h-12 flex-none items-center justify-between gap-3 border-b border-gray-200 px-4 dark:border-gray-700/50">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{selectedFile?.name}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    {sourceSize.width} x {sourceSize.height}
                                    {result ? ` · 输出 ${result.width} x ${result.height}` : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetImage}
                                className="flex flex-none items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined text-base">restart_alt</span>
                                更换图片
                            </button>
                        </div>

                        <div className="grid h-10 flex-none grid-cols-5 border-b border-gray-200 bg-gray-50/50 px-2 dark:border-gray-700/50 dark:bg-gray-800/20">
                            {PREVIEW_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActivePreview(tab.id)}
                                    className={`flex min-w-0 items-center justify-center gap-1 border-b-2 px-1 text-[11px] font-medium transition-colors ${
                                        activePreview === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                                    }`}
                                >
                                    <span className="material-symbols-outlined hidden text-sm sm:inline">{tab.icon}</span>
                                    <span className="truncate">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div
                            className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden p-3 lg:min-h-0"
                            style={{
                                backgroundColor: '#f3f4f6',
                                backgroundImage:
                                    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                                backgroundSize: '18px 18px',
                                backgroundPosition: '0 0, 0 9px, 9px -9px, -9px 0',
                            }}
                        >
                            {previewSource && (
                                <img
                                    src={previewSource}
                                    alt={PREVIEW_TABS.find(tab => tab.id === activePreview)?.label}
                                    className="max-h-full max-w-full object-contain shadow-lg"
                                    style={{ imageRendering: activePreview === 'original' ? 'auto' : 'pixelated' }}
                                />
                            )}
                            {(isProcessing || !previewSource) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-gray-700 backdrop-blur-sm dark:bg-gray-900/80 dark:text-gray-200">
                                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                                    <p className="mt-2 text-xs font-medium">正在生成制版图...</p>
                                </div>
                            )}
                        </div>

                        <div className="grid h-12 flex-none grid-cols-4 border-t border-gray-200 dark:border-gray-700/50">
                            {palette.map((color, index) => (
                                <div
                                    key={color.id}
                                    className="flex min-w-0 items-center justify-center gap-2 border-r border-gray-200 px-2 last:border-r-0 dark:border-gray-700/50"
                                >
                                    <span
                                        className="h-6 w-6 flex-none rounded border border-black/10"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-[10px] font-medium text-gray-700 dark:text-gray-300">{color.name}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {result ? `${Math.round(result.distribution[index] * 100)}%` : '--'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="flex flex-col gap-3 p-3 lg:min-h-0">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                                <span className="material-symbols-outlined text-lg">tune</span>
                                分色参数
                            </h2>
                            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-white/5">
                                {[
                                    { value: 'tone' as const, label: '照片' },
                                    { value: 'color' as const, label: '插画' },
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setMode(option.value)}
                                        className={`rounded-md px-3 py-1 text-[11px] font-medium ${
                                            mode === option.value
                                                ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            {[
                                {
                                    id: 'pcb-brightness',
                                    label: '曝光',
                                    value: brightness,
                                    display: `${brightness > 0 ? '+' : ''}${brightness}`,
                                    min: -25,
                                    max: 25,
                                    onChange: setBrightness,
                                },
                                {
                                    id: 'pcb-contrast',
                                    label: '对比度',
                                    value: contrast,
                                    display: `${contrast}%`,
                                    min: 70,
                                    max: 170,
                                    onChange: setContrast,
                                },
                                {
                                    id: 'pcb-smoothing',
                                    label: '色块净化',
                                    value: smoothing,
                                    display: ['关闭', '轻净', '纯净', '极净'][smoothing],
                                    min: 0,
                                    max: 3,
                                    onChange: setSmoothing,
                                },
                            ].map(control => (
                                <div key={control.id} className="grid grid-cols-[62px_1fr_38px] items-center gap-2">
                                    <label htmlFor={control.id} className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                                        {control.label}
                                    </label>
                                    <input
                                        id={control.id}
                                        type="range"
                                        min={control.min}
                                        max={control.max}
                                        value={control.value}
                                        onChange={event => control.onChange(Number(event.target.value))}
                                        className="h-1.5 w-full cursor-pointer accent-primary"
                                    />
                                    <span className="text-right text-[10px] text-primary">{control.display}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                输出精度
                                <select
                                    aria-label="输出精度"
                                    value={maxDimension}
                                    onChange={event => setMaxDimension(Number(event.target.value))}
                                    className="mt-1 h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                >
                                    {OUTPUT_SIZES.map(size => (
                                        <option key={size.value} value={size.value}>{size.label}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                板材风格
                                <select
                                    aria-label="板材风格"
                                    value={presetId === 'custom' ? 'custom' : presetId}
                                    onChange={event => {
                                        if (event.target.value !== 'custom') selectPreset(event.target.value);
                                    }}
                                    className="mt-1 h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                >
                                    {PCB_PALETTE_PRESETS.map(preset => (
                                        <option key={preset.id} value={preset.id}>{preset.name}</option>
                                    ))}
                                    {presetId === 'custom' && <option value="custom">自定义</option>}
                                </select>
                            </label>
                        </div>

                        <div className="border-t border-gray-200 pt-3 dark:border-gray-700/50">
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                                    <span className="material-symbols-outlined text-lg">palette</span>
                                    四色材料配方
                                </h2>
                                {presetId === 'custom' && (
                                    <button
                                        type="button"
                                        onClick={() => selectPreset(defaultPreset.id)}
                                        className="text-[10px] font-medium text-primary hover:underline"
                                    >
                                        恢复默认
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {palette.map((color, index) => (
                                    <div key={color.id} className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={color.hex}
                                                onChange={event => updateColor(index, { hex: event.target.value.toUpperCase() })}
                                                className="h-7 w-7 flex-none cursor-pointer rounded border-0 bg-transparent p-0"
                                                aria-label={`修改${color.name}颜色`}
                                            />
                                            <input
                                                type="text"
                                                value={color.name}
                                                onChange={event => updateColor(index, { name: event.target.value })}
                                                className="min-w-0 flex-1 border-0 bg-transparent text-[11px] font-medium text-gray-800 outline-none dark:text-gray-200"
                                                aria-label={`修改第${index + 1}层名称`}
                                            />
                                        </div>
                                        <div className="mt-1.5 flex gap-1">
                                            {MATERIALS.map(material => {
                                                const enabled = color.recipe[material.key];
                                                return (
                                                    <button
                                                        key={material.key}
                                                        type="button"
                                                        onClick={() => toggleMaterial(index, material.key)}
                                                        className={`flex-1 rounded border px-1 py-0.5 text-[9px] font-medium ${
                                                            enabled
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-gray-200 text-gray-400 hover:border-gray-300 dark:border-gray-700'
                                                        }`}
                                                        title={material.label}
                                                    >
                                                        {material.shortLabel}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-700/50">
                            <button
                                type="button"
                                onClick={packageDownloads}
                                disabled={!result || isProcessing || isPackaging}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPackaging ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        正在打包...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">folder_zip</span>
                                        下载完整制版包
                                    </>
                                )}
                            </button>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    disabled={!result}
                                    onClick={() => result && downloadBlob(result.blobs.artwork, `${baseName}_四色预览.png`)}
                                    className="flex h-8 items-center justify-center gap-1 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined text-sm">image</span>
                                    预览图
                                </button>
                                <button
                                    type="button"
                                    disabled={!result}
                                    onClick={() => {
                                        if (!result) return;
                                        const key = activePreview === 'original' ? 'artwork' : activePreview;
                                        downloadBlob(result.blobs[key], `${baseName}_${key}.png`);
                                    }}
                                    className="flex h-8 items-center justify-center gap-1 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    当前图层
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />
        </div>
    );
};

export default PcbArtTool;
