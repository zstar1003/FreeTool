import{r as a,j as e}from"./index-CqFSKw8P.js";import"./react-vendor-DS08_OVb.js";import"./pdf-vendor-B1Z1FYJ2.js";let m=!1;const T=async()=>{if(!(m||typeof window>"u")){if(window.hljs){m=!0;return}return new Promise((s,o)=>{const r=document.createElement("script");r.src="./libs/highlight.js/highlight.min.js",r.async=!0,r.onload=()=>{m=!0,s()},r.onerror=()=>{o(new Error("Highlight.js 加载失败"))},document.head.appendChild(r),setTimeout(()=>{m||o(new Error("Highlight.js 加载超时"))},1e4)})}},H={Python:"python",JavaScript:"javascript",HTML:"html",CSS:"css",SQL:"sql",TypeScript:"typescript",JSX:"jsx",JSON:"json",Markdown:"markdown",Go:"go",Rust:"rust",Java:"java","C++":"cpp"};async function L(s,o){if(await T(),!window.hljs)throw new Error("Highlight.js 未加载。请刷新页面重试。");try{const r=H[o]||o.toLowerCase();return window.hljs.highlight(s,{language:r,ignoreIllegals:!0}).value}catch(r){return console.error("Error highlighting code:",r),s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}const E=["Python","JavaScript","HTML","CSS","SQL","TypeScript","JSX","JSON","Markdown","Go","Rust","Java","C++"],A=()=>{const[s,o]=a.useState(""),[r,x]=a.useState("Python"),[l,h]=a.useState(""),[u,f]=a.useState(!1),[b,g]=a.useState(null),[y,j]=a.useState(!1),[k,w]=a.useState(!1),[N,i]=a.useState(!1),n=a.useRef(null),v=a.useCallback(async(t,c)=>{if(!t.trim()){h("");return}f(!0),g(null);try{const d=await L(t,c);h(d)}catch(d){console.error(d),g("代码高亮失败,请检查控制台获取更多信息。")}finally{f(!1)}},[]);a.useEffect(()=>(n.current&&clearTimeout(n.current),s.trim()?n.current=setTimeout(()=>{v(s,r)},500):(h(""),g(null)),()=>{n.current&&clearTimeout(n.current)}),[s,r,v]);const p=a.useCallback(()=>{if(!l)return;const t=document.createElement("div");t.innerHTML=l,navigator.clipboard.writeText(t.textContent||t.innerText||"").then(()=>{j(!0),i(!1),setTimeout(()=>{i(!0)},1700),setTimeout(()=>{j(!1),i(!1)},2e3)}).catch(c=>{console.error("Failed to copy text: ",c),g("复制代码失败。")})},[l]),C=a.useCallback(()=>{if(!l)return;const t=`
<!DOCTYPE html>
<html>
<head>
<style>
    body {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 10pt;
        line-height: 1.4;
        margin: 0;
        padding: 0;
    }
    pre {
        background-color: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        border: 1px solid #ddd;
        margin: 0;
        max-width: 100%;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    code {
        font-size: 9pt;
        display: block;
    }
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

    @page {
        margin: 2cm;
    }
</style>
</head>
<body>
<pre><code>${l}</code></pre>
</body>
</html>`,c=new Blob([t],{type:"text/html"}),d=new ClipboardItem({"text/html":c,"text/plain":new Blob([s],{type:"text/plain"})});navigator.clipboard.write([d]).then(()=>{w(!0),i(!1),setTimeout(()=>{i(!0)},1700),setTimeout(()=>{w(!1),i(!1)},2e3)}).catch(S=>{console.error("Failed to copy as HTML: ",S),p()})},[l,s,p]);return e.jsxs("div",{className:"flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"flex w-full max-w-6xl flex-col items-center gap-2 text-center mb-8",children:[e.jsx("p",{className:"text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl",children:"代码高亮工具"}),e.jsx("p",{className:"text-base font-normal text-gray-500 dark:text-gray-400",children:"粘贴您的代码并选择语言,自动获得可用于文档的格式化代码。"})]}),e.jsx("div",{className:"w-full max-w-6xl mb-6",children:e.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-4",children:[e.jsxs("div",{className:"relative w-full sm:w-64",children:[e.jsx("label",{className:"sr-only",htmlFor:"language-select",children:"编程语言"}),e.jsx("select",{id:"language-select",value:r,onChange:t=>x(t.target.value),className:"w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-primary/20 focus:ring-2",children:E.map(t=>e.jsx("option",{value:t,children:t},t))}),e.jsx("span",{className:"material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none",children:"expand_more"})]}),u&&e.jsxs("div",{className:"flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400",children:[e.jsx("div",{className:"spinner"}),e.jsx("span",{children:"高亮中..."})]})]})}),b&&e.jsx("div",{className:"w-full max-w-6xl mb-4",children:e.jsx("p",{className:"text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg",children:b})}),y&&e.jsx("div",{className:`fixed top-8 left-1/2 -translate-x-1/2 z-50 ${N?"animate-fade-out-up":"animate-fade-in-down"}`,children:e.jsxs("div",{className:"bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2",children:[e.jsx("span",{className:"material-symbols-outlined text-xl",children:"check_circle"}),e.jsx("span",{className:"font-medium",children:"已复制文本到剪贴板!"})]})}),k&&e.jsx("div",{className:`fixed top-8 left-1/2 -translate-x-1/2 z-50 ${N?"animate-fade-out-up":"animate-fade-in-down"}`,children:e.jsxs("div",{className:"bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2",children:[e.jsx("span",{className:"material-symbols-outlined text-xl",children:"check_circle"}),e.jsx("span",{className:"font-medium",children:"已复制为富文本格式,可直接粘贴到Word!"})]})}),e.jsx("div",{className:"w-full max-w-6xl rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/20 shadow-sm",children:e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2",children:[e.jsxs("div",{className:"relative flex flex-col p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/50",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3 min-h-[36px]",children:[e.jsxs("h3",{className:"text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2",children:[e.jsx("span",{className:"material-symbols-outlined text-xl",children:"code"}),"原始代码"]}),e.jsxs("span",{className:"text-xs text-gray-400 dark:text-gray-500",children:[s.length," 字符",u&&e.jsx("span",{className:"ml-2",children:"· 高亮中..."})]})]}),e.jsx("textarea",{value:s,onChange:t=>o(t.target.value),className:"flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[400px] placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-sm font-mono leading-relaxed",placeholder:"在此处粘贴您的代码..."})]}),e.jsxs("div",{className:"relative flex flex-col p-4 bg-gray-50/50 dark:bg-gray-800/30",children:[e.jsxs("div",{className:"flex justify-between items-start mb-3 min-h-[36px]",children:[e.jsxs("h3",{className:"text-gray-900 dark:text-white text-base font-semibold leading-normal flex items-center gap-2",children:[e.jsx("span",{className:"material-symbols-outlined text-xl",children:"auto_awesome"}),"高亮后的代码"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{onClick:p,disabled:!l,className:"flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap",children:[e.jsx("span",{className:"material-symbols-outlined text-base",children:"content_copy"}),e.jsx("span",{children:y?"已复制!":"复制文本"})]}),e.jsxs("button",{onClick:C,disabled:!l,className:"flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 dark:border-primary/40 rounded-lg text-xs font-medium hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap",children:[e.jsx("span",{className:"material-symbols-outlined text-base",children:"description"}),e.jsx("span",{children:"复制到Word"})]})]})]}),e.jsx("div",{className:"relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px] p-4 font-mono text-sm overflow-x-auto",children:l?e.jsx("pre",{className:"leading-relaxed",children:e.jsx("code",{dangerouslySetInnerHTML:{__html:l}})}):e.jsx("div",{className:"flex items-center justify-center h-full text-gray-400 dark:text-gray-500",children:e.jsxs("div",{className:"text-center",children:[e.jsx("span",{className:"material-symbols-outlined text-5xl mb-2 block opacity-50",children:"lightbulb"}),e.jsx("p",{className:"text-sm",children:"高亮后的代码将显示在此处"})]})})})]})]})})]})};export{A as default};
