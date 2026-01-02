import React, { useState, useCallback, useRef, useEffect } from 'react';

// 形状类型
type ShapeType = 'rectangle' | 'roundedRect' | 'circle' | 'ellipse' | 'diamond' | 'triangle' | 'arrow' | 'line' | 'arrowLine' | 'text' | 'freehand';

interface Point {
    x: number;
    y: number;
}

interface Shape {
    id: string;
    type: ShapeType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    text: string;
    points?: Point[]; // 用于自由绘制和线条
    endX?: number; // 用于线条
    endY?: number;
}

interface DrawingState {
    shapes: Shape[];
}

const STORAGE_KEY = 'freetool-drawing-data';

const COLORS = [
    '#607AFB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#000000', '#6B7280',
    '#FFFFFF', 'transparent'
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const loadFromStorage = (): DrawingState | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved) as DrawingState;
        }
    } catch (e) {
        console.error('Failed to load drawing data:', e);
    }
    return null;
};

const saveToStorage = (data: DrawingState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save drawing data:', e);
    }
};

const DrawingTool: React.FC = () => {
    const [state, setState] = useState<DrawingState>(() => loadFromStorage() || { shapes: [] });
    const [selectedTool, setSelectedTool] = useState<ShapeType | 'select'>('select');
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<Point | null>(null);
    const [currentShape, setCurrentShape] = useState<Shape | null>(null);
    const [fillColor, setFillColor] = useState('#FFFFFF');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [pendingEditId, setPendingEditId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 保存状态
    useEffect(() => {
        saveToStorage(state);
    }, [state]);

    // 处理待编辑的文本形状（等待 state 更新后再触发编辑）
    useEffect(() => {
        if (pendingEditId) {
            const shape = state.shapes.find(s => s.id === pendingEditId);
            if (shape) {
                setEditingTextId(pendingEditId);
                setEditText(shape.text);
                setPendingEditId(null);
                setTimeout(() => {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }, 0);
            }
        }
    }, [state.shapes, pendingEditId]);

    // 获取鼠标在画布上的位置
    const getCanvasPoint = useCallback((e: React.MouseEvent): Point => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: (e.clientX - rect.left - offset.x) / scale,
            y: (e.clientY - rect.top - offset.y) / scale,
        };
    }, [offset, scale]);

    // 创建新形状
    const createShape = useCallback((type: ShapeType, start: Point, end: Point): Shape => {
        const minX = Math.min(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);

        const baseShape: Shape = {
            id: generateId(),
            type,
            x: minX,
            y: minY,
            width: Math.max(width, 10),
            height: Math.max(height, 10),
            rotation: 0,
            fill: type === 'line' || type === 'arrowLine' || type === 'freehand' ? 'transparent' : fillColor,
            stroke: strokeColor,
            strokeWidth,
            text: type === 'text' ? '文本' : '',
        };

        if (type === 'line' || type === 'arrowLine') {
            baseShape.x = start.x;
            baseShape.y = start.y;
            baseShape.endX = end.x;
            baseShape.endY = end.y;
            baseShape.width = 0;
            baseShape.height = 0;
        }

        if (type === 'circle') {
            const size = Math.max(width, height);
            baseShape.width = size;
            baseShape.height = size;
        }

        return baseShape;
    }, [fillColor, strokeColor, strokeWidth]);

    // 鼠标按下
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const point = getCanvasPoint(e);

        // 空格键按下时平移
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            return;
        }

        if (selectedTool === 'select') {
            // 检查是否点击了形状
            const clickedShape = [...state.shapes].reverse().find(shape => {
                if (shape.type === 'line' || shape.type === 'arrowLine') {
                    // 线条点击检测
                    const dx = (shape.endX || 0) - shape.x;
                    const dy = (shape.endY || 0) - shape.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len === 0) return false;
                    const t = Math.max(0, Math.min(1, ((point.x - shape.x) * dx + (point.y - shape.y) * dy) / (len * len)));
                    const projX = shape.x + t * dx;
                    const projY = shape.y + t * dy;
                    const dist = Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
                    return dist < 10;
                }
                return (
                    point.x >= shape.x &&
                    point.x <= shape.x + shape.width &&
                    point.y >= shape.y &&
                    point.y <= shape.y + shape.height
                );
            });

            if (clickedShape) {
                setSelectedShapeId(clickedShape.id);
                setIsDragging(true);
                setDragOffset({
                    x: point.x - clickedShape.x,
                    y: point.y - clickedShape.y,
                });
            } else {
                setSelectedShapeId(null);
            }
            return;
        }

        if (selectedTool === 'freehand') {
            const newShape: Shape = {
                id: generateId(),
                type: 'freehand',
                x: point.x,
                y: point.y,
                width: 0,
                height: 0,
                rotation: 0,
                fill: 'transparent',
                stroke: strokeColor,
                strokeWidth,
                text: '',
                points: [{ x: point.x, y: point.y }],
            };
            setCurrentShape(newShape);
            setIsDrawing(true);
            return;
        }

        setIsDrawing(true);
        setDrawStart(point);
        setCurrentShape(null);
    }, [selectedTool, getCanvasPoint, state.shapes, offset, strokeColor, strokeWidth]);

    // 鼠标移动
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            setOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            });
            return;
        }

        if (isDragging && selectedShapeId) {
            const point = getCanvasPoint(e);
            setState(prev => ({
                shapes: prev.shapes.map(shape => {
                    if (shape.id === selectedShapeId) {
                        const newX = point.x - dragOffset.x;
                        const newY = point.y - dragOffset.y;
                        if (shape.type === 'line' || shape.type === 'arrowLine') {
                            const dx = (shape.endX || 0) - shape.x;
                            const dy = (shape.endY || 0) - shape.y;
                            return { ...shape, x: newX, y: newY, endX: newX + dx, endY: newY + dy };
                        }
                        return { ...shape, x: newX, y: newY };
                    }
                    return shape;
                }),
            }));
            return;
        }

        if (!isDrawing) return;

        const point = getCanvasPoint(e);

        if (selectedTool === 'freehand' && currentShape) {
            setCurrentShape(prev => {
                if (!prev || !prev.points) return prev;
                return {
                    ...prev,
                    points: [...prev.points, { x: point.x, y: point.y }],
                };
            });
            return;
        }

        if (drawStart && selectedTool !== 'select') {
            const newShape = createShape(selectedTool as ShapeType, drawStart, point);
            setCurrentShape(newShape);
        }
    }, [isPanning, panStart, isDragging, selectedShapeId, dragOffset, isDrawing, getCanvasPoint, selectedTool, currentShape, drawStart, createShape]);

    // 鼠标释放
    const handleMouseUp = useCallback(() => {
        if (isPanning) {
            setIsPanning(false);
            return;
        }

        if (isDragging) {
            setIsDragging(false);
            return;
        }

        if (isDrawing && currentShape) {
            setState(prev => ({ shapes: [...prev.shapes, currentShape] }));
            if (currentShape.type === 'text') {
                // 使用 pendingEditId 来延迟触发编辑，确保 state 已更新
                setPendingEditId(currentShape.id);
            }
        }

        setIsDrawing(false);
        setDrawStart(null);
        setCurrentShape(null);
    }, [isPanning, isDragging, isDrawing, currentShape]);

    // 双击编辑文本
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if (selectedTool !== 'select') return;

        const point = getCanvasPoint(e);

        // 找到双击的形状
        const clickedShape = [...state.shapes].reverse().find(shape => {
            if (shape.type === 'line' || shape.type === 'arrowLine' || shape.type === 'freehand') {
                return false; // 这些类型不支持文本编辑
            }
            return (
                point.x >= shape.x &&
                point.x <= shape.x + shape.width &&
                point.y >= shape.y &&
                point.y <= shape.y + shape.height
            );
        });

        if (clickedShape) {
            // 如果是文本形状，直接编辑
            if (clickedShape.type === 'text') {
                setEditingTextId(clickedShape.id);
                setEditText(clickedShape.text);
                setTimeout(() => inputRef.current?.focus(), 0);
            } else {
                // 其他形状也可以添加文本
                setEditingTextId(clickedShape.id);
                setEditText(clickedShape.text || '');
                setTimeout(() => inputRef.current?.focus(), 0);
            }
        }
    }, [selectedTool, getCanvasPoint, state.shapes]);

    // 滚轮缩放
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.25, Math.min(4, prev * delta)));
    }, []);

    // 删除选中形状
    const deleteSelected = useCallback(() => {
        if (selectedShapeId) {
            setState(prev => ({
                shapes: prev.shapes.filter(s => s.id !== selectedShapeId),
            }));
            setSelectedShapeId(null);
        }
    }, [selectedShapeId]);

    // 键盘事件
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!editingTextId) {
                    deleteSelected();
                }
            }
            if (e.key === 'Escape') {
                setSelectedShapeId(null);
                setSelectedTool('select');
                setEditingTextId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteSelected, editingTextId]);

    // 完成文本编辑
    const finishTextEditing = useCallback(() => {
        if (editingTextId && editText.trim()) {
            setState(prev => ({
                shapes: prev.shapes.map(s =>
                    s.id === editingTextId ? { ...s, text: editText.trim() } : s
                ),
            }));
        }
        setEditingTextId(null);
        setEditText('');
    }, [editingTextId, editText]);

    // 复制选中形状
    const duplicateSelected = useCallback(() => {
        if (selectedShapeId) {
            const shape = state.shapes.find(s => s.id === selectedShapeId);
            if (shape) {
                const newShape = { ...shape, id: generateId(), x: shape.x + 20, y: shape.y + 20 };
                setState(prev => ({ shapes: [...prev.shapes, newShape] }));
                setSelectedShapeId(newShape.id);
            }
        }
    }, [selectedShapeId, state.shapes]);

    // 更新选中形状的样式
    const updateSelectedStyle = useCallback((updates: Partial<Shape>) => {
        if (selectedShapeId) {
            setState(prev => ({
                shapes: prev.shapes.map(s =>
                    s.id === selectedShapeId ? { ...s, ...updates } : s
                ),
            }));
        }
    }, [selectedShapeId]);

    // 导出为 PNG
    const exportToPNG = useCallback(() => {
        if (!svgRef.current || state.shapes.length === 0) return;

        // 计算边界
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        state.shapes.forEach(shape => {
            if (shape.type === 'line' || shape.type === 'arrowLine') {
                minX = Math.min(minX, shape.x, shape.endX || 0);
                minY = Math.min(minY, shape.y, shape.endY || 0);
                maxX = Math.max(maxX, shape.x, shape.endX || 0);
                maxY = Math.max(maxY, shape.y, shape.endY || 0);
            } else if (shape.type === 'freehand' && shape.points) {
                shape.points.forEach(p => {
                    minX = Math.min(minX, p.x);
                    minY = Math.min(minY, p.y);
                    maxX = Math.max(maxX, p.x);
                    maxY = Math.max(maxY, p.y);
                });
            } else {
                minX = Math.min(minX, shape.x);
                minY = Math.min(minY, shape.y);
                maxX = Math.max(maxX, shape.x + shape.width);
                maxY = Math.max(maxY, shape.y + shape.height);
            }
        });

        const padding = 20;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;

        const svg = svgRef.current.cloneNode(true) as SVGSVGElement;
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`);
        svg.style.transform = '';

        // 添加白色背景
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', String(minX - padding));
        bg.setAttribute('y', String(minY - padding));
        bg.setAttribute('width', String(width));
        bg.setAttribute('height', String(height));
        bg.setAttribute('fill', 'white');
        svg.insertBefore(bg, svg.firstChild);

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const exportScale = 2;
            canvas.width = width * exportScale;
            canvas.height = height * exportScale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(exportScale, exportScale);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'drawing.png';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                }, 'image/png');
            }
            URL.revokeObjectURL(svgUrl);
        };
        img.src = svgUrl;

        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    }, [state.shapes]);

    // 清空画布
    const clearCanvas = useCallback(() => {
        setState({ shapes: [] });
        setSelectedShapeId(null);
    }, []);

    // 重置视图
    const resetView = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    // 渲染形状
    const renderShape = (shape: Shape, isPreview = false) => {
        const isSelected = shape.id === selectedShapeId && !isPreview;
        const key = isPreview ? `preview-${shape.id}` : shape.id;

        const commonProps = {
            fill: shape.fill === 'transparent' ? 'none' : shape.fill,
            stroke: shape.stroke,
            strokeWidth: shape.strokeWidth,
            style: { cursor: selectedTool === 'select' ? 'move' : 'crosshair' },
        };

        let element: React.ReactElement | null = null;

        switch (shape.type) {
            case 'rectangle':
                element = <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} {...commonProps} />;
                break;
            case 'roundedRect':
                element = <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={10} {...commonProps} />;
                break;
            case 'circle':
                element = <circle cx={shape.x + shape.width / 2} cy={shape.y + shape.height / 2} r={shape.width / 2} {...commonProps} />;
                break;
            case 'ellipse':
                element = <ellipse cx={shape.x + shape.width / 2} cy={shape.y + shape.height / 2} rx={shape.width / 2} ry={shape.height / 2} {...commonProps} />;
                break;
            case 'diamond':
                const dx = shape.x + shape.width / 2;
                const dy = shape.y + shape.height / 2;
                element = <polygon points={`${dx},${shape.y} ${shape.x + shape.width},${dy} ${dx},${shape.y + shape.height} ${shape.x},${dy}`} {...commonProps} />;
                break;
            case 'triangle':
                element = <polygon points={`${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`} {...commonProps} />;
                break;
            case 'arrow':
                const aw = shape.width;
                const ah = shape.height;
                element = <polygon points={`${shape.x},${shape.y + ah * 0.3} ${shape.x + aw * 0.6},${shape.y + ah * 0.3} ${shape.x + aw * 0.6},${shape.y} ${shape.x + aw},${shape.y + ah * 0.5} ${shape.x + aw * 0.6},${shape.y + ah} ${shape.x + aw * 0.6},${shape.y + ah * 0.7} ${shape.x},${shape.y + ah * 0.7}`} {...commonProps} />;
                break;
            case 'line':
                element = <line x1={shape.x} y1={shape.y} x2={shape.endX} y2={shape.endY} {...commonProps} />;
                break;
            case 'arrowLine':
                const angle = Math.atan2((shape.endY || 0) - shape.y, (shape.endX || 0) - shape.x);
                const arrowLen = 12;
                const ax1 = (shape.endX || 0) - arrowLen * Math.cos(angle - Math.PI / 6);
                const ay1 = (shape.endY || 0) - arrowLen * Math.sin(angle - Math.PI / 6);
                const ax2 = (shape.endX || 0) - arrowLen * Math.cos(angle + Math.PI / 6);
                const ay2 = (shape.endY || 0) - arrowLen * Math.sin(angle + Math.PI / 6);
                element = (
                    <g>
                        <line x1={shape.x} y1={shape.y} x2={shape.endX} y2={shape.endY} {...commonProps} />
                        <polygon points={`${shape.endX},${shape.endY} ${ax1},${ay1} ${ax2},${ay2}`} fill={shape.stroke} stroke="none" />
                    </g>
                );
                break;
            case 'text':
                element = (
                    <g>
                        <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill="transparent" stroke={isSelected ? shape.stroke : 'transparent'} strokeWidth={1} strokeDasharray="4" />
                        <text x={shape.x + shape.width / 2} y={shape.y + shape.height / 2 + 5} textAnchor="middle" fill={shape.stroke} fontSize="16" fontFamily="system-ui">
                            {shape.text}
                        </text>
                    </g>
                );
                break;
            case 'freehand':
                if (shape.points && shape.points.length > 1) {
                    const d = shape.points.reduce((acc, p, i) => {
                        return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                    }, '');
                    element = <path d={d} fill="none" stroke={shape.stroke} strokeWidth={shape.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />;
                }
                break;
        }

        if (!element) return null;

        // 判断是否需要显示文本（非文本类型但有文本内容）
        const showTextOnShape = shape.type !== 'text' && shape.type !== 'line' && shape.type !== 'arrowLine' && shape.type !== 'freehand' && shape.text;

        return (
            <g key={key}>
                {element}
                {/* 在形状上显示文本 */}
                {showTextOnShape && (
                    <text
                        x={shape.x + shape.width / 2}
                        y={shape.y + shape.height / 2 + 5}
                        textAnchor="middle"
                        fill={shape.stroke}
                        fontSize="14"
                        fontFamily="system-ui"
                        style={{ pointerEvents: 'none' }}
                    >
                        {shape.text}
                    </text>
                )}
                {isSelected && shape.type !== 'line' && shape.type !== 'arrowLine' && shape.type !== 'freehand' && (
                    <rect
                        x={shape.x - 4}
                        y={shape.y - 4}
                        width={shape.width + 8}
                        height={shape.height + 8}
                        fill="none"
                        stroke="#607AFB"
                        strokeWidth={2}
                        strokeDasharray="4"
                    />
                )}
            </g>
        );
    };

    // 自定义形状图标
    const ShapeIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-5 h-5" }) => {
        const strokeColor = "currentColor";
        const strokeWidth = 1.5;

        switch (type) {
            case 'select':
                return <span className="material-symbols-outlined text-xl">arrow_selector_tool</span>;
            case 'rectangle':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <rect x="3" y="5" width="14" height="10" />
                    </svg>
                );
            case 'roundedRect':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <rect x="3" y="5" width="14" height="10" rx="3" />
                    </svg>
                );
            case 'circle':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <circle cx="10" cy="10" r="6" />
                    </svg>
                );
            case 'ellipse':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <ellipse cx="10" cy="10" rx="7" ry="5" />
                    </svg>
                );
            case 'diamond':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <polygon points="10,3 17,10 10,17 3,10" />
                    </svg>
                );
            case 'triangle':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <polygon points="10,4 17,16 3,16" />
                    </svg>
                );
            case 'arrow':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <polygon points="3,7 12,7 12,4 18,10 12,16 12,13 3,13" />
                    </svg>
                );
            case 'line':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <line x1="3" y1="17" x2="17" y2="3" />
                    </svg>
                );
            case 'arrowLine':
                return (
                    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                        <line x1="3" y1="17" x2="17" y2="3" />
                        <polyline points="11,3 17,3 17,9" />
                    </svg>
                );
            case 'text':
                return <span className="material-symbols-outlined text-xl">title</span>;
            case 'freehand':
                return <span className="material-symbols-outlined text-xl">draw</span>;
            default:
                return null;
        }
    };

    const tools: { id: ShapeType | 'select'; label: string }[] = [
        { id: 'select', label: '选择' },
        { id: 'rectangle', label: '矩形' },
        { id: 'roundedRect', label: '圆角矩形' },
        { id: 'circle', label: '圆形' },
        { id: 'ellipse', label: '椭圆' },
        { id: 'diamond', label: '菱形' },
        { id: 'triangle', label: '三角形' },
        { id: 'arrow', label: '箭头' },
        { id: 'line', label: '直线' },
        { id: 'arrowLine', label: '箭头线' },
        { id: 'text', label: '文本' },
        { id: 'freehand', label: '画笔' },
    ];

    const selectedShape = state.shapes.find(s => s.id === selectedShapeId);

    return (
        <div className="flex w-full flex-col items-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-7xl flex-col items-center gap-2 text-center mb-6">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    绘图画布
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    在线绘制流程图、示意图，支持多种形状和连接线
                </p>
            </div>

            {copySuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        <span className="font-medium">导出成功!</span>
                    </div>
                </div>
            )}

            <div className="w-full max-w-7xl">
                {/* 工具栏 */}
                <div className="bg-white dark:bg-gray-800 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center gap-1">
                    {/* 形状工具 */}
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                            className={`p-2 rounded transition-colors ${
                                selectedTool === tool.id
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                            title={tool.label}
                        >
                            <ShapeIcon type={tool.id} />
                        </button>
                    ))}

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                    {/* 颜色选择 */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">填充</span>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                                    onChange={e => {
                                        setFillColor(e.target.value);
                                        updateSelectedStyle({ fill: e.target.value });
                                    }}
                                    className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setFillColor('transparent');
                                    updateSelectedStyle({ fill: 'transparent' });
                                }}
                                className={`w-6 h-6 rounded border ${fillColor === 'transparent' ? 'ring-2 ring-primary' : 'border-gray-300'}`}
                                style={{ background: 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 50% / 8px 8px' }}
                                title="透明"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">边框</span>
                            <input
                                type="color"
                                value={strokeColor}
                                onChange={e => {
                                    setStrokeColor(e.target.value);
                                    updateSelectedStyle({ stroke: e.target.value });
                                }}
                                className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">粗细</span>
                            <select
                                value={strokeWidth}
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    setStrokeWidth(val);
                                    updateSelectedStyle({ strokeWidth: val });
                                }}
                                className="text-xs px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                {[1, 2, 3, 4, 5, 6].map(w => (
                                    <option key={w} value={w}>{w}px</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* 操作按钮 */}
                    <button
                        onClick={duplicateSelected}
                        disabled={!selectedShapeId}
                        className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                        title="复制"
                    >
                        <span className="material-symbols-outlined text-xl">content_copy</span>
                    </button>
                    <button
                        onClick={deleteSelected}
                        disabled={!selectedShapeId}
                        className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                        title="删除"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setScale(prev => Math.min(4, prev * 1.2))}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="放大"
                        >
                            <span className="material-symbols-outlined text-base">zoom_in</span>
                        </button>
                        <span className="w-12 text-center text-xs text-gray-500">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(prev => Math.max(0.25, prev / 1.2))}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="缩小"
                        >
                            <span className="material-symbols-outlined text-base">zoom_out</span>
                        </button>
                        <button
                            onClick={resetView}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="重置视图"
                        >
                            <span className="material-symbols-outlined text-base">fit_screen</span>
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                        清空
                    </button>
                    <button
                        onClick={exportToPNG}
                        disabled={state.shapes.length === 0}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        导出
                    </button>
                </div>

                {/* 画布区域 */}
                <div
                    ref={canvasRef}
                    className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b-xl overflow-hidden"
                    style={{ height: '600px', cursor: selectedTool === 'select' ? 'default' : 'crosshair' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onDoubleClick={handleDoubleClick}
                    onWheel={handleWheel}
                >
                    {/* 网格背景 */}
                    <div
                        className="absolute inset-0 opacity-30 dark:opacity-10"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                            `,
                            backgroundSize: `${20 * scale}px ${20 * scale}px`,
                            backgroundPosition: `${offset.x}px ${offset.y}px`,
                        }}
                    />

                    <svg
                        ref={svgRef}
                        className="absolute inset-0 w-full h-full"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                        }}
                    >
                        {state.shapes.map(shape => renderShape(shape))}
                        {currentShape && renderShape(currentShape, true)}
                    </svg>

                    {/* 文本编辑 */}
                    {editingTextId && (() => {
                        const editingShape = state.shapes.find(s => s.id === editingTextId);
                        if (!editingShape) return null;
                        return (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onBlur={finishTextEditing}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') finishTextEditing();
                                    if (e.key === 'Escape') setEditingTextId(null);
                                }}
                                className="absolute bg-white dark:bg-gray-800 border-2 border-primary rounded px-2 py-1 text-sm outline-none shadow-lg"
                                style={{
                                    left: offset.x + editingShape.x * scale,
                                    top: offset.y + editingShape.y * scale,
                                    width: Math.max(120, editingShape.width * scale),
                                    transform: 'translateY(-50%)',
                                    marginTop: (editingShape.height * scale) / 2,
                                }}
                                placeholder="输入文本..."
                            />
                        );
                    })()}

                    {/* 操作提示 */}
                    <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                        <p>滚轮缩放 | Alt+拖拽移动画布 | Delete删除</p>
                        <p>选择工具可拖拽移动形状</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawingTool;
