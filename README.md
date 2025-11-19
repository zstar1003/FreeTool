<div align="center">
  <img src="public/assets/logo_with_text.png" alt="FreeTool Logo" width="500"/>

  一个纯前端的多功能在线工具站，提供实用的日常工具。

  所有工具(除翻译外)均在本地运行，数据不会上传到服务器。

  在线访问：https://xdxsb.top/FreeTool
</div>

## ✨ 功能特性

### 🌐 在线翻译
- 自动识别语言（中文/英文）
- 智能翻译，自动选择目标语言

### 💻 代码高亮
- 支持13种编程语言
- 两种复制模式：
  - 纯文本复制
  - 富文本复制（可直接粘贴到Word并保持格式）

### 📝 文本格式化
- 一键清除所有换行符
- 移除所有制表符
- 合并多余空格
- 实时预览清理结果
- 快速复制清理后的文本

### 🔧 JSON 格式化
- 自动格式化 JSON 数据
- 树形结构展示
- 支持折叠/展开节点
- 语法高亮
- 一键复制

### 📐 LaTeX 数学公式编辑器
- 实时预览数学公式
- 支持导出为 LaTeX 和 MathML 格式
- 丰富的公式模板
- 内置常用数学符号

### 🖼️ 图片格式转换
- 支持多种格式：PNG、JPEG、WebP、GIF、BMP
- 纯前端转换，无需上传到服务器
- 支持质量调节
- 实时预览
- 一键下载转换后的图片

### ✂️ 图片快速编辑
- 裁剪功能
- 分辨率调整
- 涂鸦工具（画笔、直线、矩形、圆形）
- 马赛克功能


### 🎨 多图自由拼接
- 图层管理系统
- 支持多张图片导入
- 图片缩放、旋转、透明度调节
- 添加文本图层
- 图层锁定/解锁
- 智能裁剪透明区域
- 导出为 PNG

### 📊 表格格式转换
- 基于 DataGridXL 的可编辑表格
- 实时导出为 Markdown / LaTeX / Word
- 支持自定义行列数
- 表头设置
- 一键清空/复制/下载

## 🛠️ 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS
- **图标**: Material Symbols
- **表格**: DataGridXL

## 🚀 本地运行

**前置要求**: Node.js 16+

1. 克隆项目:
   ```bash
   git clone https://github.com/zstar1003/FreeTool.git
   cd FreeTool
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

4. 访问 `http://localhost:5173`

## 📦 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 📁 项目结构

```
freetool/
├── components/              # React 组件
│   ├── TranslateTool.tsx           # 翻译工具
│   ├── CodeHighlightTool.tsx       # 代码高亮工具
│   ├── TextFormatterTool.tsx       # 文本格式化工具
│   ├── JsonFormatterTool.tsx       # JSON 格式化工具
│   ├── MathFormulaEditor.tsx       # 数学公式编辑器
│   ├── ImageConverterTool.tsx      # 图片格式转换工具
│   ├── ImageEditorTool.tsx         # 图片快速编辑工具
│   ├── ImageComparisonTool.tsx     # 多图自由拼接工具
│   ├── TableConverter.tsx          # 表格格式转换工具
│   └── BottomNavBar.tsx            # 移动端底部导航
├── services/                # 服务层
│   ├── geminiService.ts            # Gemini AI 服务
│   └── translateService.ts         # 翻译服务
├── assets/                  # 静态资源
├── App.tsx                  # 主应用组件
├── index.tsx                # 入口文件
├── index.html               # HTML模板
└── index.css                # 全局样式
```

## 🌟 特性说明

### 纯前端实现
- 所有工具均在浏览器端运行
- 图片处理使用 Canvas API
- 无需后端服务器
- 数据不会上传到服务器，隐私安全


## 📄 License

详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

如果发现问题，欢迎提交 Issue 和 Pull Request！