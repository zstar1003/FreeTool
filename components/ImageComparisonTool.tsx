import React, { useState, useRef, useCallback } from 'react';

interface ImageLayer {
    id: string;
    name: string;
    src: string;
    visible: boolean;
    locked: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
    scale: number;
    rotation: number;
    opacity: number;
    zIndex: number;
}

interface TextLayer {
    id: string;
    name: string;
    text: string;
    visible: boolean;
    locked: boolean;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    rotation: number;
    opacity: number;
    zIndex: number;
}

type Layer = (ImageLayer | TextLayer) & { type: 'image' | 'text' };

const ImageComparisonTool: React.FC = () => {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [initialLayerPos, setInitialLayerPos] = useState<{ x: number; y: number } | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

    // 绘制画布
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清空画布
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制棋盘背景
        const gridSize = 20;
        for (let i = 0; i < canvas.width; i += gridSize) {
            for (let j = 0; j < canvas.height; j += gridSize) {
                if ((i / gridSize + j / gridSize) % 2 === 0) {
                    ctx.fillStyle = '#ffffff';
                } else {
                    ctx.fillStyle = '#e0e0e0';
                }
                ctx.fillRect(i, j, gridSize, gridSize);
            }
        }

        // 按 zIndex 排序图层
        const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

        // 绘制所有可见图层
        sortedLayers.forEach(layer => {
            if (!layer.visible) return;

            ctx.save();
            ctx.globalAlpha = layer.opacity;

            if (layer.type === 'image') {
                const imgLayer = layer as ImageLayer;

                // 使用缓存的图片
                let img = loadedImagesRef.current.get(imgLayer.id);
                if (!img) {
                    img = new Image();
                    img.src = imgLayer.src;
                    loadedImagesRef.current.set(imgLayer.id, img);
                }

                ctx.translate(imgLayer.x + imgLayer.width / 2, imgLayer.y + imgLayer.height / 2);
                ctx.rotate((imgLayer.rotation * Math.PI) / 180);
                ctx.drawImage(img, -imgLayer.width / 2, -imgLayer.height / 2, imgLayer.width, imgLayer.height);

                // 选中状态边框
                if (selectedLayerId === layer.id) {
                    ctx.strokeStyle = '#00FF00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(-imgLayer.width / 2, -imgLayer.height / 2, imgLayer.width, imgLayer.height);

                    // 绘制控制点
                    const handleSize = 8;
                    ctx.fillStyle = '#00FF00';
                    ctx.fillRect(-imgLayer.width / 2 - handleSize / 2, -imgLayer.height / 2 - handleSize / 2, handleSize, handleSize);
                    ctx.fillRect(imgLayer.width / 2 - handleSize / 2, -imgLayer.height / 2 - handleSize / 2, handleSize, handleSize);
                    ctx.fillRect(-imgLayer.width / 2 - handleSize / 2, imgLayer.height / 2 - handleSize / 2, handleSize, handleSize);
                    ctx.fillRect(imgLayer.width / 2 - handleSize / 2, imgLayer.height / 2 - handleSize / 2, handleSize, handleSize);
                }
            } else if (layer.type === 'text') {
                const textLayer = layer as TextLayer;
                ctx.translate(textLayer.x, textLayer.y);
                ctx.rotate((textLayer.rotation * Math.PI) / 180);
                ctx.font = `${textLayer.fontSize}px ${textLayer.fontFamily}`;
                ctx.fillStyle = textLayer.color;
                ctx.fillText(textLayer.text, 0, 0);

                // 选中状态边框
                if (selectedLayerId === layer.id) {
                    const metrics = ctx.measureText(textLayer.text);
                    ctx.strokeStyle = '#00FF00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(-5, -textLayer.fontSize - 5, metrics.width + 10, textLayer.fontSize + 10);
                }
            }

            ctx.restore();
        });
    }, [layers, selectedLayerId]);

    // 重绘画布
    React.useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    // 添加图片
    const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // 根据画布宽度动态调整图片尺寸
                    const maxCanvasWidth = canvasSize.width * 0.8; // 最大占画布80%宽度
                    const maxCanvasHeight = canvasSize.height * 0.8; // 最大占画布80%高度

                    let displayWidth = img.width;
                    let displayHeight = img.height;
                    let scale = 1;

                    // 如果图片超过画布宽度或高度，等比例缩小
                    if (displayWidth > maxCanvasWidth || displayHeight > maxCanvasHeight) {
                        const widthScale = maxCanvasWidth / displayWidth;
                        const heightScale = maxCanvasHeight / displayHeight;
                        scale = Math.min(widthScale, heightScale);

                        displayWidth = img.width * scale;
                        displayHeight = img.height * scale;
                    }

                    const newLayer: Layer = {
                        id: Date.now().toString() + index,
                        type: 'image',
                        name: `图片 ${layers.length + index + 1}`,
                        src: event.target?.result as string,
                        visible: true,
                        locked: false,
                        x: 50 + index * 30,
                        y: 50 + index * 30,
                        width: displayWidth,
                        height: displayHeight,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        scale: scale,
                        rotation: 0,
                        opacity: 1,
                        zIndex: layers.length + index,
                    };

                    setLayers(prev => [...prev, newLayer]);

                    // 缓存图片
                    loadedImagesRef.current.set(newLayer.id, img);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
    };

    // 添加文本
    const handleAddText = () => {
        const newLayer: Layer = {
            id: Date.now().toString(),
            type: 'text',
            name: `文本 ${layers.filter(l => l.type === 'text').length + 1}`,
            text: '文本内容',
            visible: true,
            locked: false,
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            fontSize: 32,
            fontFamily: 'Arial',
            color: '#000000',
            rotation: 0,
            opacity: 1,
            zIndex: layers.length,
        };

        setLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    // 获取鼠标在canvas上的坐标
    const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    // 检测点击的图层
    const getLayerAtPoint = (x: number, y: number): Layer | null => {
        const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

        for (const layer of sortedLayers) {
            if (!layer.visible || layer.locked) continue; // 跳过不可见或锁定的图层

            if (layer.type === 'image') {
                const imgLayer = layer as ImageLayer;
                if (
                    x >= imgLayer.x &&
                    x <= imgLayer.x + imgLayer.width &&
                    y >= imgLayer.y &&
                    y <= imgLayer.y + imgLayer.height
                ) {
                    return layer;
                }
            } else if (layer.type === 'text') {
                const textLayer = layer as TextLayer;
                const canvas = canvasRef.current;
                if (!canvas) continue;
                const ctx = canvas.getContext('2d');
                if (!ctx) continue;

                ctx.font = `${textLayer.fontSize}px ${textLayer.fontFamily}`;
                const metrics = ctx.measureText(textLayer.text);

                // Text is drawn with translate(x, y) then fillText(0, 0)
                // The text baseline is at (x, y), text extends upward by fontSize
                // Match the selection box: strokeRect(-5, -fontSize - 5, width + 10, fontSize + 10)
                const hitX = textLayer.x - 5;
                const hitY = textLayer.y - textLayer.fontSize - 5;
                const hitWidth = metrics.width + 10;
                const hitHeight = textLayer.fontSize + 10;

                if (
                    x >= hitX &&
                    x <= hitX + hitWidth &&
                    y >= hitY &&
                    y <= hitY + hitHeight
                ) {
                    return layer;
                }
            }
        }

        return null;
    };

    // 鼠标按下
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const point = getCanvasPoint(e);
        const layer = getLayerAtPoint(point.x, point.y);

        if (layer && !layer.locked) {
            setSelectedLayerId(layer.id);
            setIsDragging(true);
            setDragStart(point);
            setInitialLayerPos({ x: layer.x, y: layer.y });
        } else {
            setSelectedLayerId(null);
        }
    };

    // 鼠标移动
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !dragStart || !selectedLayerId || !initialLayerPos) return;

        // 检查图层是否被锁定
        const currentLayer = layers.find(l => l.id === selectedLayerId);
        if (currentLayer?.locked) return;

        const point = getCanvasPoint(e);
        const dx = point.x - dragStart.x;
        const dy = point.y - dragStart.y;

        setLayers(prev =>
            prev.map(layer => {
                if (layer.id === selectedLayerId && !layer.locked) {
                    return {
                        ...layer,
                        x: initialLayerPos.x + dx,
                        y: initialLayerPos.y + dy,
                    };
                }
                return layer;
            })
        );
    };

    // 鼠标释放
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
        setInitialLayerPos(null);
    };

    // 切换图层可见性
    const toggleLayerVisibility = (id: string) => {
        setLayers(prev =>
            prev.map(layer => (layer.id === id ? { ...layer, visible: !layer.visible } : layer))
        );
    };

    // 切换图层锁定状态
    const toggleLayerLock = (id: string) => {
        setLayers(prev =>
            prev.map(layer => {
                if (layer.id === id) {
                    const newLocked = !layer.locked;
                    // 如果锁定了当前选中的图层，取消选中
                    if (newLocked && selectedLayerId === id) {
                        setSelectedLayerId(null);
                    }
                    return { ...layer, locked: newLocked };
                }
                return layer;
            })
        );
    };

    // 删除图层
    const deleteLayer = (id: string) => {
        setLayers(prev => prev.filter(layer => layer.id !== id));
        if (selectedLayerId === id) {
            setSelectedLayerId(null);
        }
    };

    // 调整图层顺序
    const moveLayer = (id: string, direction: 'up' | 'down') => {
        setLayers(prev => {
            const currentLayer = prev.find(l => l.id === id);
            if (!currentLayer) return prev;

            const sortedLayers = [...prev].sort((a, b) => a.zIndex - b.zIndex);
            const sortedIndex = sortedLayers.findIndex(l => l.id === id);

            if (sortedIndex === -1) return prev;

            const newLayers = [...prev];

            // 'up' means higher zIndex (rendered on top)
            if (direction === 'up' && sortedIndex < sortedLayers.length - 1) {
                const targetLayer = sortedLayers[sortedIndex + 1];
                const currentIdx = prev.findIndex(l => l.id === id);
                const targetIdx = prev.findIndex(l => l.id === targetLayer.id);

                [newLayers[currentIdx].zIndex, newLayers[targetIdx].zIndex] = [
                    newLayers[targetIdx].zIndex,
                    newLayers[currentIdx].zIndex,
                ];
            }
            // 'down' means lower zIndex (rendered below)
            else if (direction === 'down' && sortedIndex > 0) {
                const targetLayer = sortedLayers[sortedIndex - 1];
                const currentIdx = prev.findIndex(l => l.id === id);
                const targetIdx = prev.findIndex(l => l.id === targetLayer.id);

                [newLayers[currentIdx].zIndex, newLayers[targetIdx].zIndex] = [
                    newLayers[targetIdx].zIndex,
                    newLayers[currentIdx].zIndex,
                ];
            }

            return newLayers;
        });
    };

    // 更新选中图层的属性
    const updateSelectedLayer = (updates: Partial<Layer>) => {
        if (!selectedLayerId) return;

        setLayers(prev =>
            prev.map(layer => {
                if (layer.id === selectedLayerId) {
                    return { ...layer, ...updates };
                }
                return layer;
            })
        );
    };

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3 text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white sm:text-5xl">
                        多图移动对比
                    </h1>
                    <p className="text-base font-normal text-gray-600 dark:text-gray-400">
                        在一个画布中导入多张图片，支持图层管理、位置调整和文本添加
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
                    {/* 左侧：画布区域 */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">画布</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
                                    style={{ backgroundColor: '#607AFB' }}
                                >
                                    <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                                    添加图片
                                </button>
                                <button
                                    onClick={handleAddText}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined text-base">text_fields</span>
                                    添加文本
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAddImage}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-auto">
                            <canvas
                                ref={canvasRef}
                                width={canvasSize.width}
                                height={canvasSize.height}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className="max-w-full max-h-[600px] cursor-move shadow-lg"
                            />
                        </div>

                        {selectedLayer && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    当前选中: {selectedLayer.name}
                                </h4>

                                {selectedLayer.type === 'image' && (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                                缩放: {Math.round((selectedLayer as ImageLayer).scale * 100)}%
                                            </label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="200"
                                                value={(selectedLayer as ImageLayer).scale * 100}
                                                onChange={e => {
                                                    const scale = parseFloat(e.target.value) / 100;
                                                    const imgLayer = selectedLayer as ImageLayer;
                                                    updateSelectedLayer({
                                                        scale,
                                                        width: imgLayer.originalWidth * scale,
                                                        height: imgLayer.originalHeight * scale,
                                                    });
                                                }}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedLayer.type === 'text' && (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                                文本内容
                                            </label>
                                            <input
                                                type="text"
                                                value={(selectedLayer as TextLayer).text}
                                                onChange={e => updateSelectedLayer({ text: e.target.value })}
                                                className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                                                placeholder="输入文本内容"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                                字体大小: {(selectedLayer as TextLayer).fontSize}px
                                            </label>
                                            <input
                                                type="range"
                                                min="12"
                                                max="120"
                                                value={(selectedLayer as TextLayer).fontSize}
                                                onChange={e =>
                                                    updateSelectedLayer({ fontSize: parseInt(e.target.value) })
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                                颜色
                                            </label>
                                            <input
                                                type="color"
                                                value={(selectedLayer as TextLayer).color}
                                                onChange={e => updateSelectedLayer({ color: e.target.value })}
                                                className="w-full h-8 rounded cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                        旋转: {selectedLayer.rotation}°
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={selectedLayer.rotation}
                                        onChange={e => updateSelectedLayer({ rotation: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                        不透明度: {Math.round(selectedLayer.opacity * 100)}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={selectedLayer.opacity * 100}
                                        onChange={e =>
                                            updateSelectedLayer({ opacity: parseFloat(e.target.value) / 100 })
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 右侧：图层面板 */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm">
                        <div className="flex flex-col gap-4 min-h-[680px]">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">图层</h3>

                            {layers.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 text-sm">
                                    <div className="space-y-2">
                                        <span className="material-symbols-outlined text-4xl">layers</span>
                                        <p>暂无图层</p>
                                        <p className="text-xs">点击上方按钮添加图片或文本</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {[...layers]
                                        .sort((a, b) => b.zIndex - a.zIndex)
                                        .map(layer => (
                                            <div
                                                key={layer.id}
                                                className={`p-3 rounded-lg border transition-all ${
                                                    layer.locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                                } ${
                                                    selectedLayerId === layer.id
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                                onClick={() => !layer.locked && setSelectedLayerId(layer.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            toggleLayerVisibility(layer.id);
                                                        }}
                                                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                        title={layer.visible ? '隐藏' : '显示'}
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            {layer.visible ? 'visibility' : 'visibility_off'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            toggleLayerLock(layer.id);
                                                        }}
                                                        className={`${
                                                            layer.locked
                                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                                : 'text-gray-600 dark:text-gray-400'
                                                        } hover:text-gray-900 dark:hover:text-white`}
                                                        title={layer.locked ? '解锁' : '锁定'}
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            {layer.locked ? 'lock' : 'lock_open'}
                                                        </span>
                                                    </button>
                                                    <span className="material-symbols-outlined text-base text-gray-600 dark:text-gray-400">
                                                        {layer.type === 'image' ? 'image' : 'text_fields'}
                                                    </span>
                                                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {layer.name}
                                                        {layer.locked && (
                                                            <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                                (锁定)
                                                            </span>
                                                        )}
                                                    </span>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            deleteLayer(layer.id);
                                                        }}
                                                        className="text-red-500 hover:text-red-600"
                                                        title="删除"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            delete
                                                        </span>
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            moveLayer(layer.id, 'up');
                                                        }}
                                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            arrow_upward
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            moveLayer(layer.id, 'down');
                                                        }}
                                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            arrow_downward
                                                        </span>
                                                    </button>
                                                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                                                        {Math.round(layer.opacity * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    const canvas = canvasRef.current;
                                    if (!canvas) return;

                                    // 创建一个临时画布，只绘制图层内容（无背景）
                                    const exportCanvas = document.createElement('canvas');
                                    exportCanvas.width = canvas.width;
                                    exportCanvas.height = canvas.height;
                                    const exportCtx = exportCanvas.getContext('2d');
                                    if (!exportCtx) return;

                                    // 按 zIndex 排序图层
                                    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

                                    // 只绘制可见图层，不绘制背景
                                    sortedLayers.forEach(layer => {
                                        if (!layer.visible) return;

                                        exportCtx.save();
                                        exportCtx.globalAlpha = layer.opacity;

                                        if (layer.type === 'image') {
                                            const imgLayer = layer as ImageLayer;
                                            let img = loadedImagesRef.current.get(imgLayer.id);
                                            if (img) {
                                                exportCtx.translate(imgLayer.x + imgLayer.width / 2, imgLayer.y + imgLayer.height / 2);
                                                exportCtx.rotate((imgLayer.rotation * Math.PI) / 180);
                                                exportCtx.drawImage(img, -imgLayer.width / 2, -imgLayer.height / 2, imgLayer.width, imgLayer.height);
                                            }
                                        } else if (layer.type === 'text') {
                                            const textLayer = layer as TextLayer;
                                            exportCtx.translate(textLayer.x, textLayer.y);
                                            exportCtx.rotate((textLayer.rotation * Math.PI) / 180);
                                            exportCtx.font = `${textLayer.fontSize}px ${textLayer.fontFamily}`;
                                            exportCtx.fillStyle = textLayer.color;
                                            exportCtx.fillText(textLayer.text, 0, 0);
                                        }

                                        exportCtx.restore();
                                    });

                                    // 获取导出画布的像素数据
                                    const imageData = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
                                    const pixels = imageData.data;

                                    // 找到非透明区域的边界
                                    let minX = exportCanvas.width;
                                    let minY = exportCanvas.height;
                                    let maxX = 0;
                                    let maxY = 0;

                                    for (let y = 0; y < exportCanvas.height; y++) {
                                        for (let x = 0; x < exportCanvas.width; x++) {
                                            const index = (y * exportCanvas.width + x) * 4;
                                            const alpha = pixels[index + 3];

                                            // 如果像素不是完全透明的
                                            if (alpha > 0) {
                                                if (x < minX) minX = x;
                                                if (x > maxX) maxX = x;
                                                if (y < minY) minY = y;
                                                if (y > maxY) maxY = y;
                                            }
                                        }
                                    }

                                    // 如果没有找到非透明像素，使用整个画布
                                    if (minX > maxX || minY > maxY) {
                                        minX = 0;
                                        minY = 0;
                                        maxX = exportCanvas.width - 1;
                                        maxY = exportCanvas.height - 1;
                                    }

                                    // 计算裁剪区域的尺寸
                                    const cropWidth = maxX - minX + 1;
                                    const cropHeight = maxY - minY + 1;

                                    // 创建最终的导出画布
                                    const finalCanvas = document.createElement('canvas');
                                    finalCanvas.width = cropWidth;
                                    finalCanvas.height = cropHeight;
                                    const finalCtx = finalCanvas.getContext('2d');

                                    if (finalCtx) {
                                        // 将裁剪区域绘制到最终画布
                                        finalCtx.drawImage(
                                            exportCanvas,
                                            minX, minY, cropWidth, cropHeight,
                                            0, 0, cropWidth, cropHeight
                                        );

                                        // 导出裁剪后的图片
                                        finalCanvas.toBlob(blob => {
                                            if (!blob) return;
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `comparison-${Date.now()}.png`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        });
                                    }
                                }}
                                disabled={layers.length === 0}
                                style={{ backgroundColor: '#607AFB' }}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-base">download</span>
                                导出画布
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageComparisonTool;
