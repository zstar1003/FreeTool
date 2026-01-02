import React, { useState, useCallback, useRef, useEffect } from 'react';

interface MindMapNode {
    id: string;
    text: string;
    x: number;
    y: number;
    parentId: string | null;
    children: string[];
    color: string;
    collapsed: boolean;
}

interface MindMapData {
    nodes: Record<string, MindMapNode>;
    rootId: string;
}

// 样式配置
type LineStyle = 'curve' | 'straight' | 'polyline';
type NodeShape = 'rounded' | 'rectangle' | 'ellipse';
type LayoutDirection = 'right' | 'down' | 'mindmap';

interface StyleConfig {
    lineStyle: LineStyle;
    nodeShape: NodeShape;
    layoutDirection: LayoutDirection;
    theme: string;
}

const STORAGE_KEY = 'freetool-mindmap-data';
const STYLE_STORAGE_KEY = 'freetool-mindmap-style';

// 颜色主题
const COLOR_THEMES: Record<string, string[]> = {
    // 多彩主题
    '默认': ['#607AFB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'],
    '清新': ['#22C55E', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7'],
    '暖色': ['#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4'],
    '冷色': ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#EF4444'],
    '商务': ['#1E40AF', '#1E3A8A', '#312E81', '#4C1D95', '#581C87', '#701A75', '#831843', '#881337'],
    '彩虹': ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'],
    // 纯色主题
    '纯蓝': ['#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6'],
    '纯绿': ['#10B981', '#10B981', '#10B981', '#10B981', '#10B981', '#10B981', '#10B981', '#10B981'],
    '纯紫': ['#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6'],
    '纯橙': ['#F97316', '#F97316', '#F97316', '#F97316', '#F97316', '#F97316', '#F97316', '#F97316'],
    '纯红': ['#EF4444', '#EF4444', '#EF4444', '#EF4444', '#EF4444', '#EF4444', '#EF4444', '#EF4444'],
    '纯青': ['#06B6D4', '#06B6D4', '#06B6D4', '#06B6D4', '#06B6D4', '#06B6D4', '#06B6D4', '#06B6D4'],
    '纯粉': ['#EC4899', '#EC4899', '#EC4899', '#EC4899', '#EC4899', '#EC4899', '#EC4899', '#EC4899'],
    '深灰': ['#475569', '#475569', '#475569', '#475569', '#475569', '#475569', '#475569', '#475569'],
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const createInitialData = (theme: string): MindMapData => {
    const rootId = generateId();
    const colors = COLOR_THEMES[theme] || COLOR_THEMES['默认'];
    return {
        nodes: {
            [rootId]: {
                id: rootId,
                text: '中心主题',
                x: 0,
                y: 0,
                parentId: null,
                children: [],
                color: colors[0],
                collapsed: false,
            }
        },
        rootId
    };
};

const loadStyleFromStorage = (): StyleConfig => {
    try {
        const saved = localStorage.getItem(STYLE_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved) as StyleConfig;
        }
    } catch (e) {
        console.error('Failed to load style config:', e);
    }
    return {
        lineStyle: 'curve',
        nodeShape: 'rounded',
        layoutDirection: 'right',
        theme: '默认',
    };
};

const saveStyleToStorage = (style: StyleConfig) => {
    try {
        localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(style));
    } catch (e) {
        console.error('Failed to save style config:', e);
    }
};

const loadFromStorage = (): MindMapData | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved) as MindMapData;
            if (data.rootId && data.nodes && data.nodes[data.rootId]) {
                return data;
            }
        }
    } catch (e) {
        console.error('Failed to load mindmap data:', e);
    }
    return null;
};

const saveToStorage = (data: MindMapData) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save mindmap data:', e);
    }
};

const MindMapTool: React.FC = () => {
    const [styleConfig, setStyleConfig] = useState<StyleConfig>(loadStyleFromStorage);
    const [data, setData] = useState<MindMapData>(() => loadFromStorage() || createInitialData(styleConfig.theme));
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [copySuccess, setCopySuccess] = useState(false);
    const [showStylePanel, setShowStylePanel] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const colors = COLOR_THEMES[styleConfig.theme] || COLOR_THEMES['默认'];

    // 更新样式配置
    const updateStyleConfig = useCallback((updates: Partial<StyleConfig>) => {
        setStyleConfig(prev => {
            const newConfig = { ...prev, ...updates };
            saveStyleToStorage(newConfig);

            // 如果更改了颜色主题，更新所有节点的颜色
            if (updates.theme && updates.theme !== prev.theme) {
                const newColors = COLOR_THEMES[updates.theme] || COLOR_THEMES['默认'];
                setData(prevData => {
                    const newNodes = { ...prevData.nodes };
                    const rootNode = newNodes[prevData.rootId];

                    // 更新根节点颜色
                    if (rootNode) {
                        newNodes[prevData.rootId] = { ...rootNode, color: newColors[0] };
                    }

                    // 更新子节点颜色（按分支分配颜色）
                    let branchIndex = 0;
                    rootNode?.children.forEach(childId => {
                        const branchColor = newColors[branchIndex % newColors.length];
                        branchIndex++;

                        // 递归更新整个分支的颜色
                        const updateBranchColor = (nodeId: string, color: string) => {
                            const node = newNodes[nodeId];
                            if (node) {
                                newNodes[nodeId] = { ...node, color };
                                node.children.forEach(cId => updateBranchColor(cId, color));
                            }
                        };
                        updateBranchColor(childId, branchColor);
                    });

                    const updatedData = { ...prevData, nodes: newNodes };
                    saveToStorage(updatedData);
                    return updatedData;
                });
            }

            return newConfig;
        });
    }, []);

    // 自动布局算法
    const calculateLayout = useCallback((nodeId: string, nodes: Record<string, MindMapNode>, depth: number = 0, yOffset: number = 0): number => {
        const node = nodes[nodeId];
        if (!node) return yOffset;

        const isVertical = styleConfig.layoutDirection === 'down';
        const horizontalSpacing = isVertical ? 80 : 200;
        const verticalSpacing = isVertical ? 100 : 70;

        if (isVertical) {
            node.y = depth * verticalSpacing;
        } else {
            node.x = depth * horizontalSpacing;
        }

        if (node.collapsed || node.children.length === 0) {
            if (isVertical) {
                node.x = yOffset;
            } else {
                node.y = yOffset;
            }
            return yOffset + (isVertical ? 150 : verticalSpacing);
        }

        let currentOffset = yOffset;
        const childPositions: number[] = [];

        for (const childId of node.children) {
            currentOffset = calculateLayout(childId, nodes, depth + 1, currentOffset);
            const childNode = nodes[childId];
            if (childNode) {
                childPositions.push(isVertical ? childNode.x : childNode.y);
            }
        }

        if (childPositions.length > 0) {
            const minPos = Math.min(...childPositions);
            const maxPos = Math.max(...childPositions);
            if (isVertical) {
                node.x = (minPos + maxPos) / 2;
            } else {
                node.y = (minPos + maxPos) / 2;
            }
        } else {
            if (isVertical) {
                node.x = yOffset;
            } else {
                node.y = yOffset;
            }
        }

        return currentOffset;
    }, [styleConfig.layoutDirection]);

    const applyLayoutAndSave = useCallback((newData: MindMapData) => {
        const nodes = { ...newData.nodes };
        Object.keys(nodes).forEach(key => {
            nodes[key] = { ...nodes[key] };
        });
        calculateLayout(newData.rootId, nodes, 0, 0);
        const updatedData = { ...newData, nodes };
        saveToStorage(updatedData);
        return updatedData;
    }, [calculateLayout]);

    useEffect(() => {
        setData(prev => applyLayoutAndSave(prev));
    }, [styleConfig.layoutDirection]);

    const addChildNode = useCallback((parentId: string) => {
        setData(prev => {
            const parent = prev.nodes[parentId];
            if (!parent) return prev;

            const newId = generateId();
            const nodeCount = Object.keys(prev.nodes).length;
            const colorIndex = nodeCount % colors.length;

            const newNode: MindMapNode = {
                id: newId,
                text: '新节点',
                x: 0,
                y: 0,
                parentId: parentId,
                children: [],
                color: parent.parentId === null ? colors[colorIndex] : parent.color,
                collapsed: false,
            };

            const updatedNodes = {
                ...prev.nodes,
                [newId]: newNode,
                [parentId]: {
                    ...parent,
                    children: [...parent.children, newId],
                    collapsed: false,
                }
            };

            return applyLayoutAndSave({ ...prev, nodes: updatedNodes });
        });
    }, [applyLayoutAndSave, colors]);

    const deleteNode = useCallback((nodeId: string) => {
        setData(prev => {
            const node = prev.nodes[nodeId];
            if (!node || node.parentId === null) return prev;

            const newNodes = { ...prev.nodes };

            const deleteRecursive = (id: string) => {
                const n = newNodes[id];
                if (n) {
                    n.children.forEach(deleteRecursive);
                    delete newNodes[id];
                }
            };
            deleteRecursive(nodeId);

            const parent = newNodes[node.parentId];
            if (parent) {
                newNodes[node.parentId] = {
                    ...parent,
                    children: parent.children.filter(id => id !== nodeId),
                };
            }

            return applyLayoutAndSave({ ...prev, nodes: newNodes });
        });
        setSelectedNodeId(null);
    }, [applyLayoutAndSave]);

    const startEditing = useCallback((nodeId: string) => {
        const node = data.nodes[nodeId];
        if (node) {
            setEditingNodeId(nodeId);
            setEditText(node.text);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [data.nodes]);

    const finishEditing = useCallback(() => {
        if (editingNodeId && editText.trim()) {
            setData(prev => {
                const node = prev.nodes[editingNodeId];
                if (node) {
                    const newNodes = {
                        ...prev.nodes,
                        [editingNodeId]: { ...node, text: editText.trim() }
                    };
                    const newData = { ...prev, nodes: newNodes };
                    saveToStorage(newData);
                    return newData;
                }
                return prev;
            });
        }
        setEditingNodeId(null);
        setEditText('');
    }, [editingNodeId, editText]);

    const toggleCollapse = useCallback((nodeId: string) => {
        setData(prev => {
            const node = prev.nodes[nodeId];
            if (node && node.children.length > 0) {
                const newNodes = {
                    ...prev.nodes,
                    [nodeId]: { ...node, collapsed: !node.collapsed }
                };
                return applyLayoutAndSave({ ...prev, nodes: newNodes });
            }
            return prev;
        });
    }, [applyLayoutAndSave]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.3, Math.min(3, prev * delta)));
    }, []);

    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.target === canvasRef.current || e.target === svgRef.current) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            setSelectedNodeId(null);
        }
    }, [offset]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setOffset({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const calculateBounds = useCallback(() => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const collectVisibleNodes = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node) return;

            minX = Math.min(minX, node.x - 80);
            minY = Math.min(minY, node.y - 30);
            maxX = Math.max(maxX, node.x + 100);
            maxY = Math.max(maxY, node.y + 30);

            if (!node.collapsed) {
                node.children.forEach(collectVisibleNodes);
            }
        };

        collectVisibleNodes(data.rootId);

        if (minX === Infinity) {
            return { minX: -100, minY: -50, maxX: 100, maxY: 50 };
        }

        return { minX, minY, maxX, maxY };
    }, [data]);

    // 生成连接线路径
    const getLinePath = useCallback((startX: number, startY: number, endX: number, endY: number) => {
        const isVertical = styleConfig.layoutDirection === 'down';

        switch (styleConfig.lineStyle) {
            case 'straight':
                return `M ${startX} ${startY} L ${endX} ${endY}`;
            case 'polyline':
                if (isVertical) {
                    const midY = (startY + endY) / 2;
                    return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
                } else {
                    const midX = (startX + endX) / 2;
                    return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
                }
            case 'curve':
            default:
                if (isVertical) {
                    const midY = (startY + endY) / 2;
                    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                } else {
                    const midX = (startX + endX) / 2;
                    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                }
        }
    }, [styleConfig.lineStyle, styleConfig.layoutDirection]);

    // 获取节点形状属性
    const getNodeShapeAttrs = useCallback((_isRoot?: boolean) => {
        const nodeWidth = 140;
        const nodeHeight = 44;

        switch (styleConfig.nodeShape) {
            case 'rectangle':
                return { rx: 4, ry: 4, width: nodeWidth, height: nodeHeight };
            case 'ellipse':
                return { rx: nodeWidth / 2, ry: nodeHeight / 2, width: nodeWidth, height: nodeHeight };
            case 'rounded':
            default:
                return { rx: 22, ry: 22, width: nodeWidth, height: nodeHeight };
        }
    }, [styleConfig.nodeShape]);

    const exportToPNG = useCallback(async () => {
        if (editingNodeId) {
            finishEditing();
        }

        const bounds = calculateBounds();
        const padding = 50;
        const width = bounds.maxX - bounds.minX + padding * 2;
        const height = bounds.maxY - bounds.minY + padding * 2;
        const isVertical = styleConfig.layoutDirection === 'down';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('viewBox', `${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', String(bounds.minX - padding));
        bg.setAttribute('y', String(bounds.minY - padding));
        bg.setAttribute('width', String(width));
        bg.setAttribute('height', String(height));
        bg.setAttribute('fill', 'white');
        svg.appendChild(bg);

        const shapeAttrs = getNodeShapeAttrs(false);

        const drawConnections = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node || node.collapsed) return;

            node.children.forEach(childId => {
                const child = data.nodes[childId];
                if (child) {
                    let startX: number, startY: number, endX: number, endY: number;

                    if (isVertical) {
                        startX = node.x;
                        startY = node.y + shapeAttrs.height / 2;
                        endX = child.x;
                        endY = child.y - shapeAttrs.height / 2;
                    } else {
                        startX = node.x + shapeAttrs.width / 2;
                        startY = node.y;
                        endX = child.x - shapeAttrs.width / 2;
                        endY = child.y;
                    }

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', getLinePath(startX, startY, endX, endY));
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', child.color);
                    path.setAttribute('stroke-width', '2');
                    path.setAttribute('opacity', '0.6');
                    svg.appendChild(path);

                    drawConnections(childId);
                }
            });
        };
        drawConnections(data.rootId);

        const drawNodes = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node) return;

            const isRoot = node.parentId === null;
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

            const nodeShapeAttrs = getNodeShapeAttrs(isRoot);

            if (styleConfig.nodeShape === 'ellipse') {
                const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                ellipse.setAttribute('cx', '0');
                ellipse.setAttribute('cy', '0');
                ellipse.setAttribute('rx', String(nodeShapeAttrs.width / 2));
                ellipse.setAttribute('ry', String(nodeShapeAttrs.height / 2));
                ellipse.setAttribute('fill', isRoot ? node.color : 'white');
                ellipse.setAttribute('stroke', node.color);
                ellipse.setAttribute('stroke-width', '2');
                g.appendChild(ellipse);
            } else {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', String(-nodeShapeAttrs.width / 2));
                rect.setAttribute('y', String(-nodeShapeAttrs.height / 2));
                rect.setAttribute('width', String(nodeShapeAttrs.width));
                rect.setAttribute('height', String(nodeShapeAttrs.height));
                rect.setAttribute('rx', String(nodeShapeAttrs.rx));
                rect.setAttribute('fill', isRoot ? node.color : 'white');
                rect.setAttribute('stroke', node.color);
                rect.setAttribute('stroke-width', '2');
                g.appendChild(rect);
            }

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '0');
            text.setAttribute('y', '5');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', isRoot ? 'white' : node.color);
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', isRoot ? 'bold' : 'normal');
            text.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
            const displayText = node.text.length > 10 ? node.text.slice(0, 10) + '...' : node.text;
            text.textContent = displayText;
            g.appendChild(text);

            svg.appendChild(g);

            if (!node.collapsed) {
                node.children.forEach(drawNodes);
            }
        };
        drawNodes(data.rootId);

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
                        a.download = 'mindmap.png';
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
    }, [data, editingNodeId, finishEditing, calculateBounds, styleConfig, getLinePath, getNodeShapeAttrs]);

    const resetView = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    const resetMindMap = useCallback(() => {
        const newData = createInitialData(styleConfig.theme);
        setData(applyLayoutAndSave(newData));
        setSelectedNodeId(null);
        setEditingNodeId(null);
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, [applyLayoutAndSave, styleConfig.theme]);

    const renderConnections = () => {
        const lines: React.ReactElement[] = [];
        const isVertical = styleConfig.layoutDirection === 'down';
        const shapeAttrs = getNodeShapeAttrs(false);

        const drawConnections = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node || node.collapsed) return;

            node.children.forEach(childId => {
                const child = data.nodes[childId];
                if (child) {
                    let startX: number, startY: number, endX: number, endY: number;

                    if (isVertical) {
                        startX = node.x;
                        startY = node.y + shapeAttrs.height / 2;
                        endX = child.x;
                        endY = child.y - shapeAttrs.height / 2;
                    } else {
                        startX = node.x + shapeAttrs.width / 2;
                        startY = node.y;
                        endX = child.x - shapeAttrs.width / 2;
                        endY = child.y;
                    }

                    lines.push(
                        <path
                            key={`${nodeId}-${childId}`}
                            d={getLinePath(startX, startY, endX, endY)}
                            fill="none"
                            stroke={child.color}
                            strokeWidth="2"
                            opacity="0.6"
                        />
                    );

                    drawConnections(childId);
                }
            });
        };

        drawConnections(data.rootId);
        return lines;
    };

    const renderNodes = () => {
        const nodeElements: React.ReactElement[] = [];

        const renderNode = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node) return;

            const isSelected = selectedNodeId === nodeId;
            const isEditing = editingNodeId === nodeId;
            const isRoot = node.parentId === null;
            const hasChildren = node.children.length > 0;
            const shapeAttrs = getNodeShapeAttrs(isRoot);
            const isVertical = styleConfig.layoutDirection === 'down';

            nodeElements.push(
                <g key={nodeId} transform={`translate(${node.x}, ${node.y})`}>
                    {styleConfig.nodeShape === 'ellipse' ? (
                        <ellipse
                            cx="0"
                            cy="0"
                            rx={shapeAttrs.width / 2}
                            ry={shapeAttrs.height / 2}
                            fill={isRoot ? node.color : 'white'}
                            stroke={node.color}
                            strokeWidth={isSelected ? 3 : 2}
                            className="cursor-pointer transition-all"
                            onClick={() => setSelectedNodeId(nodeId)}
                            onDoubleClick={() => startEditing(nodeId)}
                        />
                    ) : (
                        <rect
                            x={-shapeAttrs.width / 2}
                            y={-shapeAttrs.height / 2}
                            width={shapeAttrs.width}
                            height={shapeAttrs.height}
                            rx={shapeAttrs.rx}
                            fill={isRoot ? node.color : 'white'}
                            stroke={node.color}
                            strokeWidth={isSelected ? 3 : 2}
                            className="cursor-pointer transition-all"
                            onClick={() => setSelectedNodeId(nodeId)}
                            onDoubleClick={() => startEditing(nodeId)}
                        />
                    )}

                    {isEditing ? (
                        <foreignObject x="-65" y="-15" width="130" height="30">
                            <input
                                ref={inputRef}
                                type="text"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onBlur={finishEditing}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') finishEditing();
                                    if (e.key === 'Escape') {
                                        setEditingNodeId(null);
                                        setEditText('');
                                    }
                                }}
                                className="w-full h-full text-center text-sm bg-transparent outline-none border-none"
                                style={{ color: isRoot ? 'white' : node.color }}
                            />
                        </foreignObject>
                    ) : (
                        <text
                            x="0"
                            y="5"
                            textAnchor="middle"
                            fill={isRoot ? 'white' : node.color}
                            fontSize="14"
                            fontWeight={isRoot ? 'bold' : 'normal'}
                            className="pointer-events-none select-none"
                        >
                            {node.text.length > 10 ? node.text.slice(0, 10) + '...' : node.text}
                        </text>
                    )}

                    {hasChildren && (
                        <g
                            transform={isVertical ? `translate(0, ${shapeAttrs.height / 2 + 5})` : `translate(${shapeAttrs.width / 2 + 5}, 0)`}
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCollapse(nodeId);
                            }}
                        >
                            <circle r="10" fill={node.color} opacity="0.8" />
                            <text
                                x="0"
                                y="4"
                                textAnchor="middle"
                                fill="white"
                                fontSize="14"
                                fontWeight="bold"
                            >
                                {node.collapsed ? '+' : '-'}
                            </text>
                        </g>
                    )}

                    {node.collapsed && hasChildren && (
                        <text
                            x={isVertical ? 20 : shapeAttrs.width / 2 + 25}
                            y={isVertical ? shapeAttrs.height / 2 + 8 : 5}
                            fontSize="12"
                            fill="#999"
                        >
                            ({node.children.length})
                        </text>
                    )}
                </g>
            );

            if (!node.collapsed) {
                node.children.forEach(renderNode);
            }
        };

        renderNode(data.rootId);
        return nodeElements;
    };

    const bounds = calculateBounds();
    const viewWidth = Math.max(800, bounds.maxX - bounds.minX + 200);
    const viewHeight = Math.max(600, bounds.maxY - bounds.minY + 200);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    return (
        <div className="flex w-full flex-col items-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-7xl flex-col items-center gap-2 text-center mb-6">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    思维导图
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    在线创建和编辑思维导图，支持多种样式和布局
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
                <div className="bg-white dark:bg-gray-800 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700 p-3 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => selectedNodeId && addChildNode(selectedNodeId)}
                        disabled={!selectedNodeId}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        添加子节点
                    </button>
                    <button
                        onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
                        disabled={!selectedNodeId || data.nodes[selectedNodeId]?.parentId === null}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-base">delete</span>
                        删除节点
                    </button>
                    <button
                        onClick={() => selectedNodeId && startEditing(selectedNodeId)}
                        disabled={!selectedNodeId}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-base">edit</span>
                        编辑文字
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                    {/* 样式按钮 */}
                    <button
                        onClick={() => setShowStylePanel(!showStylePanel)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                            showStylePanel
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        <span className="material-symbols-outlined text-base">palette</span>
                        样式设置
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <button
                            onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="放大"
                        >
                            <span className="material-symbols-outlined text-base">zoom_in</span>
                        </button>
                        <span className="w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(prev => Math.max(0.3, prev / 1.2))}
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

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                    <button
                        onClick={resetMindMap}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                        重新开始
                    </button>
                    <button
                        onClick={exportToPNG}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        导出 PNG
                    </button>
                </div>

                {/* 主内容区：画布 + 侧边栏 */}
                <div className="flex rounded-b-xl overflow-hidden border border-t-0 border-gray-200 dark:border-gray-700">
                    {/* 画布区域 */}
                    <div
                        ref={canvasRef}
                        className="relative flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden cursor-grab active:cursor-grabbing"
                        style={{ height: '600px' }}
                        onWheel={handleWheel}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
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
                            viewBox={`${centerX - viewWidth / 2} ${centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`}
                            style={{
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                                transformOrigin: 'center center',
                            }}
                        >
                            {renderConnections()}
                            {renderNodes()}
                        </svg>

                        <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                            <p>鼠标滚轮缩放 | 拖拽移动画布</p>
                            <p>单击选中节点 | 双击编辑文字</p>
                        </div>

                        {selectedNodeId && !showStylePanel && (
                            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-1">选中节点:</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {data.nodes[selectedNodeId]?.text}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 右侧样式面板 */}
                    {showStylePanel && (
                        <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto" style={{ height: '600px' }}>
                            <div className="space-y-5">
                                {/* 颜色主题 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">颜色主题</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(COLOR_THEMES).map(([name, themeColors]) => (
                                            <button
                                                key={name}
                                                onClick={() => updateStyleConfig({ theme: name })}
                                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all ${
                                                    styleConfig.theme === name
                                                        ? 'ring-2 ring-primary ring-offset-1 bg-primary/5'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                title={name}
                                            >
                                                <div className="flex shrink-0">
                                                    {themeColors.slice(0, 3).map((c, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-3 h-3 rounded-full -ml-1 first:ml-0 border border-white dark:border-gray-800"
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-gray-600 dark:text-gray-400 truncate">{name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 连接线样式 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">连接线</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'curve', label: '曲线', icon: 'M 0 12 C 12 12, 12 0, 24 0' },
                                            { id: 'straight', label: '直线', icon: 'M 0 12 L 24 0' },
                                            { id: 'polyline', label: '折线', icon: 'M 0 12 L 12 12 L 12 0 L 24 0' },
                                        ].map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => updateStyleConfig({ lineStyle: style.id as LineStyle })}
                                                className={`flex flex-col items-center gap-1 p-2 rounded text-xs transition-all ${
                                                    styleConfig.lineStyle === style.id
                                                        ? 'bg-primary/10 text-primary ring-1 ring-primary'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                <svg width="24" height="14" viewBox="0 0 24 14">
                                                    <path d={style.icon} fill="none" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                                <span>{style.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 节点形状 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">节点形状</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'rounded', label: '圆角' },
                                            { id: 'rectangle', label: '方形' },
                                            { id: 'ellipse', label: '椭圆' },
                                        ].map(shape => (
                                            <button
                                                key={shape.id}
                                                onClick={() => updateStyleConfig({ nodeShape: shape.id as NodeShape })}
                                                className={`flex flex-col items-center gap-1 p-2 rounded text-xs transition-all ${
                                                    styleConfig.nodeShape === shape.id
                                                        ? 'bg-primary/10 text-primary ring-1 ring-primary'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                <svg width="32" height="18" viewBox="0 0 32 18">
                                                    {shape.id === 'rounded' && <rect x="1" y="1" width="30" height="16" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />}
                                                    {shape.id === 'rectangle' && <rect x="1" y="1" width="30" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />}
                                                    {shape.id === 'ellipse' && <ellipse cx="16" cy="9" rx="15" ry="8" fill="none" stroke="currentColor" strokeWidth="2" />}
                                                </svg>
                                                <span>{shape.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 布局方向 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">布局方向</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'right', label: '向右', icon: 'arrow_forward' },
                                            { id: 'down', label: '向下', icon: 'arrow_downward' },
                                        ].map(dir => (
                                            <button
                                                key={dir.id}
                                                onClick={() => updateStyleConfig({ layoutDirection: dir.id as LayoutDirection })}
                                                className={`flex items-center justify-center gap-1 px-3 py-2 rounded text-xs transition-all ${
                                                    styleConfig.layoutDirection === dir.id
                                                        ? 'bg-primary/10 text-primary ring-1 ring-primary'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-base">{dir.icon}</span>
                                                <span>{dir.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MindMapTool;
