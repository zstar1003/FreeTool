<div align="center">
  <img src="public/assets/logo_with_text.png" alt="FreeTool Logo" width="500"/>

  一个纯前端的多功能在线工具站，提供实用的日常工具。

  所有工具(除翻译外)均在本地运行，数据不会上传到服务器。

  在线访问：https://xdxsb.top/FreeTool

  国内站点：https://tool.zstar.website
</div>

## 包含功能

- 文本工具
  - 在线翻译
  - 代码高亮
  - 文本格式化
  - JSON 格式化
  - XML 格式化
  - 文本差异对比

- 图片工具
  - 图片格式转换
  - 图片快速编辑
  - 多图自由拼接
  - 图片圆角处理
  - 模板快速拼接
  - 图片水印去除

- 数据工具
  - 表格格式转换
  - 数学公式编辑
  - 思维导图
  - 绘图画布

- 媒体工具
  - 视频比例转换
  - PDF 转 PPT
  - PDF 转长图

- 其它工具
  - 图片转提示词
  - 简历生成器
  - 提示词生成器
  - MBTI 人格测试

Tips：可通过鼠标右键，将高频使用的工具进行置顶。

## 本地运行

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

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。


## 📄 License

详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

如果发现问题，欢迎提交 Issue 和 Pull Request！