// Google Translate API (通过公共API代理)

interface TranslateResult {
    translatedText: string;
    detectedLang: string;
    sourceLangCode: string;
    targetLangCode: string;
}

// 语言代码映射
const LANG_NAME_MAP: Record<string, string> = {
    'zh': '中文',
    'zh-CN': '中文',
    'zh-TW': '繁体中文',
    'en': '英语',
    'ja': '日语',
    'ko': '韩语',
    'fr': '法语',
    'de': '德语',
    'es': '西班牙语',
    'ru': '俄语',
    'ar': '阿拉伯语',
    'pt': '葡萄牙语',
    'it': '意大利语',
    'auto': '自动检测',
};

// 检测语言是否为中文
function isChinese(text: string): boolean {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const totalLength = text.replace(/\s/g, '').length;
    return chineseCount / totalLength > 0.3;
}

// 使用 Google Translate API (通过 CORS 代理)
async function translateWithGoogle(text: string, targetLang: string): Promise<{ translatedText: string; detectedLang: string }> {
    try {
        // 使用 CORS 代理访问 Google Translate API
        const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Google翻译API返回格式: [[["翻译结果","原文",null,null,10]],null,"en",...]
        if (!data || !data[0] || !data[0][0]) {
            throw new Error('Invalid response format');
        }

        const translatedText = data[0].map((item: any[]) => item[0]).join('');
        const detectedLangCode = data[2] || 'auto';

        return {
            translatedText,
            detectedLang: LANG_NAME_MAP[detectedLangCode] || detectedLangCode
        };
    } catch (error) {
        console.error('Google Translate error:', error);
        throw error;
    }
}

// 使用 MyMemory Translation API (免费备用)
async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
        }
        throw new Error('MyMemory translation failed');
    } catch (error) {
        console.error('MyMemory translation error:', error);
        throw error;
    }
}

export async function translateText(text: string, userSourceLang: string = 'auto', userTargetLang: string = 'auto'): Promise<TranslateResult> {
    if (!text.trim()) {
        throw new Error('请输入需要翻译的文本');
    }

    let sourceLangCode = userSourceLang;
    let targetLangCode = userTargetLang;

    // 如果是自动模式,智能判断源语言和目标语言
    if (userSourceLang === 'auto' || userTargetLang === 'auto') {
        const containsChinese = isChinese(text);
        if (containsChinese) {
            sourceLangCode = 'zh';
            targetLangCode = userTargetLang === 'auto' ? 'en' : userTargetLang;
        } else {
            sourceLangCode = 'en';
            targetLangCode = userTargetLang === 'auto' ? 'zh' : userTargetLang;
        }
    }

    let translatedText = '';
    let detectedLang = LANG_NAME_MAP[sourceLangCode] || sourceLangCode;

    try {
        // 优先使用 Google Translate
        const result = await translateWithGoogle(text, targetLangCode);
        translatedText = result.translatedText;
        detectedLang = result.detectedLang;
    } catch (error) {
        console.error('Google Translate failed, trying MyMemory:', error);

        try {
            // 降级到 MyMemory
            translatedText = await translateWithMyMemory(text, sourceLangCode, targetLangCode);
        } catch (fallbackError) {
            console.error('All translation methods failed:', fallbackError);
            throw new Error('翻译服务暂时不可用,请检查网络连接或稍后重试');
        }
    }

    return {
        translatedText,
        detectedLang,
        sourceLangCode,
        targetLangCode
    };
}
