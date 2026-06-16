import React, { useCallback, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
    MaterialKey,
    PCB_ART_COLORS,
    quantizeImageData,
    renderArtwork,
    renderBinaryMask,
    renderSeparationArtwork,
} from '../utils/pcbArt';

type PreviewKey =
    | 'artwork'
    | 'original'
    | 'copper'
    | 'solderMaskOpening'
    | 'backSolderMaskOpening'
    | 'silkscreen';
type GeneratedKey = Exclude<PreviewKey, 'original'> | 'separation' | `color${number}`;

interface ProcessedResult {
    width: number;
    height: number;
    urls: Record<GeneratedKey, string>;
    blobs: Record<GeneratedKey, Blob>;
    distribution: number[];
}

const PREVIEW_TABS: { id: PreviewKey; label: string; icon: string }[] = [
    { id: 'artwork', label: '板材效果', icon: 'developer_board' },
    { id: 'original', label: '原图', icon: 'image' },
    { id: 'copper', label: '铜皮', icon: 'layers' },
    { id: 'solderMaskOpening', label: '正面开窗', icon: 'crop_free' },
    { id: 'backSolderMaskOpening', label: '背面开窗', icon: 'flip' },
    { id: 'silkscreen', label: '丝印', icon: 'format_paint' },
];

const MATERIALS: { key: MaterialKey; label: string; shortLabel: string }[] = [
    { key: 'copper', label: '正面铜皮', shortLabel: '铜' },
    { key: 'solderMask', label: '正面阻焊', shortLabel: '正阻' },
    { key: 'backSolderMask', label: '背面阻焊', shortLabel: '背阻' },
    { key: 'silkscreen', label: '白色丝印', shortLabel: '丝印' },
];

const MAX_OUTPUT_DIMENSION = 3600;

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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sourceUrl, setSourceUrl] = useState('');
    const [sourceSize, setSourceSize] = useState({ width: 0, height: 0 });
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
            const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
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
            const quantized = quantizeImageData(sourceData);

            const blobs = {} as ProcessedResult['blobs'];
            blobs.artwork = await canvasToBlob(
                renderArtwork(quantized.labels, width, height, sourceData)
            );
            blobs.separation = await canvasToBlob(
                renderSeparationArtwork(quantized.labels, width, height)
            );
            blobs.copper = await canvasToBlob(
                renderBinaryMask(
                    quantized.labels,
                    width,
                    height,
                    label => PCB_ART_COLORS[label].recipe.copper
                )
            );
            blobs.solderMaskOpening = await canvasToBlob(
                renderBinaryMask(
                    quantized.labels,
                    width,
                    height,
                    label => !PCB_ART_COLORS[label].recipe.solderMask
                )
            );
            blobs.backSolderMaskOpening = await canvasToBlob(
                renderBinaryMask(
                    quantized.labels,
                    width,
                    height,
                    label => !PCB_ART_COLORS[label].recipe.backSolderMask
                )
            );
            blobs.silkscreen = await canvasToBlob(
                renderBinaryMask(
                    quantized.labels,
                    width,
                    height,
                    label => PCB_ART_COLORS[label].recipe.silkscreen
                )
            );

            for (let index = 0; index < PCB_ART_COLORS.length; index += 1) {
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
    }, [clearResultUrls, sourceUrl]);

    useEffect(() => {
        if (!sourceUrl) return;
        const timer = window.setTimeout(processImage, 220);
        return () => window.clearTimeout(timer);
    }, [processImage, sourceUrl]);

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
            zip.file(`${baseName}_参考板效果.png`, result.blobs.artwork);
            zip.file(`${baseName}_六色分色稿.png`, result.blobs.separation);

            const manufacturing = zip.folder('01_制版图');
            manufacturing?.file(`${baseName}_顶层铜皮.png`, result.blobs.copper);
            manufacturing?.file(`${baseName}_正面阻焊开窗.png`, result.blobs.solderMaskOpening);
            manufacturing?.file(`${baseName}_背面阻焊开窗.png`, result.blobs.backSolderMaskOpening);
            manufacturing?.file(`${baseName}_顶层丝印.png`, result.blobs.silkscreen);

            const separations = zip.folder('02_六色分离');
            PCB_ART_COLORS.forEach((color, index) => {
                separations?.file(
                    `${index + 1}_${color.name.replace(/[^\w\u4e00-\u9fa5-]+/g, '_')}.png`,
                    result.blobs[`color${index}`]
                );
            });

            const recipeLines = PCB_ART_COLORS.map((color, index) => {
                const layers = MATERIALS
                    .filter(material => color.recipe[material.key])
                    .map(material => material.label)
                    .join(' + ') || '仅基材';
                return `${index + 1}. ${color.name}（判定色 ${color.matchHex} / 成品色 ${color.displayHex}）: ${layers}`;
            });

            zip.file(
                'README_制版说明.txt',
                [
                    'PCB 艺术画制版包',
                    '',
                    `源文件: ${selectedFile.name}`,
                    `输出尺寸: ${result.width} x ${result.height} px`,
                    '',
                    '黑白图约定:',
                    '- 白色表示该层需要保留的铜皮、需要开窗的阻焊或需要印刷的丝印。',
                    '- 黑色表示该层不处理。',
                    '- 阻焊文件导出的是开窗图，不是阻焊覆盖图。',
                    '',
                    '六色材料配方:',
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
            downloadBlob(zipBlob, `${baseName}_PCB艺术画.zip`);
        } catch (packagingError) {
            setError(packagingError instanceof Error ? packagingError.message : '打包失败');
        } finally {
            setIsPackaging(false);
        }
    }, [result, selectedFile]);

    const previewSource = activePreview === 'original'
        ? sourceUrl
        : result?.urls[activePreview] || '';
    const baseName = selectedFile ? safeFilename(selectedFile.name) : 'pcb_art';

    return (
        <div className="flex w-full flex-col items-center px-4 py-5 sm:px-6 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:px-0 lg:py-0">
            <div className="mb-3 flex w-full max-w-6xl flex-none flex-col items-center gap-1 text-center">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    PCB 艺术画
                </p>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    复刻参考板的蓝色阻焊、裸铜、基材与白色丝印组合
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

                        <div className="grid h-10 flex-none grid-cols-6 border-b border-gray-200 bg-gray-50/50 px-2 dark:border-gray-700/50 dark:bg-gray-800/20">
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

                        <div
                            className="grid h-12 flex-none border-t border-gray-200 dark:border-gray-700/50"
                            style={{ gridTemplateColumns: `repeat(${PCB_ART_COLORS.length}, minmax(0, 1fr))` }}
                        >
                            {PCB_ART_COLORS.map((color, index) => (
                                <div
                                    key={color.id}
                                    className="flex min-w-0 items-center justify-center gap-2 border-r border-gray-200 px-2 last:border-r-0 dark:border-gray-700/50"
                                >
                                    <span
                                        className="h-6 w-6 flex-none rounded border border-black/10"
                                        style={{ backgroundColor: color.displayHex }}
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
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                                <span className="material-symbols-outlined text-lg">verified</span>
                                固定六色工艺
                            </h2>
                            <span className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-semibold text-primary">
                                参考板基准
                            </span>
                        </div>

                        <div className="border-t border-gray-200 pt-3 dark:border-gray-700/50">
                            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                                <span className="material-symbols-outlined text-lg">palette</span>
                                六种真实材料色
                            </h2>

                            <div className="grid grid-cols-2 gap-2">
                                {PCB_ART_COLORS.map(color => (
                                    <div key={color.id} className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-7 w-7 flex-none rounded border border-black/10"
                                                style={{ backgroundColor: color.displayHex }}
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                                                    {color.name}
                                                </p>
                                                <p className="truncate text-[9px] text-gray-400">
                                                    {color.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-1.5 flex gap-1">
                                            {MATERIALS
                                                .filter(material => color.recipe[material.key])
                                                .map(material => (
                                                    <span
                                                        key={material.key}
                                                        className="rounded border border-primary/20 bg-primary/5 px-1 py-0.5 text-[8px] font-medium text-primary"
                                                        title={material.label}
                                                    >
                                                        {material.shortLabel}
                                                    </span>
                                                ))}
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
                                    onClick={() => result && downloadBlob(result.blobs.artwork, `${baseName}_参考板效果.png`)}
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
