import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as ExifReader from 'exifreader';
import type { ExpandedTags } from 'exifreader';

type ProvenanceTone = 'success' | 'warning' | 'neutral';

interface ImageDimensions {
    width: number;
    height: number;
}

interface MetadataRow {
    group: string;
    groupLabel: string;
    name: string;
    value: string;
}

interface MetadataGroup {
    key: string;
    label: string;
    rows: MetadataRow[];
}

interface MarkerMatch {
    label: string;
    count: number;
    offsets: number[];
}

interface ContainerFinding {
    label: string;
    detail: string;
    tone: ProvenanceTone;
}

interface ProvenanceScan {
    detected: boolean;
    statusLabel: string;
    statusDetail: string;
    markers: MarkerMatch[];
    containers: ContainerFinding[];
}

interface AnalysisResult {
    file: {
        name: string;
        type: string;
        size: number;
        lastModified: number;
    };
    dimensions: ImageDimensions | null;
    detectedType: string;
    metadataGroups: MetadataGroup[];
    metadataRows: MetadataRow[];
    provenance: ProvenanceScan;
    exportJson: string;
}

const GROUP_LABELS: Record<string, string> = {
    file: '文件',
    jfif: 'JFIF',
    pngFile: 'PNG 文件',
    pngText: 'PNG 文本',
    png: 'PNG',
    exif: 'EXIF',
    iptc: 'IPTC',
    xmp: 'XMP',
    icc: 'ICC 色彩',
    riff: 'RIFF/WebP',
    gif: 'GIF',
    Thumbnail: '缩略图',
    gps: 'GPS',
    photoshop: 'Photoshop',
    makerNotes: '厂商 MakerNote',
    composite: '计算字段',
};

const GROUP_ORDER = [
    'file',
    'jfif',
    'pngFile',
    'pngText',
    'png',
    'exif',
    'xmp',
    'iptc',
    'gps',
    'icc',
    'riff',
    'gif',
    'photoshop',
    'makerNotes',
    'composite',
    'Thumbnail',
];

const SCAN_PATTERNS = [
    { label: 'C2PA', terms: ['c2pa', 'C2PA'] },
    { label: 'JUMBF', terms: ['jumb', 'JUMBF'] },
    { label: 'Content Credentials', terms: ['Content Credentials', 'contentcredentials', 'contentauth'] },
    { label: 'OpenAI', terms: ['OpenAI', 'openai'] },
    { label: 'ChatGPT', terms: ['ChatGPT', 'chatgpt'] },
    { label: 'DALL-E / DALL·E', terms: ['DALL-E', 'DALL·E', 'DALL\\u00b7E'] },
    { label: 'GPT image hint', terms: ['GPT-4o', 'gpt-4o', 'GPT Image', 'gpt-image'] },
];

const MAX_DISPLAY_TEXT = 6000;
const MAX_SCAN_OFFSET_COUNT = 8;

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;

    return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
};

const formatDateTime = (time: number) => {
    if (!time) return '未知';

    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(time));
};

const truncateText = (value: string, maxLength = MAX_DISPLAY_TEXT) => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}\n... 已截断 ${value.length - maxLength} 个字符`;
};

const readAscii = (bytes: Uint8Array, start: number, end: number) => {
    let output = '';
    const safeEnd = Math.min(end, bytes.length);

    for (let index = Math.max(0, start); index < safeEnd; index += 1) {
        const code = bytes[index];
        output += code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
    }

    return output;
};

const readUInt16BE = (bytes: Uint8Array, offset: number) => (
    (bytes[offset] << 8) | bytes[offset + 1]
);

const readUInt32BE = (bytes: Uint8Array, offset: number) => (
    (bytes[offset] * 0x1000000) + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])
);

const readUInt32LE = (bytes: Uint8Array, offset: number) => (
    bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) + (bytes[offset + 3] * 0x1000000)
);

const toAsciiPattern = (value: string) => Array.from(value).map(character => character.charCodeAt(0));

const findPatternOffsets = (bytes: Uint8Array, pattern: number[], maxCount = MAX_SCAN_OFFSET_COUNT) => {
    const offsets: number[] = [];

    if (!pattern.length || pattern.length > bytes.length) return offsets;

    for (let index = 0; index <= bytes.length - pattern.length; index += 1) {
        let matched = true;

        for (let patternIndex = 0; patternIndex < pattern.length; patternIndex += 1) {
            if (bytes[index + patternIndex] !== pattern[patternIndex]) {
                matched = false;
                break;
            }
        }

        if (matched) {
            offsets.push(index);
            if (offsets.length >= maxCount) break;
        }
    }

    return offsets;
};

const hasAsciiInRange = (bytes: Uint8Array, start: number, end: number, terms: string[]) => {
    const segment = bytes.subarray(Math.max(0, start), Math.min(end, bytes.length));
    return terms.some(term => findPatternOffsets(segment, toAsciiPattern(term), 1).length > 0);
};

const detectImageType = (bytes: Uint8Array, fallbackType: string) => {
    if (bytes.length >= 12 && readAscii(bytes, 0, 4) === 'RIFF' && readAscii(bytes, 8, 12) === 'WEBP') return 'WebP';
    if (bytes.length >= 8 && bytes[0] === 0x89 && readAscii(bytes, 1, 4) === 'PNG') return 'PNG';
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'JPEG';
    if (bytes.length >= 6 && (readAscii(bytes, 0, 6) === 'GIF87a' || readAscii(bytes, 0, 6) === 'GIF89a')) return 'GIF';
    if (bytes.length >= 12 && readAscii(bytes, 4, 8) === 'ftyp') return readAscii(bytes, 8, 12).trim() || 'ISO BMFF';
    if (bytes.length >= 2 && readAscii(bytes, 0, 2) === 'BM') return 'BMP';

    return fallbackType || '未知';
};

const scanJpegContainers = (bytes: Uint8Array) => {
    const findings: ContainerFinding[] = [];

    if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) return findings;

    let offset = 2;
    let app11Count = 0;
    let xmpCount = 0;

    while (offset + 4 < bytes.length) {
        if (bytes[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        while (bytes[offset] === 0xff) offset += 1;

        const marker = bytes[offset];
        offset += 1;

        if (marker === 0xda || marker === 0xd9) break;
        if (marker >= 0xd0 && marker <= 0xd7) continue;
        if (offset + 2 > bytes.length) break;

        const length = readUInt16BE(bytes, offset);
        const dataStart = offset + 2;
        const dataEnd = Math.min(dataStart + Math.max(0, length - 2), bytes.length);

        if (marker === 0xe1 && hasAsciiInRange(bytes, dataStart, dataEnd, ['http://ns.adobe.com/xap/1.0/', 'Exif'])) {
            xmpCount += 1;
        }

        if (marker === 0xeb) {
            app11Count += 1;
            const isC2paLike = hasAsciiInRange(bytes, dataStart, dataEnd, ['JUMBF', 'jumb', 'c2pa', 'C2PA']);
            findings.push({
                label: `JPEG APP11 #${app11Count}`,
                detail: isC2paLike ? '包含 JUMBF/C2PA 字符串，常见于 C2PA manifest 容器。' : '存在 APP11 段，但未在该段头部扫描到 C2PA 字符串。',
                tone: isC2paLike ? 'success' : 'neutral',
            });
        }

        if (length < 2) break;
        offset += length;
    }

    if (xmpCount > 0) {
        findings.push({
            label: 'JPEG APP1',
            detail: `检测到 ${xmpCount} 个 EXIF/XMP 相关 APP1 段。`,
            tone: 'neutral',
        });
    }

    return findings;
};

const scanPngContainers = (bytes: Uint8Array) => {
    const findings: ContainerFinding[] = [];
    const isPng = bytes.length >= 8 && bytes[0] === 0x89 && readAscii(bytes, 1, 4) === 'PNG';

    if (!isPng) return findings;

    let offset = 8;
    const chunkCounts = new Map<string, number>();

    while (offset + 12 <= bytes.length) {
        const length = readUInt32BE(bytes, offset);
        const type = readAscii(bytes, offset + 4, offset + 8);
        const dataStart = offset + 8;
        const dataEnd = dataStart + length;

        if (dataEnd + 4 > bytes.length) break;

        chunkCounts.set(type, (chunkCounts.get(type) ?? 0) + 1);

        const c2paLikeChunk = ['caBX', 'c2pa'].includes(type) || type.toLowerCase().includes('c2pa');
        const c2paLikeData = hasAsciiInRange(bytes, dataStart, dataEnd, ['JUMBF', 'jumb', 'c2pa', 'C2PA', 'Content Credentials']);

        if (c2paLikeChunk || c2paLikeData) {
            findings.push({
                label: `PNG ${type}`,
                detail: c2paLikeChunk ? '检测到 C2PA 相关 PNG chunk。' : '该 chunk 数据中包含 C2PA/JUMBF 相关字符串。',
                tone: 'success',
            });
        }

        offset = dataEnd + 4;
        if (type === 'IEND') break;
    }

    ['eXIf', 'iTXt', 'tEXt', 'zTXt', 'iCCP'].forEach(type => {
        const count = chunkCounts.get(type);
        if (count) {
            findings.push({
                label: `PNG ${type}`,
                detail: `检测到 ${count} 个 metadata chunk。`,
                tone: 'neutral',
            });
        }
    });

    return findings;
};

const scanWebpContainers = (bytes: Uint8Array) => {
    const findings: ContainerFinding[] = [];
    const isWebp = bytes.length >= 12 && readAscii(bytes, 0, 4) === 'RIFF' && readAscii(bytes, 8, 12) === 'WEBP';

    if (!isWebp) return findings;

    let offset = 12;

    while (offset + 8 <= bytes.length) {
        const type = readAscii(bytes, offset, offset + 4);
        const length = readUInt32LE(bytes, offset + 4);
        const dataStart = offset + 8;
        const dataEnd = Math.min(dataStart + length, bytes.length);

        if (['EXIF', 'XMP ', 'ICCP'].includes(type)) {
            findings.push({
                label: `WebP ${type.trim()}`,
                detail: `检测到 ${formatBytes(length)} 的 ${type.trim()} metadata chunk。`,
                tone: 'neutral',
            });
        }

        if (type.toLowerCase().includes('c2pa') || hasAsciiInRange(bytes, dataStart, dataEnd, ['JUMBF', 'jumb', 'c2pa', 'C2PA'])) {
            findings.push({
                label: `WebP ${type.trim() || 'chunk'}`,
                detail: '检测到 C2PA/JUMBF 相关字符串。',
                tone: 'success',
            });
        }

        offset = dataEnd + (length % 2);
    }

    return findings;
};

const scanIsoBmffContainers = (bytes: Uint8Array) => {
    const findings: ContainerFinding[] = [];

    if (!(bytes.length >= 12 && readAscii(bytes, 4, 8) === 'ftyp')) return findings;

    let offset = 0;
    let scanned = 0;

    while (offset + 8 <= bytes.length && scanned < 80) {
        const size = readUInt32BE(bytes, offset);
        const type = readAscii(bytes, offset + 4, offset + 8);

        if (size < 8) break;

        if (['ftyp', 'meta', 'uuid', 'c2pa', 'jumb'].includes(type) || type.toLowerCase().includes('c2pa')) {
            findings.push({
                label: `BMFF ${type}`,
                detail: `检测到 ${formatBytes(size)} 的 ${type} box。`,
                tone: type.toLowerCase().includes('c2pa') || type === 'jumb' ? 'success' : 'neutral',
            });
        }

        offset += size;
        scanned += 1;
    }

    return findings;
};

const scanProvenance = (arrayBuffer: ArrayBuffer): ProvenanceScan => {
    const bytes = new Uint8Array(arrayBuffer);
    const markers = SCAN_PATTERNS.map(({ label, terms }) => {
        const offsets = Array.from(new Set(terms.flatMap(term => findPatternOffsets(bytes, toAsciiPattern(term)))));
        offsets.sort((a, b) => a - b);
        return {
            label,
            count: offsets.length,
            offsets: offsets.slice(0, MAX_SCAN_OFFSET_COUNT),
        };
    }).filter(marker => marker.count > 0);

    const containers = [
        ...scanJpegContainers(bytes),
        ...scanPngContainers(bytes),
        ...scanWebpContainers(bytes),
        ...scanIsoBmffContainers(bytes),
    ];

    const strongMarkerLabels = new Set(['C2PA', 'JUMBF', 'Content Credentials']);
    const detected = markers.some(marker => strongMarkerLabels.has(marker.label)) || containers.some(finding => finding.tone === 'success');

    return {
        detected,
        statusLabel: detected ? '发现 provenance 线索' : '未发现 C2PA metadata 线索',
        statusDetail: detected
            ? '检测到 C2PA/JUMBF/Content Credentials 相关字符串或容器。此工具不验证证书链。'
            : '没有扫描到 C2PA/JUMBF 相关 metadata。metadata 可能本来不存在，也可能在截图、压缩或平台转发时被移除。',
        markers,
        containers,
    };
};

const safeStringify = (value: unknown) => {
    try {
        return JSON.stringify(value, (_key, item) => {
            if (item instanceof ArrayBuffer) return `[ArrayBuffer ${formatBytes(item.byteLength)}]`;
            if (ArrayBuffer.isView(item)) return `[${item.constructor.name} ${formatBytes(item.byteLength)}]`;
            if (typeof item === 'bigint') return item.toString();
            if (typeof item === 'string' && item.length > MAX_DISPLAY_TEXT) return truncateText(item);
            return item;
        }, 2);
    } catch {
        return String(value);
    }
};

const valueToText = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return truncateText(value);
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    if (value instanceof ArrayBuffer) return `[ArrayBuffer ${formatBytes(value.byteLength)}]`;
    if (ArrayBuffer.isView(value)) return `[${value.constructor.name} ${formatBytes(value.byteLength)}]`;
    if (Array.isArray(value)) {
        const displayValue = value.length > 24 ? [...value.slice(0, 24), `... ${value.length - 24} more`] : value;
        return safeStringify(displayValue);
    }

    return safeStringify(value);
};

const tagToText = (tag: unknown) => {
    if (!tag || typeof tag !== 'object') return valueToText(tag);

    const candidate = tag as { description?: unknown; value?: unknown };
    const description = valueToText(candidate.description);
    if (description) return description;

    return valueToText(candidate.value ?? tag);
};

const shouldSkipMetadataValue = (name: string, value: unknown) => {
    const lowerName = name.toLowerCase();
    if (['image', 'base64'].includes(lowerName)) return true;
    if (lowerName.includes('thumbnail') && typeof value === 'string' && value.length > 500) return true;
    return false;
};

const flattenMetadata = (tags: ExpandedTags): MetadataGroup[] => {
    const groups = Object.entries(tags)
        .filter(([, value]) => value && typeof value === 'object')
        .map(([groupKey, groupValue]) => {
            const rows = Object.entries(groupValue as Record<string, unknown>)
                .filter(([name, value]) => !shouldSkipMetadataValue(name, value))
                .map(([name, value]) => ({
                    group: groupKey,
                    groupLabel: GROUP_LABELS[groupKey] ?? groupKey,
                    name,
                    value: tagToText(value),
                }))
                .filter(row => row.value.length > 0);

            return {
                key: groupKey,
                label: GROUP_LABELS[groupKey] ?? groupKey,
                rows: rows.sort((a, b) => a.name.localeCompare(b.name)),
            };
        })
        .filter(group => group.rows.length > 0);

    return groups.sort((a, b) => {
        const aIndex = GROUP_ORDER.indexOf(a.key);
        const bIndex = GROUP_ORDER.indexOf(b.key);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
};

const loadImageDimensions = (url: string) => new Promise<ImageDimensions | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
});

const buildExportJson = (
    file: File,
    dimensions: ImageDimensions | null,
    detectedType: string,
    metadataGroups: MetadataGroup[],
    provenance: ProvenanceScan
) => {
    const metadata = metadataGroups.reduce<Record<string, Record<string, string>>>((accumulator, group) => {
        accumulator[group.key] = group.rows.reduce<Record<string, string>>((rows, row) => {
            rows[row.name] = row.value;
            return rows;
        }, {});
        return accumulator;
    }, {});

    return JSON.stringify({
        file: {
            name: file.name,
            type: file.type,
            detectedType,
            size: file.size,
            sizeText: formatBytes(file.size),
            lastModified: file.lastModified,
            lastModifiedText: formatDateTime(file.lastModified),
        },
        dimensions,
        provenance,
        metadata,
    }, null, 2);
};

const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

const downloadText = (value: string, filename: string) => {
    const blob = new Blob([value], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};

const getToneClasses = (tone: ProvenanceTone) => {
    if (tone === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300';
    if (tone === 'warning') return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300';
    return 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300';
};

const ImageMetadataTool: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [query, setQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const reset = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl('');
        setAnalysis(null);
        setError(null);
        setQuery('');
        setCopied(false);
        if (inputRef.current) inputRef.current.value = '';
    }, [previewUrl]);

    const parseFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?|bmp)$/i.test(file.name)) {
            setError('请选择图片文件');
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const objectUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(objectUrl);
        setAnalysis(null);
        setError(null);
        setCopied(false);
        setIsParsing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const detectedType = detectImageType(bytes, file.type);

            const [dimensions, tags] = await Promise.all([
                loadImageDimensions(objectUrl),
                ExifReader.load(arrayBuffer, {
                    async: true,
                    computed: true,
                    expanded: true,
                    includeUnknown: true,
                }).catch((metadataError: unknown) => {
                    if (metadataError instanceof ExifReader.errors.MetadataMissingError) {
                        return {} as ExpandedTags;
                    }
                    throw metadataError;
                }),
            ]);

            const metadataGroups = flattenMetadata(tags);
            const metadataRows = metadataGroups.flatMap(group => group.rows);
            const provenance = scanProvenance(arrayBuffer);
            const exportJson = buildExportJson(file, dimensions, detectedType, metadataGroups, provenance);

            setAnalysis({
                file: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                },
                dimensions,
                detectedType,
                metadataGroups,
                metadataRows,
                provenance,
                exportJson,
            });
        } catch (parseError) {
            console.error('Metadata parsing failed:', parseError);
            setError(parseError instanceof Error ? parseError.message : '图片元信息解析失败');
        } finally {
            setIsParsing(false);
        }
    }, [previewUrl]);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) parseFile(file);
    }, [parseFile]);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file) parseFile(file);
    }, [parseFile]);

    const handleCopy = useCallback(async () => {
        if (!analysis) return;
        await copyText(analysis.exportJson);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    }, [analysis]);

    const handleDownload = useCallback(() => {
        if (!analysis) return;
        const baseName = analysis.file.name.replace(/\.[^/.]+$/, '') || 'image';
        downloadText(analysis.exportJson, `${baseName}-metadata.json`);
    }, [analysis]);

    const filteredGroups = useMemo(() => {
        if (!analysis) return [];
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) return analysis.metadataGroups;

        return analysis.metadataGroups
            .map(group => ({
                ...group,
                rows: group.rows.filter(row => (
                    row.name.toLowerCase().includes(normalizedQuery)
                    || row.value.toLowerCase().includes(normalizedQuery)
                    || row.groupLabel.toLowerCase().includes(normalizedQuery)
                )),
            }))
            .filter(group => group.rows.length > 0);
    }, [analysis, query]);

    const metadataCount = analysis?.metadataRows.length ?? 0;
    const dimensionsText = analysis?.dimensions ? `${analysis.dimensions.width} x ${analysis.dimensions.height}` : '未读取';

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex w-full max-w-6xl flex-col items-center gap-2 text-center">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    图片元信息查看器
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    读取 EXIF、XMP、IPTC、PNG/WebP metadata 与 C2PA 线索
                </p>
            </div>

            <div className="flex w-full max-w-6xl flex-col gap-6">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-800 dark:bg-red-900/50">
                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}

                <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-background-dark">
                    {!analysis && !isParsing ? (
                        <label
                            className={`m-6 flex cursor-pointer flex-col items-center gap-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors sm:p-14 ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 hover:border-primary dark:border-gray-700 dark:hover:border-primary'
                            }`}
                            onDragEnter={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">
                                fingerprint
                            </span>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">拖拽图片至此</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">支持 JPG、PNG、WebP、GIF、AVIF、HEIC、TIFF</p>
                            </div>
                            <span className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100 px-4 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                                点击选择文件
                            </span>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*,.heic,.heif,.avif,.tif,.tiff"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            <div className="relative flex flex-col gap-5 border-b border-gray-200 p-6 dark:border-gray-700/50 lg:border-b-0 lg:border-r">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="flex items-center gap-2 text-base font-semibold leading-normal text-gray-900 dark:text-white">
                                        <span className="material-symbols-outlined text-xl">image</span>
                                        上传的图片
                                    </h3>
                                    <button
                                        onClick={reset}
                                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        更换图片
                                    </button>
                                </div>

                                <div className="flex min-h-[300px] flex-1 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                                    {previewUrl && (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-[420px] max-w-full object-contain"
                                        />
                                    )}
                                    {isParsing && (
                                        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', borderTopColor: '#607AFB' }}></div>
                                            <span className="text-sm">解析中...</span>
                                        </div>
                                    )}
                                </div>

                                {selectedFile && (
                                    <div className="min-w-0">
                                        <p className="truncate text-center text-xs text-gray-500 dark:text-gray-400">{selectedFile.name}</p>
                                    </div>
                                )}

                                {analysis && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">文件大小</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatBytes(analysis.file.size)}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">图片尺寸</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{dimensionsText}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">识别格式</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{analysis.detectedType}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">字段数量</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{metadataCount}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex min-h-[560px] flex-col gap-5 bg-gray-50/50 p-6 dark:bg-gray-800/30">
                                {analysis ? (
                                    <>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white">解析结果</h3>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    最后修改：{formatDateTime(analysis.file.lastModified)}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={handleCopy}
                                                    className="flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                                >
                                                    <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'content_copy'}</span>
                                                    {copied ? '已复制' : '复制 JSON'}
                                                </button>
                                                <button
                                                    onClick={handleDownload}
                                                    className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:opacity-90"
                                                >
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                    下载 JSON
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`rounded-lg border p-4 ${analysis.provenance.detected ? getToneClasses('success') : getToneClasses('warning')}`}>
                                            <div className="flex items-start gap-3">
                                                <span className="material-symbols-outlined text-xl">
                                                    {analysis.provenance.detected ? 'verified' : 'info'}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold">{analysis.provenance.statusLabel}</p>
                                                    <p className="mt-1 text-xs leading-relaxed">{analysis.provenance.statusDetail}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {(analysis.provenance.containers.length > 0 || analysis.provenance.markers.length > 0) && (
                                            <div className="space-y-3">
                                                {analysis.provenance.containers.length > 0 && (
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {analysis.provenance.containers.map((finding, index) => (
                                                            <div
                                                                key={`${finding.label}-${index}`}
                                                                className={`rounded-lg border p-3 ${getToneClasses(finding.tone)}`}
                                                            >
                                                                <p className="text-sm font-semibold">{finding.label}</p>
                                                                <p className="mt-1 text-xs leading-relaxed">{finding.detail}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {analysis.provenance.markers.length > 0 && (
                                                    <details className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                                        <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
                                                            字符串命中
                                                        </summary>
                                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                            {analysis.provenance.markers.map(marker => (
                                                                <div key={marker.label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{marker.label}</p>
                                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                        {marker.count} 处：{marker.offsets.map(offset => `0x${offset.toString(16)}`).join(', ')}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/40">
                                            <span className="material-symbols-outlined text-lg text-gray-400">search</span>
                                            <input
                                                value={query}
                                                onChange={(event) => setQuery(event.target.value)}
                                                placeholder="搜索字段或值"
                                                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                                            />
                                        </div>

                                        {filteredGroups.length > 0 ? (
                                            <div className="space-y-3">
                                                {filteredGroups.map((group, index) => (
                                                    <details
                                                        key={group.key}
                                                        open={index < 4 || Boolean(query.trim())}
                                                        className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40"
                                                    >
                                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                                                            <span>{group.label}</span>
                                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">{group.rows.length}</span>
                                                        </summary>
                                                        <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                                                            {group.rows.map(row => (
                                                                <div key={`${row.group}-${row.name}`} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                                                                    <p className="break-words text-xs font-semibold text-gray-500 dark:text-gray-400">{row.name}</p>
                                                                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-gray-800 dark:text-gray-200">{row.value}</pre>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900/40">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {metadataCount === 0 ? '没有读取到可展示的 metadata 字段' : '没有匹配的字段'}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-1 items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', borderTopColor: '#607AFB' }}></div>
                                            <p className="text-sm">正在读取图片元信息...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ImageMetadataTool;
