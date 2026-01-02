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

interface MindMapState {
    nodes: Map<string, MindMapNode>;
    rootId: string;
}

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

const createInitialState = (): MindMapState => {
    const rootId = generateId();
    const nodes = new Map<string, MindMapNode>();
    nodes.set(rootId, {
        id: rootId,
        text: '中心主题',
        x: 0,
        y: 0,
        parentId: null,
        children: [],
        color: COLORS[0],
        collapsed: false,
    });
    return { nodes, rootId };
};

const MindMapTool: React.FC = () => {
    const [state, setState] = useState<MindMapState>(createInitialState);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragNodeId, setDragNodeId] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 自动布局算法
    const calculateLayout = useCallback((nodeId: string, nodes: Map<string, MindMapNode>, depth: number = 0, yOffset: number = 0): number => {
        const node = nodes.get(nodeId);
        if (!node) return yOffset;

        const horizontalSpacing = 180;
        const verticalSpacing = 60;

        node.x = depth * horizontalSpacing;

        if (node.collapsed || node.children.length === 0) {
            node.y = yOffset;
            return yOffset + verticalSpacing;
        }

        let currentY = yOffset;
        const childYPositions: number[] = [];

        for (const childId of node.children) {
            const childStartY = currentY;
            currentY = calculateLayout(childId, nodes, depth + 1, currentY);
            const childNode = nodes.get(childId);
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

    // 应用布局
    const applyLayout = useCallback(() => {
        setState(prev => {
            const newNodes = new Map(prev.nodes);
            calculateLayout(prev.rootId, newNodes, 0, 0);
            return { ...prev, nodes: newNodes };
        });
    }, [calculateLayout]);

    // 初始化时应用布局
    useEffect(() => {
        applyLayout();
    }, []);

    // 添加子节点
    const addChildNode = useCallback((parentId: string) => {
        setState(prev => {
            const parent = prev.nodes.get(parentId);
            if (!parent) return prev;

            const newId = generateId();
            const colorIndex = (prev.nodes.size) % COLORS.length;
            const newNodes = new Map(prev.nodes);

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

            newNodes.set(newId, newNode);
            newNodes.set(parentId, {
                ...parent,
                children: [...parent.children, newId],
                collapsed: false,
            });

            // 重新计算布局
            calculateLayout(prev.rootId, newNodes, 0, 0);

            return { ...prev, nodes: newNodes };
        });
    }, [calculateLayout]);

    // 删除节点及其所有子节点
    const deleteNode = useCallback((nodeId: string) => {
        setState(prev => {
            const node = prev.nodes.get(nodeId);
            if (!node || node.parentId === null) return prev; // 不能删除根节点

            const newNodes = new Map(prev.nodes);

            // 递归删除所有子节点
            const deleteRecursive = (id: string) => {
                const n = newNodes.get(id);
                if (n) {
                    n.children.forEach(deleteRecursive);
                    newNodes.delete(id);
                }
            };
            deleteRecursive(nodeId);

            // 从父节点中移除
            const parent = newNodes.get(node.parentId);
            if (parent) {
                newNodes.set(node.parentId, {
                    ...parent,
                    children: parent.children.filter(id => id !== nodeId),
                });
            }

            // 重新计算布局
            calculateLayout(prev.rootId, newNodes, 0, 0);

            return { ...prev, nodes: newNodes };
        });
        setSelectedNodeId(null);
    }, [calculateLayout]);

    // 开始编辑节点
    const startEditing = useCallback((nodeId: string) => {
        const node = state.nodes.get(nodeId);
        if (node) {
            setEditingNodeId(nodeId);
            setEditText(node.text);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [state.nodes]);

    // 完成编辑
    const finishEditing = useCallback(() => {
        if (editingNodeId && editText.trim()) {
            setState(prev => {
                const newNodes = new Map(prev.nodes);
                const node = newNodes.get(editingNodeId);
                if (node) {
                    newNodes.set(editingNodeId, { ...node, text: editText.trim() });
                }
                return { ...prev, nodes: newNodes };
            });
        }
        setEditingNodeId(null);
        setEditText('');
    }, [editingNodeId, editText]);

    // 切换折叠状态
    const toggleCollapse = useCallback((nodeId: string) => {
        setState(prev => {
            const newNodes = new Map(prev.nodes);
            const node = newNodes.get(nodeId);
            if (node && node.children.length > 0) {
                newNodes.set(nodeId, { ...node, collapsed: !node.collapsed });
                calculateLayout(prev.rootId, newNodes, 0, 0);
            }
            return { ...prev, nodes: newNodes };
        });
    }, [calculateLayout]);

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
        if (isDragging && !dragNodeId) {
            setOffset({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart, dragNodeId]);

    // 结束拖拽
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setDragNodeId(null);
    }, []);

    // 导出为PNG
    const exportToPNG = useCallback(async () => {
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const nodes = Array.from(state.nodes.values());

        // 计算边界
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            minX = Math.min(minX, node.x - 80);
            minY = Math.min(minY, node.y - 25);
            maxX = Math.max(maxX, node.x + 80);
            maxY = Math.max(maxY, node.y + 25);
        });

        const padding = 40;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;

        // 创建临时 SVG
        const tempSvg = svg.cloneNode(true) as SVGSVGElement;
        tempSvg.setAttribute('width', String(width));
        tempSvg.setAttribute('height', String(height));
        tempSvg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`);

        // 添加白色背景
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', String(minX - padding));
        bg.setAttribute('y', String(minY - padding));
        bg.setAttribute('width', String(width));
        bg.setAttribute('height', String(height));
        bg.setAttribute('fill', 'white');
        tempSvg.insertBefore(bg, tempSvg.firstChild);

        const svgData = new XMLSerializer().serializeToString(tempSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width * 2; // 2x for better quality
            canvas.height = height * 2;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(2, 2);
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
    }, [state.nodes]);

    // 重置画布位置
    const resetView = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    // 清空并重新开始
    const resetMindMap = useCallback(() => {
        setState(createInitialState());
        setSelectedNodeId(null);
        setEditingNodeId(null);
        setScale(1);
        setOffset({ x: 0, y: 0 });
        setTimeout(applyLayout, 0);
    }, [applyLayout]);

    // 渲染连接线
    const renderConnections = () => {
        const lines: JSX.Element[] = [];
        state.nodes.forEach((node, nodeId) => {
            if (node.collapsed) return;
            node.children.forEach(childId => {
                const child = state.nodes.get(childId);
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
                }
            });
        });
        return lines;
    };

    // 渲染节点
    const renderNodes = () => {
        const nodeElements: JSX.Element[] = [];

        const renderNode = (nodeId: string, visible: boolean = true) => {
            const node = state.nodes.get(nodeId);
            if (!node) return;

            if (visible) {
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
            }

            // 递归渲染子节点
            if (!node.collapsed) {
                node.children.forEach(childId => renderNode(childId, visible));
            }
        };

        renderNode(state.rootId);
        return nodeElements;
    };

    // 计算 SVG 视图
    const nodes = Array.from(state.nodes.values());
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        minX = Math.min(minX, node.x - 100);
        minY = Math.min(minY, node.y - 40);
        maxX = Math.max(maxX, node.x + 120);
        maxY = Math.max(maxY, node.y + 40);
    });
    const viewWidth = Math.max(800, maxX - minX + 200);
    const viewHeight = Math.max(600, maxY - minY + 200);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

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
                        disabled={!selectedNodeId || state.nodes.get(selectedNodeId)?.parentId === null}
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
                        className="absolute inset-0 opacity-30"
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
                                {state.nodes.get(selectedNodeId)?.text}
                            </p>
                        </div>
                    )}
                </div>

                {/* 使用说明 */}
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-2">使用说明:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                        <li>点击节点选中，再点击「添加子节点」创建分支</li>
                        <li>双击节点可直接编辑文字，按 Enter 确认或 Esc 取消</li>
                        <li>点击节点右侧的 +/- 按钮可以折叠/展开子节点</li>
                        <li>使用鼠标滚轮缩放，拖拽空白区域移动画布</li>
                        <li>完成后点击「导出 PNG」保存思维导图</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MindMapTool;
