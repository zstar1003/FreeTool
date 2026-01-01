/**
 * 图像修复 (Inpainting) 核心逻辑
 * 使用 MI-GAN 模型进行图像修复，移除水印等不需要的内容
 * 纯 Canvas API 实现，无需 OpenCV.js
 */

declare global {
    interface Window {
        ort: typeof import('onnxruntime-web');
    }
}

// 模型 URL - 使用 pipeline v2 版本，支持两个独立输入 (image + mask)
const MODEL_URLS = [
    'https://huggingface.co/andraniksargsyan/migan/resolve/main/migan_pipeline_v2.onnx',
    'https://huggingface.co/lxfater/inpaint-web/resolve/main/migan.onnx',
];

// IndexedDB 配置
const DB_NAME = 'freetool-inpaint';
const STORE_NAME = 'models';
const MODEL_KEY = 'migan-pipeline-v2'; // 使用 pipeline v2 模型

/**
 * 打开 IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

/**
 * 从 IndexedDB 获取模型
 */
async function getModelFromCache(): Promise<ArrayBuffer | null> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(MODEL_KEY);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    } catch (e) {
        console.error('Failed to get model from cache:', e);
        return null;
    }
}

/**
 * 保存模型到 IndexedDB
 */
async function saveModelToCache(data: ArrayBuffer): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(data, MODEL_KEY);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (e) {
        console.error('Failed to save model to cache:', e);
    }
}

/**
 * 下载模型
 */
export async function downloadModel(
    onProgress?: (progress: number, loaded: number, total: number) => void
): Promise<ArrayBuffer> {
    // 先尝试从缓存获取
    const cached = await getModelFromCache();
    if (cached) {
        onProgress?.(100, cached.byteLength, cached.byteLength);
        return cached;
    }

    // 尝试从多个 URL 下载
    for (const url of MODEL_URLS) {
        try {
            const response = await fetch(url);
            if (!response.ok) continue;

            const contentLength = Number(response.headers.get('content-length')) || 0;
            const reader = response.body?.getReader();
            if (!reader) continue;

            const chunks: Uint8Array[] = [];
            let loaded = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                loaded += value.length;
                if (contentLength > 0) {
                    onProgress?.(Math.round((loaded / contentLength) * 100), loaded, contentLength);
                }
            }

            const buffer = new Uint8Array(loaded);
            let offset = 0;
            for (const chunk of chunks) {
                buffer.set(chunk, offset);
                offset += chunk.length;
            }

            const arrayBuffer = buffer.buffer;
            // 保存到缓存
            await saveModelToCache(arrayBuffer);
            return arrayBuffer;
        } catch (e) {
            console.error(`Failed to download from ${url}:`, e);
            continue;
        }
    }

    throw new Error('Failed to download model from all URLs');
}

// ONNX Session 缓存
let sessionCache: any = null;

/**
 * 获取 ONNX Session
 */
export async function getSession(
    onProgress?: (progress: number, loaded: number, total: number) => void
): Promise<any> {
    if (sessionCache) return sessionCache;

    const modelData = await downloadModel(onProgress);
    const ort = window.ort;

    // 配置执行提供者
    const options: any = {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
    };

    sessionCache = await ort.InferenceSession.create(modelData, options);
    return sessionCache;
}

/**
 * 使用 Canvas 调整图像大小
 */
function resizeImageCanvas(
    imageData: ImageData,
    targetSize: number
): { resized: ImageData; scale: number; padX: number; padY: number; newWidth: number; newHeight: number } {
    const { width, height } = imageData;

    // 计算缩放比例
    const scale = Math.min(targetSize / width, targetSize / height);
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);

    // 计算填充位置（居中）
    const padX = Math.floor((targetSize - newWidth) / 2);
    const padY = Math.floor((targetSize - newHeight) / 2);

    // 创建临时 canvas 来缩放图像
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = width;
    srcCanvas.height = height;
    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.putImageData(imageData, 0, 0);

    // 创建目标 canvas（带填充）
    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = targetSize;
    dstCanvas.height = targetSize;
    const dstCtx = dstCanvas.getContext('2d')!;

    // 填充黑色背景
    dstCtx.fillStyle = 'black';
    dstCtx.fillRect(0, 0, targetSize, targetSize);

    // 绘制缩放后的图像到中心位置
    dstCtx.drawImage(srcCanvas, 0, 0, width, height, padX, padY, newWidth, newHeight);

    const resized = dstCtx.getImageData(0, 0, targetSize, targetSize);

    return { resized, scale, padX, padY, newWidth, newHeight };
}

/**
 * 使用 Canvas 恢复原始大小
 */
function restoreSizeCanvas(
    imageData: ImageData,
    originalWidth: number,
    originalHeight: number,
    scale: number,
    padX: number,
    padY: number,
    newWidth: number,
    newHeight: number
): ImageData {
    const targetSize = imageData.width;

    // 创建源 canvas
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = targetSize;
    srcCanvas.height = targetSize;
    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.putImageData(imageData, 0, 0);

    // 创建目标 canvas
    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = originalWidth;
    dstCanvas.height = originalHeight;
    const dstCtx = dstCanvas.getContext('2d')!;

    // 从有效区域裁剪并缩放回原始大小
    dstCtx.drawImage(
        srcCanvas,
        padX, padY, newWidth, newHeight,  // 源区域
        0, 0, originalWidth, originalHeight  // 目标区域
    );

    return dstCtx.getImageData(0, 0, originalWidth, originalHeight);
}

/**
 * 图像预处理 - 将 ImageData 转换为 CHW 格式的 uint8 数组 (RGB)
 * 输出格式: [1, 3, H, W] - RGB 通道，uint8
 */
function preprocessImage(imageData: ImageData): Uint8Array {
    const { width, height, data } = imageData;
    const chwArray = new Uint8Array(3 * height * width);

    for (let c = 0; c < 3; c++) {
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                const srcIndex = (h * width + w) * 4 + c; // RGBA format
                const dstIndex = c * height * width + h * width + w; // CHW format
                chwArray[dstIndex] = data[srcIndex];
            }
        }
    }

    return chwArray;
}

/**
 * Mask 预处理 - 将 ImageData 转换为二值 CHW 格式的 uint8 数组
 * 输出格式: [1, 1, H, W] - 单通道，uint8 (0 或 255)
 * 注意：白色区域（用户画的）转为 255（需要修复），其他转为 0
 */
function preprocessMask(maskData: ImageData): Uint8Array {
    const { width, height, data } = maskData;
    const chwArray = new Uint8Array(height * width);

    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const srcIndex = (h * width + w) * 4; // RGBA format, 取 R 通道
            const dstIndex = h * width + w; // CHW format (单通道)
            // 如果像素不是白色(255)，则标记为需要修复的区域
            // 原始 mask: 白色(255) = 用户标记的需要修复区域
            // 模型期望: 255 = 已知区域, 0 = 需要修复区域
            // 所以需要反转: 白色 → 0, 黑色 → 255
            chwArray[dstIndex] = data[srcIndex] !== 255 ? 255 : 0;
        }
    }

    return chwArray;
}

/**
 * 后处理 - 将模型输出 (CHW uint8) 转换为 ImageData (HWC RGBA)
 */
function postprocessOutput(
    output: Uint8Array,
    width: number,
    height: number
): ImageData {
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    const size = width * height;

    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const dstIndex = (h * width + w) * 4;
            for (let c = 0; c < 3; c++) {
                const srcIndex = c * size + h * width + w;
                let pixelVal = output[srcIndex];
                // 确保值在有效范围内
                if (pixelVal > 255) pixelVal = 255;
                if (pixelVal < 0) pixelVal = 0;
                data[dstIndex + c] = pixelVal;
            }
            data[dstIndex + 3] = 255; // Alpha
        }
    }

    return imageData;
}

/**
 * 执行图像修复
 * 使用 migan_pipeline_v2.onnx 模型，支持任意分辨率输入
 */
export async function inpaint(
    imageData: ImageData,
    maskData: ImageData,
    onProgress?: (stage: string) => void
): Promise<ImageData> {
    const width = imageData.width;
    const height = imageData.height;

    onProgress?.('正在准备图像...');

    // 预处理图像 - CHW uint8 格式
    const imageArray = preprocessImage(imageData);
    // 预处理遮罩 - CHW uint8 格式
    const maskArray = preprocessMask(maskData);

    onProgress?.('正在运行 AI 模型...');
    const session = await getSession();
    const ort = window.ort;

    // 动态获取输入输出名称
    const inputNames = session.inputNames;
    const outputNames = session.outputNames;

    console.log('Model input names:', inputNames);
    console.log('Model output names:', outputNames);

    // 创建输入张量 - 使用 uint8 类型
    // 图像张量: [1, 3, H, W]
    const imageTensor = new ort.Tensor('uint8', imageArray, [1, 3, height, width]);
    // 遮罩张量: [1, 1, H, W]
    const maskTensor = new ort.Tensor('uint8', maskArray, [1, 1, height, width]);

    // 构建 feeds 对象 - 两个独立输入
    const feeds: Record<string, any> = {};
    feeds[inputNames[0]] = imageTensor;
    feeds[inputNames[1]] = maskTensor;

    // 运行推理
    const results = await session.run(feeds);

    // 获取输出
    const outputData = results[outputNames[0]].data as Uint8Array;

    onProgress?.('正在处理结果...');
    // 后处理 - 从 CHW 转回 HWC RGBA
    const outputImageData = postprocessOutput(outputData, width, height);

    return outputImageData;
}

/**
 * 检查模型是否已缓存
 */
export async function isModelCached(): Promise<boolean> {
    const cached = await getModelFromCache();
    return cached !== null;
}

/**
 * 清除模型缓存
 */
export async function clearModelCache(): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(MODEL_KEY);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                sessionCache = null;
                resolve();
            };
        });
    } catch (e) {
        console.error('Failed to clear model cache:', e);
    }
}
