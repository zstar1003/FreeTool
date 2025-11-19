import React, { useState } from 'react';
import TranslateTool from './components/TranslateTool';
import ImageConverterTool from './components/ImageConverterTool';
import CodeHighlightTool from './components/CodeHighlightTool';
import TextFormatterTool from './components/TextFormatterTool';
import JsonFormatterTool from './components/JsonFormatterTool';
import MathFormulaEditor from './components/MathFormulaEditor';
import TableConverter from './components/TableConverter';
import BottomNavBar from './components/BottomNavBar';

type ToolType =
    | 'translate'
    | 'image-converter'
    | 'code-highlight'
    | 'text-formatter'
    | 'json-formatter'
    | 'math-formula'
    | 'table-converter';

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
        id: 'table-converter',
        name: '表格格式转换',
        icon: 'table_chart',
        component: TableConverter,
    },
];

const App: React.FC = () => {
    const [activeTool, setActiveTool] = useState<ToolType>('translate');

    const ActiveComponent = TOOLS.find(tool => tool.id === activeTool)?.component || TranslateTool;

    return (
        <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
            <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-border-light dark:border-border-dark p-4 hidden md:flex flex-col">
                <div className="flex h-full flex-col">
                    <div className="flex items-center gap-3 px-2 pb-4">
                        <img
                            src="/logo.png"
                            alt="FreeTool Logo"
                            className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-gray-900 dark:text-gray-100 text-base font-medium leading-normal">FreeTool 工具箱</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">在线小工具</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
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
                </div>
            </aside>

            <BottomNavBar activeTool={activeTool} setActiveTool={setActiveTool} />

            <main className="flex-1 p-6 sm:p-8 md:p-10 pb-20">
                <ActiveComponent />
            </main>
        </div>
    );
};

export default App;
