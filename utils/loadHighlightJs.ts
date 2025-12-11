// Highlight.js 按需加载工具
let highlightJsLoaded = false;

export const loadHighlightJs = async (): Promise<void> => {
  if (highlightJsLoaded || typeof window === 'undefined') {
    return;
  }

  // 检查是否已经加载
  if (window.hljs) {
    highlightJsLoaded = true;
    return;
  }

  // 动态加载 Highlight.js 脚本
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './libs/highlight.js/highlight.min.js';
    script.async = true;

    script.onload = () => {
      highlightJsLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Highlight.js 加载失败'));
    };

    document.head.appendChild(script);

    // 超时处理
    setTimeout(() => {
      if (!highlightJsLoaded) {
        reject(new Error('Highlight.js 加载超时'));
      }
    }, 10000);
  });
};

// 声明 window.hljs 类型
declare global {
  interface Window {
    hljs?: {
      highlightElement: (element: HTMLElement) => void;
      highlightAll: () => void;
    };
  }
}
