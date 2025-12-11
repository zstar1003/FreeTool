import React, { useState, lazy, Suspense } from 'react';
import BottomNavBar from './components/BottomNavBar';

// 懒加载组件 - 提升首屏加载速度
const TranslateTool = lazy(() => import('./components/TranslateTool'));
const ImageConverterTool = lazy(() => import('./components/ImageConverterTool'));
const ImageEditorTool = lazy(() => import('./components/ImageEditorTool'));
const ImageComparisonTool = lazy(() => import('./components/ImageComparisonTool'));
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
const PromptGeneratorTool = lazy(() => import('./components/PromptGeneratorTool'));

// 获取资源路径的辅助函数
const getAssetUrl = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${path}`.replace(/\/+/g, '/');
};

type ToolType =
    | 'translate'
    | 'image-converter'
    | 'image-editor'
    | 'image-comparison'
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
    | 'prompt-generator';

interface Tool {
    id: ToolType;
    name: string;
    icon: string;
    component: React.FC;
}

const TOOLS: Tool[] = [
    {
        id: 'translate',
        name: '在线翻译',
        icon: 'translate',
        component: TranslateTool,
    },
    {
        id: 'code-highlight',
        name: '代码高亮',
        icon: 'code',
        component: CodeHighlightTool,
    },
    {
        id: 'text-formatter',
        name: '文本格式化',
        icon: 'description',
        component: TextFormatterTool,
    },
    {
        id: 'json-formatter',
        name: 'JSON 格式化',
        icon: 'data_object',
        component: JsonFormatterTool,
    },
    {
        id: 'xml-formatter',
        name: 'XML 格式化',
        icon: 'code',
        component: XmlFormatterTool,
    },
    {
        id: 'math-formula',
        name: '数学公式编辑',
        icon: 'functions',
        component: MathFormulaEditor,
    },
    {
        id: 'image-converter',
        name: '图片格式转换',
        icon: 'image',
        component: ImageConverterTool,
    },
    {
        id: 'image-editor',
        name: '图片快速编辑',
        icon: 'edit',
        component: ImageEditorTool,
    },
    {
        id: 'image-comparison',
        name: '多图自由拼接',
        icon: 'layers',
        component: ImageComparisonTool,
    },
    {
        id: 'photo-collage',
        name: '模板快速拼接',
        icon: 'grid_view',
        component: PhotoCollageTool,
    },
    {
        id: 'table-converter',
        name: '表格格式转换',
        icon: 'table_chart',
        component: TableConverter,
    },
    {
        id: 'video-aspect-converter',
        name: '视频比例转换',
        icon: 'aspect_ratio',
        component: VideoAspectConverter,
    },
    {
        id: 'text-diff',
        name: '文本差异对比',
        icon: 'compare',
        component: TextDiffTool,
    },
    {
        id: 'pdf-to-ppt',
        name: 'PDF转PPT',
        icon: 'slideshow',
        component: PdfToPptTool,
    },
    {
        id: 'prompt-generator',
        name: '提示词生成器',
        icon: 'psychology',
        component: PromptGeneratorTool,
    },
];

const App: React.FC = () => {
    const [activeTool, setActiveTool] = useState<ToolType>('translate');
    const [showAboutDialog, setShowAboutDialog] = useState(false);

    const ActiveComponent = TOOLS.find(tool => tool.id === activeTool)?.component || TranslateTool;

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
            <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-border-light dark:border-border-dark p-4 hidden md:flex flex-col">
                <div className="flex h-full flex-col">
                    <div className="flex items-center gap-3 px-2 pb-4">
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
                    <nav className="flex flex-col gap-2 flex-1">
                        {TOOLS.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                    activeTool === tool.id
                                        ? 'bg-gray-200/50 text-gray-900 dark:bg-gray-700/50 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-gray-100'
                                }`}                            >
                                <span
                                    className="material-symbols-outlined text-xl"
                                    style={activeTool === tool.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    {tool.icon}
                                </span>
                                <p className="text-sm font-medium leading-normal">{tool.name}</p>
                            </button>
                        ))}
                    </nav>

                    {/* 底部图标 */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a
                            href="https://github.com/zstar1003/FreeTool"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            title="GitHub"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <button
                            onClick={() => setShowAboutDialog(true)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            title="关于"
                        >
                            <span className="material-symbols-outlined text-2xl">info</span>
                        </button>
                    </div>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
