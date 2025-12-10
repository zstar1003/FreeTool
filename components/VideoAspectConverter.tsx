import React, { useRef, useState } from 'react';

type AspectRatio = '16:9' | '9:16' | '4:3' | '1:1';

interface AspectRatioOption {
    value: AspectRatio;
    label: string;
    ratio: number;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
    { value: '16:9', label: '16:9 (横屏)', ratio: 16 / 9 },
    { value: '9:16', label: '9:16 (竖屏)', ratio: 9 / 16 },
    { value: '4:3', label: '4:3 (标准)', ratio: 4 / 3 },
    { value: '1:1', label: '1:1 (正方形)', ratio: 1 / 1 },
];

type FillType = 'color' | 'blur';

const VideoAspectConverter: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [targetRatio, setTargetRatio] = useState<AspectRatio>('16:9');
    const [fillType, setFillType] = useState<FillType>('color');
    const [fillColor, setFillColor] = useState<string>('#000000');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [outputUrl, setOutputUrl] = useState<string>('');
    const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
            setOutputUrl('');
        }
    };

    const handleVideoLoad = () => {
        const video = videoPreviewRef.current;
        if (video) {
            setVideoDimensions({
                width: video.videoWidth,
                height: video.videoHeight,
            });
        }
    };

    const processVideo = async () => {
        if (!videoFile || !videoPreviewRef.current || !canvasRef.current) return;

        setIsProcessing(true);

        try {
            const video = videoPreviewRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('无法获取 Canvas 上下文');

            const selectedRatio = ASPECT_RATIOS.find(r => r.value === targetRatio)?.ratio || 16 / 9;
            const videoRatio = video.videoWidth / video.videoHeight;

            let canvasWidth: number;
            let canvasHeight: number;
            let videoX: number;
            let videoY: number;
            let videoWidth: number;
            let videoHeight: number;

            // 计算输出尺寸
            if (video.videoWidth >= video.videoHeight) {
                // 横屏视频
                canvasWidth = 1920;
                canvasHeight = Math.round(canvasWidth / selectedRatio);
            } else {
                // 竖屏视频
                canvasHeight = 1920;
                canvasWidth = Math.round(canvasHeight * selectedRatio);
            }

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // 计算视频在画布中的位置和尺寸
            if (videoRatio > selectedRatio) {
                // 视频更宽，以宽度为准
                videoWidth = canvasWidth;
                videoHeight = Math.round(videoWidth / videoRatio);
                videoX = 0;
                videoY = (canvasHeight - videoHeight) / 2;
            } else {
                // 视频更高，以高度为准
                videoHeight = canvasHeight;
                videoWidth = Math.round(videoHeight * videoRatio);
                videoX = (canvasWidth - videoWidth) / 2;
                videoY = 0;
            }

            // 创建临时canvas用于背景模糊
            let backgroundCanvas: HTMLCanvasElement | null = null;
            let backgroundCtx: CanvasRenderingContext2D | null = null;

            if (fillType === 'blur') {
                backgroundCanvas = document.createElement('canvas');
                backgroundCanvas.width = canvasWidth;
                backgroundCanvas.height = canvasHeight;
                backgroundCtx = backgroundCanvas.getContext('2d');
            }

            // 从视频元素获取音频流
            const canvasStream = canvas.captureStream(30); // 30 FPS

            // 创建一个隐藏的 video 元素来获取音频
            const audioVideo = document.createElement('video');
            audioVideo.src = videoUrl;
            audioVideo.muted = false;

            // 等待音频视频准备好
            await new Promise((resolve) => {
                audioVideo.onloadedmetadata = resolve;
            });

            // 尝试获取音频轨道
            let combinedStream: MediaStream;
            try {
                // @ts-ignore - captureStream 在某些浏览器中可用
                const audioStream = audioVideo.captureStream ? audioVideo.captureStream() : audioVideo.mozCaptureStream?.();

                if (audioStream) {
                    const audioTracks = audioStream.getAudioTracks();
                    const videoTracks = canvasStream.getVideoTracks();

                    // 合并视频流和音频流
                    combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
                } else {
                    combinedStream = canvasStream;
                    console.warn('无法获取音频流，输出视频将没有声音');
                }
            } catch (e) {
                console.warn('获取音频失败:', e);
                combinedStream = canvasStream;
            }

            // 使用 MediaRecorder 录制视频（包含音频）
            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000,
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setOutputUrl(url);
                setIsProcessing(false);

                // 清理音频视频元素
                audioVideo.pause();
                audioVideo.src = '';
            };

            // 开始录制
            mediaRecorder.start();

            // 同时播放原始视频和音频视频
            video.currentTime = 0;
            audioVideo.currentTime = 0;
            await Promise.all([video.play(), audioVideo.play()]);

            const drawFrame = () => {
                if (video.paused || video.ended) {
                    mediaRecorder.stop();
                    audioVideo.pause();
                    return;
                }

                // 绘制背景
                if (fillType === 'blur' && backgroundCtx && backgroundCanvas) {
                    // 绘制模糊背景
                    backgroundCtx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
                    ctx.filter = 'blur(20px)';
                    ctx.drawImage(backgroundCanvas, 0, 0);
                    ctx.filter = 'none';
                } else {
                    // 纯色背景
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                }

                // 绘制视频
                ctx.drawImage(video, videoX, videoY, videoWidth, videoHeight);

                requestAnimationFrame(drawFrame);
            };

            drawFrame();
        } catch (error) {
            console.error('处理视频失败:', error);
            alert('处理视频时出错，请重试');
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (outputUrl) {
            const a = document.createElement('a');
            a.href = outputUrl;
            a.download = `converted-${targetRatio.replace(':', 'x')}.webm`;
            a.click();
        }
    };

    const clearVideo = () => {
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }
        if (outputUrl) {
            URL.revokeObjectURL(outputUrl);
        }
        setVideoFile(null);
        setVideoUrl('');
        setOutputUrl('');
        setVideoDimensions(null);
        if (videoInputRef.current) {
            videoInputRef.current.value = '';
        }
    };

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-7xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    视频比例转换
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    将视频转换为标准比例，空白区域可用颜色或模糊背景填充
                </p>
            </div>

            <div className="w-full max-w-7xl flex flex-col gap-6">
                {/* 控制面板 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm">
                    <div className="flex flex-col gap-4">
                        {/* 上传视频 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                选择视频文件
                            </label>
                            <div className="flex gap-3">
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                    className="flex-1 text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-gray-900 hover:file:opacity-90"
                                    style={{ '--file-bg': '#607AFB' } as React.CSSProperties}
                                />
                                {videoFile && (
                                    <button
                                        onClick={clearVideo}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        清除
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 目标比例 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                目标比例
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {ASPECT_RATIOS.map(ratio => (
                                    <button
                                        key={ratio.value}
                                        onClick={() => setTargetRatio(ratio.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            targetRatio === ratio.value
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                        style={targetRatio === ratio.value ? { backgroundColor: '#607AFB' } : {}}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 填充方式 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                填充方式
                            </label>
                            <div className="flex gap-4 items-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFillType('color')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            fillType === 'color'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                        style={fillType === 'color' ? { backgroundColor: '#607AFB' } : {}}
                                    >
                                        纯色填充
                                    </button>
                                    <button
                                        onClick={() => setFillType('blur')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            fillType === 'blur'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                        style={fillType === 'blur' ? { backgroundColor: '#607AFB' } : {}}
                                    >
                                        模糊背景
                                    </button>
                                </div>

                                {fillType === 'color' && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 dark:text-gray-400">颜色:</label>
                                        <input
                                            type="color"
                                            value={fillColor}
                                            onChange={(e) => setFillColor(e.target.value)}
                                            className="h-10 w-20 rounded border border-gray-300 dark:border-gray-700 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                            {fillColor.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 处理按钮 */}
                        {videoFile && (
                            <div className="flex gap-3">
                                <button
                                    onClick={processVideo}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ backgroundColor: '#607AFB' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="spinner-small" />
                                            处理中...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">play_arrow</span>
                                            开始转换
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 视频预览区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 原始视频 */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            原始视频
                        </h3>
                        <div className="relative rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 aspect-video flex items-center justify-center overflow-hidden">
                            {videoUrl ? (
                                <video
                                    ref={videoPreviewRef}
                                    src={videoUrl}
                                    controls
                                    onLoadedMetadata={handleVideoLoad}
                                    className="max-w-full max-h-full"
                                />
                            ) : (
                                <div className="text-center text-gray-400 dark:text-gray-500">
                                    <span className="material-symbols-outlined text-6xl mb-2">videocam</span>
                                    <p className="text-sm">未选择视频</p>
                                </div>
                            )}
                        </div>
                        {videoDimensions && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                尺寸: {videoDimensions.width} × {videoDimensions.height}
                                (比例: {(videoDimensions.width / videoDimensions.height).toFixed(2)})
                            </p>
                        )}
                    </div>

                    {/* 转换后视频 */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            转换后视频
                        </h3>
                        <div className="relative rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 aspect-video flex items-center justify-center overflow-hidden">
                            {outputUrl ? (
                                <video
                                    src={outputUrl}
                                    controls
                                    className="max-w-full max-h-full"
                                />
                            ) : (
                                <div className="text-center text-gray-400 dark:text-gray-500">
                                    <span className="material-symbols-outlined text-6xl mb-2">movie</span>
                                    <p className="text-sm">等待转换</p>
                                </div>
                            )}
                        </div>
                        {outputUrl && (
                            <div className="mt-4">
                                <button
                                    onClick={handleDownload}
                                    className="w-full px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:opacity-90 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: '#607AFB' }}
                                >
                                    <span className="material-symbols-outlined text-xl">download</span>
                                    下载转换后的视频
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 隐藏的canvas用于处理 */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default VideoAspectConverter;
