export type QuantizeMode = 'tone' | 'color';
export type MaterialKey = 'copper' | 'solderMask' | 'silkscreen';

export interface LayerRecipe {
    copper: boolean;
    solderMask: boolean;
    silkscreen: boolean;
}

export interface ArtColor {
    id: string;
    name: string;
    hex: string;
    recipe: LayerRecipe;
}

export interface PcbPalettePreset {
    id: string;
    name: string;
    description: string;
    colors: ArtColor[];
}

export interface QuantizeOptions {
    mode: QuantizeMode;
    brightness: number;
    contrast: number;
    smoothing: number;
}

interface ColorFeature {
    y: number;
    cb: number;
    cr: number;
}

interface PhotoToneData {
    toneMap: Float32Array;
    detailProtectionMap: Float32Array;
}

export interface QuantizeResult {
    labels: Uint8Array;
    distribution: number[];
}

export const PCB_PALETTE_PRESETS: PcbPalettePreset[] = [
    {
        id: 'classic-green',
        name: '经典绿板',
        description: '深绿阻焊、浅绿基材、裸铜与白色丝印',
        colors: [
            {
                id: 'masked-copper',
                name: '覆铜阻焊',
                hex: '#12372A',
                recipe: { copper: true, solderMask: true, silkscreen: false },
            },
            {
                id: 'masked-board',
                name: '基材阻焊',
                hex: '#397255',
                recipe: { copper: false, solderMask: true, silkscreen: false },
            },
            {
                id: 'bare-copper',
                name: '裸铜',
                hex: '#D4A44C',
                recipe: { copper: true, solderMask: false, silkscreen: false },
            },
            {
                id: 'silkscreen',
                name: '丝印',
                hex: '#F2F0DF',
                recipe: { copper: false, solderMask: true, silkscreen: true },
            },
        ],
    },
    {
        id: 'deep-blue',
        name: '深海蓝板',
        description: '适合星空、夜景和高反差人物图像',
        colors: [
            {
                id: 'masked-copper',
                name: '覆铜阻焊',
                hex: '#111C4B',
                recipe: { copper: true, solderMask: true, silkscreen: false },
            },
            {
                id: 'masked-board',
                name: '基材阻焊',
                hex: '#376A9C',
                recipe: { copper: false, solderMask: true, silkscreen: false },
            },
            {
                id: 'bare-copper',
                name: '裸铜',
                hex: '#C99545',
                recipe: { copper: true, solderMask: false, silkscreen: false },
            },
            {
                id: 'silkscreen',
                name: '丝印',
                hex: '#EEF2E8',
                recipe: { copper: false, solderMask: true, silkscreen: true },
            },
        ],
    },
    {
        id: 'oxide-red',
        name: '氧化红板',
        description: '偏暖的红黑层次，适合海报和复古插画',
        colors: [
            {
                id: 'masked-copper',
                name: '覆铜阻焊',
                hex: '#3C1118',
                recipe: { copper: true, solderMask: true, silkscreen: false },
            },
            {
                id: 'masked-board',
                name: '基材阻焊',
                hex: '#8B2E38',
                recipe: { copper: false, solderMask: true, silkscreen: false },
            },
            {
                id: 'bare-copper',
                name: '裸铜',
                hex: '#C98B3C',
                recipe: { copper: true, solderMask: false, silkscreen: false },
            },
            {
                id: 'silkscreen',
                name: '丝印',
                hex: '#F1ECE0',
                recipe: { copper: false, solderMask: true, silkscreen: true },
            },
        ],
    },
    {
        id: 'graphite',
        name: '石墨黑板',
        description: '低饱和工业风，突出铜色和丝印细节',
        colors: [
            {
                id: 'masked-copper',
                name: '覆铜阻焊',
                hex: '#111517',
                recipe: { copper: true, solderMask: true, silkscreen: false },
            },
            {
                id: 'masked-board',
                name: '基材阻焊',
                hex: '#596264',
                recipe: { copper: false, solderMask: true, silkscreen: false },
            },
            {
                id: 'bare-copper',
                name: '裸铜',
                hex: '#B87333',
                recipe: { copper: true, solderMask: false, silkscreen: false },
            },
            {
                id: 'silkscreen',
                name: '丝印',
                hex: '#F2EEDF',
                recipe: { copper: false, solderMask: true, silkscreen: true },
            },
        ],
    },
];

export const clonePalette = (colors: ArtColor[]): ArtColor[] =>
    colors.map(color => ({
        ...color,
        recipe: { ...color.recipe },
    }));

export const hexToRgb = (hex: string): [number, number, number] => {
    const normalized = hex.replace('#', '').padEnd(6, '0').slice(0, 6);
    return [
        Number.parseInt(normalized.slice(0, 2), 16),
        Number.parseInt(normalized.slice(2, 4), 16),
        Number.parseInt(normalized.slice(4, 6), 16),
    ];
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const luminance = (r: number, g: number, b: number) =>
    (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const adjustedChannel = (value: number, brightness: number, contrast: number) =>
    clamp(((value / 255 - 0.5) * contrast + 0.5 + brightness) * 255, 0, 255);

const colorFeature = (r: number, g: number, b: number): ColorFeature => ({
    y: 0.299 * r + 0.587 * g + 0.114 * b,
    cb: 128 - 0.168736 * r - 0.331264 * g + 0.5 * b,
    cr: 128 + 0.5 * r - 0.418688 * g - 0.081312 * b,
});

const colorDistance = (first: ColorFeature, second: ColorFeature) => {
    const deltaY = first.y - second.y;
    const deltaCb = first.cb - second.cb;
    const deltaCr = first.cr - second.cr;
    return 2.2 * deltaY * deltaY + deltaCb * deltaCb + deltaCr * deltaCr;
};

const edgeAwareSmooth = (
    source: Uint8ClampedArray,
    width: number,
    height: number,
    passes: number
): Uint8ClampedArray => {
    if (passes <= 0) return source;

    let current = new Uint8ClampedArray(source);
    let next = new Uint8ClampedArray(source.length);
    const neighborOffsets = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ] as const;

    for (let pass = 0; pass < passes; pass += 1) {
        const edgeThreshold = 14 + pass * 4;

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const offset = (y * width + x) * 4;
                const centerR = current[offset];
                const centerG = current[offset + 1];
                const centerB = current[offset + 2];
                const centerLightness = luminance(centerR, centerG, centerB);
                let totalR = centerR * 4;
                let totalG = centerG * 4;
                let totalB = centerB * 4;
                let totalWeight = 4;

                for (const [offsetX, offsetY] of neighborOffsets) {
                    const sampleX = x + offsetX;
                    const sampleY = y + offsetY;
                    if (sampleX < 0 || sampleX >= width || sampleY < 0 || sampleY >= height) {
                        continue;
                    }

                    const sampleOffset = (sampleY * width + sampleX) * 4;
                    const sampleR = current[sampleOffset];
                    const sampleG = current[sampleOffset + 1];
                    const sampleB = current[sampleOffset + 2];
                    const sampleLightness = luminance(sampleR, sampleG, sampleB);

                    if (Math.abs(centerLightness - sampleLightness) <= edgeThreshold / 255) {
                        totalR += sampleR;
                        totalG += sampleG;
                        totalB += sampleB;
                        totalWeight += 1;
                    }
                }

                next[offset] = Math.round(totalR / totalWeight);
                next[offset + 1] = Math.round(totalG / totalWeight);
                next[offset + 2] = Math.round(totalB / totalWeight);
                next[offset + 3] = current[offset + 3];
            }
        }

        const swap = current;
        current = next;
        next = swap;
    }

    return current;
};

const buildColorClusters = (
    pixels: Uint8ClampedArray,
    brightness: number,
    contrast: number
): ColorFeature[] => {
    const pixelCount = pixels.length / 4;
    const stride = Math.max(1, Math.floor(pixelCount / 50000));
    const samples: ColorFeature[] = [];

    for (let pixel = 0; pixel < pixelCount; pixel += stride) {
        const offset = pixel * 4;
        samples.push(colorFeature(
            adjustedChannel(pixels[offset], brightness, contrast),
            adjustedChannel(pixels[offset + 1], brightness, contrast),
            adjustedChannel(pixels[offset + 2], brightness, contrast)
        ));
    }

    const orderedSamples = [...samples].sort((a, b) => a.y - b.y);
    let centers = [0.125, 0.375, 0.625, 0.875].map(quantile => {
        const index = Math.min(
            orderedSamples.length - 1,
            Math.floor((orderedSamples.length - 1) * quantile)
        );
        return { ...orderedSamples[index] };
    });

    for (let iteration = 0; iteration < 8; iteration += 1) {
        const totals = centers.map(() => ({ y: 0, cb: 0, cr: 0, count: 0 }));

        samples.forEach(sample => {
            let nearest = 0;
            let nearestDistance = Number.POSITIVE_INFINITY;

            centers.forEach((center, centerIndex) => {
                const distance = colorDistance(sample, center);
                if (distance < nearestDistance) {
                    nearest = centerIndex;
                    nearestDistance = distance;
                }
            });

            totals[nearest].y += sample.y;
            totals[nearest].cb += sample.cb;
            totals[nearest].cr += sample.cr;
            totals[nearest].count += 1;
        });

        centers = centers.map((center, index) => {
            const total = totals[index];
            if (total.count === 0) return center;
            return {
                y: total.y / total.count,
                cb: total.cb / total.count,
                cr: total.cr / total.count,
            };
        });
    }

    return centers.sort((a, b) => a.y - b.y);
};

const histogramQuantile = (
    histogram: Uint32Array,
    total: number,
    target: number
): number => {
    let seen = 0;
    for (let index = 0; index < histogram.length; index += 1) {
        seen += histogram[index];
        if (seen >= total * target) return index / (histogram.length - 1);
    }
    return 1;
};

const boxBlurMap = (
    source: Float32Array,
    width: number,
    height: number,
    radius: number
): Float32Array => {
    if (radius <= 0) return source;

    const integralWidth = width + 1;
    const integral = new Float32Array(integralWidth * (height + 1));
    const output = new Float32Array(source.length);

    for (let y = 0; y < height; y += 1) {
        let rowSum = 0;
        for (let x = 0; x < width; x += 1) {
            rowSum += source[y * width + x];
            integral[(y + 1) * integralWidth + x + 1] =
                integral[y * integralWidth + x + 1] + rowSum;
        }
    }

    for (let y = 0; y < height; y += 1) {
        const top = Math.max(0, y - radius);
        const bottom = Math.min(height - 1, y + radius);

        for (let x = 0; x < width; x += 1) {
            const left = Math.max(0, x - radius);
            const right = Math.min(width - 1, x + radius);
            const area = (right - left + 1) * (bottom - top + 1);
            const sum =
                integral[(bottom + 1) * integralWidth + right + 1] -
                integral[top * integralWidth + right + 1] -
                integral[(bottom + 1) * integralWidth + left] +
                integral[top * integralWidth + left];
            output[y * width + x] = sum / area;
        }
    }

    return output;
};

const buildPhotoToneMap = (
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    brightness: number,
    contrast: number,
    cleanliness: number
): PhotoToneData => {
    const pixelCount = width * height;
    let toneMap = new Float32Array(pixelCount);
    const sourceToneMap = new Float32Array(pixelCount);
    const detailProtectionMap = new Float32Array(pixelCount);
    const histogram = new Uint32Array(256);

    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
        const offset = pixel * 4;
        const r = adjustedChannel(pixels[offset], brightness, contrast);
        const g = adjustedChannel(pixels[offset + 1], brightness, contrast);
        const b = adjustedChannel(pixels[offset + 2], brightness, contrast);
        const value = luminance(r, g, b);
        const feature = colorFeature(r, g, b);
        const isWarmDetail =
            feature.cb >= 72 &&
            feature.cb <= 138 &&
            feature.cr >= 132 &&
            feature.cr <= 182 &&
            r >= g * 0.94 &&
            g >= b * 0.85;

        toneMap[pixel] = value;
        detailProtectionMap[pixel] = Number(isWarmDetail);
        histogram[Math.round(value * 255)] += 1;
    }

    const low = histogramQuantile(histogram, pixelCount, 0.015);
    const high = histogramQuantile(histogram, pixelCount, 0.985);
    const range = Math.max(0.08, high - low);

    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
        toneMap[pixel] = clamp((toneMap[pixel] - low) / range, 0, 1);
        sourceToneMap[pixel] = toneMap[pixel];
    }

    const blurRadii = [0, 1, 2, 3];
    const blurRadius = blurRadii[cleanliness];
    if (blurRadius > 0) {
        toneMap = boxBlurMap(toneMap, width, height, blurRadius);
        toneMap = boxBlurMap(toneMap, width, height, blurRadius);
    }

    const integralWidth = width + 1;
    const integral = new Float32Array(integralWidth * (height + 1));

    for (let y = 0; y < height; y += 1) {
        let rowSum = 0;
        for (let x = 0; x < width; x += 1) {
            rowSum += toneMap[y * width + x];
            integral[(y + 1) * integralWidth + x + 1] =
                integral[y * integralWidth + x + 1] + rowSum;
        }
    }

    const radiusDivisors = [52, 44, 36, 32];
    const detailStrengths = [0.68, 0.5, 0.36, 0.3];
    const radius = clamp(
        Math.round(Math.min(width, height) / radiusDivisors[cleanliness]),
        4,
        24
    );
    const detailStrength = detailStrengths[cleanliness];

    for (let y = 0; y < height; y += 1) {
        const top = Math.max(0, y - radius);
        const bottom = Math.min(height - 1, y + radius);

        for (let x = 0; x < width; x += 1) {
            const left = Math.max(0, x - radius);
            const right = Math.min(width - 1, x + radius);
            const area = (right - left + 1) * (bottom - top + 1);
            const localSum =
                integral[(bottom + 1) * integralWidth + right + 1] -
                integral[top * integralWidth + right + 1] -
                integral[(bottom + 1) * integralWidth + left] +
                integral[top * integralWidth + left];
            const value = toneMap[y * width + x];
            const localMean = localSum / area;

            const detail = value - localMean;
            const protectedDetail = sourceToneMap[y * width + x] - localMean;
            const protection = detailProtectionMap[y * width + x];
            const effectiveDetail =
                detail * (1 - protection) + protectedDetail * protection;
            const protectedStrength = detailStrength + protection * 0.28;
            toneMap[y * width + x] = clamp(
                value + effectiveDetail * protectedStrength,
                0,
                1
            );
        }
    }

    return { toneMap, detailProtectionMap };
};

const buildMapThresholds = (
    values: Float32Array,
    targets: number[]
): number[] => {
    let maximum = 0;
    values.forEach(value => {
        maximum = Math.max(maximum, value);
    });
    if (maximum === 0) return targets.map(() => 1);

    const histogram = new Uint32Array(256);
    values.forEach(value => {
        histogram[Math.round(clamp(value / maximum, 0, 1) * 255)] += 1;
    });

    return targets.map(target =>
        histogramQuantile(histogram, values.length, target) * maximum
    );
};

const smoothLabels = (
    source: Uint8Array,
    width: number,
    height: number,
    passes: number
): Uint8Array => {
    let current = source;

    for (let pass = 0; pass < passes; pass += 1) {
        const next = new Uint8Array(current.length);
        const radius = 1;
        const sampleArea = (radius * 2 + 1) ** 2;
        const consensus = Math.ceil(sampleArea * 0.56);

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const counts = [0, 0, 0, 0];

                for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
                    const sampleY = clamp(y + offsetY, 0, height - 1);
                    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
                        const sampleX = clamp(x + offsetX, 0, width - 1);
                        counts[current[sampleY * width + sampleX]] += 1;
                    }
                }

                const original = current[y * width + x];
                let winner = original;
                let winnerCount = counts[original];

                for (let label = 0; label < counts.length; label += 1) {
                    if (counts[label] > winnerCount) {
                        winner = label;
                        winnerCount = counts[label];
                    }
                }

                next[y * width + x] =
                    winnerCount >= consensus && winnerCount >= counts[original] + 2
                        ? winner
                        : original;
            }
        }

        current = next;
    }

    return current;
};

const removeSmallRegions = (
    source: Uint8Array,
    width: number,
    height: number,
    cleanliness: number,
    detailProtectionMap?: Float32Array
): Uint8Array => {
    if (cleanliness <= 0) return source;

    const pixelCount = width * height;
    const areaRatios = [0, 0.000025, 0.00005, 0.00008];
    const minimumArea = Math.max(6, Math.round(pixelCount * areaRatios[cleanliness]));
    const cleanupPasses = cleanliness > 0 ? 1 : 0;
    let current = new Uint8Array(source);
    const directions = [-1, 1, -width, width];

    for (let pass = 0; pass < cleanupPasses; pass += 1) {
        const visited = new Uint8Array(pixelCount);
        const queue = new Int32Array(pixelCount);

        for (let seed = 0; seed < pixelCount; seed += 1) {
            if (visited[seed]) continue;

            const label = current[seed];
            const boundaryCounts = [0, 0, 0, 0];
            let queueStart = 0;
            let queueEnd = 1;
            let protectedPixels = detailProtectionMap?.[seed] ?? 0;
            queue[0] = seed;
            visited[seed] = 1;

            while (queueStart < queueEnd) {
                const index = queue[queueStart];
                queueStart += 1;
                const x = index % width;

                for (const direction of directions) {
                    if (
                        (direction === -1 && x === 0) ||
                        (direction === 1 && x === width - 1)
                    ) {
                        continue;
                    }

                    const neighbor = index + direction;
                    if (neighbor < 0 || neighbor >= pixelCount) continue;

                    if (current[neighbor] === label) {
                        if (!visited[neighbor]) {
                            visited[neighbor] = 1;
                            queue[queueEnd] = neighbor;
                            queueEnd += 1;
                            protectedPixels += detailProtectionMap?.[neighbor] ?? 0;
                        }
                    } else {
                        boundaryCounts[current[neighbor]] += 1;
                    }
                }
            }

            const protectionRatio = protectedPixels / queueEnd;
            const effectiveMinimumArea =
                protectionRatio >= 0.35 ? Math.max(5, minimumArea * 0.35) : minimumArea;
            if (queueEnd >= effectiveMinimumArea) continue;

            let replacement = label;
            let strongestBoundary = 0;
            for (let candidate = 0; candidate < boundaryCounts.length; candidate += 1) {
                if (boundaryCounts[candidate] > strongestBoundary) {
                    replacement = candidate;
                    strongestBoundary = boundaryCounts[candidate];
                }
            }

            if (replacement !== label) {
                for (let index = 0; index < queueEnd; index += 1) {
                    current[queue[index]] = replacement;
                }
            }
        }
    }

    return current;
};

const roundLabelContours = (
    source: Uint8Array,
    width: number,
    height: number,
    cleanliness: number
): Uint8Array => {
    if (cleanliness < 2) return source;

    let current = new Uint8Array(source);
    const passes = cleanliness === 3 ? 3 : 2;

    for (let pass = 0; pass < passes; pass += 1) {
        const next = new Uint8Array(current);

        for (let y = 1; y < height - 1; y += 1) {
            for (let x = 1; x < width - 1; x += 1) {
                const index = y * width + x;
                const original = current[index];
                const counts = [0, 0, 0, 0];

                for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
                    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                        const weight = offsetX === 0 || offsetY === 0 ? 2 : 1;
                        counts[current[(y + offsetY) * width + x + offsetX]] += weight;
                    }
                }

                let winner = original;
                for (let label = 0; label < counts.length; label += 1) {
                    if (counts[label] > counts[winner]) winner = label;
                }

                if (counts[winner] >= 10 && counts[original] <= 5) {
                    next[index] = winner;
                }
            }
        }

        current = next;
    }

    return current;
};

const cleanSilkscreenMask = (
    source: Uint8Array,
    width: number,
    height: number,
    minimumArea: number
): Uint8Array => {
    const smoothed = new Uint8Array(source.length);

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            let neighbors = 0;

            for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
                const sampleY = clamp(y + offsetY, 0, height - 1);
                for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                    const sampleX = clamp(x + offsetX, 0, width - 1);
                    neighbors += source[sampleY * width + sampleX];
                }
            }

            const index = y * width + x;
            smoothed[index] = source[index]
                ? Number(neighbors >= 5)
                : Number(neighbors >= 7);
        }
    }

    const cleaned = new Uint8Array(source.length);
    const visited = new Uint8Array(source.length);
    const queue = new Int32Array(source.length);
    const directions = [-1, 1, -width, width];

    for (let seed = 0; seed < smoothed.length; seed += 1) {
        if (!smoothed[seed] || visited[seed]) continue;

        let start = 0;
        let end = 1;
        queue[0] = seed;
        visited[seed] = 1;

        while (start < end) {
            const index = queue[start];
            start += 1;
            const x = index % width;

            for (const direction of directions) {
                if (
                    (direction === -1 && x === 0) ||
                    (direction === 1 && x === width - 1)
                ) {
                    continue;
                }

                const neighbor = index + direction;
                if (
                    neighbor >= 0 &&
                    neighbor < smoothed.length &&
                    smoothed[neighbor] &&
                    !visited[neighbor]
                ) {
                    visited[neighbor] = 1;
                    queue[end] = neighbor;
                    end += 1;
                }
            }
        }

        if (end >= minimumArea) {
            for (let index = 0; index < end; index += 1) {
                cleaned[queue[index]] = 1;
            }
        }
    }

    return cleaned;
};

const buildSilkscreenMask = (
    pixels: Uint8ClampedArray,
    toneMap: Float32Array,
    width: number,
    height: number,
    brightness: number,
    contrast: number,
    cleanliness: number
): Uint8Array => {
    const candidate = new Uint8Array(width * height);
    const toneThresholds = [0.78, 0.82, 0.86, 0.9];
    const saturationThresholds = [0.2, 0.17, 0.14, 0.12];

    for (let index = 0; index < candidate.length; index += 1) {
        const offset = index * 4;
        const r = adjustedChannel(pixels[offset], brightness, contrast);
        const g = adjustedChannel(pixels[offset + 1], brightness, contrast);
        const b = adjustedChannel(pixels[offset + 2], brightness, contrast);
        const maximum = Math.max(r, g, b);
        const minimum = Math.min(r, g, b);
        const saturation = maximum === 0 ? 0 : (maximum - minimum) / maximum;
        const feature = colorFeature(r, g, b);
        const isNeutral =
            feature.cb >= 112 &&
            feature.cb <= 144 &&
            feature.cr >= 112 &&
            feature.cr <= 146;

        candidate[index] = Number(
            toneMap[index] >= toneThresholds[cleanliness] &&
            maximum >= 190 &&
            saturation <= saturationThresholds[cleanliness] &&
            isNeutral
        );
    }

    const minimumAreas = [24, 40, 80, 140];
    const scaleArea = Math.round(width * height * 0.00024);
    return cleanSilkscreenMask(
        candidate,
        width,
        height,
        Math.max(minimumAreas[cleanliness], scaleArea)
    );
};

export const quantizeImageData = (
    imageData: ImageData,
    palette: ArtColor[],
    options: QuantizeOptions
): QuantizeResult => {
    const pixels = edgeAwareSmooth(
        imageData.data,
        imageData.width,
        imageData.height,
        options.smoothing
    );
    const rawLabels = new Uint8Array(imageData.width * imageData.height);
    const paletteOrder = palette
        .map((color, index) => ({
            index,
            lightness: luminance(...hexToRgb(color.hex)),
        }))
        .sort((a, b) => a.lightness - b.lightness)
        .map(item => item.index);

    let thresholds = [0.4, 0.78];
    let photoToneData: PhotoToneData | null = null;
    let colorClusters: ColorFeature[] = [];

    if (options.mode === 'tone') {
        photoToneData = buildPhotoToneMap(
            pixels,
            imageData.width,
            imageData.height,
            options.brightness,
            options.contrast,
            options.smoothing
        );
        thresholds = buildMapThresholds(photoToneData.toneMap, [0.42, 0.78]);
    } else {
        colorClusters = buildColorClusters(pixels, options.brightness, options.contrast);
    }

    for (let pixelIndex = 0, labelIndex = 0; pixelIndex < pixels.length; pixelIndex += 4, labelIndex += 1) {
        const r = adjustedChannel(pixels[pixelIndex], options.brightness, options.contrast);
        const g = adjustedChannel(pixels[pixelIndex + 1], options.brightness, options.contrast);
        const b = adjustedChannel(pixels[pixelIndex + 2], options.brightness, options.contrast);

        if (options.mode === 'tone') {
            const value = photoToneData?.toneMap[labelIndex] ?? luminance(r, g, b);
            const toneIndex =
                value < thresholds[0] ? 0 :
                value < thresholds[1] ? 1 : 2;
            rawLabels[labelIndex] = paletteOrder[toneIndex];
            continue;
        }

        const sample = colorFeature(r, g, b);
        let nearestCluster = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        colorClusters.forEach((cluster, clusterIndex) => {
            const distance = colorDistance(sample, cluster);
            if (distance < nearestDistance) {
                nearestCluster = clusterIndex;
                nearestDistance = distance;
            }
        });

        rawLabels[labelIndex] = paletteOrder[nearestCluster];
    }

    let labels = smoothLabels(
        rawLabels,
        imageData.width,
        imageData.height,
        options.smoothing
    );

    if (photoToneData) {
        const silkscreenMask = buildSilkscreenMask(
            pixels,
            photoToneData.toneMap,
            imageData.width,
            imageData.height,
            options.brightness,
            options.contrast,
            options.smoothing
        );
        silkscreenMask.forEach((silkscreen, index) => {
            if (silkscreen) labels[index] = paletteOrder[3];
        });
    }

    labels = removeSmallRegions(
        labels,
        imageData.width,
        imageData.height,
        options.smoothing,
        photoToneData?.detailProtectionMap
    );
    labels = roundLabelContours(
        labels,
        imageData.width,
        imageData.height,
        options.smoothing
    );

    const counts = [0, 0, 0, 0];
    labels.forEach(label => {
        counts[label] += 1;
    });

    return {
        labels,
        distribution: counts.map(count => count / labels.length),
    };
};

export const renderArtwork = (
    labels: Uint8Array,
    width: number,
    height: number,
    palette: ArtColor[]
): ImageData => {
    const output = new ImageData(width, height);
    const paletteRgb = palette.map(color => hexToRgb(color.hex));

    labels.forEach((label, index) => {
        const [r, g, b] = paletteRgb[label];
        const offset = index * 4;
        output.data[offset] = r;
        output.data[offset + 1] = g;
        output.data[offset + 2] = b;
        output.data[offset + 3] = 255;
    });

    return output;
};

export const renderBinaryMask = (
    labels: Uint8Array,
    width: number,
    height: number,
    predicate: (label: number) => boolean
): ImageData => {
    const output = new ImageData(width, height);

    labels.forEach((label, index) => {
        const value = predicate(label) ? 255 : 0;
        const offset = index * 4;
        output.data[offset] = value;
        output.data[offset + 1] = value;
        output.data[offset + 2] = value;
        output.data[offset + 3] = 255;
    });

    return output;
};
