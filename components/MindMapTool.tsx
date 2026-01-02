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

const STORAGE_KEY = 'freetool-mindmap-data';

const COLORS = [
    '#607AFB', // Primary blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialData = (): MindMapData => {
    const rootId = generateId();
    return {
        nodes: {
            [rootId]: {
                id: rootId,
                text: '中心主题',
                x: 0,
                y: 0,
                parentId: null,
                children: [],
                color: COLORS[0],
                collapsed: false,
            }
        },
        rootId
    };
};

// 从 localStorage 加载数据
const loadFromStorage = (): MindMapData | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved) as MindMapData;
            // 验证数据完整性
            if (data.rootId && data.nodes && data.nodes[data.rootId]) {
                return data;
            }
        }
    } catch (e) {
        console.error('Failed to load mindmap data:', e);
    }
    return null;
};

// 保存到 localStorage
const saveToStorage = (data: MindMapData) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save mindmap data:', e);
    }
};

const MindMapTool: React.FC = () => {
    const [data, setData] = useState<MindMapData>(() => loadFromStorage() || createInitialData());
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [copySuccess, setCopySuccess] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 自动布局算法
    const calculateLayout = useCallback((nodeId: string, nodes: Record<string, MindMapNode>, depth: number = 0, yOffset: number = 0): number => {
        const node = nodes[nodeId];
        if (!node) return yOffset;

        const horizontalSpacing = 200;
        const verticalSpacing = 70;

        node.x = depth * horizontalSpacing;

        if (node.collapsed || node.children.length === 0) {
            node.y = yOffset;
            return yOffset + verticalSpacing;
        }

        let currentY = yOffset;
        const childYPositions: number[] = [];

        for (const childId of node.children) {
            currentY = calculateLayout(childId, nodes, depth + 1, currentY);
            const childNode = nodes[childId];
            if (childNode) {
                childYPositions.push(childNode.y);
            }
        }

        // 父节点居中于子节点
        if (childYPositions.length > 0) {
            const minY = Math.min(...childYPositions);
            const maxY = Math.max(...childYPositions);
            node.y = (minY + maxY) / 2;
        } else {
            node.y = yOffset;
        }

        return currentY;
    }, []);

    // 应用布局并保存
    const applyLayoutAndSave = useCallback((newData: MindMapData) => {
        const nodes = { ...newData.nodes };
        calculateLayout(newData.rootId, nodes, 0, 0);
        const updatedData = { ...newData, nodes };
        saveToStorage(updatedData);
        return updatedData;
    }, [calculateLayout]);

    // 初始化时应用布局
    useEffect(() => {
        setData(prev => applyLayoutAndSave(prev));
    }, []);

    // 添加子节点
    const addChildNode = useCallback((parentId: string) => {
        setData(prev => {
            const parent = prev.nodes[parentId];
            if (!parent) return prev;

            const newId = generateId();
            const nodeCount = Object.keys(prev.nodes).length;
            const colorIndex = nodeCount % COLORS.length;

            const newNode: MindMapNode = {
                id: newId,
                text: '新节点',
                x: 0,
                y: 0,
                parentId: parentId,
                children: [],
                color: parent.parentId === null ? COLORS[colorIndex] : parent.color,
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
    }, [applyLayoutAndSave]);

    // 删除节点及其所有子节点
    const deleteNode = useCallback((nodeId: string) => {
        setData(prev => {
            const node = prev.nodes[nodeId];
            if (!node || node.parentId === null) return prev;

            const newNodes = { ...prev.nodes };

            // 递归删除所有子节点
            const deleteRecursive = (id: string) => {
                const n = newNodes[id];
                if (n) {
                    n.children.forEach(deleteRecursive);
                    delete newNodes[id];
                }
            };
            deleteRecursive(nodeId);

            // 从父节点中移除
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

    // 开始编辑节点
    const startEditing = useCallback((nodeId: string) => {
        const node = data.nodes[nodeId];
        if (node) {
            setEditingNodeId(nodeId);
            setEditText(node.text);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [data.nodes]);

    // 完成编辑
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

    // 切换折叠状态
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

    // 鼠标滚轮缩放
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.3, Math.min(3, prev * delta)));
    }, []);

    // 开始拖拽画布
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.target === canvasRef.current || e.target === svgRef.current) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            setSelectedNodeId(null);
        }
    }, [offset]);

    // 拖拽画布
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setOffset({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart]);

    // 结束拖拽
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 计算所有可见节点的边界
    const calculateBounds = useCallback(() => {
        const nodes = Object.values(data.nodes);
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

    // 导出为PNG - 重新生成干净的SVG
    const exportToPNG = useCallback(async () => {
        // 先结束编辑状态
        if (editingNodeId) {
            finishEditing();
        }

        const bounds = calculateBounds();
        const padding = 50;
        const width = bounds.maxX - bounds.minX + padding * 2;
        const height = bounds.maxY - bounds.minY + padding * 2;

        // 创建新的 SVG 元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('viewBox', `${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // 白色背景
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', String(bounds.minX - padding));
        bg.setAttribute('y', String(bounds.minY - padding));
        bg.setAttribute('width', String(width));
        bg.setAttribute('height', String(height));
        bg.setAttribute('fill', 'white');
        svg.appendChild(bg);

        // 绘制连接线
        const drawConnections = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node || node.collapsed) return;

            node.children.forEach(childId => {
                const child = data.nodes[childId];
                if (child) {
                    const startX = node.x + 70;
                    const startY = node.y;
                    const endX = child.x - 70;
                    const endY = child.y;
                    const midX = (startX + endX) / 2;

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`);
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

        // 绘制节点
        const drawNodes = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node) return;

            const isRoot = node.parentId === null;
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

            // 节点背景
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '-70');
            rect.setAttribute('y', '-22');
            rect.setAttribute('width', '140');
            rect.setAttribute('height', '44');
            rect.setAttribute('rx', '22');
            rect.setAttribute('fill', isRoot ? node.color : 'white');
            rect.setAttribute('stroke', node.color);
            rect.setAttribute('stroke-width', '2');
            g.appendChild(rect);

            // 节点文本
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

            // 折叠指示器
            if (node.collapsed && node.children.length > 0) {
                const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                indicator.setAttribute('cx', '75');
                indicator.setAttribute('cy', '0');
                indicator.setAttribute('r', '10');
                indicator.setAttribute('fill', node.color);
                indicator.setAttribute('opacity', '0.8');
                g.appendChild(indicator);

                const plus = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                plus.setAttribute('x', '75');
                plus.setAttribute('y', '4');
                plus.setAttribute('text-anchor', 'middle');
                plus.setAttribute('fill', 'white');
                plus.setAttribute('font-size', '14');
                plus.setAttribute('font-weight', 'bold');
                plus.textContent = '+';
                g.appendChild(plus);

                const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                count.setAttribute('x', '95');
                count.setAttribute('y', '5');
                count.setAttribute('font-size', '12');
                count.setAttribute('fill', '#999');
                count.textContent = `(${node.children.length})`;
                g.appendChild(count);
            }

            svg.appendChild(g);

            // 递归绘制子节点
            if (!node.collapsed) {
                node.children.forEach(drawNodes);
            }
        };
        drawNodes(data.rootId);

        // 转换为图片
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = 2; // 2x for better quality
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(scale, scale);
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
    }, [data, editingNodeId, finishEditing, calculateBounds]);

    // 重置画布位置
    const resetView = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    // 清空并重新开始
    const resetMindMap = useCallback(() => {
        const newData = createInitialData();
        setData(applyLayoutAndSave(newData));
        setSelectedNodeId(null);
        setEditingNodeId(null);
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, [applyLayoutAndSave]);

    // 渲染连接线
    const renderConnections = () => {
        const lines: JSX.Element[] = [];

        const drawConnections = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node || node.collapsed) return;

            node.children.forEach(childId => {
                const child = data.nodes[childId];
                if (child) {
                    const startX = node.x + 70;
                    const startY = node.y;
                    const endX = child.x - 70;
                    const endY = child.y;
                    const midX = (startX + endX) / 2;

                    lines.push(
                        <path
                            key={`${nodeId}-${childId}`}
                            d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
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

    // 渲染节点
    const renderNodes = () => {
        const nodeElements: JSX.Element[] = [];

        const renderNode = (nodeId: string) => {
            const node = data.nodes[nodeId];
            if (!node) return;

            const isSelected = selectedNodeId === nodeId;
            const isEditing = editingNodeId === nodeId;
            const isRoot = node.parentId === null;
            const hasChildren = node.children.length > 0;

            nodeElements.push(
                <g key={nodeId} transform={`translate(${node.x}, ${node.y})`}>
                    {/* 节点背景 */}
                    <rect
                        x="-70"
                        y="-22"
                        width="140"
                        height="44"
                        rx="22"
                        fill={isRoot ? node.color : 'white'}
                        stroke={node.color}
                        strokeWidth={isSelected ? 3 : 2}
                        className="cursor-pointer transition-all"
                        onClick={() => setSelectedNodeId(nodeId)}
                        onDoubleClick={() => startEditing(nodeId)}
                    />

                    {/* 节点文本或输入框 */}
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

                    {/* 折叠/展开按钮 */}
                    {hasChildren && (
                        <g
                            transform="translate(75, 0)"
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

                    {/* 折叠时显示子节点数量 */}
                    {node.collapsed && hasChildren && (
                        <text
                            x="95"
                            y="5"
                            fontSize="12"
                            fill="#999"
                        >
                            ({node.children.length})
                        </text>
                    )}
                </g>
            );

            // 递归渲染子节点
            if (!node.collapsed) {
                node.children.forEach(renderNode);
            }
        };

        renderNode(data.rootId);
        return nodeElements;
    };

    // 计算 SVG 视图
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
                    在线创建和编辑思维导图，双击编辑节点，支持导出为 PNG 图片
                </p>
            </div>

            {/* 成功提示 */}
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

                {/* 画布区域 */}
                <div
                    ref={canvasRef}
                    className="relative bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b-xl overflow-hidden cursor-grab active:cursor-grabbing"
                    style={{ height: '600px' }}
                    onWheel={handleWheel}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
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
                        viewBox={`${centerX - viewWidth / 2} ${centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`}
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transformOrigin: 'center center',
                        }}
                    >
                        {renderConnections()}
                        {renderNodes()}
                    </svg>

                    {/* 操作提示 */}
                    <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                        <p>鼠标滚轮缩放 | 拖拽移动画布</p>
                        <p>单击选中节点 | 双击编辑文字</p>
                    </div>

                    {/* 选中节点信息 */}
                    {selectedNodeId && (
                        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-sm">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">选中节点:</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {data.nodes[selectedNodeId]?.text}
                            </p>
                        </div>
                    )}
                </div>

                    
            </div>
        </div>
    );
};

export default MindMapTool;
