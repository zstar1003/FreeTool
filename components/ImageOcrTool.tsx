import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { InitializationSummary, OcrResult, PaddleOCRCreateOptions } from '@paddleocr/paddleocr-js';

type OcrLanguage = 'ch' | 'chinese_cht' | 'en' | 'japan';
type ToolStatus = 'idle' | 'initializing' | 'ready' | 'processing';
type UploadSource = 'upload' | 'replace' | 'drop' | 'paste';
type ExpandedPanel = 'image' | 'text' | null;
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

const formatOcrText = (text: string) => {
    if (!text.trim()) return '';

    return text
        .replace(/[\r\n]+/g, '')
        .replace(/\t+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
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
    const [initSummary, setInitSummary] = useState<InitializationSummary | null>(null);
    const [downloadTasks, setDownloadTasks] = useState<ModelDownloadTask[]>([]);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);
    const [isFormattedResult, setIsFormattedResult] = useState<boolean>(false);
    const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);
    const [resultText, setResultText] = useState<string>('');
    const [restoreResultText, setRestoreResultText] = useState<string>('');

    const uploadInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
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
        () => resultText.replace(/\s/g, '').length,
        [resultText]
    );

    const engineNeedsRefresh = Boolean(currentLanguageRef.current && currentLanguageRef.current !== language);
    const activeLanguage = LANGUAGE_OPTIONS.find(option => option.value === language);
    const previewSource = annotatedUrl || previewUrl;

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

    const activeDownloadTask = useMemo(
        () => downloadTasks.find(task => !task.done) ?? downloadTasks.at(-1) ?? null,
        [downloadTasks]
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

    useEffect(() => {
        setResultText(recognizedText);
        setRestoreResultText(recognizedText);
        setIsFormattedResult(false);
    }, [recognizedText]);

    useEffect(() => {
        if (!expandedPanel) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setExpandedPanel(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expandedPanel]);

    const resetOutput = useCallback(() => {
        setOcrResult(null);
        setAnnotatedUrl('');
        setCopied(false);
        setIsFormattedResult(false);
        setExpandedPanel(null);
        setResultText('');
        setRestoreResultText('');
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
        if (!resultText) return;

        try {
            await copyText(resultText);
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
    }, [resultText]);

    const handleDownloadText = useCallback(() => {
        if (!resultText || !selectedFile) return;

        const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
        const baseName = selectedFile.name.replace(/\.[^.]+$/, '') || 'ocr-result';
        downloadBlob(blob, `${baseName}-ocr.txt`);
    }, [resultText, selectedFile]);

    const handleToggleFormattedResult = useCallback(() => {
        if (!resultText.trim()) return;

        if (isFormattedResult) {
            setResultText(restoreResultText);
            setIsFormattedResult(false);
            return;
        }

        setRestoreResultText(resultText);
        setResultText(formatOcrText(resultText));
        setIsFormattedResult(true);
    }, [isFormattedResult, restoreResultText, resultText]);

    const handleResultTextChange = useCallback((value: string) => {
        setResultText(value);

        if (!isFormattedResult) {
            setRestoreResultText(value);
        }
    }, [isFormattedResult]);

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
        : status === 'processing'
            ? '88%'
        : initSummary
            ? '100%'
            : selectedFile
                ? '12%'
                : '0%';

    const statusHeading = status === 'initializing'
        ? `${activeDownloadTask?.label ?? '模型资源'}下载中`
        : status === 'processing'
            ? '正在识别图片中的文字'
            : initSummary
                ? '模型已就绪'
                : selectedFile
                    ? '图片已就绪'
                    : '等待上传图片';

    const statusBadge = status === 'initializing'
        ? (downloadProgress !== null ? `${downloadProgress}%` : '下载中')
        : status === 'processing'
            ? '处理中'
            : initSummary
                ? '就绪'
                : '';

    const statusDetail = status === 'initializing' && activeDownloadTask
        ? `当前阶段：${activeDownloadTask.label}`
        : statusMessage;

    return (
        <div className="flex w-full flex-col items-center px-4 py-3 sm:px-6 lg:px-8">
            <div className="mb-2 flex w-full max-w-6xl flex-col items-center gap-1.5 text-center">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    图片 OCR 识别
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    上传、拖拽或直接粘贴图片，快速提取文字并整理结果。
                </p>
            </div>

            <div className="flex w-full max-w-6xl flex-col gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {statusHeading}
                            </p>
                            {statusBadge && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                                    {statusBadge}
                                </span>
                            )}
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                            <div
                                className={`h-full rounded-full bg-primary transition-all duration-300 ${
                                    status === 'initializing' && downloadProgress === null && !allDownloadsCompleted
                                        ? 'animate-pulse'
                                        : ''
                                }`}
                                style={{ width: statusProgressWidth }}
                            />
                        </div>

                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {statusDetail}
                        </p>
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
                                className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all ${uploadZoneClassName}`}
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
                                className={`flex flex-col gap-2 rounded-2xl transition-all ${isDragActive ? 'bg-primary/5 shadow-[0_0_0_6px_rgba(96,122,251,0.08)] dark:bg-primary/10' : ''}`}
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
                                        <label className="inline-flex min-w-[104px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
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
                                            className="inline-flex min-w-[88px] items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                            清空
                                        </button>
                                    </div>
                                </div>

                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setExpandedPanel('image')}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            setExpandedPanel('image');
                                        }
                                    }}
                                    className="group relative flex min-h-[280px] cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition-colors focus:border-primary dark:border-gray-800 dark:bg-gray-900/40"
                                >
                                    <img
                                        src={previewSource}
                                        alt="OCR preview"
                                        className="max-h-[360px] max-w-full rounded-xl object-contain"
                                    />
                                    <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                                        点击放大
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex h-full flex-col gap-2.5">
                            <div className="space-y-1.5">
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
                                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/40">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        行数
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                        {ocrResult?.items.length ?? '--'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/40">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        字符
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                        {recognizedText ? textCharacterCount : '--'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/40">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        耗时
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                        {ocrResult ? `${Math.round(ocrResult.metrics.totalMs)} ms` : '--'}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/5 to-white p-3 dark:border-primary/15 dark:from-primary/10 dark:to-background-dark">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            识别结果
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            点击文本框可放大查看
                                        </p>
                                    </div>

                                    <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:min-w-[316px]">
                                        <button
                                            onClick={handleToggleFormattedResult}
                                            disabled={!resultText}
                                            className={`inline-flex min-w-[118px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                                isFormattedResult
                                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                                    : 'border-gray-300 text-gray-700 hover:bg-white dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {isFormattedResult ? 'history' : 'auto_awesome'}
                                            </span>
                                            {isFormattedResult ? '恢复原文' : '格式化'}
                                        </button>
                                        <button
                                            onClick={handleCopyText}
                                            disabled={!resultText}
                                            className="inline-flex min-w-[108px] items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                            {copied ? '已复制' : '复制文本'}
                                        </button>
                                        <button
                                            onClick={handleDownloadText}
                                            disabled={!resultText}
                                            className="inline-flex min-w-[108px] items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined text-base">description</span>
                                            下载文件
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={resultText}
                                        onChange={(event) => handleResultTextChange(event.target.value)}
                                        spellCheck={false}
                                        onClick={() => setExpandedPanel('text')}
                                        className="h-[240px] w-full resize-none rounded-2xl border border-primary/20 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition-shadow focus:border-primary/40 focus:shadow-[0_0_0_4px_rgba(96,122,251,0.08)] dark:border-primary/15 dark:bg-gray-950/30 dark:text-gray-100 xl:h-[280px]"
                                        placeholder="识别完成后，文字会显示在这里"
                                    />
                                    {resultText && (
                                        <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white">
                                            点击放大
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {expandedPanel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setExpandedPanel(null)}
                >
                    <div
                        className="w-full max-w-4xl rounded-[28px] border border-white/10 bg-white p-4 shadow-2xl dark:bg-background-dark"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {expandedPanel === 'image' ? '识别预览' : '识别结果'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {expandedPanel === 'image'
                                        ? (annotatedUrl ? '当前显示识别后的标注效果' : '当前显示原图')
                                        : (isFormattedResult ? '当前为格式化后的文本' : '当前为原始识别文本')}
                                </p>
                            </div>
                            <button
                                onClick={() => setExpandedPanel(null)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {expandedPanel === 'image' ? (
                            <div className="flex max-h-[88vh] items-center justify-center overflow-auto rounded-2xl bg-gray-50 p-4 dark:bg-gray-950/40">
                                <img
                                    src={previewSource}
                                    alt="Expanded OCR preview"
                                    className="max-h-[84vh] max-w-[92vw] rounded-2xl object-contain"
                                />
                            </div>
                        ) : (
                            <textarea
                                value={resultText}
                                onChange={(event) => handleResultTextChange(event.target.value)}
                                spellCheck={false}
                                className="h-[70vh] w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm leading-7 text-gray-800 outline-none focus:border-primary dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageOcrTool;
