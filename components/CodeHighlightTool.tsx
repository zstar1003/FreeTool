import React, { useState, useCallback } from 'react';
import { highlightCode } from '../services/highlightService';

const LANGUAGES = [
    "Python", "JavaScript", "HTML", "CSS", "SQL", "TypeScript", "JSX", "JSON", "Markdown", "Go", "Rust", "Java", "C++"
];

const CodeHighlightTool: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [language, setLanguage] = useState<string>('Python');
    const [highlightedCode, setHighlightedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [copyHtmlSuccess, setCopyHtmlSuccess] = useState<boolean>(false);

    const handleHighlight = useCallback(async () => {
        if (!code) {
            setError("请输入需要高亮的代码。");
            return;
        }
        setIsLoading(true);
        setError(null);
        setHighlightedCode('');

        try {
            const result = await highlightCode(code, language);
            setHighlightedCode(result);
        } catch (err) {
            console.error(err);
            setError("代码高亮失败,请检查控制台获取更多信息。");
        } finally {
            setIsLoading(false);
        }
    }, [code, language]);

    const handleCopyAsText = useCallback(() => {
        if (!highlightedCode) return;

        // For Highlight.js output, we need to extract text from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = highlightedCode;

        navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || '').then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setError("复制代码失败。");
        });
    }, [highlightedCode]);

    const handleCopyAsHTML = useCallback(() => {
        if (!highlightedCode) return;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 11pt; line-height: 1.5; }
    pre { background-color: #f5f5f5; padding: 16px; border-radius: 4px; border: 1px solid #ddd; }
    /* Highlight.js GitHub theme colors */
    .hljs-keyword { color: #d73a49; font-weight: bold; }
    .hljs-string { color: #032f62; }
    .hljs-comment { color: #6a737d; font-style: italic; }
    .hljs-number { color: #005cc5; }
    .hljs-function { color: #6f42c1; }
    .hljs-class { color: #6f42c1; font-weight: bold; }
    .hljs-title { color: #6f42c1; font-weight: bold; }
    .hljs-variable { color: #e36209; }
    .hljs-built_in { color: #005cc5; }
    .hljs-literal { color: #005cc5; }
    .hljs-attr { color: #6f42c1; }
    .hljs-tag { color: #22863a; }
    .hljs-name { color: #22863a; font-weight: bold; }
    .hljs-attribute { color: #6f42c1; }
</style>
</head>
<body>
<pre><code>${highlightedCode}</code></pre>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
            'text/html': blob,
            'text/plain': new Blob([code], { type: 'text/plain' })
        });

        navigator.clipboard.write([clipboardItem]).then(() => {
            setCopyHtmlSuccess(true);
            setTimeout(() => setCopyHtmlSuccess(false), 2000);
        }).catch(err => {
            console.error('Failed to copy as HTML: ', err);
            handleCopyAsText();
        });
    }, [highlightedCode, code, handleCopyAsText]);

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-6xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">代码高亮工具</p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">粘贴您的代码,选择语言,然后点击高亮按钮,即可获得可用于文档的格式化代码。</p>
            </div>

            <div className="w-full max-w-6xl mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-64">
                        <label className="sr-only" htmlFor="language-select">编程语言</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-primary/20 focus:ring-2"
                        >
                            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">expand_more</span>
                    </div>
                    <button
                        onClick={handleHighlight}
                        disabled={isLoading || !code}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <div className="spinner"></div> : <span className="material-symbols-outlined text-xl">format_paint</span>}
                        <span>{isLoading ? "高亮中..." : "高亮代码"}</span>
                    </button>
                </div>
            </div>

            {error && <div className="w-full max-w-6xl mb-4"><p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p></div>}

            {copySuccess && (
                <div className="w-full max-w-6xl mb-4">
                    <p className="text-green-600 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        已复制文本到剪贴板!
                    </p>
                </div>
            )}

            {copyHtmlSuccess && (
                <div className="w-full max-w-6xl mb-4">
                    <p className="text-green-600 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        已复制为富文本格式,可直接粘贴到Word!
                    </p>
                </div>
            )}

            <div className="w-full max-w-6xl rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/20 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* 左侧：原始代码 */}
                    <div className="relative flex flex-col p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">code</span>
                                原始代码
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{code.length} 字符</span>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[400px] placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-sm font-mono leading-relaxed"
                            placeholder="在此处粘贴您的代码..."
                        ></textarea>
                    </div>

                    {/* 右侧：高亮后的代码 */}
                    <div className="relative flex flex-col p-4 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                高亮后的代码
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyAsText}
                                    disabled={!highlightedCode}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">content_copy</span>
                                    <span>{copySuccess ? "已复制!" : "复制文本"}</span>
                                </button>
                                <button
                                    onClick={handleCopyAsHTML}
                                    disabled={!highlightedCode}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">description</span>
                                    <span>复制到Word</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px] p-4 font-mono text-sm overflow-x-auto">
                            {highlightedCode ? (
                                <pre className="leading-relaxed"><code dangerouslySetInnerHTML={{ __html: highlightedCode }}></code></pre>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-5xl mb-2 block opacity-50">lightbulb</span>
                                        <p className="text-sm">高亮后的代码将显示在此处</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeHighlightTool;
