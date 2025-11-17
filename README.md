# FreeTool - 在线工具箱

一个纯前端的多功能在线工具站，提供实用的日常工具。

## 功能特性

### 🌐 在线翻译
- 自动识别语言（中文/英文）
- 智能翻译，自动选择目标语言
- 支持文本互换功能
- 使用免费翻译API（LibreTranslate + MyMemory备用）

### 🖼️ 图片格式转换
- 支持多种格式：PNG、JPEG、WebP、GIF、BMP
- 纯前端转换，无需上传到服务器
- 实时预览
- 一键下载转换后的图片
- 支持拖拽上传

### 💻 代码高亮
- 支持13种编程语言
- AI智能高亮（基于 Gemini）
- 两种复制模式：
  - 纯文本复制
  - 富文本复制（可直接粘贴到Word并保持格式）
- 暗黑模式支持

### 📝 文本格式化
- 一键清除所有换行符
- 移除所有制表符
- 合并多余空格
- 实时预览清理结果
- 快速复制清理后的文本

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS
- **AI服务**: Google Gemini API
- **翻译API**: LibreTranslate (开源) + MyMemory (备用)

## 本地运行

**前置要求**: Node.js 16+

1. 安装依赖:
   ```bash
   npm install
   ```

2. 配置环境变量:

   在 `.env.local` 文件中设置您的 Gemini API Key:
   ```
   API_KEY=your_gemini_api_key_here
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

4. 访问 `http://localhost:5173`

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 项目结构

```
freetool/
├── components/           # React 组件
│   ├── TranslateTool.tsx       # 翻译工具
│   ├── ImageConverterTool.tsx  # 图片转换工具
│   ├── CodeHighlightTool.tsx   # 代码高亮工具
│   └── TextFormatterTool.tsx   # 文本格式化工具
├── services/            # 服务层
│   ├── geminiService.ts        # Gemini AI 服务
│   └── translateService.ts     # 翻译服务
├── App.tsx              # 主应用组件
├── index.tsx            # 入口文件
├── index.html           # HTML模板
└── index.css            # 全局样式
```

## 特性说明

### 纯前端实现
- 所有工具均在浏览器端运行
- 图片转换使用 Canvas API
- 无需后端服务器
- 数据不会上传到服务器，隐私安全

### 响应式设计
- 桌面端：侧边栏导航
- 移动端：下拉选择器
- 完全适配各种屏幕尺寸

### 暗黑模式
- 自动检测系统主题
- 支持手动切换
- 所有组件完美适配

## API 说明

### 翻译API
使用两个免费翻译API:
- **LibreTranslate**: 开源翻译API (主要)
- **MyMemory**: 备用翻译服务

### Gemini API
用于代码高亮功能，需要配置 API Key。

获取 Gemini API Key: [Google AI Studio](https://ai.google.dev/)

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
