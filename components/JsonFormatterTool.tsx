import React, { useState, useCallback, useEffect, useRef } from 'react';

interface JsonNode {
    key: string;
    value: any;
    type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
    isExpanded: boolean;
    path: string;
}

const JsonFormatterTool: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [parsedJson, setParsedJson] = useState<any>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [isNotificationFadingOut, setIsNotificationFadingOut] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [indentSize, setIndentSize] = useState<number>(2);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    const formatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 尝试修复非标准 JSON 格式
    const tryFixJson = (text: string): string => {
        let fixed = text;

        // 1. 移除尾随逗号 (对象和数组中)
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

        // 2. 将单引号替换为双引号 (键和值都处理)
        fixed = fixed.replace(/'/g, '"');

        // 3. 给没有引号的键名加上双引号
        // 匹配 { 或 , 后面跟着的无引号键名（包括数字开头的键名）
        fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][\w$]*|[\d][\w$]*)(\s*:)/g, '$1"$2"$3');

        return fixed;
    };

    // 自动格式化函数
    const performFormat = useCallback((text: string) => {
        if (!text.trim()) {
            setParsedJson(null);
            setError(null);
            return;
        }

        try {
            // 首先尝试直接解析
            const parsed = JSON.parse(text);
            setParsedJson(parsed);
            setError(null);
            // 默认展开第一层
            setExpandedPaths(new Set(['root']));
        } catch {
            // 解析失败，尝试修复后再解析
            try {
                const fixedText = tryFixJson(text);
                const parsed = JSON.parse(fixedText);
                setParsedJson(parsed);
                setError(null);
                setExpandedPaths(new Set(['root']));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'JSON 格式错误');
                setParsedJson(null);
            }
        }
    }, []);

    // 输入文本变化时,延迟格式化
    useEffect(() => {
        if (formatTimeoutRef.current) {
            clearTimeout(formatTimeoutRef.current);
        }

        if (inputText.trim()) {
            formatTimeoutRef.current = setTimeout(() => {
                performFormat(inputText);
            }, 300);
        } else {
            setParsedJson(null);
            setError(null);
        }

        return () => {
            if (formatTimeoutRef.current) {
                clearTimeout(formatTimeoutRef.current);
            }
        };
    }, [inputText, performFormat]);

    const handleCopy = useCallback(() => {
        if (!parsedJson) return;
        const formatted = JSON.stringify(parsedJson, null, indentSize);
        navigator.clipboard.writeText(formatted).then(() => {
            setCopySuccess(true);
            setIsNotificationFadingOut(false);
            setTimeout(() => {
                setIsNotificationFadingOut(true);
            }, 1700);
            setTimeout(() => {
                setCopySuccess(false);
                setIsNotificationFadingOut(false);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }, [parsedJson, indentSize]);

    const togglePath = useCallback((path: string) => {
        setExpandedPaths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    }, []);

    const expandAll = useCallback(() => {
        if (!parsedJson) return;
        const allPaths = new Set<string>();

        const collectPaths = (obj: any, path: string) => {
            allPaths.add(path);
            if (obj && typeof obj === 'object') {
                Object.keys(obj).forEach(key => {
                    collectPaths(obj[key], `${path}.${key}`);
                });
            }
        };

        collectPaths(parsedJson, 'root');
        setExpandedPaths(allPaths);
    }, [parsedJson]);

    const collapseAll = useCallback(() => {
        setExpandedPaths(new Set(['root']));
    }, []);

    const renderJsonValue = useCallback((value: any, path: string, level: number = 0): React.ReactNode => {
        const indent = level * indentSize;
        const isExpanded = expandedPaths.has(path);

        if (value === null) {
            return <span className="text-gray-500 dark:text-gray-400">null</span>;
        }

        if (typeof value === 'boolean') {
            return <span className="text-purple-600 dark:text-purple-400">{value.toString()}</span>;
        }

        if (typeof value === 'number') {
            return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
        }

        if (typeof value === 'string') {
            return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return <span className="text-gray-600 dark:text-gray-400">[]</span>;
            }

            return (
                <div>
                    <button
                        onClick={() => togglePath(path)}
                        className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-sm">
                            {isExpanded ? 'expand_more' : 'chevron_right'}
                        </span>
                        <span>[{value.length}]</span>
                    </button>
                    {isExpanded && (
                        <div className="ml-4 border-l border-gray-300 dark:border-gray-600 pl-2">
                            {value.map((item, index) => (
                                <div key={index} className="py-0.5">
                                    <span className="text-gray-500 dark:text-gray-400 mr-2">{index}:</span>
                                    {renderJsonValue(item, `${path}[${index}]`, level + 1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return <span className="text-gray-600 dark:text-gray-400">{'{}'}</span>;
            }

            return (
                <div>
                    <button
                        onClick={() => togglePath(path)}
                        className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-sm">
                            {isExpanded ? 'expand_more' : 'chevron_right'}
                        </span>
                        <span>{'{'}{keys.length}{'}'}</span>
                    </button>
                    {isExpanded && (
                        <div className="ml-4 border-l border-gray-300 dark:border-gray-600 pl-2">
                            {keys.map(key => (
                                <div key={key} className="py-0.5">
                                    <span className="text-orange-600 dark:text-orange-400 mr-2">"{key}":</span>
                                    {renderJsonValue(value[key], `${path}.${key}`, level + 1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return <span>{String(value)}</span>;
    }, [expandedPaths, indentSize, togglePath]);

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-6xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">JSON 格式化工具</p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">粘贴 JSON 数据,自动格式化并以树形结构展示。</p>
            </div>

            {/* 全局通知 - 固定在顶部中央 */}
            {copySuccess && (
                <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 ${isNotificationFadingOut ? 'animate-fade-out-up' : 'animate-fade-in-down'}`}>
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        <span className="font-medium">已复制到剪贴板!</span>
                    </div>
                </div>
            )}

            <div className="w-full max-w-6xl rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/20 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* 左侧：原始 JSON */}
                    <div className="relative flex flex-col p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-3 min-h-[36px]">
                            <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">data_object</span>
                                原始 JSON
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{inputText.length} 字符</span>
                        </div>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[400px] placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-sm leading-relaxed font-mono"
                            placeholder='在此处粘贴 JSON 数据...'
                        ></textarea>
                    </div>

                    {/* 右侧：格式化后的 JSON */}
                    <div className="relative flex flex-col p-4 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex justify-between items-start mb-3 min-h-[36px] gap-2">
                            <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">account_tree</span>
                                树形视图
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={expandAll}
                                    disabled={!parsedJson}
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">unfold_more</span>
                                    展开
                                </button>
                                <button
                                    onClick={collapseAll}
                                    disabled={!parsedJson}
                                    className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">unfold_less</span>
                                    收起
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={!parsedJson}
                                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                    复制
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                {error}
                            </div>
                        )}
                        <div className="relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px] p-4 text-sm overflow-auto">
                            {parsedJson ? (
                                <div className="font-mono text-xs">
                                    {renderJsonValue(parsedJson, 'root')}
                                </div>
                            ) : !error ? (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-5xl mb-2 block opacity-50">account_tree</span>
                                        <p className="text-sm">格式化后的 JSON 将显示在此处</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JsonFormatterTool;
