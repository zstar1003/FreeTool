import React, { useState, useCallback, useRef, useEffect } from 'react';

const ImageRoundCornerTool: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [processedUrl, setProcessedUrl] = useState<string>('');
    const [borderRadius, setBorderRadius] = useState<number>(20);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('请选择图片文件');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setProcessedUrl('');

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setPreviewUrl(dataUrl);
        };
        reader.readAsDataURL(file);
    }, []);

    // 处理粘贴事件
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) {
                        setSelectedFile(file);
                        setError(null);
                        setProcessedUrl('');

                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            const dataUrl = ev.target?.result as string;
                            setPreviewUrl(dataUrl);
                        };
                        reader.readAsDataURL(file);
                    }
                    break;
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    // 当预览图片加载完成后，获取图片尺寸
    useEffect(() => {
        if (!previewUrl) return;

        const img = new Image();
        img.onload = () => {
            setImageSize({ width: img.width, height: img.height });
        };
        img.src = previewUrl;
    }, [previewUrl]);

    // 处理圆角
    const processImage = useCallback(() => {
        if (!previewUrl) return;

        setIsProcessing(true);
        setError(null);

        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) {
                setError('Canvas 创建失败');
                setIsProcessing(false);
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setError('Canvas 上下文创建失败');
                setIsProcessing(false);
                return;
            }

            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 计算实际的圆角半径（基于百分比）
            const maxRadius = Math.min(img.width, img.height) / 2;
            const actualRadius = (borderRadius / 100) * maxRadius;

            // 绘制圆角矩形路径
            ctx.beginPath();
            ctx.moveTo(actualRadius, 0);
            ctx.lineTo(img.width - actualRadius, 0);
            ctx.quadraticCurveTo(img.width, 0, img.width, actualRadius);
            ctx.lineTo(img.width, img.height - actualRadius);
            ctx.quadraticCurveTo(img.width, img.height, img.width - actualRadius, img.height);
            ctx.lineTo(actualRadius, img.height);
            ctx.quadraticCurveTo(0, img.height, 0, img.height - actualRadius);
            ctx.lineTo(0, actualRadius);
            ctx.quadraticCurveTo(0, 0, actualRadius, 0);
            ctx.closePath();

            // 裁剪
            ctx.clip();

            // 绘制图片
            ctx.drawImage(img, 0, 0);

            // 导出为 PNG（保持透明背景）
            canvas.toBlob((blob) => {
                if (!blob) {
                    setError('图片处理失败');
                    setIsProcessing(false);
                    return;
                }

                const url = URL.createObjectURL(blob);
                setProcessedUrl(url);
                setIsProcessing(false);
            }, 'image/png');
        };

        img.onerror = () => {
            setError('图片加载失败');
            setIsProcessing(false);
        };

        img.src = previewUrl;
    }, [previewUrl, borderRadius]);

    // 当预览URL或圆角半径改变时自动处理
    useEffect(() => {
        if (previewUrl) {
            processImage();
        }
    }, [previewUrl, borderRadius, processImage]);

    const handleDownload = useCallback(() => {
        if (!processedUrl || !selectedFile) return;

        const a = document.createElement('a');
        a.href = processedUrl;
        const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
        a.download = `${originalName}_rounded.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [processedUrl, selectedFile]);

    // 计算最大圆角值对应的像素
    const maxRadiusPx = Math.min(imageSize.width, imageSize.height) / 2;
    const currentRadiusPx = Math.round((borderRadius / 100) * maxRadiusPx);

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-6xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">图片圆角工具</p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">快速为您的图片添加圆角效果，支持自定义圆角大小</p>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="w-full max-w-6xl flex flex-col gap-10">
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark shadow-sm">
                    {!previewUrl ? (
                        <label className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 sm:p-14 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors m-6">
                            <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">rounded_corner</span>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    拖拽图片至此或粘贴图片
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">支持 JPG, PNG, BMP, GIF 等格式</p>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* 左侧：原始图片预览 */}
                            <div className="relative flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">image</span>
                                        原始图片
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl('');
                                            setProcessedUrl('');
                                            setImageSize({ width: 0, height: 0 });
                                        }}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        更换图片
                                    </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[300px]">
                                    <img
                                        src={previewUrl}
                                        alt="Original"
                                        className="max-w-full max-h-[400px] object-contain"
                                    />
                                </div>
                                {selectedFile && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                        {selectedFile.name} ({imageSize.width} x {imageSize.height})
                                    </p>
                                )}
                            </div>

                            {/* 右侧：处理后预览和设置 */}
                            <div className="relative flex flex-col p-6 bg-gray-50/50 dark:bg-gray-800/30 gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">rounded_corner</span>
                                        圆角预览
                                    </h3>
                                </div>

                                {/* 圆角预览 - 使用棋盘格背景显示透明区域 */}
                                <div
                                    className="flex-1 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[300px]"
                                    style={{
                                        backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
                                        backgroundSize: '20px 20px',
                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                        backgroundColor: '#f5f5f5'
                                    }}
                                >
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">处理中...</p>
                                        </div>
                                    ) : processedUrl ? (
                                        <img
                                            src={processedUrl}
                                            alt="Rounded"
                                            className="max-w-full max-h-[400px] object-contain"
                                        />
                                    ) : null}
                                </div>

                                {/* 圆角调节 */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">圆角大小</h3>
                                        <span className="text-sm font-medium text-primary">
                                            {borderRadius}% {imageSize.width > 0 && `(${currentRadiusPx}px)`}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={borderRadius}
                                        onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                                        <span>无圆角</span>
                                        <span>正圆</span>
                                    </div>
                                </div>

                                {/* 快捷预设 */}
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { label: '无', value: 0 },
                                        { label: '小', value: 10 },
                                        { label: '中', value: 25 },
                                        { label: '大', value: 50 },
                                        { label: '正圆', value: 100 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setBorderRadius(preset.value)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                borderRadius === preset.value
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleDownload}
                                    disabled={!processedUrl || isProcessing}
                                    style={{ backgroundColor: '#607AFB' }}
                                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                    <span className="truncate">下载圆角图片 (PNG)</span>
                                </button>

                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    导出为 PNG 格式以保留透明背景
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageRoundCornerTool;
