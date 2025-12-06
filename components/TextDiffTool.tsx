import React, { useState, useCallback, useRef, useEffect } from 'react';

interface DiffLine {
    type: 'same' | 'added' | 'removed' | 'modified';
    leftContent?: string;
    rightContent?: string;
    leftLineNumber?: number;
    rightLineNumber?: number;
}

const TextDiffTool: React.FC = () => {
    const [leftText, setLeftText] = useState<string>('');
    const [rightText, setRightText] = useState<string>('');
    const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [isNotificationFadingOut, setIsNotificationFadingOut] = useState<boolean>(false);
    const [copyTarget, setCopyTarget] = useState<'left' | 'right' | ''>('');

    const leftFileInputRef = useRef<HTMLInputElement>(null);
    const rightFileInputRef = useRef<HTMLInputElement>(null);
    const leftEditorRef = useRef<HTMLTextAreaElement>(null);
    const rightEditorRef = useRef<HTMLTextAreaElement>(null);
    const leftBackgroundRef = useRef<HTMLDivElement>(null);
    const rightBackgroundRef = useRef<HTMLDivElement>(null);

    // 计算文本差异
    const calculateDiff = useCallback((text1: string, text2: string): DiffLine[] => {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const result: DiffLine[] = [];

        const maxLength = Math.max(lines1.length, lines2.length);
        let leftLineNum = 1;
        let rightLineNum = 1;

        for (let i = 0; i < maxLength; i++) {
            const line1 = lines1[i];
            const line2 = lines2[i];

            if (line1 === undefined && line2 !== undefined) {
                result.push({
                    type: 'added',
                    rightContent: line2,
                    rightLineNumber: rightLineNum++,
                });
            } else if (line1 !== undefined && line2 === undefined) {
                result.push({
                    type: 'removed',
                    leftContent: line1,
                    leftLineNumber: leftLineNum++,
                });
            } else if (line1 === line2) {
                result.push({
                    type: 'same',
                    leftContent: line1,
                    rightContent: line2,
                    leftLineNumber: leftLineNum++,
                    rightLineNumber: rightLineNum++,
                });
            } else {
                result.push({
                    type: 'modified',
                    leftContent: line1,
                    rightContent: line2,
                    leftLineNumber: leftLineNum++,
                    rightLineNumber: rightLineNum++,
                });
            }
        }

        return result;
    }, []);

    // 当文本变化时重新计算差异
    useEffect(() => {
        const diff = calculateDiff(leftText, rightText);
        setDiffResult(diff);
    }, [leftText, rightText, calculateDiff]);

    // 同步滚动
    const handleScroll = useCallback((side: 'left' | 'right') => {
        if (side === 'left' && leftEditorRef.current && leftBackgroundRef.current) {
            leftBackgroundRef.current.scrollTop = leftEditorRef.current.scrollTop;
        } else if (side === 'right' && rightEditorRef.current && rightBackgroundRef.current) {
            rightBackgroundRef.current.scrollTop = rightEditorRef.current.scrollTop;
        }
    }, []);

    // 处理文件上传
    const handleFileUpload = useCallback((side: 'left' | 'right', file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (side === 'left') {
                setLeftText(text);
            } else {
                setRightText(text);
            }
        };
        reader.readAsText(file);
    }, []);

    // 复制文本
    const handleCopy = useCallback((side: 'left' | 'right') => {
        const text = side === 'left' ? leftText : rightText;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setCopyTarget(side);
            setIsNotificationFadingOut(false);
            setTimeout(() => {
                setIsNotificationFadingOut(true);
            }, 1700);
            setTimeout(() => {
                setCopySuccess(false);
                setCopyTarget('');
                setIsNotificationFadingOut(false);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }, [leftText, rightText]);

    // 根据实际文本行生成行号和背景
    const generateLineBackgrounds = useCallback((side: 'left' | 'right', text: string) => {
        const lines = text.split('\n');
        const lineCount = Math.max(lines.length, 1);

        // 创建行号到差异类型的映射
        const lineTypeMap = new Map<number, string>();
        diffResult.forEach(diff => {
            const lineNum = side === 'left' ? diff.leftLineNumber : diff.rightLineNumber;
            if (lineNum !== undefined) {
                lineTypeMap.set(lineNum, diff.type);
            }
        });

        return Array.from({ length: lineCount }, (_, index) => {
            const lineNumber = index + 1;
            const lineType = lineTypeMap.get(lineNumber) || 'same';
            let bgColor = '';

            if (side === 'left') {
                if (lineType === 'removed') {
                    bgColor = 'bg-red-100 dark:bg-red-900/20';
                } else if (lineType === 'modified') {
                    bgColor = 'bg-orange-100 dark:bg-orange-900/20';
                }
            } else {
                if (lineType === 'added') {
                    bgColor = 'bg-green-100 dark:bg-green-900/20';
                } else if (lineType === 'modified') {
                    bgColor = 'bg-orange-100 dark:bg-orange-900/20';
                }
            }

            return (
                <div
                    key={index}
                    className={`flex ${bgColor}`}
                    style={{
                        height: '20px',
                        paddingLeft: '12px',
                        paddingRight: '16px',
                    }}
                >
                    <span
                        className="text-gray-400 dark:text-gray-600 select-none text-right flex-shrink-0 font-mono"
                        style={{
                            fontSize: '11px',
                            lineHeight: '20px',
                            width: '32px',
                            marginRight: '8px'
                        }}
                    >
                        {lineNumber}
                    </span>
                </div>
            );
        });
    }, [diffResult]);

    // 统计差异
    const stats = React.useMemo(() => {
        const added = diffResult.filter(line => line.type === 'added').length;
        const removed = diffResult.filter(line => line.type === 'removed').length;
        const modified = diffResult.filter(line => line.type === 'modified').length;
        const same = diffResult.filter(line => line.type === 'same').length;
        return { added, removed, modified, same, total: diffResult.length };
    }, [diffResult]);

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-7xl flex-col items-center gap-2 text-center mb-6">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">文本差异对比</p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">对比两段文本的差异，支持直接编辑或上传文件。</p>
            </div>

            {/* 全局通知 */}
            {copySuccess && (
                <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 ${isNotificationFadingOut ? 'animate-fade-out-up' : 'animate-fade-in-down'}`}>
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        <span className="font-medium">已复制{copyTarget === 'left' ? '左侧' : '右侧'}文本到剪贴板!</span>
                    </div>
                </div>
            )}

            {/* 差异统计 - 始终显示 */}
            <div className="w-full max-w-7xl mb-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/20 shadow-sm p-3">
                    <div className="flex items-center gap-6 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-gray-600 dark:text-gray-400">insert_chart</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">差异统计:</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-green-600 dark:text-green-400 font-semibold">{stats.added}</span>
                            <span className="text-gray-500 dark:text-gray-400">行新增</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-red-600 dark:text-red-400 font-semibold">{stats.removed}</span>
                            <span className="text-gray-500 dark:text-gray-400">行删除</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-orange-600 dark:text-orange-400 font-semibold">{stats.modified}</span>
                            <span className="text-gray-500 dark:text-gray-400">行修改</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-600 dark:text-gray-400 font-semibold">{stats.same}</span>
                            <span className="text-gray-500 dark:text-gray-400">行相同</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 内联差异编辑器 - VS Code 风格 */}
            <div className="w-full max-w-7xl">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/20 shadow-sm overflow-hidden">
                    {/* 工具栏 */}
                    <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
                        {/* 左侧工具栏 */}
                        <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-900 dark:text-white text-sm font-semibold leading-normal flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">description</span>
                                    原始文本
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => leftFileInputRef.current?.click()}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                        上传
                                    </button>
                                    <button
                                        onClick={() => handleCopy('left')}
                                        disabled={!leftText}
                                        className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                        复制
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* 右侧工具栏 */}
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gray-900 dark:text-white text-sm font-semibold leading-normal flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">description</span>
                                    对比文本
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => rightFileInputRef.current?.click()}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                        上传
                                    </button>
                                    <button
                                        onClick={() => handleCopy('right')}
                                        disabled={!rightText}
                                        className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                        复制
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 隐藏的文件上传输入 */}
                    <input
                        ref={leftFileInputRef}
                        type="file"
                        accept=".txt,.md,.json,.xml,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.h,.hpp"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('left', file);
                        }}
                        className="hidden"
                    />
                    <input
                        ref={rightFileInputRef}
                        type="file"
                        accept=".txt,.md,.json,.xml,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.h,.hpp"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('right', file);
                        }}
                        className="hidden"
                    />

                    {/* 编辑器主体 - 带差异高亮 */}
                    <div className="grid grid-cols-2">
                        {/* 左侧编辑器 */}
                        <div className="border-r border-gray-200 dark:border-gray-700/50 relative overflow-hidden">
                            {/* 背景层 - 显示行号和差异高亮 */}
                            <div
                                ref={leftBackgroundRef}
                                className="absolute inset-0 pointer-events-none overflow-auto scrollbar-hide"
                                style={{
                                    scrollBehavior: 'auto',
                                    paddingTop: '4px',
                                    paddingBottom: '4px'
                                }}
                            >
                                {generateLineBackgrounds('left', leftText)}
                            </div>
                            {/* 编辑层 */}
                            <textarea
                                ref={leftEditorRef}
                                value={leftText}
                                onChange={(e) => setLeftText(e.target.value)}
                                onScroll={() => handleScroll('left')}
                                className="w-full h-full resize-none bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono min-h-[500px] relative z-10"
                                style={{
                                    paddingLeft: '52px',
                                    paddingRight: '16px',
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                    fontSize: '12px',
                                    lineHeight: '20px',
                                    border: 'none',
                                    margin: '0',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="在此粘贴或输入原始文本..."
                                spellCheck={false}
                            />
                        </div>

                        {/* 右侧编辑器 */}
                        <div className="relative overflow-hidden">
                            {/* 背景层 - 显示行号和差异高亮 */}
                            <div
                                ref={rightBackgroundRef}
                                className="absolute inset-0 pointer-events-none overflow-auto scrollbar-hide"
                                style={{
                                    scrollBehavior: 'auto',
                                    paddingTop: '4px',
                                    paddingBottom: '4px'
                                }}
                            >
                                {generateLineBackgrounds('right', rightText)}
                            </div>
                            {/* 编辑层 */}
                            <textarea
                                ref={rightEditorRef}
                                value={rightText}
                                onChange={(e) => setRightText(e.target.value)}
                                onScroll={() => handleScroll('right')}
                                className="w-full h-full resize-none bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono min-h-[500px] relative z-10"
                                style={{
                                    paddingLeft: '52px',
                                    paddingRight: '16px',
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                    fontSize: '12px',
                                    lineHeight: '20px',
                                    border: 'none',
                                    margin: '0',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="在此粘贴或输入对比文本..."
                                spellCheck={false}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 隐藏滚动条的样式 */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default TextDiffTool;
