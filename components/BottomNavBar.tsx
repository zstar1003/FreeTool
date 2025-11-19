import React from 'react';

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
}

const TOOLS: Tool[] = [
    {
        id: 'translate',
        name: '翻译',
        icon: 'translate',
    },
    {
        id: 'code-highlight',
        name: '代码',
        icon: 'code',
    },
    {
        id: 'text-formatter',
        name: '文本',
        icon: 'description',
    },
    {
        id: 'json-formatter',
        name: 'JSON',
        icon: 'data_object',
    },
    {
        id: 'math-formula',
        name: '公式',
        icon: 'functions',
    },
    {
        id: 'image-converter',
        name: '图片',
        icon: 'image',
    },
    {
        id: 'table-converter',
        name: '表格',
        icon: 'table_chart',
    },
];

interface BottomNavBarProps {
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTool, setActiveTool }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-border-light dark:border-border-dark z-10">
            <div className="flex justify-around">
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`flex flex-col items-center justify-center w-full h-16 transition-all duration-200 ${
                            activeTool === tool.id
                                ? 'text-gray-900 dark:text-gray-100'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <span
                            className="material-symbols-outlined text-2xl"
                            style={activeTool === tool.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                            {tool.icon}
                        </span>
                        <p className="text-xs font-medium">{tool.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavBar;
