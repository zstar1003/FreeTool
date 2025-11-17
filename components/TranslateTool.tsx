import React, { useState, useCallback } from 'react';
import { translateText } from '../services/translateService';

type Language = 'auto' | 'zh' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es';

interface LanguageOption {
    code: Language;
    name: string;
}

const LANGUAGES: LanguageOption[] = [
    { code: 'auto', name: '自动检测' },
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'es', name: '西班牙语' },
];

const TARGET_LANGUAGES: LanguageOption[] = LANGUAGES.filter(lang => lang.code !== 'auto');

const TranslateTool: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceLang, setSourceLang] = useState<Language>('auto');
    const [targetLang, setTargetLang] = useState<Language>('zh');
    const [detectedLangName, setDetectedLangName] = useState<string>('');
    const [showSourceDropdown, setShowSourceDropdown] = useState<boolean>(false);
    const [showTargetDropdown, setShowTargetDropdown] = useState<boolean>(false);

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim()) {
            setError("请输入需要翻译的文本。");
            return;
        }
        setIsLoading(true);
        setError(null);
        setTranslatedText('');

        try {
            const result = await translateText(inputText, sourceLang, targetLang);
            setTranslatedText(result.translatedText);
            setDetectedLangName(result.detectedLang);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "翻译失败,请稍后重试。");
        } finally {
            setIsLoading(false);
        }
    }, [inputText, sourceLang, targetLang]);

    const handleCopy = useCallback(() => {
        if (!translatedText) return;
        navigator.clipboard.writeText(translatedText).then(() => {
            alert('已复制到剪贴板!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setError("复制文本失败。");
        });
    }, [translatedText]);

    const handleSwap = useCallback(() => {
        if (sourceLang === 'auto') {
            alert('自动检测模式无法互换语言');
            return;
        }

        setInputText(translatedText);
        setTranslatedText('');

        const temp = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(temp);
        setDetectedLangName('');
    }, [translatedText, sourceLang, targetLang]);

    const handleClear = useCallback(() => {
        setInputText('');
    }, []);

    const getSourceLangDisplay = () => {
        if (detectedLangName && sourceLang === 'auto') {
            return detectedLangName;
        }
        return LANGUAGES.find(l => l.code === sourceLang)?.name || '自动检���';
    };

    const getTargetLangDisplay = () => {
        return LANGUAGES.find(l => l.code === targetLang)?.name || '中文';
    };

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-5xl flex-col items-center gap-2 text-center mb-8">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">在线翻译</p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">在不同语言之间即时翻译文本。</p>
            </div>

            {error && (
                <div className="w-full max-w-5xl mb-4">
                    <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>
                </div>
            )}

            <div className="w-full max-w-5xl rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/20 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700/50 p-3">
                    <div className="flex w-full items-center gap-2">
                        {/* 源语言选择 */}
                        <div className="flex-1 relative">
                            <button
                                onClick={() => {
                                    setShowSourceDropdown(!showSourceDropdown);
                                    setShowTargetDropdown(false);
                                }}
                                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-between"
                            >
                                <span>{getSourceLangDisplay()}</span>
                                <span className="material-symbols-outlined text-base">expand_more</span>
                            </button>
                            {showSourceDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setSourceLang(lang.code);
                                                setShowSourceDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                sourceLang === lang.code ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 互换按钮 */}
                        <button
                            onClick={handleSwap}
                            disabled={!translatedText || sourceLang === 'auto'}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-xl">swap_horiz</span>
                        </button>

                        {/* 目标语言选择 */}
                        <div className="flex-1 relative">
                            <button
                                onClick={() => {
                                    setShowTargetDropdown(!showTargetDropdown);
                                    setShowSourceDropdown(false);
                                }}
                                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-primary bg-primary/10 dark:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-between"
                            >
                                <span>{getTargetLangDisplay()}</span>
                                <span className="material-symbols-outlined text-base">expand_more</span>
                            </button>
                            {showTargetDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {TARGET_LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setTargetLang(lang.code);
                                                setShowTargetDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                targetLang === lang.code ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative flex flex-col p-4">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="form-textarea flex-1 resize-none border-0 bg-transparent p-2 text-base font-normal text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
                            placeholder="输入文本..."
                            rows={8}
                        ></textarea>
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-gray-400 dark:text-gray-500">{inputText.length} / 5000</p>
                            <button
                                onClick={handleClear}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative flex flex-col border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700/50 p-4 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex-1 p-2 text-base font-normal text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {translatedText || <span className="text-gray-500 dark:text-gray-400">翻译结果将显示在此处。</span>}
                        </div>
                        <div className="flex items-center justify-end pt-2">
                            <button
                                onClick={handleCopy}
                                disabled={!translatedText}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-base">content_copy</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleTranslate}
                    disabled={isLoading || !inputText.trim()}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="spinner"></div>
                            <span>翻译中...</span>
                        </>
                    ) : (
                        <>
                            <span>翻译</span>
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </>
                    )}
                </button>
            </div>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">由 Google 翻译 API 驱动</p>
        </div>
    );
};

export default TranslateTool;
