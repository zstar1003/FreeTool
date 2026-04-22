import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { InitializationSummary, OcrResult } from '@paddleocr/paddleocr-js';

type OcrLanguage = 'ch' | 'chinese_cht' | 'en' | 'japan';
type BackendMode = 'auto' | 'wasm';
type ToolStatus = 'idle' | 'initializing' | 'ready' | 'processing';
type PreviewMode = 'original' | 'annotated';
type OcrRuntime = typeof import('@paddleocr/paddleocr-js');
type OcrVizRuntime = typeof import('@paddleocr/paddleocr-js/viz');
type OcrEngine = Awaited<ReturnType<OcrRuntime['PaddleOCR']['create']>>;

interface LanguageOption {
    value: OcrLanguage;
    label: string;
    description: string;
}

interface BackendOption {
    value: BackendMode;
    label: string;
    description: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    { value: 'ch', label: '简体中文', description: '默认推荐，适合中文海报、截图与文档' },
    { value: 'chinese_cht', label: '繁體中文', description: '适合繁体内容与传统排版文字' },
    { value: 'en', label: 'English', description: '适合英文界面、票据与说明文档' },
    { value: 'japan', label: '日本語', description: '适合日文截图、漫画与常见界面文字' },
];

const BACKEND_OPTIONS: BackendOption[] = [
    { value: 'auto', label: '自动加速', description: '优先尝试 WebGPU，不支持时自动回退到 WASM' },
    { value: 'wasm', label: '兼容模式', description: '强制使用 WASM，通常更稳定但速度略慢' },
];

const getAssetUrl = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${path}`.replace(/\/+/g, '/');
};

const FONT_URL = getAssetUrl('fonts/NotoSansSC-Regular.ttf');
const ORT_WASM_OVERRIDE = {
    wasm: getAssetUrl('ort/ort-wasm-simd-threaded.jsep.wasm'),
} as const;
const ENABLE_OCR_WORKER = false;

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;

    return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
};

const formatProviderLabel = (value?: string) => {
    if (!value) return '未初始化';
    return value.replace(/_/g, ' ').toUpperCase();
};

const formatErrorMessage = (error: unknown) => {
    if (!(error instanceof Error)) {
        return 'OCR 初始化失败，请刷新页面后重试。';
    }

    const message = error.message || 'OCR 初始化失败，请稍后重试。';

    if (message.includes('Failed to fetch')) {
        return '模型或运行时资源加载失败，请检查网络连接后重试。';
    }

    if (message.includes('HTTP') || message.includes('http')) {
        return '请通过 http(s) 方式访问页面后再使用 OCR。';
    }

    if (message.includes('WebGPU')) {
        return '当前浏览器暂时无法使用 WebGPU，请切换到“兼容模式”后重试。';
    }

    if (message.includes("previous call to 'initWasm()' failed")) {
        return 'OCR 运行时初始化失败，请刷新页面后再试一次。';
    }

    if (message.includes('no available backend found')) {
        return '当前浏览器未能完成 OCR 运行时初始化，请刷新页面或切换到“兼容模式”后重试。';
    }

    if (message.includes('OCR worker failed')) {
        return '浏览器 OCR 初始化失败，请刷新页面后重试。';
    }

    return message;
};

const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};

const loadImageElement = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片预览加载失败，请重新选择图片。'));
    image.src = src;
});

const ImageOcrTool: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [annotatedUrl, setAnnotatedUrl] = useState<string>('');
    const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
    const [language, setLanguage] = useState<OcrLanguage>('ch');
    const [backend, setBackend] = useState<BackendMode>('auto');
    const [scoreThreshold, setScoreThreshold] = useState<number>(0.3);
    const [status, setStatus] = useState<ToolStatus>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('选择图片后即可在浏览器中本地识别文字。');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('original');
    const [initSummary, setInitSummary] = useState<InitializationSummary | null>(null);
    const [engineMode, setEngineMode] = useState<'worker' | 'main-thread' | null>(null);

    const uploadInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const ocrRef = useRef<OcrEngine | null>(null);
    const ocrRuntimeRef = useRef<OcrRuntime | null>(null);
    const ocrVizRuntimeRef = useRef<OcrVizRuntime | null>(null);
    const currentConfigRef = useRef<{ language: OcrLanguage; backend: BackendMode } | null>(null);
    const mountedRef = useRef<boolean>(true);

    const recognizedText = useMemo(
        () => ocrResult?.items.map(item => item.text).join('\n') ?? '',
        [ocrResult]
    );

    const averageConfidence = useMemo(() => {
        if (!ocrResult?.items.length) return 0;
        const total = ocrResult.items.reduce((sum, item) => sum + item.score, 0);
        return total / ocrResult.items.length;
    }, [ocrResult]);

    const engineNeedsRefresh = Boolean(
        currentConfigRef.current &&
        (
            currentConfigRef.current.language !== language ||
            currentConfigRef.current.backend !== backend
        )
    );

    const disposeEngine = useCallback(async () => {
        if (!ocrRef.current) return;

        const instance = ocrRef.current;
        ocrRef.current = null;
        currentConfigRef.current = null;

        try {
            await instance.dispose();
        } catch (disposeError) {
            console.warn('Failed to dispose OCR engine:', disposeError);
        }
    }, []);

    const ensureSdkModules = useCallback(async () => {
        if (!ocrRuntimeRef.current || !ocrVizRuntimeRef.current) {
            const [ocrRuntime, ocrVizRuntime] = await Promise.all([
                import('@paddleocr/paddleocr-js'),
                import('@paddleocr/paddleocr-js/viz'),
            ]);

            ocrRuntimeRef.current = ocrRuntime;
            ocrVizRuntimeRef.current = ocrVizRuntime;
        }

        return {
            ocrRuntime: ocrRuntimeRef.current,
            ocrVizRuntime: ocrVizRuntimeRef.current,
        };
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            void disposeEngine();
        };
    }, [disposeEngine]);

    useEffect(() => () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    }, [previewUrl]);

    useEffect(() => () => {
        if (annotatedUrl) {
            URL.revokeObjectURL(annotatedUrl);
        }
    }, [annotatedUrl]);

    const resetOutput = useCallback(() => {
        setOcrResult(null);
        setAnnotatedUrl('');
        setPreviewMode('original');
        setCopied(false);
    }, []);

    const handleSelectFile = useCallback((file: File | null) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('请选择 JPG、PNG、WebP 等图片文件。');
            return;
        }

        resetOutput();
        setError(null);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setStatus(ocrRef.current ? 'ready' : 'idle');
        setStatusMessage('图片已就绪，点击“开始识别”即可本地提取文字。');
    }, [resetOutput]);

    const ensureEngine = useCallback(async () => {
        const needsNewEngine = !ocrRef.current ||
            !currentConfigRef.current ||
            currentConfigRef.current.language !== language ||
            currentConfigRef.current.backend !== backend;

        if (!needsNewEngine && ocrRef.current) {
            return ocrRef.current;
        }

        await disposeEngine();
        setInitSummary(null);
        setEngineMode(null);
        setStatus('initializing');
        setStatusMessage('正在初始化 PaddleOCR.js，首次使用会自动下载模型并缓存到浏览器。');
        setError(null);

        const { ocrRuntime } = await ensureSdkModules();

        const baseOptions = {
            lang: language,
            ocrVersion: 'PP-OCRv5' as const,
            initialize: false,
            ortOptions: {
                backend,
                numThreads: 1,
                wasmPaths: ORT_WASM_OVERRIDE as unknown as string,
            },
        };

        // PaddleOCR.js worker transport is unstable in the current Vite runtime,
        // so we keep OCR on the main thread for consistent local execution.
        const instance = await ocrRuntime.PaddleOCR.create({
            ...baseOptions,
            worker: ENABLE_OCR_WORKER,
        });

        const summary = await instance.initialize();

        if (!mountedRef.current) {
            await instance.dispose();
            throw new Error('OCR 初始化已取消。');
        }

        ocrRef.current = instance;
        currentConfigRef.current = { language, backend };
        setInitSummary(summary);
        setEngineMode(ENABLE_OCR_WORKER ? 'worker' : 'main-thread');
        setStatus('ready');
        setStatusMessage('模型已就绪，您现在可以直接开始识别。');

        return instance;
    }, [backend, disposeEngine, ensureSdkModules, language]);

    const handleRecognize = useCallback(async () => {
        if (!selectedFile || !previewUrl) {
            setError('请先上传一张图片。');
            return;
        }

        resetOutput();
        setError(null);
        setStatusMessage('正在准备识别任务...');

        try {
            const { ocrVizRuntime } = await ensureSdkModules();
            const engine = await ensureEngine();

            if (!mountedRef.current) return;

            setStatus('processing');
            setStatusMessage('正在浏览器本地识别文字，请稍候...');

            const [result] = await engine.predict(selectedFile, {
                textRecScoreThresh: Number(scoreThreshold.toFixed(2)),
            });

            const image = await loadImageElement(previewUrl);
            const annotatedBlob = await ocrVizRuntime.renderOcrToBlob(image, result, {
                font: {
                    family: 'Noto Sans SC',
                    source: FONT_URL,
                },
                outputFormat: 'png',
            });

            if (!mountedRef.current) return;

            setOcrResult(result);
            setAnnotatedUrl(URL.createObjectURL(annotatedBlob));
            setPreviewMode('annotated');
            setStatus('ready');
            setStatusMessage(
                result.items.length
                    ? '识别完成，可复制文字或下载标注结果。'
                    : '识别完成，但当前图片中未检测到明显文字。'
            );
        } catch (ocrError) {
            if (!mountedRef.current) return;

            console.error('OCR failed:', ocrError);
            setError(formatErrorMessage(ocrError));
            setStatus(ocrRef.current ? 'ready' : 'idle');
            setStatusMessage(ocrRef.current
                ? '模型仍可继续使用，您可以更换图片或调整参数后再试一次。'
                : '请选择图片后再试。'
            );
        }
    }, [ensureEngine, ensureSdkModules, previewUrl, resetOutput, scoreThreshold, selectedFile]);

    const handleCopyText = useCallback(async () => {
        if (!recognizedText) return;

        try {
            await copyText(recognizedText);
            setCopied(true);
            window.setTimeout(() => {
                if (mountedRef.current) {
                    setCopied(false);
                }
            }, 1800);
        } catch (copyError) {
            console.error('Failed to copy OCR text:', copyError);
            setError('复制失败，请手动选择文本复制。');
        }
    }, [recognizedText]);

    const handleDownloadText = useCallback(() => {
        if (!recognizedText || !selectedFile) return;

        const blob = new Blob([recognizedText], { type: 'text/plain;charset=utf-8' });
        const baseName = selectedFile.name.replace(/\.[^.]+$/, '') || 'ocr-result';
        downloadBlob(blob, `${baseName}-ocr.txt`);
    }, [recognizedText, selectedFile]);

    const handleDownloadAnnotated = useCallback(async () => {
        if (!annotatedUrl || !selectedFile) return;

        const response = await fetch(annotatedUrl);
        const blob = await response.blob();
        const baseName = selectedFile.name.replace(/\.[^.]+$/, '') || 'ocr-result';
        downloadBlob(blob, `${baseName}-ocr-preview.png`);
    }, [annotatedUrl, selectedFile]);

    const handleReset = useCallback(() => {
        resetOutput();
        setSelectedFile(null);
        setPreviewUrl('');
        setError(null);
        setStatus(ocrRef.current ? 'ready' : 'idle');
        setStatusMessage(
            ocrRef.current
                ? '模型仍已就绪，上传新图片即可继续识别。'
                : '选择图片后即可在浏览器中本地识别文字。'
        );

        if (uploadInputRef.current) {
            uploadInputRef.current.value = '';
        }

        if (replaceInputRef.current) {
            replaceInputRef.current.value = '';
        }
    }, [resetOutput]);

    const activeLanguage = LANGUAGE_OPTIONS.find(option => option.value === language);
    const activeBackend = BACKEND_OPTIONS.find(option => option.value === backend);
    const previewSource = previewMode === 'annotated' && annotatedUrl ? annotatedUrl : previewUrl;
    const runtimeLabel = ocrResult
        ? `${formatProviderLabel(ocrResult.runtime.detProvider)} / ${formatProviderLabel(ocrResult.runtime.recProvider)}`
        : initSummary
            ? `${formatProviderLabel(initSummary.detProvider)} / ${formatProviderLabel(initSummary.recProvider)}`
            : '未初始化';

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex w-full max-w-6xl flex-col items-center gap-3 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/15">
                        PaddleOCR.js
                    </span>
                    <span className="rounded-full bg-gray-900/5 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        PP-OCRv5
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        纯前端本地识别
                    </span>
                </div>
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    图片 OCR 识别
                </p>
                <p className="max-w-3xl text-base font-normal text-gray-500 dark:text-gray-400">
                    基于 PaddleOCR 官方浏览器端 SDK，在本地浏览器中完成文字检测与识别。图片内容不会上传到服务器，首次使用会下载模型并缓存到浏览器。
                </p>
            </div>

            <div className="flex w-full max-w-6xl flex-col gap-6">
                <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-white to-white p-5 shadow-sm dark:border-primary/20 dark:from-primary/15 dark:via-background-dark dark:to-background-dark">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-2xl text-primary">
                                privacy_tip
                            </span>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    浏览器本地运行，适合截图、海报、文档与界面文字提取
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    当前官方浏览器端 SDK 支持简体中文、繁体中文、英文与日文识别；首次初始化时会下载模型资源，后续会优先复用本地缓存。
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 dark:border-gray-700 dark:bg-white/5">
                                图片不上传
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 dark:border-gray-700 dark:bg-white/5">
                                支持标注预览
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 dark:border-gray-700 dark:bg-white/5">
                                可复制导出文本
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        {!selectedFile || !previewUrl ? (
                            <label
                                className="flex min-h-[420px] cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-primary dark:border-gray-700 dark:hover:border-primary"
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    handleSelectFile(event.dataTransfer.files?.[0] ?? null);
                                }}
                            >
                                <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500">
                                    upload_file
                                </span>
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        拖拽图片到这里，或点击选择文件
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        支持 JPG、PNG、WebP、GIF 等常见图片格式
                                    </p>
                                </div>
                                <span className="flex h-10 min-w-[96px] items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                                    选择图片
                                </span>
                                <input
                                    ref={uploadInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            图片预览
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedFile.name} · {formatBytes(selectedFile.size)}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                                            <span className="material-symbols-outlined text-base">sync</span>
                                            更换图片
                                            <input
                                                ref={replaceInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
                                                className="hidden"
                                            />
                                        </label>
                                        <button
                                            onClick={handleReset}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                            清空
                                        </button>
                                    </div>
                                </div>

                                {ocrResult && annotatedUrl && (
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { value: 'annotated' as PreviewMode, label: '识别标注图', icon: 'document_scanner' },
                                            { value: 'original' as PreviewMode, label: '原始图片', icon: 'image' },
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => setPreviewMode(option.value)}
                                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                    previewMode === option.value
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {option.icon}
                                                </span>
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                                    <img
                                        src={previewSource}
                                        alt="OCR preview"
                                        className="max-h-[560px] max-w-full rounded-lg object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex flex-col gap-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    识别设置
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    选择语言与运行模式后开始识别，后续同配置会复用已加载模型。
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        语言模型
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        当前：{activeLanguage?.label}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {LANGUAGE_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setLanguage(option.value)}
                                            disabled={status === 'initializing' || status === 'processing'}
                                            className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                                language === option.value
                                                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                                    : 'border-gray-200 text-gray-700 hover:border-primary/40 dark:border-gray-700 dark:text-gray-200'
                                            } disabled:cursor-not-allowed disabled:opacity-60`}
                                        >
                                            <p className="text-sm font-semibold">{option.label}</p>
                                            <p className={`mt-1 text-xs ${
                                                language === option.value
                                                    ? 'text-primary/80'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {option.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        推理模式
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        当前：{activeBackend?.label}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {BACKEND_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setBackend(option.value)}
                                            disabled={status === 'initializing' || status === 'processing'}
                                            className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                                backend === option.value
                                                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                                    : 'border-gray-200 text-gray-700 hover:border-primary/40 dark:border-gray-700 dark:text-gray-200'
                                            } disabled:cursor-not-allowed disabled:opacity-60`}
                                        >
                                            <p className="text-sm font-semibold">{option.label}</p>
                                            <p className={`mt-1 text-xs ${
                                                backend === option.value
                                                    ? 'text-primary/80'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {option.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        最低识别置信度
                                    </p>
                                    <p className="text-sm font-semibold text-primary">
                                        {Math.round(scoreThreshold * 100)}%
                                    </p>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="0.9"
                                    step="0.05"
                                    value={scoreThreshold}
                                    onChange={(event) => setScoreThreshold(Number(event.target.value))}
                                    disabled={status === 'initializing' || status === 'processing'}
                                    className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    阈值越高，过滤掉低置信度文本的力度越大。一般截图建议 30% 到 45%。
                                </p>
                            </div>

                            {engineNeedsRefresh && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                                    识别设置已变更，下次点击“开始识别”时会自动重新初始化模型。
                                </div>
                            )}

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                                <div className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined text-xl ${
                                        status === 'processing' || status === 'initializing'
                                            ? 'text-primary'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {status === 'processing' || status === 'initializing' ? 'hourglass_top' : 'info'}
                                    </span>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            运行状态
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {statusMessage}
                                        </p>
                                        {initSummary && (
                                            <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-2">
                                                <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
                                                    当前后端：{runtimeLabel}
                                                </div>
                                                <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
                                                    执行方式：{engineMode === 'worker' ? 'Worker' : engineMode === 'main-thread' ? '主线程' : '未初始化'}
                                                </div>
                                                <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
                                                    模型语言：{activeLanguage?.label}
                                                </div>
                                                <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
                                                    初始化耗时：{Math.round(initSummary.elapsedMs)} ms
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={handleRecognize}
                                    disabled={!selectedFile || status === 'initializing' || status === 'processing'}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {(status === 'initializing' || status === 'processing') && (
                                        <span className="spinner-small"></span>
                                    )}
                                    <span className="material-symbols-outlined text-base">
                                        scan_text
                                    </span>
                                    {status === 'processing'
                                        ? '识别中...'
                                        : status === 'initializing'
                                            ? '初始化中...'
                                            : '开始识别'}
                                </button>
                                <button
                                    onClick={handleCopyText}
                                    disabled={!recognizedText}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                    {copied ? '已复制' : '复制文本'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {ocrResult && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    识别结果
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    可直接复制纯文本，或下载带识别框的可视化结果图。
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={handleDownloadText}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined text-base">description</span>
                                    下载 TXT
                                </button>
                                <button
                                    onClick={handleDownloadAnnotated}
                                    disabled={!annotatedUrl}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined text-base">download</span>
                                    下载标注图
                                </button>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    识别行数
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {ocrResult.items.length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    平均置信度
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(averageConfidence * 100)}%
                                </p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    总耗时
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(ocrResult.metrics.totalMs)} ms
                                </p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    推理后端
                                </p>
                                <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                                    {runtimeLabel}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        纯文本输出
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        保留原始换行顺序
                                    </p>
                                </div>
                                <textarea
                                    value={recognizedText}
                                    readOnly
                                    className="h-80 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-100"
                                    placeholder="识别结果会显示在这里"
                                />
                            </div>

                            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        逐行识别明细
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        共 {ocrResult.items.length} 行
                                    </p>
                                </div>
                                <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
                                    {ocrResult.items.length > 0 ? ocrResult.items.map((item, index) => (
                                        <div
                                            key={`${item.text}-${index}`}
                                            className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/40"
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Line {index + 1}
                                                </span>
                                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                                    {Math.round(item.score * 100)}%
                                                </span>
                                            </div>
                                            <p className="break-words text-sm leading-6 text-gray-800 dark:text-gray-100">
                                                {item.text || '（空结果）'}
                                            </p>
                                        </div>
                                    )) : (
                                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                            当前图片未检测到可输出的文字内容。
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageOcrTool;
