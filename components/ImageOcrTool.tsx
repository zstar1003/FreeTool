import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { InitializationSummary, OcrResult, PaddleOCRCreateOptions } from '@paddleocr/paddleocr-js';

type OcrLanguage = 'ch' | 'chinese_cht' | 'en' | 'japan';
type ToolStatus = 'idle' | 'initializing' | 'ready' | 'processing';
type PreviewMode = 'original' | 'annotated';
type UploadSource = 'upload' | 'replace' | 'drop' | 'paste';
type OcrRuntime = typeof import('@paddleocr/paddleocr-js');
type OcrVizRuntime = typeof import('@paddleocr/paddleocr-js/viz');
type OcrEngine = Awaited<ReturnType<OcrRuntime['PaddleOCR']['create']>>;

interface LanguageOption {
    value: OcrLanguage;
    label: string;
    description: string;
}

interface ModelDownloadTask {
    url: string;
    label: string;
    loaded: number;
    total: number | null;
    done: boolean;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    { value: 'ch', label: '简体中文', description: '适合中文海报、截图与文档' },
    { value: 'chinese_cht', label: '繁體中文', description: '适合繁体内容与传统排版文字' },
    { value: 'en', label: 'English', description: '适合英文界面、票据与说明文档' },
    { value: 'japan', label: '日本語', description: '适合日文截图、漫画与界面文字' },
];

const INITIAL_STATUS_MESSAGE = '拖拽、粘贴或点击上传图片后即可开始识别。';
const DEFAULT_SCORE_THRESHOLD = 0.3;

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

const inferModelLabel = (url: string) => {
    if (url.includes('_det')) return '检测模型';
    if (url.includes('_rec')) return '识别模型';
    return '模型资源';
};

const getRequestUrl = (input: RequestInfo | URL) => {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.href;
    return input.url;
};

const buildPastedImageFile = (file: File) => {
    const extension = file.type.split('/')[1] || 'png';
    return new File(
        [file],
        `pasted-image-${Date.now()}.${extension}`,
        {
            type: file.type,
            lastModified: Date.now(),
        }
    );
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
        return '当前浏览器暂时无法使用 WebGPU，请刷新页面后重试。';
    }

    if (message.includes("previous call to 'initWasm()' failed")) {
        return 'OCR 运行时初始化失败，请刷新页面后再试一次。';
    }

    if (message.includes('no available backend found')) {
        return '当前浏览器未能完成 OCR 运行时初始化，请刷新页面后重试。';
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
    const [status, setStatus] = useState<ToolStatus>('idle');
    const [statusMessage, setStatusMessage] = useState<string>(INITIAL_STATUS_MESSAGE);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('original');
    const [initSummary, setInitSummary] = useState<InitializationSummary | null>(null);
    const [engineMode, setEngineMode] = useState<'worker' | 'main-thread' | null>(null);
    const [downloadTasks, setDownloadTasks] = useState<ModelDownloadTask[]>([]);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);

    const uploadInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const resultTextareaRef = useRef<HTMLTextAreaElement>(null);
    const ocrRef = useRef<OcrEngine | null>(null);
    const ocrRuntimeRef = useRef<OcrRuntime | null>(null);
    const ocrVizRuntimeRef = useRef<OcrVizRuntime | null>(null);
    const currentLanguageRef = useRef<OcrLanguage | null>(null);
    const mountedRef = useRef<boolean>(true);

    const recognizedText = useMemo(
        () => ocrResult?.items.map(item => item.text).join('\n') ?? '',
        [ocrResult]
    );

    const textCharacterCount = useMemo(
        () => recognizedText.replace(/\s/g, '').length,
        [recognizedText]
    );

    const engineNeedsRefresh = Boolean(currentLanguageRef.current && currentLanguageRef.current !== language);
    const activeLanguage = LANGUAGE_OPTIONS.find(option => option.value === language);
    const previewSource = previewMode === 'annotated' && annotatedUrl ? annotatedUrl : previewUrl;
    const runtimeLabel = ocrResult
        ? `${formatProviderLabel(ocrResult.runtime.detProvider)} / ${formatProviderLabel(ocrResult.runtime.recProvider)}`
        : initSummary
            ? `${formatProviderLabel(initSummary.detProvider)} / ${formatProviderLabel(initSummary.recProvider)}`
            : '未初始化';

    const totalDownloadedBytes = useMemo(
        () => downloadTasks.reduce((sum, task) => sum + task.loaded, 0),
        [downloadTasks]
    );

    const totalDownloadBytes = useMemo(() => {
        const total = downloadTasks.reduce((sum, task) => sum + (task.total ?? 0), 0);
        return total > 0 ? total : null;
    }, [downloadTasks]);

    const allDownloadsCompleted = downloadTasks.length > 0 && downloadTasks.every(task => task.done);

    const downloadProgress = useMemo(() => {
        if (!totalDownloadBytes) return null;
        return Math.min(100, Math.round((totalDownloadedBytes / totalDownloadBytes) * 100));
    }, [totalDownloadBytes, totalDownloadedBytes]);

    const initializedAssetBytes = useMemo(
        () => initSummary?.assets.reduce((sum, asset) => sum + asset.bytes, 0) ?? 0,
        [initSummary]
    );

    const updateDownloadTask = useCallback((url: string, patch: Partial<ModelDownloadTask>) => {
        setDownloadTasks(currentTasks => {
            const taskIndex = currentTasks.findIndex(task => task.url === url);
            const existingTask = taskIndex >= 0
                ? currentTasks[taskIndex]
                : {
                    url,
                    label: inferModelLabel(url),
                    loaded: 0,
                    total: null,
                    done: false,
                };

            const nextTask = { ...existingTask, ...patch };

            if (taskIndex >= 0) {
                const nextTasks = [...currentTasks];
                nextTasks[taskIndex] = nextTask;
                return nextTasks;
            }

            return [...currentTasks, nextTask];
        });
    }, []);

    const trackedModelFetch = useCallback<typeof fetch>(async (input, init) => {
        const requestUrl = getRequestUrl(input);
        updateDownloadTask(requestUrl, {
            label: inferModelLabel(requestUrl),
            loaded: 0,
            total: null,
            done: false,
        });

        const response = await fetch(input, init);

        if (!response.ok) {
            return response;
        }

        const totalHeader = response.headers.get('content-length');
        const totalBytes = totalHeader ? Number(totalHeader) : null;
        const normalizedTotal = totalBytes && Number.isFinite(totalBytes) ? totalBytes : null;

        if (!response.body) {
            const buffer = await response.arrayBuffer();
            updateDownloadTask(requestUrl, {
                loaded: buffer.byteLength,
                total: normalizedTotal ?? buffer.byteLength,
                done: true,
            });
            return new Response(buffer, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loadedBytes = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (value) {
                chunks.push(value);
                loadedBytes += value.byteLength;
                updateDownloadTask(requestUrl, {
                    loaded: loadedBytes,
                    total: normalizedTotal,
                });
            }
        }

        const buffer = await new Blob(chunks).arrayBuffer();

        updateDownloadTask(requestUrl, {
            loaded: loadedBytes || buffer.byteLength,
            total: normalizedTotal ?? buffer.byteLength,
            done: true,
        });

        return new Response(buffer, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }, [updateDownloadTask]);

    const disposeEngine = useCallback(async () => {
        if (!ocrRef.current) return;

        const instance = ocrRef.current;
        ocrRef.current = null;
        currentLanguageRef.current = null;

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

    const handleSelectFile = useCallback((file: File | null, source: UploadSource = 'upload') => {
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
        setStatusMessage(
            source === 'paste'
                ? '已从剪贴板导入图片，点击“识别”开始处理。'
                : source === 'drop'
                    ? '图片已拖入，点击“识别”开始处理。'
                    : source === 'replace'
                        ? '图片已替换，点击“识别”重新处理。'
                        : '图片已就绪，点击“识别”开始处理。'
        );
        setIsDragActive(false);
    }, [resetOutput]);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            for (let index = 0; index < items.length; index += 1) {
                const item = items[index];

                if (!item.type.startsWith('image/')) continue;

                const file = item.getAsFile();
                if (!file) continue;

                event.preventDefault();
                handleSelectFile(buildPastedImageFile(file), 'paste');
                break;
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handleSelectFile]);

    const ensureEngine = useCallback(async () => {
        const needsNewEngine = !ocrRef.current || currentLanguageRef.current !== language;

        if (!needsNewEngine && ocrRef.current) {
            return ocrRef.current;
        }

        await disposeEngine();
        setInitSummary(null);
        setEngineMode(null);
        setDownloadTasks([]);
        setStatus('initializing');
        setStatusMessage('正在准备模型与运行时资源...');
        setError(null);

        const { ocrRuntime } = await ensureSdkModules();

        const baseOptions: PaddleOCRCreateOptions = {
            lang: language,
            ocrVersion: 'PP-OCRv5',
            initialize: false,
            fetch: trackedModelFetch,
            ortOptions: {
                backend: 'auto',
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
        currentLanguageRef.current = language;
        setInitSummary(summary);
        setEngineMode(ENABLE_OCR_WORKER ? 'worker' : 'main-thread');
        setStatus('ready');
        setStatusMessage('模型已就绪，现在可以继续识别新图片。');

        return instance;
    }, [disposeEngine, ensureSdkModules, language, trackedModelFetch]);

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
            setStatusMessage('正在识别图片中的文字，请稍候...');

            const [result] = await engine.predict(selectedFile, {
                textRecScoreThresh: DEFAULT_SCORE_THRESHOLD,
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
                    ? '识别完成，可直接复制文本或导出结果。'
                    : '识别完成，但当前图片中没有提取到明显文字。'
            );
        } catch (ocrError) {
            if (!mountedRef.current) return;

            console.error('OCR failed:', ocrError);
            setError(formatErrorMessage(ocrError));
            setStatus(ocrRef.current ? 'ready' : 'idle');
            setStatusMessage(
                ocrRef.current
                    ? '模型仍可继续使用，您可以更换图片后再试一次。'
                    : INITIAL_STATUS_MESSAGE
            );
        }
    }, [ensureEngine, ensureSdkModules, previewUrl, resetOutput, selectedFile]);

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

    const handleSelectAllText = useCallback(() => {
        if (!resultTextareaRef.current) return;
        resultTextareaRef.current.focus();
        resultTextareaRef.current.select();
    }, []);

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
        setIsDragActive(false);
        setStatus(ocrRef.current ? 'ready' : 'idle');
        setStatusMessage(
            ocrRef.current
                ? '模型仍已就绪，拖拽、粘贴或选择新图片即可继续识别。'
                : INITIAL_STATUS_MESSAGE
        );

        if (uploadInputRef.current) {
            uploadInputRef.current.value = '';
        }

        if (replaceInputRef.current) {
            replaceInputRef.current.value = '';
        }
    }, [resetOutput]);

    const uploadZoneClassName = isDragActive
        ? 'border-primary bg-primary/5 shadow-[0_0_0_6px_rgba(96,122,251,0.08)] dark:bg-primary/10'
        : 'border-gray-300 hover:border-primary dark:border-gray-700 dark:hover:border-primary';

    const statusProgressWidth = status === 'initializing'
        ? downloadProgress !== null
            ? `${Math.max(downloadProgress, 6)}%`
            : allDownloadsCompleted
                ? '100%'
                : '55%'
        : initSummary
            ? '100%'
            : '0%';

    return (
        <div className="flex w-full flex-col items-center px-4 py-3 sm:px-6 lg:px-8">
            <div className="mb-2 flex w-full max-w-6xl items-end justify-between gap-3">
                <div className="space-y-1">
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary dark:bg-primary/15">
                        PaddleOCR.js
                    </span>
                    <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                        图片 OCR 识别
                    </p>
                </div>
            </div>

            <div className="flex w-full max-w-6xl flex-col gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                    <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-lg ${
                                    status === 'initializing' || status === 'processing'
                                        ? 'text-primary'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    {status === 'initializing' || status === 'processing' ? 'hourglass_top' : 'info'}
                                </span>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    模型状态
                                </p>
                            </div>
                            <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                                {statusMessage}
                            </p>
                        </div>

                        <div className="w-full xl:max-w-[460px]">
                            <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                                <span>
                                    {status === 'initializing'
                                        ? (allDownloadsCompleted ? '模型下载完成' : '模型下载中')
                                        : initSummary
                                            ? `已加载 ${initSummary.assets.length} 个模型`
                                            : '尚未初始化'}
                                </span>
                                <span>
                                    {status === 'initializing'
                                        ? (downloadProgress !== null ? `${downloadProgress}%` : '进行中')
                                        : initSummary
                                            ? `${Math.round(initSummary.elapsedMs)} ms`
                                            : (activeLanguage?.label ?? '')}
                                </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                <div
                                    className={`h-full rounded-full bg-primary transition-all duration-300 ${
                                        status === 'initializing' && downloadProgress === null && !allDownloadsCompleted
                                            ? 'animate-pulse'
                                            : ''
                                    }`}
                                    style={{ width: statusProgressWidth }}
                                />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {status === 'initializing' && downloadTasks.length > 0
                                    ? downloadTasks.map(task => (
                                        <span
                                            key={task.url}
                                            className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5"
                                        >
                                            {task.label} {task.total ? `${formatBytes(task.loaded)} / ${formatBytes(task.total)}` : formatBytes(task.loaded)}
                                        </span>
                                    ))
                                    : initSummary && (
                                        <>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                                                {activeLanguage?.label}
                                            </span>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                                                {runtimeLabel}
                                            </span>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                                                {engineMode === 'main-thread' ? '主线程' : 'Worker'}
                                            </span>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
                                                {formatBytes(initializedAssetBytes)}
                                            </span>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.12fr)_390px]">
                    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        {!selectedFile || !previewUrl ? (
                            <label
                                className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all ${uploadZoneClassName}`}
                                onDragEnter={() => setIsDragActive(true)}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragActive(true);
                                }}
                                onDragLeave={() => setIsDragActive(false)}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    handleSelectFile(event.dataTransfer.files?.[0] ?? null, 'drop');
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
                                        支持拖拽与 Ctrl/Cmd + V 直接粘贴截图
                                    </p>
                                </div>
                                <span className="flex h-11 min-w-[104px] items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm">
                                    选择图片
                                </span>
                                <input
                                    ref={uploadInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null, 'upload')}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div
                                className={`flex flex-col gap-3 rounded-2xl transition-all ${isDragActive ? 'bg-primary/5 shadow-[0_0_0_6px_rgba(96,122,251,0.08)] dark:bg-primary/10' : ''}`}
                                onDragEnter={() => setIsDragActive(true)}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragActive(true);
                                }}
                                onDragLeave={() => setIsDragActive(false)}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    handleSelectFile(event.dataTransfer.files?.[0] ?? null, 'drop');
                                }}
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                图片预览
                                            </p>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                                                {selectedFile.name}
                                            </span>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                                                {formatBytes(selectedFile.size)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            拖拽新图片或按 Ctrl/Cmd + V，可直接替换当前内容。
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {ocrResult && annotatedUrl && (
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { value: 'annotated' as PreviewMode, label: '识别标注图', icon: 'document_scanner' },
                                                    { value: 'original' as PreviewMode, label: '原始图片', icon: 'image' },
                                                ].map(option => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setPreviewMode(option.value)}
                                                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
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

                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                                            <span className="material-symbols-outlined text-base">sync</span>
                                            更换图片
                                            <input
                                                ref={replaceInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null, 'replace')}
                                                className="hidden"
                                            />
                                        </label>
                                        <button
                                            onClick={handleReset}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                            清空
                                        </button>
                                    </div>
                                </div>

                                <div className="flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/40">
                                    <img
                                        src={previewSource}
                                        alt="OCR preview"
                                        className="max-h-[440px] max-w-full rounded-xl object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex h-full flex-col gap-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                        语言模型
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {activeLanguage?.description}
                                    </p>
                                </div>
                                <div className="relative">
                                    <select
                                        value={language}
                                        onChange={(event) => setLanguage(event.target.value as OcrLanguage)}
                                        disabled={status === 'initializing' || status === 'processing'}
                                        className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-primary dark:border-gray-700 dark:bg-background-dark dark:text-gray-100"
                                    >
                                        {LANGUAGE_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        expand_more
                                    </span>
                                </div>
                            </div>

                            {engineNeedsRefresh && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                                    语言已变更，下次点击“识别”时会自动切换模型。
                                </div>
                            )}

                            <button
                                onClick={handleRecognize}
                                disabled={!selectedFile || status === 'initializing' || status === 'processing'}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {(status === 'initializing' || status === 'processing') && (
                                    <span className="spinner-small"></span>
                                )}
                                <span className="material-symbols-outlined text-base">
                                    document_scanner
                                </span>
                                {status === 'processing'
                                    ? '识别中...'
                                    : status === 'initializing'
                                        ? '初始化模型...'
                                        : '识别'}
                            </button>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-900/40">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        行数
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                        {ocrResult?.items.length ?? '--'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-900/40">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        字符
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                        {recognizedText ? textCharacterCount : '--'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-900/40">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        耗时
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                        {ocrResult ? `${Math.round(ocrResult.metrics.totalMs)} ms` : '--'}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/5 to-white p-3 dark:border-primary/15 dark:from-primary/10 dark:to-background-dark">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            纯文本输出
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            点击文本框即可直接复制或选中内容
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={handleSelectAllText}
                                            disabled={!recognizedText}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined text-base">select_all</span>
                                            全选
                                        </button>
                                        <button
                                            onClick={handleCopyText}
                                            disabled={!recognizedText}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                            {copied ? '已复制' : '复制文本'}
                                        </button>
                                        <button
                                            onClick={handleDownloadText}
                                            disabled={!recognizedText}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined text-base">description</span>
                                            下载 TXT
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    ref={resultTextareaRef}
                                    value={recognizedText}
                                    readOnly
                                    spellCheck={false}
                                    className="h-36 w-full resize-none rounded-2xl border border-primary/20 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition-shadow focus:border-primary/40 focus:shadow-[0_0_0_4px_rgba(96,122,251,0.08)] dark:border-primary/15 dark:bg-gray-950/30 dark:text-gray-100"
                                    placeholder="识别完成后，文字会显示在这里"
                                />
                            </div>

                            <div className="rounded-2xl border border-gray-200 p-3 dark:border-gray-800">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            识别结果
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {runtimeLabel}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownloadAnnotated}
                                        disabled={!annotatedUrl}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-base">download</span>
                                        标注图
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {ocrResult?.items.length ? (
                                        <>
                                            {ocrResult.items.slice(0, 2).map((item, index) => (
                                                <div
                                                    key={`${item.text}-${index}`}
                                                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40"
                                                >
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                        第 {index + 1} 行
                                                    </p>
                                                    <p className="mt-1 truncate text-sm text-gray-800 dark:text-gray-100">
                                                        {item.text || '（空结果）'}
                                                    </p>
                                                </div>
                                            ))}
                                            {ocrResult.items.length > 2 && (
                                                <div className="rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                                    其余 {ocrResult.items.length - 2} 行可在上方文本框查看
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                            识别后的文本摘要会显示在这里。
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageOcrTool;
