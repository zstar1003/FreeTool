import React, { useState, useCallback, useRef, useEffect } from 'react';
import { downloadModel, getSession, inpaint, isModelCached } from '../utils/inpaint';

type Status = 'idle' | 'loading-model' | 'ready' | 'processing';

interface Point {
    x: number;
    y: number;
}

interface Line {
    points: Point[];
    brushSize: number;
}

const ImageWatermarkRemoverTool: React.FC = () => {
    // 状态
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [status, setStatus] = useState<Status>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [brushSize, setBrushSize] = useState<number>(30);
    const [lines, setLines] = useState<Line[]>([]);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [cursorPos, setCursorPos] = useState<Point | null>(null); // 鼠标位置，用于显示画笔预览
    const [resultUrl, setResultUrl] = useState<string>('');
    const [showResult, setShowResult] = useState<boolean>(false);
    const [modelCached, setModelCached] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 检查模型缓存状态
    useEffect(() => {
        isModelCached().then(setModelCached);
    }, []);

    // 处理文件选择
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('请选择图片文件');
            return;
        }

        setError(null);
        setFileName(file.name);
        setLines([]);
        setResultUrl('');
        setShowResult(false);

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setImageUrl(url);
        };
        img.src = url;
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
        setFileName(file.name);
        setLines([]);
        setResultUrl('');
        setShowResult(false);

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setImageUrl(url);
        };
        img.src = url;
    }, []);

    // 绘制画布
    useEffect(() => {
        if (!canvasRef.current || !image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 设置画布大小
        canvas.width = image.width;
        canvas.height = image.height;

        // 绘制图片
        ctx.drawImage(image, 0, 0);

        // 绘制遮罩线条
        ctx.globalCompositeOperation = 'source-over';
        lines.forEach(line => {
            if (line.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = line.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(line.points[0].x, line.points[0].y);
            for (let i = 1; i < line.points.length; i++) {
                ctx.lineTo(line.points[i].x, line.points[i].y);
            }
            ctx.stroke();
        });

        // 绘制画笔光标预览
        if (cursorPos && !isDrawing) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.arc(cursorPos.x, cursorPos.y, brushSize / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }, [image, lines, cursorPos, brushSize, isDrawing]);

    // 获取画布坐标
    const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
        if (!canvasRef.current || !image) return null;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = image.width / rect.width;
        const scaleY = image.height / rect.height;

        let clientX: number, clientY: number;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }, [image]);

    // 开始绘制
    const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const point = getCanvasCoords(e);
        if (!point) return;

        setIsDrawing(true);
        setLines(prev => [...prev, { points: [point], brushSize }]);
    }, [getCanvasCoords, brushSize]);

    // 绘制中 / 更新光标位置
    const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const point = getCanvasCoords(e);
        if (!point) return;

        // 始终更新光标位置以显示预览
        setCursorPos(point);

        if (!isDrawing) return;

        setLines(prev => {
            const newLines = [...prev];
            const currentLine = newLines[newLines.length - 1];
            if (currentLine) {
                currentLine.points.push(point);
            }
            return newLines;
        });
    }, [isDrawing, getCanvasCoords]);

    // 结束绘制
    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
    }, []);

    // 鼠标离开画布
    const handleMouseLeave = useCallback(() => {
        setIsDrawing(false);
        setCursorPos(null);
    }, []);

    // 撤销
    const handleUndo = useCallback(() => {
        setLines(prev => prev.slice(0, -1));
    }, []);

    // 清除
    const handleClear = useCallback(() => {
        setLines([]);
    }, []);

    // 加载模型
    const handleLoadModel = useCallback(async () => {
        setStatus('loading-model');
        setStatusMessage('正在下载模型...');
        setError(null);

        try {
            await downloadModel((progress, loaded, total) => {
                setDownloadProgress(progress);
                const loadedMB = (loaded / 1024 / 1024).toFixed(1);
                const totalMB = (total / 1024 / 1024).toFixed(1);
                setStatusMessage(`正在下载模型... ${loadedMB}MB / ${totalMB}MB`);
            });

            setStatusMessage('正在初始化模型...');
            await getSession();

            setStatus('ready');
            setStatusMessage('');
            setModelCached(true);
        } catch (e) {
            console.error('Model loading failed:', e);
            setError('模型加载失败，请检查网络后重试');
            setStatus('idle');
        }
    }, []);

    // 生成遮罩
    const generateMask = useCallback((): ImageData | null => {
        if (!image || lines.length === 0) return null;

        // 创建遮罩画布
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = image.width;
        maskCanvas.height = image.height;
        const ctx = maskCanvas.getContext('2d');
        if (!ctx) return null;

        // 黑色背景
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        // 白色绘制遮罩区域
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        lines.forEach(line => {
            if (line.points.length < 2) return;
            ctx.beginPath();
            ctx.lineWidth = line.brushSize;
            ctx.moveTo(line.points[0].x, line.points[0].y);
            for (let i = 1; i < line.points.length; i++) {
                ctx.lineTo(line.points[i].x, line.points[i].y);
            }
            ctx.stroke();
        });

        return ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    }, [image, lines]);

    // 处理图片
    const handleProcess = useCallback(async () => {
        if (!image || lines.length === 0) {
            setError('请先用画笔标记需要去除的区域');
            return;
        }

        setStatus('processing');
        setError(null);

        try {
            // 如果模型未加载，先加载
            if (!modelCached) {
                setStatusMessage('正在下载 AI 模型...');
                await downloadModel((progress, loaded, total) => {
                    setDownloadProgress(progress);
                    const loadedMB = (loaded / 1024 / 1024).toFixed(1);
                    const totalMB = (total / 1024 / 1024).toFixed(1);
                    setStatusMessage(`正在下载 AI 模型... ${loadedMB}MB / ${totalMB}MB`);
                });
                setModelCached(true);
            }

            setStatusMessage('正在初始化模型...');
            await getSession();

            // 获取原始图片数据
            setStatusMessage('正在准备图像...');
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) throw new Error('Canvas context error');
            tempCtx.drawImage(image, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, image.width, image.height);

            // 生成遮罩
            const maskData = generateMask();
            if (!maskData) throw new Error('Mask generation error');

            // 执行修复
            const result = await inpaint(imageData, maskData, (stage) => {
                setStatusMessage(stage);
            });

            // 显示结果
            const resultCanvas = document.createElement('canvas');
            resultCanvas.width = result.width;
            resultCanvas.height = result.height;
            const resultCtx = resultCanvas.getContext('2d');
            if (!resultCtx) throw new Error('Result canvas error');
            resultCtx.putImageData(result, 0, 0);

            const resultUrl = resultCanvas.toDataURL('image/png');
            setResultUrl(resultUrl);
            setShowResult(true);
            setStatus('ready');
            setStatusMessage('');
        } catch (e) {
            console.error('Processing failed:', e);
            setError('处理失败: ' + (e instanceof Error ? e.message : '未知错误'));
            setStatus('idle');
            setStatusMessage('');
        }
    }, [image, lines, modelCached, generateMask]);

    // 下载结果
    const handleDownload = useCallback(() => {
        if (!resultUrl) return;

        const a = document.createElement('a');
        a.href = resultUrl;
        const originalName = fileName.replace(/\.[^/.]+$/, '');
        a.download = `${originalName}_no_watermark.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [resultUrl, fileName]);

    // 继续编辑 - 将处理结果作为新的编辑图片
    const handleContinueEdit = useCallback(() => {
        if (!resultUrl) return;

        // 将处理结果加载为新的图片
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setImageUrl(resultUrl);
            setLines([]);
            setShowResult(false);
            setResultUrl('');
        };
        img.src = resultUrl;
    }, [resultUrl]);

    // 重置
    const handleReset = useCallback(() => {
        setImage(null);
        setImageUrl('');
        setFileName('');
        setLines([]);
        setResultUrl('');
        setShowResult(false);
        setError(null);
    }, []);

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-6xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    图片水印去除
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    使用 AI 智能移除图片中的水印、文字等不需要的内容
                </p>
            </div>

            <div className="w-full max-w-6xl flex flex-col gap-6">
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
                                healing
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
                            />
                        </label>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3">
                            {/* 左侧：画布 */}
                            <div
                                ref={containerRef}
                                className="relative flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/50 lg:col-span-2"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">brush</span>
                                        {showResult ? '处理结果' : '用画笔涂抹水印区域'}
                                    </h3>
                                    <button
                                        onClick={handleReset}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        更换图片
                                    </button>
                                </div>

                                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[400px] overflow-auto">
                                    {showResult ? (
                                        <img
                                            src={resultUrl}
                                            alt="Result"
                                            className="max-w-full max-h-[500px] object-contain"
                                        />
                                    ) : (
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full max-h-[500px] object-contain cursor-none"
                                            style={{ touchAction: 'none' }}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseLeave}
                                            onTouchStart={handleMouseDown}
                                            onTouchMove={handleMouseMove}
                                            onTouchEnd={handleMouseUp}
                                        />
                                    )}
                                </div>

                                {fileName && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                        {fileName}
                                    </p>
                                )}
                            </div>

                            {/* 右侧：工具栏 */}
                            <div className="relative flex flex-col p-6 bg-gray-50/50 dark:bg-gray-800/30 gap-4">
                                {/* 画笔大小 */}
                                {!showResult && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">画笔大小</h3>
                                            <span className="text-sm font-medium text-primary">{brushSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="100"
                                            value={brushSize}
                                            onChange={(e) => setBrushSize(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                )}

                                {/* 撤销/清除按钮 */}
                                {!showResult && lines.length > 0 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUndo}
                                            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">undo</span>
                                            <span className="text-sm font-medium">撤销</span>
                                        </button>
                                        <button
                                            onClick={handleClear}
                                            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                            <span className="text-sm font-medium">清除</span>
                                        </button>
                                    </div>
                                )}

                                {/* 模型加载进度 */}
                                {status === 'loading-model' && (
                                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="spinner" style={{ borderTopColor: '#607AFB' }}></div>
                                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                                {statusMessage}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${downloadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* 处理中 */}
                                {status === 'processing' && (
                                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="spinner" style={{ borderTopColor: '#607AFB' }}></div>
                                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                                {statusMessage || '正在处理...'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 操作按钮 */}
                                {!showResult ? (
                                    <button
                                        onClick={handleProcess}
                                        disabled={status === 'loading-model' || status === 'processing' || lines.length === 0}
                                        style={{ backgroundColor: '#607AFB' }}
                                        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined">auto_fix_high</span>
                                        <span>{modelCached ? '开始处理' : '加载模型并处理'}</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleDownload}
                                            style={{ backgroundColor: '#607AFB' }}
                                            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            <span>下载结果</span>
                                        </button>
                                        <button
                                            onClick={handleContinueEdit}
                                            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                            <span>继续编辑</span>
                                        </button>
                                    </div>
                                )}

                                {/* 提示信息 */}
                                {!showResult && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                            <strong>使用说明：</strong>用画笔涂抹需要去除的水印区域（显示为红色），然后点击处理按钮。首次使用需下载约 27MB 的 AI 模型。
                                        </p>
                                    </div>
                                )}

                                {modelCached && status === 'idle' && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-xs text-green-700 dark:text-green-300">
                                            <strong>模型已缓存</strong> - 无需重新下载
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

export default ImageWatermarkRemoverTool;
