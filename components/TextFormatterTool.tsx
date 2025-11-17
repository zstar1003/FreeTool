import React, { useState, useCallback } from 'react';

const TextFormatterTool: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [formattedText, setFormattedText] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const handleFormat = useCallback(() => {
        if (!inputText.trim()) {
            alert("请输入需要格式化的文本。");
            return;
        }

        // 移除所有换行符、制表符和多余空格
        let result = inputText;

        // 移除所有换行符
        result = result.replace(/[\r\n]+/g, '');

        // 移除所有制表符
        result = result.replace(/\t+/g, '');

        // 将多个空格替换为单个空格并去除首尾空格
        result = result.replace(/\s+/g, ' ').trim();

        setFormattedText(result);
    }, [inputText]);

    const handleCopy = useCallback(() => {
        if (!formattedText) return;
        navigator.clipboard.writeText(formattedText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }, [formattedText]);

    return (
        <div className="p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">文本清理</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-2">快速清除文本中所有多余的空格、换行符和制表符。</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col gap-4">
                        <label className="flex flex-col min-w-40 flex-1">
                            <p className="text-slate-900 dark:text-white text-base font-medium leading-normal pb-2">原始文本</p>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary dark:focus:border-primary min-h-60 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal"
                                placeholder="请在此处粘贴文本..."
                            ></textarea>
                        </label>
                        <div className="flex justify-start">
                            <button
                                onClick={handleFormat}
                                disabled={!inputText.trim()}
                                className="flex min-w-[84px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-slate-50 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="truncate">清理文本</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col min-w-40 flex-1">
                            <div className="flex justify-between items-center pb-2">
                                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">清理后的文本</p>
                                <button
                                    onClick={handleCopy}
                                    disabled={!formattedText}
                                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-xl">content_copy</span>
                                    <span className="text-sm font-medium">复制</span>
                                </button>
                            </div>
                            <textarea
                                value={formattedText}
                                readOnly
                                className="form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 min-h-60 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal"
                                placeholder="清理后的文本将显示在此处..."
                            ></textarea>
                        </div>

                        {copySuccess && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800/50 transition-opacity" role="alert">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                                <p className="text-green-800 dark:text-green-300 text-sm font-medium">已复制到剪贴板!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextFormatterTool;
