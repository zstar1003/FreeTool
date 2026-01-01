import React, { useState, useCallback, useRef, useEffect } from 'react';

type TaskType = '<CAPTION>' | '<DETAILED_CAPTION>' | '<MORE_DETAILED_CAPTION>';
type Status = 'idle' | 'loading' | 'ready' | 'processing';

interface ProgressItem {
    file: string;
    progress: number;
    total: number;
    loaded: number;
}

const IS_WEBGPU_AVAILABLE = (() => {
    try {
        return 'gpu' in navigator;
    } catch {
        return false;
    }
})();

const TASK_OPTIONS: { value: TaskType; label: string; description: string }[] = [
    { value: '<CAPTION>', label: '简短描述', description: '生成简洁的图片描述' },
    { value: '<DETAILED_CAPTION>', label: '详细描述', description: '生成较详细的图片描述' },
    { value: '<MORE_DETAILED_CAPTION>', label: '完整描述', description: '生成完整详细的描述，适合作为 AI 绘画提示词' },
];

const ImageToPromptTool: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [status, setStatus] = useState<Status>('idle');
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
    const [taskType, setTaskType] = useState<TaskType>('<DETAILED_CAPTION>');
    const [result, setResult] = useState<string>('');
    const [processTime, setProcessTime] = useState<number>(0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const workerRef = useRef<Worker | null>(null);

    // 初始化 Worker
    useEffect(() => {
        if (!IS_WEBGPU_AVAILABLE) return;

        // 使用 BASE_URL 确保在子目录部署时路径正确
        const base = import.meta.env.BASE_URL || '/';
        const workerUrl = `${base}florence2.worker.js`.replace(/\/+/g, '/');
        const worker = new Worker(workerUrl, { type: 'module' });

        worker.onmessage = (e) => {
            const { status: msgStatus, data, progress, file, loaded, total, result: msgResult, time } = e.data;

            if (msgStatus === 'loading') {
                setLoadingMessage(data);
            } else if (msgStatus === 'progress') {
                // 更新进度
                setProgressItems(prev => {
                    const existing = prev.find(item => item.file === file);
                    if (existing) {
                        return prev.map(item =>
                            item.file === file ? { ...item, progress, loaded, total } : item
                        );
                    }
                    return [...prev, { file, progress, loaded, total }];
                });
            } else if (msgStatus === 'ready') {
                setStatus('ready');
                setLoadingMessage('');
                setProgressItems([]);
            } else if (msgStatus === 'complete') {
                setStatus('ready');
                // 提取结果文本 - 直接使用 taskType 作为键（如 "<MORE_DETAILED_CAPTION>"）
                const resultText = msgResult[taskType] || Object.values(msgResult)[0] || JSON.stringify(msgResult);
                setResult(resultText);
                setProcessTime(time);
            }
        };

        worker.onerror = (e) => {
            console.error('Worker error:', e);
            setError('模型加载失败，请刷新页面重试');
            setStatus('idle');
        };

        workerRef.current = worker;

        return () => {
            worker.terminate();
        };
    }, [taskType]);

    // 处理文件选择
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('请选择图片文件');
            return;
        }

        setError(null);
        setResult('');
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setImage(dataUrl);
            // 重置 worker 中的图片缓存
            workerRef.current?.postMessage({ type: 'reset' });
        };
        reader.readAsDataURL(file);
    }, []);

    // 处理拖拽
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) {
            setError('请拖入图片文件');
            return;
        }

        setError(null);
        setResult('');
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setImage(dataUrl);
            workerRef.current?.postMessage({ type: 'reset' });
        };
        reader.readAsDataURL(file);
    }, []);

    // 加载模型
    const handleLoadModel = useCallback(() => {
        if (!workerRef.current) return;
        setStatus('loading');
        setError(null);
        workerRef.current.postMessage({ type: 'load' });
    }, []);

    // 生成描述
    const handleGenerate = useCallback(() => {
        if (!workerRef.current || !image || status !== 'ready') return;
        setStatus('processing');
        setError(null);
        workerRef.current.postMessage({
            type: 'run',
            data: { url: image, task: taskType }
        });
    }, [image, status, taskType]);

    // 复制结果
    const handleCopy = useCallback(async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('复制失败:', e);
        }
    }, [result]);

    // 重置图片
    const handleReset = useCallback(() => {
        setImage(null);
        setFileName('');
        setResult('');
        setProcessTime(0);
        workerRef.current?.postMessage({ type: 'reset' });
    }, []);

    // 格式化文件大小
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // 计算总体加载进度
    const totalProgress = progressItems.length > 0
        ? progressItems.reduce((sum, item) => sum + (item.progress || 0), 0) / progressItems.length
        : 0;

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-6xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    图片转提示词
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    使用 AI 从图片生成描述文本，可用作 Stable Diffusion 等 AI 绘画的提示词
                </p>
            </div>

            <div className="w-full max-w-6xl flex flex-col gap-6">
                {/* WebGPU 不可用提示 */}
                {!IS_WEBGPU_AVAILABLE && (
                    <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                            <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                                您的浏览器不支持 WebGPU，无法使用此功能
                            </p>
                        </div>
                        <p className="text-red-700 dark:text-red-400 text-xs mt-2">
                            请使用最新版本的 Chrome、Edge 或其他支持 WebGPU 的浏览器
                        </p>
                    </div>
                )}

                {/* 错误提示 */}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark shadow-sm">
                    {!image ? (
                        <label
                            className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 sm:p-14 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors m-6"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">
                                add_photo_alternate
                            </span>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    拖拽图片至此
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    支持 JPG, PNG, WebP 等格式
                                </p>
                            </div>
                            <span className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-white/10 px-4 text-sm font-bold text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-white/20">
                                点击选择文件
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={!IS_WEBGPU_AVAILABLE}
                            />
                        </label>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* 左侧：图片预览 */}
                            <div className="relative flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">image</span>
                                        上传的图片
                                    </h3>
                                    <button
                                        onClick={handleReset}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        更换图片
                                    </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[300px]">
                                    <img
                                        src={image}
                                        alt="Preview"
                                        className="max-w-full max-h-[400px] object-contain"
                                    />
                                </div>
                                {fileName && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                        {fileName}
                                    </p>
                                )}
                            </div>

                            {/* 右侧：设置与结果 */}
                            <div className="relative flex flex-col p-6 bg-gray-50/50 dark:bg-gray-800/30 gap-4">
                                {/* 描述类型选择 */}
                                <div className="space-y-3">
                                    <h3 className="px-1 text-base font-bold text-gray-900 dark:text-white">描述类型</h3>
                                    <div className="flex flex-col gap-2">
                                        {TASK_OPTIONS.map((option) => (
                                            <label
                                                key={option.value}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                    taskType === option.value
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="taskType"
                                                    value={option.value}
                                                    checked={taskType === option.value}
                                                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    taskType === option.value
                                                        ? 'border-primary'
                                                        : 'border-gray-400 dark:border-gray-500'
                                                }`}>
                                                    {taskType === option.value && (
                                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {option.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {option.description}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* 模型加载进度 */}
                                {status === 'loading' && (
                                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="spinner" style={{ borderTopColor: '#607AFB' }}></div>
                                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                                {loadingMessage || '正在加载模型...'}
                                            </span>
                                        </div>
                                        {progressItems.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-300"
                                                        style={{ width: `${totalProgress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    {Math.round(totalProgress)}% - 首次加载约需下载 500MB 模型文件
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 操作按钮 */}
                                <div className="flex flex-col gap-3">
                                    {status === 'idle' && (
                                        <button
                                            onClick={handleLoadModel}
                                            disabled={!IS_WEBGPU_AVAILABLE}
                                            style={{ backgroundColor: '#607AFB' }}
                                            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            <span>加载 AI 模型</span>
                                        </button>
                                    )}

                                    {(status === 'ready' || status === 'processing') && (
                                        <button
                                            onClick={handleGenerate}
                                            disabled={status === 'processing'}
                                            style={{ backgroundColor: '#607AFB' }}
                                            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {status === 'processing' ? (
                                                <>
                                                    <div className="spinner"></div>
                                                    <span>生成中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined">auto_awesome</span>
                                                    <span>生成描述</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* 结果显示 */}
                                {result && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                生成结果
                                            </h3>
                                            {processTime > 0 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    耗时: {(processTime / 1000).toFixed(2)}s
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                readOnly
                                                value={result}
                                                className="w-full h-32 p-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button
                                                onClick={handleCopy}
                                                className="absolute top-2 right-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title="复制"
                                            >
                                                <span className="material-symbols-outlined text-lg text-gray-600 dark:text-gray-300">
                                                    {copied ? 'check' : 'content_copy'}
                                                </span>
                                            </button>
                                        </div>
                                        {copied && (
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                已复制到剪贴板
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 提示信息 */}
                                {status === 'idle' && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                            <strong>提示：</strong>首次使用需要下载约 500MB 的 AI 模型，模型会缓存到浏览器中，后续使用无需重复下载。
                                        </p>
                                    </div>
                                )}

                                {status === 'ready' && !result && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-xs text-green-700 dark:text-green-300">
                                            <strong>模型已就绪！</strong>选择描述类型后点击"生成描述"按钮。
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageToPromptTool;
