import React, { useState, useRef, useCallback, useEffect } from 'react';

type EditorTool = 'select' | 'crop' | 'mosaic' | 'draw';
type DrawMode = 'pen' | 'line' | 'rect' | 'circle';
type CropHandle = 'tl' | 'tr' | 'bl' | 'br' | 'top' | 'right' | 'bottom' | 'left' | 'move' | null;

interface Point {
    x: number;
    y: number;
}

interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

const ImageEditorTool: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [activeTool, setActiveTool] = useState<EditorTool>('select');
    const [drawMode, setDrawMode] = useState<DrawMode>('pen');
    const [drawColor, setDrawColor] = useState<string>('#FF0000');
    const [lineWidth, setLineWidth] = useState<number>(3);
    const [mosaicSize, setMosaicSize] = useState<number>(10);

    // 裁剪相关状态
    const [cropRect, setCropRect] = useState<CropRect | null>(null);
    const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
    const [cropHandle, setCropHandle] = useState<CropHandle>(null);
    const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
    const [initialCropRect, setInitialCropRect] = useState<CropRect | null>(null);

    // 绘制相关状态
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [drawStart, setDrawStart] = useState<Point | null>(null);

    // 分辨率修改
    const [targetWidth, setTargetWidth] = useState<number>(0);
    const [targetHeight, setTargetHeight] = useState<number>(0);
    const [originalWidth, setOriginalWidth] = useState<number>(0);
    const [originalHeight, setOriginalHeight] = useState<number>(0);
    const [maintainRatio, setMaintainRatio] = useState<boolean>(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const historyRef = useRef<HTMLCanvasElement[]>([]);
    const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // 处理文件选择
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setImageSrc(dataUrl);

            const img = new Image();
            img.onload = () => {
                imageRef.current = img;
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setTargetWidth(img.width);
                setTargetHeight(img.height);

                const canvas = canvasRef.current;
                if (canvas) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        saveHistory();
                    }
                }
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }, []);

    // 保存历史记录 - 改用canvas克隆而不是ImageData
    const saveHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const historyCanvas = document.createElement('canvas');
        historyCanvas.width = canvas.width;
        historyCanvas.height = canvas.height;
        const historyCtx = historyCanvas.getContext('2d');
        if (historyCtx) {
            historyCtx.drawImage(canvas, 0, 0);
            historyRef.current = [...historyRef.current, historyCanvas];

            // 限制历史记录数量，避免内存溢出
            if (historyRef.current.length > 20) {
                historyRef.current.shift();
            }
        }
    };

    // 恢复历史状态
    const restoreFromHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas || historyRef.current.length === 0) return;

        const lastHistory = historyRef.current[historyRef.current.length - 1];
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(lastHistory, 0, 0);
    };

    // 撤销
    const handleUndo = () => {
        if (historyRef.current.length > 1) {
            historyRef.current.pop();
            restoreFromHistory();
        }
    };

    // 监听工具切换，切换到裁剪工具时初始化裁剪框
    useEffect(() => {
        if (activeTool === 'crop' && !cropRect) {
            const canvas = canvasRef.current;
            if (canvas) {
                // 初始化一个默认的裁剪框（画布中央，80%大小）
                const padding = Math.min(canvas.width, canvas.height) * 0.1;
                setCropRect({
                    x: padding,
                    y: padding,
                    width: canvas.width - padding * 2,
                    height: canvas.height - padding * 2,
                });
            }
        } else if (activeTool !== 'crop' && cropRect) {
            // 切换到其他工具时清除裁剪框
            setCropRect(null);
            restoreFromHistory();
        }
    }, [activeTool]);

    // 获取鼠标在canvas上的坐标
    const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    // 检测鼠标是否在裁剪框的控制点上
    const getCropHandleAtPoint = (point: Point, rect: CropRect): CropHandle => {
        const handleSize = 8;
        const { x, y, width, height } = rect;

        // 检测四个角
        if (Math.abs(point.x - x) < handleSize && Math.abs(point.y - y) < handleSize) return 'tl';
        if (Math.abs(point.x - (x + width)) < handleSize && Math.abs(point.y - y) < handleSize) return 'tr';
        if (Math.abs(point.x - x) < handleSize && Math.abs(point.y - (y + height)) < handleSize) return 'bl';
        if (Math.abs(point.x - (x + width)) < handleSize && Math.abs(point.y - (y + height)) < handleSize) return 'br';

        // 检测四条边
        if (Math.abs(point.x - x) < handleSize && point.y > y && point.y < y + height) return 'left';
        if (Math.abs(point.x - (x + width)) < handleSize && point.y > y && point.y < y + height) return 'right';
        if (Math.abs(point.y - y) < handleSize && point.x > x && point.x < x + width) return 'top';
        if (Math.abs(point.y - (y + height)) < handleSize && point.x > x && point.x < x + width) return 'bottom';

        // 检测是否在裁剪框内部（移动）
        if (point.x > x && point.x < x + width && point.y > y && point.y < y + height) return 'move';

        return null;
    };

    // 绘制裁剪框
    const drawCropRect = (ctx: CanvasRenderingContext2D, rect: CropRect) => {
        const { x, y, width, height } = rect;

        // 绘制暗色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 清除裁剪区域，显示原图
        ctx.clearRect(x, y, width, height);
        if (historyRef.current.length > 0) {
            const lastHistory = historyRef.current[historyRef.current.length - 1];
            ctx.drawImage(lastHistory, x, y, width, height, x, y, width, height);
        }

        // 绘制裁剪框边框
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // 绘制网格线（九宫格）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(x + width / 3, y);
        ctx.lineTo(x + width / 3, y + height);
        ctx.moveTo(x + width * 2 / 3, y);
        ctx.lineTo(x + width * 2 / 3, y + height);
        // 水平线
        ctx.moveTo(x, y + height / 3);
        ctx.lineTo(x + width, y + height / 3);
        ctx.moveTo(x, y + height * 2 / 3);
        ctx.lineTo(x + width, y + height * 2 / 3);
        ctx.stroke();

        // 绘制控制点
        const handleSize = 6;
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        const handles = [
            { x: x, y: y }, // tl
            { x: x + width, y: y }, // tr
            { x: x, y: y + height }, // bl
            { x: x + width, y: y + height }, // br
            { x: x + width / 2, y: y }, // top
            { x: x + width, y: y + height / 2 }, // right
            { x: x + width / 2, y: y + height }, // bottom
            { x: x, y: y + height / 2 }, // left
        ];

        handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
    };

    // 处理鼠标按下
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const point = getCanvasPoint(e);

        if (activeTool === 'crop') {
            if (cropRect) {
                // 检测是否点击了控制点
                const handle = getCropHandleAtPoint(point, cropRect);
                if (handle) {
                    setIsDraggingCrop(true);
                    setCropHandle(handle);
                    setDragStartPoint(point);
                    setInitialCropRect({ ...cropRect });
                } else {
                    // 创建新的裁剪框
                    setCropRect({ x: point.x, y: point.y, width: 0, height: 0 });
                    setIsDraggingCrop(true);
                    setCropHandle('br');
                    setDragStartPoint(point);
                    setInitialCropRect({ x: point.x, y: point.y, width: 0, height: 0 });
                }
            } else {
                // 初始化裁剪框
                setCropRect({ x: point.x, y: point.y, width: 0, height: 0 });
                setIsDraggingCrop(true);
                setCropHandle('br');
                setDragStartPoint(point);
                setInitialCropRect({ x: point.x, y: point.y, width: 0, height: 0 });
            }
        } else if (activeTool === 'draw' || activeTool === 'mosaic') {
            setIsDrawing(true);
            setDrawStart(point);
        }
    };

    // 处理鼠标移动
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const point = getCanvasPoint(e);

        if (activeTool === 'crop') {
            if (isDraggingCrop && dragStartPoint && initialCropRect && cropHandle) {
                const dx = point.x - dragStartPoint.x;
                const dy = point.y - dragStartPoint.y;
                let newRect = { ...initialCropRect };

                switch (cropHandle) {
                    case 'tl':
                        newRect.x = initialCropRect.x + dx;
                        newRect.y = initialCropRect.y + dy;
                        newRect.width = initialCropRect.width - dx;
                        newRect.height = initialCropRect.height - dy;
                        break;
                    case 'tr':
                        newRect.y = initialCropRect.y + dy;
                        newRect.width = initialCropRect.width + dx;
                        newRect.height = initialCropRect.height - dy;
                        break;
                    case 'bl':
                        newRect.x = initialCropRect.x + dx;
                        newRect.width = initialCropRect.width - dx;
                        newRect.height = initialCropRect.height + dy;
                        break;
                    case 'br':
                        newRect.width = initialCropRect.width + dx;
                        newRect.height = initialCropRect.height + dy;
                        break;
                    case 'top':
                        newRect.y = initialCropRect.y + dy;
                        newRect.height = initialCropRect.height - dy;
                        break;
                    case 'bottom':
                        newRect.height = initialCropRect.height + dy;
                        break;
                    case 'left':
                        newRect.x = initialCropRect.x + dx;
                        newRect.width = initialCropRect.width - dx;
                        break;
                    case 'right':
                        newRect.width = initialCropRect.width + dx;
                        break;
                    case 'move':
                        newRect.x = initialCropRect.x + dx;
                        newRect.y = initialCropRect.y + dy;
                        break;
                }

                // 确保宽高为正数
                if (newRect.width < 0) {
                    newRect.x += newRect.width;
                    newRect.width = -newRect.width;
                }
                if (newRect.height < 0) {
                    newRect.y += newRect.height;
                    newRect.height = -newRect.height;
                }

                // 限制在画布范围内
                newRect.x = Math.max(0, Math.min(newRect.x, canvas.width));
                newRect.y = Math.max(0, Math.min(newRect.y, canvas.height));
                newRect.width = Math.min(newRect.width, canvas.width - newRect.x);
                newRect.height = Math.min(newRect.height, canvas.height - newRect.y);

                setCropRect(newRect);

                // 重绘
                restoreFromHistory();
                drawCropRect(ctx, newRect);
            } else if (cropRect) {
                // 只显示裁剪框，不拖拽
                restoreFromHistory();
                drawCropRect(ctx, cropRect);

                // 更新鼠标样式
                const handle = getCropHandleAtPoint(point, cropRect);
                if (handle) {
                    const cursorMap: Record<CropHandle, string> = {
                        'tl': 'nw-resize',
                        'tr': 'ne-resize',
                        'bl': 'sw-resize',
                        'br': 'se-resize',
                        'top': 'n-resize',
                        'bottom': 's-resize',
                        'left': 'w-resize',
                        'right': 'e-resize',
                        'move': 'move',
                    };
                    canvas.style.cursor = cursorMap[handle] || 'default';
                } else {
                    canvas.style.cursor = 'crosshair';
                }
            }
        } else if (isDrawing && drawStart) {
            if (activeTool === 'mosaic') {
                // 马赛克效果
                applyMosaic(ctx, point);
            } else if (activeTool === 'draw') {
                if (drawMode === 'pen') {
                    ctx.strokeStyle = drawColor;
                    ctx.lineWidth = lineWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();
                    ctx.moveTo(drawStart.x, drawStart.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                    setDrawStart(point);
                } else {
                    // 其他绘图模式需要先恢复上一状态
                    restoreFromHistory();

                    ctx.strokeStyle = drawColor;
                    ctx.lineWidth = lineWidth;

                    if (drawMode === 'line') {
                        ctx.beginPath();
                        ctx.moveTo(drawStart.x, drawStart.y);
                        ctx.lineTo(point.x, point.y);
                        ctx.stroke();
                    } else if (drawMode === 'rect') {
                        ctx.strokeRect(
                            drawStart.x,
                            drawStart.y,
                            point.x - drawStart.x,
                            point.y - drawStart.y
                        );
                    } else if (drawMode === 'circle') {
                        const radius = Math.sqrt(
                            Math.pow(point.x - drawStart.x, 2) +
                            Math.pow(point.y - drawStart.y, 2)
                        );
                        ctx.beginPath();
                        ctx.arc(drawStart.x, drawStart.y, radius, 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                }
            }
        }
    };

    // 马赛克效果
    const applyMosaic = (ctx: CanvasRenderingContext2D, point: Point) => {
        const size = mosaicSize;
        const x = Math.floor(point.x / size) * size;
        const y = Math.floor(point.y / size) * size;

        const imageData = ctx.getImageData(x, y, size, size);
        const pixels = imageData.data;

        let r = 0, g = 0, b = 0;
        const pixelCount = size * size;

        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
        }

        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, size, size);
    };

    // 处理鼠标释放
    const handleMouseUp = () => {
        if (isDraggingCrop) {
            setIsDraggingCrop(false);
            setCropHandle(null);
            setDragStartPoint(null);
            setInitialCropRect(null);
        } else if (isDrawing) {
            saveHistory();
            setIsDrawing(false);
            setDrawStart(null);
        }
    };

    // 确认裁剪
    const confirmCrop = () => {
        const canvas = canvasRef.current;
        if (!canvas || !cropRect) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y, width, height } = cropRect;

        if (width > 10 && height > 10) {
            // 先恢复历史状态，移除绿色裁剪框
            restoreFromHistory();

            // 然后获取裁剪区域的图像数据
            const imageData = ctx.getImageData(x, y, width, height);
            canvas.width = width;
            canvas.height = height;
            ctx.putImageData(imageData, 0, 0);

            setTargetWidth(Math.round(width));
            setTargetHeight(Math.round(height));
            setOriginalWidth(Math.round(width));
            setOriginalHeight(Math.round(height));

            // 重置历史记录和裁剪状态
            historyRef.current = [];
            saveHistory();
            setCropRect(null);
        }
    };

    // 取消裁剪
    const cancelCrop = () => {
        setCropRect(null);
        setIsDraggingCrop(false);
        setCropHandle(null);
        const canvas = canvasRef.current;
        if (canvas) {
            restoreFromHistory();
        }
    };

    // 修改分辨率
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

        setOriginalWidth(targetWidth);
        setOriginalHeight(targetHeight);

        // 重置历史记录
        historyRef.current = [];
        saveHistory();
    };

    // 宽度变化处理
    const handleWidthChange = (value: number) => {
        setTargetWidth(value);
        if (maintainRatio && originalWidth > 0) {
            setTargetHeight(Math.round(value * originalHeight / originalWidth));
        }
    };

    // 高度变化处理
    const handleHeightChange = (value: number) => {
        setTargetHeight(value);
        if (maintainRatio && originalHeight > 0) {
            setTargetWidth(Math.round(value * originalWidth / originalHeight));
        }
    };

    // 导出图片
    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-7xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    图片快速编辑
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    支持裁剪、调整分辨率、涂鸦、马赛克等功能。
                </p>
            </div>

            <div className="w-full max-w-7xl flex flex-col gap-8">
                {!imageSrc ? (
                    <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark shadow-sm">
                        <label className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 sm:p-14 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors m-6">
                            <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">
                                upload_file
                            </span>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    拖拽图片至此或点击选择
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    支持 JPG, PNG, GIF 等格式
                                </p>
                            </div>
                            <span className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-white/10 px-4 text-sm font-bold text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-white/20">
                                选择图片
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
                        {/* 左侧：编辑区域 */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    编辑区域
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUndo}
                                        disabled={historyRef.current.length <= 1}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-base">undo</span>
                                        撤销
                                    </button>
                                    <button
                                        onClick={() => {
                                            setImageSrc('');
                                            setSelectedFile(null);
                                            historyRef.current = [];
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-base">refresh</span>
                                        更换图片
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-auto relative">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    className="max-w-full max-h-[600px] cursor-crosshair"
                                    style={{
                                        cursor: activeTool === 'select' ? 'default' :
                                               activeTool === 'crop' ? 'crosshair' :
                                               activeTool === 'mosaic' ? 'cell' : 'crosshair'
                                    }}
                                />

                                {/* 裁剪尺寸提示 */}
                                {cropRect && activeTool === 'crop' && (
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-mono">
                                        {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
                                    </div>
                                )}

                                {/* 裁剪确认按钮 */}
                                {cropRect && activeTool === 'crop' && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                        <button
                                            onClick={confirmCrop}
                                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 shadow-lg"
                                        >
                                            <span className="material-symbols-outlined text-base">check</span>
                                            确认裁剪
                                        </button>
                                        <button
                                            onClick={cancelCrop}
                                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 shadow-lg"
                                        >
                                            <span className="material-symbols-outlined text-base">close</span>
                                            取消
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 右侧：工具栏 */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm">
                            <div className="flex flex-col gap-6 min-h-[680px]">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                                    工具
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'select', icon: 'touch_app', label: '选择' },
                                        { id: 'crop', icon: 'crop', label: '裁剪' },
                                        { id: 'draw', icon: 'brush', label: '涂鸦' },
                                        { id: 'mosaic', icon: 'grid_on', label: '马赛克' }
                                    ].map((tool) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => setActiveTool(tool.id as EditorTool)}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                                                activeTool === tool.id
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary/50'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-2xl">
                                                {tool.icon}
                                            </span>
                                            <span className="text-xs font-medium">{tool.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {activeTool === 'crop' && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        裁剪说明
                                    </h3>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                                        <p>• 在画布上拖拽创建裁剪框</p>
                                        <p>• 拖拽边框和角落调整大小</p>
                                        <p>• 拖拽内部移动裁剪框</p>
                                        <p>• 点击确认按钮完成裁剪</p>
                                    </div>
                                    {cropRect && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                                当前选区: {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTool === 'draw' && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                        绘图模式
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        {[
                                            { id: 'pen', icon: 'edit', label: '画笔' },
                                            { id: 'line', icon: 'show_chart', label: '直线' },
                                            { id: 'rect', icon: 'crop_square', label: '矩形' },
                                            { id: 'circle', icon: 'circle', label: '圆形' }
                                        ].map((mode) => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setDrawMode(mode.id as DrawMode)}
                                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                                                    drawMode === mode.id
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {mode.icon}
                                                </span>
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                                颜色
                                            </label>
                                            <input
                                                type="color"
                                                value={drawColor}
                                                onChange={(e) => setDrawColor(e.target.value)}
                                                className="w-full h-8 rounded cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                                线条粗细: {lineWidth}px
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="20"
                                                value={lineWidth}
                                                onChange={(e) => setLineWidth(Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTool === 'mosaic' && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                        马赛克设置
                                    </h3>
                                    <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                            马赛克大小: {mosaicSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="50"
                                            value={mosaicSize}
                                            onChange={(e) => setMosaicSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                    修改分辨率
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-600 dark:text-gray-400 w-12">
                                            宽度
                                        </label>
                                        <input
                                            type="number"
                                            value={targetWidth}
                                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                                            className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                                        />
                                        <span className="text-xs text-gray-500">px</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-600 dark:text-gray-400 w-12">
                                            高度
                                        </label>
                                        <input
                                            type="number"
                                            value={targetHeight}
                                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                                            className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                                        />
                                        <span className="text-xs text-gray-500">px</span>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={maintainRatio}
                                            onChange={(e) => setMaintainRatio(e.target.checked)}
                                            className="rounded"
                                        />
                                        保持宽高比
                                    </label>
                                    <button
                                        onClick={handleResize}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        应用分辨率
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                style={{ backgroundColor: '#607AFB' }}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white shadow hover:opacity-90"
                            >
                                <span className="material-symbols-outlined text-base">download</span>
                                导出图片
                            </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditorTool;
