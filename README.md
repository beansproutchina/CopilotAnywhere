# CopilotAnywhere - AI代码助手浏览器扩展
CopilotAnywhere 是一个类似于GitHub Copilot的AI代码自动补全工具，但它作为一个浏览器扩展运行，可以在浏览器任何普通的文本框中使用。它特别针对`水源社区`和各种`AI大模型网页版`进行了优化。

![Copilot](./video/copilot1.gif)

## 功能特点

- 🚀 在任何普通文本框中都能使用AI自动补全
- 🔧 针对特定网站和平台进行优化
- 🌐 浏览器扩展形式，易于安装和使用

## 安装与使用

### 1. 运行后端服务

首先需要在本地或服务器上运行后端服务。推荐使用bun或者node.js>20.6.0：

```bash
# 设置环境变量
export OPENAI_BASE_URL=https://api.openai.com
export OPENAI_API_KEY=your_openai_api_key_here
export OPENAI_MODEL=gpt-3.5-turbo

# 安装依赖
bun install

# 运行后端服务
bun run index.js
```

记住其服务地址。

### 2. 安装浏览器扩展

1. 打开Chrome/Edge等基于Chromium的浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目中的 `extension` 文件夹

### 3. 配置通信地址

点击扩展图标，在此页面配置后端服务地址，确保浏览器扩展能与后端正常通信。
![设置界面](image.png)

## 未来规划

- ✅ 支持基于CodeMirror的高级文本框（如Overleaf, CodiMD等）
- ❓ 加入问答工具，可以对网页内的内容进行提问
- 🎨 改进UI界面和用户体验

## 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目！