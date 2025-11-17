import React, { useState, useCallback } from 'react';

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'bmp';

const ImageConverterTool: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
    const [convertedUrl, setConvertedUrl] = useState<string>('');
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('请选择图片文件');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setConvertedUrl('');

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleConvert = useCallback(async () => {
        if (!selectedFile || !previewUrl) {
            setError('请先选择图片');
            return;
        }

        setIsConverting(true);
        setError(null);

        try {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setError('Canvas 上下文创建失败');
                    setIsConverting(false);
                    return;
                }

                ctx.drawImage(img, 0, 0);

                const mimeType = `image/${targetFormat === 'jpeg' ? 'jpeg' : targetFormat}`;
                const quality = targetFormat === 'jpeg' ? 0.9 : undefined;

                canvas.toBlob((blob) => {
                    if (!blob) {
                        setError('图片转换失败');
                        setIsConverting(false);
                        return;
                    }

                    const url = URL.createObjectURL(blob);
                    setConvertedUrl(url);
                    setIsConverting(false);
                }, mimeType, quality);
            };

            img.onerror = () => {
                setError('图片加载失败');
                setIsConverting(false);
            };

            img.src = previewUrl;
        } catch (err) {
            console.error(err);
            setError('转换过程中出现错误');
            setIsConverting(false);
        }
    }, [selectedFile, previewUrl, targetFormat]);

    const handleDownload = useCallback(() => {
        if (!convertedUrl || !selectedFile) return;

        const a = document.createElement('a');
        a.href = convertedUrl;
        const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
        a.download = `${originalName}.${targetFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [convertedUrl, selectedFile, targetFormat]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-3 text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white sm:text-5xl">在线图片格式转换</h1>
                    <p className="text-base font-normal text-gray-600 dark:text-gray-400">快速将您的图片转换为 JPG, PNG, WEBP 等多种格式。免费、安全。</p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="w-full space-y-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 sm:p-8 shadow-sm">
                    <label className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 sm:p-14 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">upload_file</span>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {selectedFile ? selectedFile.name : '拖拽图片至此'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">支持 JPG, PNG, BMP, GIF 等格式</p>
                        </div>
                        {!selectedFile && (
                            <span className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-white/10 px-4 text-sm font-bold text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-white/20">
                                点击选择文件
                            </span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>

                    {previewUrl && (
                        <>
                            <div className="space-y-4">
                                <h3 className="px-1 text-lg font-bold text-gray-900 dark:text-white">转换为：</h3>
                                <div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 p-1.5">
                                    {(['jpeg', 'png', 'webp', 'gif'] as ImageFormat[]).map((format) => (
                                        <label
                                            key={format}
                                            className="flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:has-[:checked]:bg-gray-700 dark:has-[:checked]:text-white"
                                        >
                                            <span className="truncate uppercase">{format}</span>
                                            <input
                                                className="sr-only"
                                                name="format-select"
                                                type="radio"
                                                value={format}
                                                checked={targetFormat === format}
                                                onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={convertedUrl ? handleDownload : handleConvert}
                                disabled={isConverting}
                                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isConverting ? (
                                    <>
                                        <div className="spinner"></div>
                                        <span className="truncate">转换中...</span>
                                    </>
                                ) : convertedUrl ? (
                                    <>
                                        <span className="material-symbols-outlined">download</span>
                                        <span className="truncate">下载转换后的图片</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">transform</span>
                                        <span className="truncate">转换图片</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                <section className="py-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">如何使用</h2>
                        <p className="max-w-xl text-gray-600 dark:text-gray-400">只需三步,轻松转换您的图片。</p>
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">upload</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. 上传图片</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">点击上传区域选择文件,或直接拖拽您的图片文件。</p>
                        </div>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">tune</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. 选择格式</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">从 JPG, PNG 等可用选项中选择您需要的目标格式。</p>
                        </div>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">download_done</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. 下载文件</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">点击下载按钮,您的新图片将在几秒钟内准备就绪。</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ImageConverterTool;
