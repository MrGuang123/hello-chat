# Hello Chat 🤖

一个基于 React + Cloudflare Workers + DeepSeek AI 的智能聊天应用，支持 Markdown 格式渲染。

## ✨ 功能特性

- 🎨 **现代化 UI** - 清洁美观的聊天界面
- 🤖 **AI 对话** - 集成 DeepSeek AI 模型
- 📝 **Markdown 渲染** - 支持代码高亮、表格、列表等
- ⚡ **实时响应** - 基于 GraphQL 的高效数据传输
- 🌐 **全球部署** - 利用 Cloudflare 全球网络
- 📱 **响应式设计** - 支持桌面和移动端
- 🔒 **安全可靠** - 环境变量安全管理

## 🏗️ 技术栈

### 前端
- **React 19** - 用户界面库
- **TypeScript** - 类型安全
- **React Markdown** - Markdown 渲染
- **GraphQL Request** - API 客户端
- **Lucide React** - 图标库

### 后端
- **Cloudflare Workers** - 无服务器计算平台
- **GraphQL Yoga** - GraphQL 服务器
- **DeepSeek API** - AI 模型服务

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/hello-chat.git
   cd hello-chat
   ```

2. **安装依赖**
   ```bash
   # 安装服务端依赖
   cd server
   npm install
   
   # 安装前端依赖
   cd ../fe  
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 服务端
   cd server
   cp .env.example .dev.vars
   # 编辑 .dev.vars，填入你的 DeepSeek API 密钥
   
   # 前端会自动使用 .env.development 中的配置
   ```

4. **启动开发服务器**
   ```bash
   # 启动后端 (Terminal 1)
   cd server
   npm run dev
   
   # 启动前端 (Terminal 2)
   cd fe
   npm start
   ```

5. **访问应用**
   - 前端：http://localhost:3000
   - 后端 GraphQL Playground：http://localhost:8787/graphql

## 📦 部署到 Cloudflare

详细部署指南请参考：[DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署步骤

1. **推送代码到 GitHub**
2. **设置 Cloudflare API Token 和 Account ID**
3. **部署 Worker 并设置 DeepSeek API 密钥**
4. **连接 Pages 到 GitHub 仓库**
5. **配置前端环境变量**

部署完成后即可使用！

## 🎯 使用说明

1. **开始对话** - 在输入框中输入消息
2. **发送消息** - 按 Enter 键或点击发送按钮
3. **查看回复** - AI 回复支持完整的 Markdown 格式
4. **清空对话** - 点击右上角的清空按钮

### 支持的 Markdown 功能

- ✅ 标题 (H1-H6)
- ✅ **粗体** 和 *斜体*
- ✅ `行内代码` 和代码块
- ✅ 列表（有序/无序）
- ✅ 链接和图片
- ✅ 表格
- ✅ 引用块

## 📁 项目结构

```
hello-chat/
├── .github/workflows/     # GitHub Actions 工作流
├── fe/                   # React 前端应用
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── graphql/      # GraphQL 客户端
│   │   └── App.tsx       # 主应用组件
│   ├── public/           # 静态资源
│   └── package.json      # 前端依赖
├── server/               # Cloudflare Worker 后端
│   ├── src/
│   │   ├── index.ts      # Worker 入口
│   │   ├── schema.ts     # GraphQL Schema
│   │   ├── resolvers.ts  # GraphQL Resolvers
│   │   └── deepseek.ts   # DeepSeek API 客户端
│   ├── wrangler.toml     # Cloudflare 配置
│   └── package.json      # 后端依赖
├── DEPLOYMENT.md         # 详细部署指南
└── README.md             # 项目文档
```

## 🔧 开发指南

### 添加新的 AI 模型

1. 修改 `server/src/deepseek.ts` 中的模型配置
2. 更新 GraphQL Schema 中的模型选项
3. 测试新模型的响应格式

### 自定义 UI 样式

1. 修改 `fe/src/App.css` 中的样式
2. 更新 `fe/src/components/MarkdownRenderer.css` 中的 Markdown 样式
3. 调整颜色主题和布局

### 扩展 GraphQL API

1. 更新 `server/src/schema.ts` 中的 Schema 定义
2. 实现对应的 Resolvers 在 `server/src/resolvers.ts`
3. 更新前端的 GraphQL 查询

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com/) - 提供强大的 AI 模型服务
- [Cloudflare](https://www.cloudflare.com/) - 提供全球部署平台
- [React](https://reactjs.org/) - 优秀的用户界面库

## 📞 支持

如有问题或建议，请：

1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的常见问题
2. 创建 [GitHub Issue](https://github.com/your-username/hello-chat/issues)
3. 参与 [Discussions](https://github.com/your-username/hello-chat/discussions)

---

**Happy Chatting! 🚀**