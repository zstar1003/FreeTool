import React, { useState, useRef, useCallback, useEffect } from 'react';

interface UploadedImage {
    file: File;
    url: string;
}

interface CollageTemplate {
    id: string;
    name: string;
    slots: number;
    layout: {
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
}

type LayoutDirection = 'horizontal' | 'vertical';
type FitMode = 'cover' | 'contain' | 'fill';

interface AspectRatio {
    id: string;
    name: string;
    ratio: number; // 宽度/高度
}

const ASPECT_RATIOS: AspectRatio[] = [
    { id: 'square', name: 'Square', ratio: 1 / 1 },
    { id: 'portrait', name: 'Portrait', ratio: 3 / 4 },
    { id: 'post', name: 'Post', ratio: 4 / 3 },
    { id: 'story', name: 'Story', ratio: 9 / 16 },
    { id: 'wide', name: 'Wide', ratio: 16 / 9 },
];

// 生成布局的辅助函数
const generateLayout = (count: number, direction: LayoutDirection): CollageTemplate => {
    const layout: CollageTemplate['layout'] = [];

    if (count === 1) {
        return {
            id: 'single',
            name: '单图',
            slots: 1,
            layout: [{ x: 0, y: 0, width: 1, height: 1 }],
        };
    }

    if (count === 2) {
        if (direction === 'horizontal') {
            return {
                id: 'horizontal-2',
                name: '水平 2 行',
                slots: 2,
                layout: [
                    { x: 0, y: 0, width: 1, height: 0.5 },
                    { x: 0, y: 0.5, width: 1, height: 0.5 },
                ],
            };
        } else {
            return {
                id: 'vertical-2',
                name: '垂直 2 列',
                slots: 2,
                layout: [
                    { x: 0, y: 0, width: 0.5, height: 1 },
                    { x: 0.5, y: 0, width: 0.5, height: 1 },
                ],
            };
        }
    }

    if (count === 3) {
        if (direction === 'horizontal') {
            return {
                id: 'horizontal-3',
                name: '水平 3 行',
                slots: 3,
                layout: [
                    { x: 0, y: 0, width: 1, height: 1/3 },
                    { x: 0, y: 1/3, width: 1, height: 1/3 },
                    { x: 0, y: 2/3, width: 1, height: 1/3 },
                ],
            };
        } else {
            return {
                id: 'vertical-3',
                name: '垂直 3 列',
                slots: 3,
                layout: [
                    { x: 0, y: 0, width: 1/3, height: 1 },
                    { x: 1/3, y: 0, width: 1/3, height: 1 },
                    { x: 2/3, y: 0, width: 1/3, height: 1 },
                ],
            };
        }
    }

    if (count === 4) {
        return {
            id: 'grid-2x2',
            name: '2x2 网格',
            slots: 4,
            layout: [
                { x: 0, y: 0, width: 0.5, height: 0.5 },
                { x: 0.5, y: 0, width: 0.5, height: 0.5 },
                { x: 0, y: 0.5, width: 0.5, height: 0.5 },
                { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
            ],
        };
    }

    if (count >= 5 && count <= 6) {
        if (direction === 'horizontal') {
            // 3行2列
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 2; col++) {
                    if (layout.length < count) {
                        layout.push({
                            x: col * 0.5,
                            y: row * (1/3),
                            width: 0.5,
                            height: 1/3,
                        });
                    }
                }
            }
        } else {
            // 2行3列
            for (let row = 0; row < 2; row++) {
                for (let col = 0; col < 3; col++) {
                    if (layout.length < count) {
                        layout.push({
                            x: col * (1/3),
                            y: row * 0.5,
                            width: 1/3,
                            height: 0.5,
                        });
                    }
                }
            }
        }
        return {
            id: `grid-${count}`,
            name: `${count}图网格`,
            slots: count,
            layout,
        };
    }

    // 7-9张图片，使用3x3网格
    if (count >= 7 && count <= 9) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (layout.length < count) {
                    layout.push({
                        x: col * (1/3),
                        y: row * (1/3),
                        width: 1/3,
                        height: 1/3,
                    });
                }
            }
        }
        return {
            id: `grid-${count}`,
            name: `${count}图网格`,
            slots: count,
            layout,
        };
    }

    // 超过9张，使用4x4网格
    const gridSize = Math.ceil(Math.sqrt(count));
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (layout.length < count) {
                layout.push({
                    x: col * (1 / gridSize),
                    y: row * (1 / gridSize),
                    width: 1 / gridSize,
                    height: 1 / gridSize,
                });
            }
        }
    }

    return {
        id: `grid-${count}`,
        name: `${count}图网格`,
        slots: count,
        layout,
    };
};

const PhotoCollageTool: React.FC = () => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('vertical');
    const [fitMode, setFitMode] = useState<FitMode>('cover');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]); // 默认正方形
    const [canvasBaseSize, setCanvasBaseSize] = useState<number>(1200); // 基准尺寸
    const [spacing, setSpacing] = useState<number>(10);
    const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 根据当前图片数量和布局方向生成模板
    const currentTemplate = images.length > 0 ? generateLayout(images.length, layoutDirection) : null;

    // 根据宽高比计算实际画布尺寸
    const canvasWidth = aspectRatio.ratio >= 1
        ? canvasBaseSize
        : Math.round(canvasBaseSize * aspectRatio.ratio);
    const canvasHeight = aspectRatio.ratio >= 1
        ? Math.round(canvasBaseSize / aspectRatio.ratio)
        : canvasBaseSize;

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        const newImages: UploadedImage[] = imageFiles.map(file => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setImages(prev => [...prev, ...newImages]);
    }, []);

    const removeImage = useCallback((index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].url);
            newImages.splice(index, 1);
            return newImages;
        });
    }, []);

    const clearAllImages = useCallback(() => {
        images.forEach(img => URL.revokeObjectURL(img.url));
        setImages([]);
        setPreviewUrl('');
    }, [images]);

    const generateCollage = useCallback(async () => {
        if (images.length === 0 || !currentTemplate) return;

        setIsGenerating(true);

        try {
            const canvas = canvasRef.current;
            if (!canvas) return;

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // 填充背景色
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // 加载所有图片
            const loadedImages = await Promise.all(
                images.slice(0, currentTemplate.slots).map(img => {
                    return new Promise<HTMLImageElement>((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = img.url;
                    });
                })
            );

            // 绘制每个槽位的图片
            currentTemplate.layout.forEach((slot, index) => {
                if (index >= loadedImages.length) return;

                const image = loadedImages[index];

                // 计算槽位的实际像素位置和大小（考虑间距）
                const halfSpacing = spacing / 2;
                const slotX = slot.x * canvasWidth + halfSpacing;
                const slotY = slot.y * canvasHeight + halfSpacing;
                const slotWidth = slot.width * canvasWidth - spacing;
                const slotHeight = slot.height * canvasHeight - spacing;

                // 先填充背景色
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(slotX, slotY, slotWidth, slotHeight);

                // 计算图片的绘制位置和大小
                const slotRatio = slotWidth / slotHeight;
                const imageRatio = image.width / image.height;

                let sx = 0;
                let sy = 0;
                let sWidth = image.width;
                let sHeight = image.height;
                let dx = slotX;
                let dy = slotY;
                let dWidth = slotWidth;
                let dHeight = slotHeight;

                if (fitMode === 'cover') {
                    // 填充模式：裁剪图片以填满槽位
                    if (imageRatio > slotRatio) {
                        // 图片更宽，裁剪左右
                        sWidth = image.height * slotRatio;
                        sx = (image.width - sWidth) / 2;
                    } else {
                        // 图片更高，裁剪上下
                        sHeight = image.width / slotRatio;
                        sy = (image.height - sHeight) / 2;
                    }
                } else if (fitMode === 'contain') {
                    // 适应模式：完整显示图片，可能有留白
                    if (imageRatio > slotRatio) {
                        // 图片更宽，以宽度为准
                        dHeight = slotWidth / imageRatio;
                        dy = slotY + (slotHeight - dHeight) / 2;
                    } else {
                        // 图片更高，以高度为准
                        dWidth = slotHeight * imageRatio;
                        dx = slotX + (slotWidth - dWidth) / 2;
                    }
                } else if (fitMode === 'fill') {
                    // 拉伸模式：拉伸图片以填满槽位（保持sx, sy, sWidth, sHeight为默认值）
                    // dx, dy, dWidth, dHeight 已经是槽位大小，无需修改
                }

                ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            });

            // 生成预览
            const dataUrl = canvas.toDataURL('image/png');
            setPreviewUrl(dataUrl);

        } catch (error) {
            console.error('生成拼接图失败:', error);
            alert('生成拼接图时出错，请重试');
        } finally {
            setIsGenerating(false);
        }
    }, [images, currentTemplate, canvasWidth, canvasHeight, spacing, backgroundColor, fitMode]);

    const handleDownload = useCallback(() => {
        if (!previewUrl) return;

        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    }, [previewUrl]);

    // 当图片或模板改变时，自动生成预览
    useEffect(() => {
        if (images.length > 0) {
            generateCollage();
        }
    }, [images, layoutDirection, canvasWidth, canvasHeight, spacing, backgroundColor, fitMode]);

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-7xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    模板快速拼接
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    上传多张图片，选择模板自动拼接成一张图片
                </p>
            </div>

            <div className="w-full max-w-7xl">
                {/* 主要内容区域 - 左右布局 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左侧 - 预览区域 */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* 上传区域 */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/20 shadow-sm p-6">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        上传图片 ({images.length} 张)
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="flex-1 text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-gray-900 hover:file:opacity-90"
                                        />
                                        {images.length > 0 && (
                                            <button
                                                onClick={clearAllImages}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                            >
                                                清除全部
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 图片缩略图列表 - 更小尺寸 */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={img.url}
                                                    alt={`图片 ${index + 1}`}
                                                    className="w-full aspect-square object-cover rounded border border-gray-200 dark:border-gray-700"
                                                />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                >
                                                    ×
                                                </button>
                                                <div className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 预览区域 */}
                        {previewUrl ? (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/20 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        拼接预览
                                    </h3>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        下载拼接图
                                    </button>
                                </div>
                                <div className="flex justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="拼接预览"
                                        className="max-w-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                                        style={{ maxHeight: '600px' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            images.length === 0 && (
                                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-12 text-center">
                                    <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500 mb-4 block">
                                        collections
                                    </span>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        请上传图片开始制作拼接图
                                    </p>
                                </div>
                            )
                        )}
                    </div>

                    {/* 右侧 - 控制面板 */}
                    <div className="flex flex-col gap-4">
                        {/* 当前模板信息 */}
                        {currentTemplate && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <div className="flex flex-col gap-1 text-blue-700 dark:text-blue-300">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">info</span>
                                        <span className="text-xs font-medium">当前配置</span>
                                    </div>
                                    <div className="text-xs ml-6">
                                        {currentTemplate.name} ({currentTemplate.slots}张)
                                    </div>
                                    <div className="text-xs ml-6">
                                        {canvasWidth} x {canvasHeight}px
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 画布比例 */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/20 shadow-sm p-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                画布比例
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {ASPECT_RATIOS.map(ratio => (
                                    <button
                                        key={ratio.id}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                                            aspectRatio.id === ratio.id
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <span className="font-medium text-sm">{ratio.name}</span>
                                        <span className="text-xs opacity-70">
                                            {ratio.id === 'square' && '1:1'}
                                            {ratio.id === 'portrait' && '3:4'}
                                            {ratio.id === 'post' && '4:3'}
                                            {ratio.id === 'story' && '9:16'}
                                            {ratio.id === 'wide' && '16:9'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 布局方向 */}
                        {images.length >= 2 && images.length <= 3 && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/20 shadow-sm p-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    布局方向
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => setLayoutDirection('vertical')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                                            layoutDirection === 'vertical'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">view_column</span>
                                            <span className="font-medium text-sm">左右排列</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setLayoutDirection('horizontal')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                                            layoutDirection === 'horizontal'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">view_agenda</span>
                                            <span className="font-medium text-sm">上下排列</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 图片适配方式 */}
                        {images.length > 0 && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/20 shadow-sm p-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    图片适配
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => setFitMode('cover')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                                            fitMode === 'cover'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">crop_free</span>
                                            <span className="font-medium text-sm">填充</span>
                                        </div>
                                        <span className="text-xs opacity-70">裁剪填满</span>
                                    </button>
                                    <button
                                        onClick={() => setFitMode('contain')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                                            fitMode === 'contain'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">fit_screen</span>
                                            <span className="font-medium text-sm">适应</span>
                                        </div>
                                        <span className="text-xs opacity-70">完整显示</span>
                                    </button>
                                    <button
                                        onClick={() => setFitMode('fill')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                                            fitMode === 'fill'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">open_in_full</span>
                                            <span className="font-medium text-sm">拉伸</span>
                                        </div>
                                        <span className="text-xs opacity-70">可能变形</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 其他设置 */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/20 shadow-sm p-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                其他设置
                            </label>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                                        基准尺寸
                                    </label>
                                    <select
                                        value={canvasBaseSize}
                                        onChange={(e) => setCanvasBaseSize(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value={800}>800px</option>
                                        <option value={1200}>1200px</option>
                                        <option value={1600}>1600px</option>
                                        <option value={2000}>2000px</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                                        图片间距: {spacing}px
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={spacing}
                                        onChange={(e) => setSpacing(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                                        背景颜色
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={backgroundColor}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            className="h-9 w-16 rounded border border-gray-300 dark:border-gray-700 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                            {backgroundColor.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 隐藏的 canvas */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default PhotoCollageTool;
