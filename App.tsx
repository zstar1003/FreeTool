import React, { useState, lazy, Suspense, useEffect, useCallback, useRef } from 'react';
import BottomNavBar from './components/BottomNavBar';

// 懒加载组件 - 提升首屏加载速度
const TranslateTool = lazy(() => import('./components/TranslateTool'));
const ImageConverterTool = lazy(() => import('./components/ImageConverterTool'));
const ImageEditorTool = lazy(() => import('./components/ImageEditorTool'));
const ImageComparisonTool = lazy(() => import('./components/ImageComparisonTool'));
const ImageRoundCornerTool = lazy(() => import('./components/ImageRoundCornerTool'));
const PhotoCollageTool = lazy(() => import('./components/PhotoCollageTool'));
const CodeHighlightTool = lazy(() => import('./components/CodeHighlightTool'));
const TextFormatterTool = lazy(() => import('./components/TextFormatterTool'));
const JsonFormatterTool = lazy(() => import('./components/JsonFormatterTool'));
const XmlFormatterTool = lazy(() => import('./components/XmlFormatterTool'));
const MathFormulaEditor = lazy(() => import('./components/MathFormulaEditor'));
const TableConverter = lazy(() => import('./components/TableConverter'));
const VideoAspectConverter = lazy(() => import('./components/VideoAspectConverter'));
const TextDiffTool = lazy(() => import('./components/TextDiffTool'));
const PdfToPptTool = lazy(() => import('./components/PdfToPptTool'));
const PdfToImageTool = lazy(() => import('./components/PdfToImageTool'));
const ResumeGeneratorTool = lazy(() => import('./components/ResumeGeneratorTool'));
const PromptGeneratorTool = lazy(() => import('./components/PromptGeneratorTool'));
const MBTITestTool = lazy(() => import('./components/MBTITestTool'));
const ImageToPromptTool = lazy(() => import('./components/ImageToPromptTool'));
const ImageWatermarkRemoverTool = lazy(() => import('./components/ImageWatermarkRemoverTool'));

// 获取资源路径的辅助函数
const getAssetUrl = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${path}`.replace(/\/+/g, '/');
};

// localStorage key
const PINNED_TOOLS_KEY = 'freetool-pinned-tools';
const ACTIVE_TOOL_KEY = 'freetool-active-tool';

type ToolType =
    | 'translate'
    | 'image-converter'
    | 'image-editor'
    | 'image-comparison'
    | 'image-round-corner'
    | 'photo-collage'
    | 'code-highlight'
    | 'text-formatter'
    | 'json-formatter'
    | 'xml-formatter'
    | 'math-formula'
    | 'table-converter'
    | 'video-aspect-converter'
    | 'text-diff'
    | 'pdf-to-ppt'
    | 'pdf-to-image'
    | 'resume-generator'
    | 'prompt-generator'
    | 'mbti-test'
    | 'image-to-prompt'
    | 'image-watermark-remover';

type CategoryType = 'text' | 'image' | 'data' | 'media' | 'ai';

interface Tool {
    id: ToolType;
    name: string;
    icon: string;
    component: React.FC;
}

interface ToolCategory {
    id: CategoryType;
    name: string;
    icon: string;
    tools: Tool[];
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    toolId: ToolType | null;
    isPinned: boolean;
}

const TOOL_CATEGORIES: ToolCategory[] = [
    {
        id: 'text',
        name: '文本工具',
        icon: 'text_fields',
        tools: [
            { id: 'translate', name: '在线翻译', icon: 'translate', component: TranslateTool },
            { id: 'code-highlight', name: '代码高亮', icon: 'code', component: CodeHighlightTool },
            { id: 'text-formatter', name: '文本格式化', icon: 'description', component: TextFormatterTool },
            { id: 'json-formatter', name: 'JSON 格式化', icon: 'data_object', component: JsonFormatterTool },
            { id: 'xml-formatter', name: 'XML 格式化', icon: 'code', component: XmlFormatterTool },
            { id: 'text-diff', name: '文本差异对比', icon: 'compare', component: TextDiffTool },
        ],
    },
    {
        id: 'image',
        name: '图片工具',
        icon: 'image',
        tools: [
            { id: 'image-converter', name: '图片格式转换', icon: 'image', component: ImageConverterTool },
            { id: 'image-editor', name: '图片快速编辑', icon: 'edit', component: ImageEditorTool },
            { id: 'image-comparison', name: '多图自由拼接', icon: 'layers', component: ImageComparisonTool },
            { id: 'image-round-corner', name: '图片圆角处理', icon: 'rounded_corner', component: ImageRoundCornerTool },
            { id: 'photo-collage', name: '模板快速拼接', icon: 'grid_view', component: PhotoCollageTool },
            { id: 'image-watermark-remover', name: '图片水印去除', icon: 'healing', component: ImageWatermarkRemoverTool },
        ],
    },
    {
        id: 'data',
        name: '数据工具',
        icon: 'analytics',
        tools: [
            { id: 'table-converter', name: '表格格式转换', icon: 'table_chart', component: TableConverter },
            { id: 'math-formula', name: '数学公式编辑', icon: 'functions', component: MathFormulaEditor },
        ],
    },
    {
        id: 'media',
        name: '媒体工具',
        icon: 'perm_media',
        tools: [
            { id: 'video-aspect-converter', name: '视频比例转换', icon: 'aspect_ratio', component: VideoAspectConverter },
            { id: 'pdf-to-ppt', name: 'PDF转PPT', icon: 'slideshow', component: PdfToPptTool },
            { id: 'pdf-to-image', name: 'PDF转长图', icon: 'photo_library', component: PdfToImageTool },
        ],
    },
    {
        id: 'ai',
        name: '其它工具',
        icon: 'smart_toy',
        tools: [
            { id: 'image-to-prompt', name: '图片转提示词', icon: 'image_search', component: ImageToPromptTool },
            { id: 'resume-generator', name: '简历生成器', icon: 'description', component: ResumeGeneratorTool },
            { id: 'prompt-generator', name: '提示词生成器', icon: 'psychology', component: PromptGeneratorTool },
            { id: 'mbti-test', name: 'MBTI人格测试', icon: 'mood', component: MBTITestTool },
        ],
    },
];

// 扁平化工具列表，用于查找组件
const TOOLS: Tool[] = TOOL_CATEGORIES.flatMap(category => category.tools);

// 从 localStorage 读取置顶工具
const loadPinnedTools = (): ToolType[] => {
    try {
        const saved = localStorage.getItem(PINNED_TOOLS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // 验证保存的工具ID是否有效
            return parsed.filter((id: string) => TOOLS.some(tool => tool.id === id));
        }
    } catch (e) {
        console.error('Failed to load pinned tools:', e);
    }
    return [];
};

// 保存置顶工具到 localStorage
const savePinnedTools = (pinnedTools: ToolType[]) => {
    try {
        localStorage.setItem(PINNED_TOOLS_KEY, JSON.stringify(pinnedTools));
    } catch (e) {
        console.error('Failed to save pinned tools:', e);
    }
};

// 从 URL hash 或 localStorage 读取活动工具
const loadActiveTool = (): ToolType => {
    // 优先从 URL hash 读取
    const hash = window.location.hash.slice(1);
    if (hash && TOOLS.some(tool => tool.id === hash)) {
        return hash as ToolType;
    }
    // 其次从 localStorage 读取
    try {
        const saved = localStorage.getItem(ACTIVE_TOOL_KEY);
        if (saved && TOOLS.some(tool => tool.id === saved)) {
            return saved as ToolType;
        }
    } catch (e) {
        console.error('Failed to load active tool:', e);
    }
    return 'translate';
};

// 保存活动工具
const saveActiveTool = (toolId: ToolType) => {
    try {
        localStorage.setItem(ACTIVE_TOOL_KEY, toolId);
        // 同时更新 URL hash
        window.history.replaceState(null, '', `#${toolId}`);
    } catch (e) {
        console.error('Failed to save active tool:', e);
    }
};

const App: React.FC = () => {
    const [activeTool, setActiveToolState] = useState<ToolType>(loadActiveTool);

    // 包装 setActiveTool 以同时保存到 localStorage
    const setActiveTool = useCallback((toolId: ToolType) => {
        setActiveToolState(toolId);
        saveActiveTool(toolId);
    }, []);
    const [showAboutDialog, setShowAboutDialog] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<CategoryType[]>(['text', 'image', 'data', 'media', 'ai']);
    const [pinnedTools, setPinnedTools] = useState<ToolType[]>(loadPinnedTools);
    const [pinnedExpanded, setPinnedExpanded] = useState(true);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        toolId: null,
        isPinned: false,
    });

    // 拖拽状态
    const [draggedTool, setDraggedTool] = useState<ToolType | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragNodeRef = useRef<HTMLDivElement | null>(null);

    // 保存置顶工具到 localStorage
    useEffect(() => {
        savePinnedTools(pinnedTools);
    }, [pinnedTools]);

    // 点击其他地方关闭右键菜单
    useEffect(() => {
        const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
        if (contextMenu.visible) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [contextMenu.visible]);

    const toggleCategory = (categoryId: CategoryType) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // 右键菜单处理
    const handleContextMenu = useCallback((e: React.MouseEvent, toolId: ToolType, isPinned: boolean) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            toolId,
            isPinned,
        });
    }, []);

    // 置顶工具
    const pinTool = useCallback((toolId: ToolType) => {
        setPinnedTools(prev => {
            if (prev.includes(toolId)) return prev;
            return [...prev, toolId];
        });
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);

    // 取消置顶
    const unpinTool = useCallback((toolId: ToolType) => {
        setPinnedTools(prev => prev.filter(id => id !== toolId));
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);

    // 拖拽开始
    const handleDragStart = useCallback((e: React.DragEvent, toolId: ToolType) => {
        setDraggedTool(toolId);
        e.dataTransfer.effectAllowed = 'move';
        // 设置拖拽图像
        if (e.currentTarget instanceof HTMLElement) {
            dragNodeRef.current = e.currentTarget as HTMLDivElement;
        }
    }, []);

    // 拖拽经过
    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    }, []);

    // 拖拽离开
    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    // 放置
    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedTool === null) return;

        setPinnedTools(prev => {
            const dragIndex = prev.indexOf(draggedTool);
            if (dragIndex === -1) return prev;

            const newList = [...prev];
            newList.splice(dragIndex, 1);
            newList.splice(dropIndex, 0, draggedTool);
            return newList;
        });

        setDraggedTool(null);
        setDragOverIndex(null);
    }, [draggedTool]);

    // 拖拽结束
    const handleDragEnd = useCallback(() => {
        setDraggedTool(null);
        setDragOverIndex(null);
    }, []);

    const ActiveComponent = TOOLS.find(tool => tool.id === activeTool)?.component || TranslateTool;

    // 获取置顶工具的完整信息
    const getPinnedToolsInfo = () => {
        return pinnedTools
            .map(id => TOOLS.find(tool => tool.id === id))
            .filter((tool): tool is Tool => tool !== undefined);
    };

    // 加载中组件
    const LoadingFallback = () => (
        <div className="flex w-full h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
            </div>
        </div>
    );

    return (
        <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
            <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-border-light dark:border-border-dark hidden md:flex flex-col">
                {/* 顶部：Logo 和标题 - 固定 */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <picture>
                        <source srcSet={getAssetUrl('assets/logo.webp')} type="image/webp" />
                        <img
                            src={getAssetUrl('logo.png')}
                            alt="FreeTool Logo"
                            className="w-10 h-10 rounded-lg object-cover"
                            loading="eager"
                        />
                    </picture>
                    <div className="flex flex-col">
                        <h1 className="text-gray-900 dark:text-gray-100 text-base font-medium leading-normal">FreeTool 工具箱</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">在线小工具</p>
                    </div>
                </div>

                {/* 中间：工具列表 - 可滚动 */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
                    <div className="flex flex-col gap-1">
                        {/* 置顶工具分类 */}
                        {pinnedTools.length > 0 && (
                            <div className="flex flex-col mb-2">
                                {/* 置顶分类标题 */}
                                <button
                                    onClick={() => setPinnedExpanded(!pinnedExpanded)}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg text-amber-500">
                                            push_pin
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            置顶工具
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            ({pinnedTools.length})
                                        </span>
                                    </div>
                                    <span
                                        className={`material-symbols-outlined text-lg text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                                            pinnedExpanded ? 'rotate-180' : ''
                                        }`}
                                    >
                                        expand_more
                                    </span>
                                </button>

                                {/* 置顶工具列表 */}
                                <div
                                    className={`overflow-hidden transition-all duration-200 ${
                                        pinnedExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1 pl-4 pt-1 pb-2">
                                        {getPinnedToolsInfo().map((tool, index) => (
                                            <div
                                                key={tool.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, tool.id)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onContextMenu={(e) => handleContextMenu(e, tool.id, true)}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                                                    dragOverIndex === index ? 'border-t-2 border-primary' : ''
                                                } ${
                                                    draggedTool === tool.id ? 'opacity-50' : ''
                                                } ${
                                                    activeTool === tool.id
                                                        ? 'bg-gray-200/50 text-gray-900 dark:bg-gray-700/50 dark:text-gray-100 shadow-sm'
                                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-gray-100'
                                                }`}
                                                onClick={() => setActiveTool(tool.id)}
                                            >
                                                <span className="material-symbols-outlined text-xs text-gray-400 dark:text-gray-500 cursor-grab">
                                                    drag_indicator
                                                </span>
                                                <span
                                                    className="material-symbols-outlined text-xl"
                                                    style={activeTool === tool.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                                                >
                                                    {tool.icon}
                                                </span>
                                                <p className="text-sm font-medium leading-normal flex-1">{tool.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 分隔线 */}
                                <div className="mx-3 my-2 border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                        )}

                        {/* 其他分类 */}
                        {TOOL_CATEGORIES.map(category => {
                            const isExpanded = expandedCategories.includes(category.id);
                            const hasActiveTool = category.tools.some(tool => tool.id === activeTool);

                            return (
                                <div key={category.id} className="flex flex-col">
                                    {/* 分类标题 */}
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                            hasActiveTool && !isExpanded
                                                ? 'bg-gray-200/30 dark:bg-gray-700/30'
                                                : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-lg text-gray-500 dark:text-gray-400">
                                                {category.icon}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                {category.name}
                                            </span>
                                        </div>
                                        <span
                                            className={`material-symbols-outlined text-lg text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                                                isExpanded ? 'rotate-180' : ''
                                            }`}
                                        >
                                            expand_more
                                        </span>
                                    </button>

                                    {/* 子工具列表 */}
                                    <div
                                        className={`overflow-hidden transition-all duration-200 ${
                                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-1 pl-4 pt-1 pb-2">
                                            {category.tools.map(tool => (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => setActiveTool(tool.id)}
                                                    onContextMenu={(e) => handleContextMenu(e, tool.id, pinnedTools.includes(tool.id))}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                                        activeTool === tool.id
                                                            ? 'bg-gray-200/50 text-gray-900 dark:bg-gray-700/50 dark:text-gray-100 shadow-sm'
                                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-gray-100'
                                                    }`}
                                                >
                                                    <span
                                                        className="material-symbols-outlined text-xl"
                                                        style={activeTool === tool.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                                                    >
                                                        {tool.icon}
                                                    </span>
                                                    <p className="text-sm font-medium leading-normal">{tool.name}</p>
                                                    {pinnedTools.includes(tool.id) && (
                                                        <span className="material-symbols-outlined text-xs text-amber-500 ml-auto">
                                                            push_pin
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* 底部：GitHub 和关于 - 固定 */}
                <div className="flex items-center gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href="https://github.com/zstar1003/FreeTool"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center"
                        title="GitHub"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </a>
                    <button
                        onClick={() => setShowAboutDialog(true)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center"
                        title="关于"
                    >
                        <span className="material-symbols-outlined w-6 h-6 flex items-center justify-center" style={{ fontSize: '24px' }}>info</span>
                    </button>
                </div>
            </aside>

            <BottomNavBar activeTool={activeTool} setActiveTool={setActiveTool} />

            <main className="flex-1 p-6 sm:p-8 md:p-10 pb-20">
                <Suspense fallback={<LoadingFallback />}>
                    <ActiveComponent />
                </Suspense>
            </main>

            {/* 关于弹窗 */}
            {showAboutDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAboutDialog(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">关于 FreeTool</h2>
                            <button
                                onClick={() => setShowAboutDialog(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p><strong>制作者：</strong>zstar</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-2"><strong>个人微信号：</strong></p>
                                    <picture>
                                        <source srcSet={getAssetUrl('assets/wechat.webp')} type="image/webp" />
                                        <img
                                            src={getAssetUrl('assets/wechat.jpg')}
                                            alt="个人微信号"
                                            className="w-full h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                            loading="lazy"
                                        />
                                    </picture>
                                </div>
                                <div>
                                    <p className="mb-2"><strong>微信公众号：</strong>我有一计</p>
                                    <picture>
                                        <source srcSet={getAssetUrl('assets/media.webp')} type="image/webp" />
                                        <img
                                            src={getAssetUrl('assets/media.jpg')}
                                            alt="微信公众号"
                                            className="w-full h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                            loading="lazy"
                                        />
                                    </picture>
                                </div>
                            </div>
                            <p><strong>理念：</strong>致力于构建免费好用的产品</p>

                            {/* 分隔线 */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">隐私政策</h3>
                                <div className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                                    <p>FreeTool 尊重并保护您的隐私：</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>所有工具均在浏览器本地运行，您的数据不会上传到任何服务器</li>
                                        <li>图片、文档等文件仅在您的设备上处理，处理完成后即被释放</li>
                                        <li>我们不收集、存储或分享您的任何个人数据或文件内容</li>
                                        <li>AI 模型文件会缓存到浏览器本地，以加快后续使用速度</li>
                                        <li>本站使用 Google Analytics 收集匿名访问统计，不涉及个人隐私</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 版权信息 */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                <p>© {new Date().getFullYear()} FreeTool. All rights reserved.</p>
                                <p className="mt-1">本项目开源于 <a href="https://github.com/zstar1003/FreeTool" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 右键菜单 */}
            {contextMenu.visible && contextMenu.toolId && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.isPinned ? (
                        <button
                            onClick={() => unpinTool(contextMenu.toolId!)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">push_pin</span>
                            <span>取消置顶</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => pinTool(contextMenu.toolId!)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg text-amber-500">push_pin</span>
                            <span>置顶</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
