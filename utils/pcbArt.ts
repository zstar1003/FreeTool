export type MaterialKey =
    | 'copper'
    | 'solderMask'
    | 'backSolderMask'
    | 'silkscreen';

export interface LayerRecipe {
    copper: boolean;
    solderMask: boolean;
    backSolderMask: boolean;
    silkscreen: boolean;
}

export interface ArtColor {
    id: string;
    name: string;
    matchHex: string;
    displayHex: string;
    description: string;
    recipe: LayerRecipe;
}

export interface QuantizeResult {
    labels: Uint8Array;
    distribution: number[];
}

const WHITE_LABEL = 5;
const DEEP_GREEN_LABEL = 2;
const LIGHT_GREEN_LABEL = 3;

// matchHex follows the Python project's six labels.
// displayHex approximates the visible material colors in the finished reference PCB.
export const PCB_ART_COLORS: readonly ArtColor[] = [
    {
        id: 'deep-blue',
        name: '深蓝阻焊',
        matchHex: '#161F7D',
        displayHex: '#1A5B86',
        description: '正面有阻焊，无铜皮',
        recipe: {
            copper: false,
            solderMask: true,
            backSolderMask: true,
            silkscreen: false,
        },
    },
    {
        id: 'light-blue',
        name: '覆铜蓝',
        matchHex: '#5DA7E3',
        displayHex: '#0D4672',
        description: '正面有阻焊，有铜皮',
        recipe: {
            copper: true,
            solderMask: true,
            backSolderMask: true,
            silkscreen: false,
        },
    },
    {
        id: 'deep-green',
        name: '背阻焊基材',
        matchHex: '#193522',
        displayHex: '#344C52',
        description: '正面无阻焊，背面有阻焊',
        recipe: {
            copper: false,
            solderMask: false,
            backSolderMask: true,
            silkscreen: false,
        },
    },
    {
        id: 'light-green',
        name: '透光基材',
        matchHex: '#F9E195',
        displayHex: '#B8A478',
        description: '正面、背面均无阻焊',
        recipe: {
            copper: false,
            solderMask: false,
            backSolderMask: false,
            silkscreen: false,
        },
    },
    {
        id: 'black',
        name: '裸铜',
        matchHex: '#061008',
        displayHex: '#E4E6D8',
        description: '正面无阻焊，有铜皮',
        recipe: {
            copper: true,
            solderMask: false,
            backSolderMask: true,
            silkscreen: false,
        },
    },
    {
        id: 'white',
        name: '白色丝印',
        matchHex: '#E6EAEB',
        displayHex: '#F8FFF9',
        description: '正面白色丝印层',
        recipe: {
            copper: false,
            solderMask: true,
            backSolderMask: true,
            silkscreen: true,
        },
    },
] as const;

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

const buildLuminanceMap = (pixels: Uint8ClampedArray): Float32Array => {
    const output = new Float32Array(pixels.length / 4);

    for (let pixelOffset = 0, index = 0; pixelOffset < pixels.length; pixelOffset += 4, index += 1) {
        output[index] = luminance(
            pixels[pixelOffset],
            pixels[pixelOffset + 1],
            pixels[pixelOffset + 2]
        );
    }

    return output;
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

const restoreSilkscreenHighlights = (
    imageData: ImageData,
    labels: Uint8Array,
    counts: number[]
) => {
    const whiteRatio = counts[WHITE_LABEL] / labels.length;

    if (whiteRatio >= 0.08) return;

    const luminanceMap = buildLuminanceMap(imageData.data);
    const localMeanMap = boxBlurMap(
        luminanceMap,
        imageData.width,
        imageData.height,
        clamp(Math.round(Math.min(imageData.width, imageData.height) / 60), 4, 10)
    );

    for (let pixelOffset = 0, index = 0; pixelOffset < imageData.data.length; pixelOffset += 4, index += 1) {
        if (labels[index] === WHITE_LABEL) continue;

        const r = imageData.data[pixelOffset] / 255;
        const g = imageData.data[pixelOffset + 1] / 255;
        const b = imageData.data[pixelOffset + 2] / 255;
        const maximum = Math.max(r, g, b);
        const minimum = Math.min(r, g, b);
        const saturation = maximum === 0 ? 0 : (maximum - minimum) / maximum;
        const value = luminanceMap[index];
        const localLift = value - localMeanMap[index];
        const isSoftWhiteStroke = value > 0.58 && saturation < 0.42;
        const isBrushHighlight =
            value > 0.5 &&
            saturation < 0.55 &&
            localLift > 0.045;

        if (!isSoftWhiteStroke && !isBrushHighlight) continue;

        counts[labels[index]] -= 1;
        labels[index] = WHITE_LABEL;
        counts[WHITE_LABEL] += 1;
    }
};

const recoverFineMaterialDetails = (
    imageData: ImageData,
    labels: Uint8Array,
    counts: number[]
) => {
    const luminanceMap = buildLuminanceMap(imageData.data);
    const localCoarseMap = boxBlurMap(luminanceMap, imageData.width, imageData.height, 3);
    const localFineMap = boxBlurMap(luminanceMap, imageData.width, imageData.height, 1);

    const updateLabel = (index: number, nextLabel: number) => {
        const currentLabel = labels[index];
        if (currentLabel === nextLabel) return;
        counts[currentLabel] -= 1;
        labels[index] = nextLabel;
        counts[nextLabel] += 1;
    };

    for (let pixelOffset = 0, index = 0; pixelOffset < imageData.data.length; pixelOffset += 4, index += 1) {
        if (labels[index] === WHITE_LABEL) continue;

        const r = imageData.data[pixelOffset] / 255;
        const g = imageData.data[pixelOffset + 1] / 255;
        const b = imageData.data[pixelOffset + 2] / 255;
        const maximum = Math.max(r, g, b);
        const minimum = Math.min(r, g, b);
        const saturation = maximum === 0 ? 0 : (maximum - minimum) / maximum;
        const value = luminanceMap[index];
        const highFrequency = Math.abs(value - localFineMap[index]);
        const isDarkBrushStroke =
            value < 0.24 &&
            localCoarseMap[index] - value > 0.085 &&
            highFrequency > 0.035 &&
            saturation > 0.18;

        if (isDarkBrushStroke) {
            updateLabel(index, DEEP_GREEN_LABEL);
            continue;
        }

        const isWarmMaterialDetail =
            r > 0.34 &&
            g > 0.27 &&
            r > b * 1.22 &&
            g > b * 1.05 &&
            saturation > 0.24 &&
            value > 0.32 &&
            value < 0.74;

        if (isWarmMaterialDetail) updateLabel(index, LIGHT_GREEN_LABEL);
    }
};

export const quantizeImageData = (imageData: ImageData): QuantizeResult => {
    const labels = new Uint8Array(imageData.width * imageData.height);
    const counts = new Array<number>(PCB_ART_COLORS.length).fill(0);
    const matchColors = PCB_ART_COLORS.map(color => hexToRgb(color.matchHex));

    for (
        let pixelOffset = 0, labelIndex = 0;
        pixelOffset < imageData.data.length;
        pixelOffset += 4, labelIndex += 1
    ) {
        const r = imageData.data[pixelOffset];
        const g = imageData.data[pixelOffset + 1];
        const b = imageData.data[pixelOffset + 2];
        let nearestLabel = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        matchColors.forEach(([matchR, matchG, matchB], colorIndex) => {
            const deltaR = r - matchR;
            const deltaG = g - matchG;
            const deltaB = b - matchB;
            const distance =
                deltaR * deltaR +
                deltaG * deltaG +
                deltaB * deltaB;

            if (distance < nearestDistance) {
                nearestLabel = colorIndex;
                nearestDistance = distance;
            }
        });

        labels[labelIndex] = nearestLabel;
        counts[nearestLabel] += 1;
    }

    restoreSilkscreenHighlights(imageData, labels, counts);
    recoverFineMaterialDetails(imageData, labels, counts);

    return {
        labels,
        distribution: counts.map(count => count / labels.length),
    };
};

const renderLabels = (
    labels: Uint8Array,
    width: number,
    height: number,
    colorKey: 'matchHex' | 'displayHex'
): ImageData => {
    const output = new ImageData(width, height);
    const colors = PCB_ART_COLORS.map(color => hexToRgb(color[colorKey]));

    labels.forEach((label, index) => {
        const [r, g, b] = colors[label];
        const offset = index * 4;
        output.data[offset] = r;
        output.data[offset + 1] = g;
        output.data[offset + 2] = b;
        output.data[offset + 3] = 255;
    });

    return output;
};

export const renderArtwork = (
    labels: Uint8Array,
    width: number,
    height: number,
    sourceImageData?: ImageData
): ImageData => {
    if (!sourceImageData) return renderLabels(labels, width, height, 'displayHex');

    const output = new ImageData(width, height);
    const colors = PCB_ART_COLORS.map(color => hexToRgb(color.displayHex));
    const luminanceMap = buildLuminanceMap(sourceImageData.data);
    const darkInk: [number, number, number] = [20, 39, 48];

    labels.forEach((label, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        const value = luminanceMap[index];
        let boundary = 0;
        let localContrast = 0;
        let neighborCount = 0;

        const sampleNeighbor = (neighbor: number) => {
            if (labels[neighbor] !== label) boundary += 1;
            localContrast += Math.abs(value - luminanceMap[neighbor]);
            neighborCount += 1;
        };

        if (x > 0) sampleNeighbor(index - 1);
        if (x < width - 1) sampleNeighbor(index + 1);
        if (y > 0) sampleNeighbor(index - width);
        if (y < height - 1) sampleNeighbor(index + width);

        boundary = Math.min(1, boundary / 2);
        localContrast = neighborCount > 0 ? localContrast / neighborCount : 0;

        let [r, g, b] = colors[label];
        const shade =
            label === 0 || label === 1 ? 0.88 + value * 0.22 :
            label === 2 ? 0.8 + value * 0.2 :
            label === 3 ? 0.9 + value * 0.12 :
            label === WHITE_LABEL ? 0.97 + value * 0.05 : 1;

        r *= shade;
        g *= shade;
        b *= shade;

        if (label === 4) {
            const darkness = clamp((0.42 - value) / 0.42, 0, 1);
            const crack = clamp(localContrast * 9 * darkness + boundary * 0.38, 0, 0.86);
            r = r * (1 - crack) + darkInk[0] * crack;
            g = g * (1 - crack) + darkInk[1] * crack;
            b = b * (1 - crack) + darkInk[2] * crack;
        } else {
            const rimStrength =
                label === WHITE_LABEL ? 0.04 :
                label === 3 ? 0.22 :
                label === 0 ? 0.26 : 0.34;
            const rim = clamp(boundary * rimStrength + localContrast * 0.28, 0, 0.45);
            r = r * (1 - rim) + darkInk[0] * rim;
            g = g * (1 - rim) + darkInk[1] * rim;
            b = b * (1 - rim) + darkInk[2] * rim;
        }

        if ((label === 4 || label === WHITE_LABEL) && value > 0.55) {
            const highlight = label === WHITE_LABEL ? 0.12 : 0.08;
            r = r * (1 - highlight) + 255 * highlight;
            g = g * (1 - highlight) + 255 * highlight;
            b = b * (1 - highlight) + 255 * highlight;
        }

        const offset = index * 4;
        output.data[offset] = clamp(Math.round(r), 0, 255);
        output.data[offset + 1] = clamp(Math.round(g), 0, 255);
        output.data[offset + 2] = clamp(Math.round(b), 0, 255);
        output.data[offset + 3] = 255;
    });

    return output;
};

export const renderSeparationArtwork = (
    labels: Uint8Array,
    width: number,
    height: number
): ImageData => renderLabels(labels, width, height, 'matchHex');

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
