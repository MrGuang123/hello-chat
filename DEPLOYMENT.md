# Hello Chat - Cloudflare 部署指南

本指南将帮助您将 Hello Chat 项目部署到 Cloudflare Workers 和 Cloudflare Pages。

## 📋 前置要求

1. **Cloudflare 账号** - [注册地址](https://dash.cloudflare.com/sign-up)
2. **GitHub 账号** - 用于代码托管和自动部署
3. **DeepSeek API 密钥** - [获取地址](https://platform.deepseek.com/)

## 🚀 部署步骤

### 第一步：准备 GitHub 仓库

1. **创建 GitHub 仓库**
   ```bash
   # 在项目根目录初始化 Git
   git init
   git add .
   git commit -m "Initial commit: Hello Chat with DeepSeek integration"
   
   # 添加远程仓库（替换为你的仓库地址）
   git remote add origin https://github.com/your-username/hello-chat.git
   git push -u origin main
   ```

### 第二步：部署 Cloudflare Worker (后端)

1. **登录 Cloudflare Dashboard**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 Workers & Pages 部分

2. **获取 API 令牌**
   - 访问 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
   - 创建新令牌，选择 "Custom token"
   - 权限设置：
     - Zone: Zone:Read (用于你的域名，如果有)
     - Account: Cloudflare Workers:Edit
     - Account: Account:Read

3. **设置 GitHub Secrets**
   在你的 GitHub 仓库中：
   - 进入 Settings > Secrets and variables > Actions
   - 添加以下 Repository secrets：
     ```
     CLOUDFLARE_API_TOKEN: [你的 Cloudflare API Token]
     CLOUDFLARE_ACCOUNT_ID: [你的 Cloudflare Account ID]
     ```

4. **获取 Account ID**
   - 在 Cloudflare Dashboard 右侧边栏找到 Account ID

5. **设置 Worker 环境变量**
   ```bash
   # 安装 wrangler CLI
   npm install -g wrangler
   
   # 登录到 Cloudflare
   wrangler login
   
   # 设置 DeepSeek API 密钥
   cd server
   wrangler secret put DEEPSEEK_API_KEY --env production
   # 输入你的 DeepSeek API 密钥
   ```

6. **手动部署一次（可选）**
   ```bash
   cd server
   wrangler deploy --env production
   ```

7. **记录 Worker URL**
   部署成功后，记录 Worker 的 URL，格式类似：
   `https://deepseek-worker.your-account.workers.dev`

### 第三步：部署 Cloudflare Pages (前端)

1. **连接 GitHub 仓库**
   - 在 Cloudflare Dashboard 中，进入 Workers & Pages
   - 点击 "Create application" > "Pages" > "Connect to Git"
   - 授权并选择你的 GitHub 仓库

2. **配置构建设置**
   ```
   Framework preset: Create React App
   Build command: npm run build
   Build output directory: /build
   Root directory: /fe
   ```

3. **设置环境变量**
   在 Pages 项目设置中添加：
   ```
   REACT_APP_GRAPHQL_ENDPOINT: https://deepseek-worker.your-account.workers.dev/graphql
   ```
   （将 `your-account` 替换为你的实际 Account ID）

4. **配置自动部署**
   - Production branch: `main`
   - 当 `fe/` 目录有更改时自动部署

### 第四步：验证部署

1. **测试 Worker**
   访问：`https://deepseek-worker.your-account.workers.dev/graphql`
   应该看到 GraphQL playground

2. **测试前端**
   访问你的 Pages URL（类似：`https://hello-chat-fe.pages.dev`）
   应该能正常使用聊天功能

## 🔧 环境配置

### Worker 环境变量

| 变量名 | 类型 | 描述 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | Secret | DeepSeek API 密钥 |
| `DEEPSEEK_API_URL` | Variable | DeepSeek API 地址 (已预配置) |

### Pages 环境变量

| 变量名 | 值 | 描述 |
|--------|----|----|
| `REACT_APP_GRAPHQL_ENDPOINT` | `https://your-worker.workers.dev/graphql` | Worker GraphQL 端点 |

## 🔄 自动部署

项目配置了 GitHub Actions，会在以下情况自动部署：

- **Worker**: 当 `server/` 目录有更改并推送到 `main` 分支
- **Pages**: 通过 Cloudflare Pages 的 Git 集成自动部署

## 🐛 常见问题

### Worker 部署失败
- 检查 API Token 权限
- 确认 Account ID 正确
- 验证 DeepSeek API 密钥已设置

### Pages 构建失败
- 检查环境变量是否正确设置
- 确认构建目录配置为 `/fe`
- 验证依赖安装是否成功

### 跨域问题
Worker 已配置 CORS，支持前端域名访问。如有问题，检查 `server/src/index.ts` 中的 CORS 配置。

## 🔐 安全建议

1. **定期轮换 API 密钥**
2. **使用最小权限原则设置 Cloudflare API Token**
3. **监控 Worker 使用量和日志**
4. **启用 Cloudflare 的安全功能**

## 📞 支持

如遇到问题，请检查：
1. Cloudflare Workers 日志
2. GitHub Actions 运行日志
3. 浏览器开发者控制台

---

部署完成后，你将拥有：
- 🔗 **后端 API**: `https://deepseek-worker.your-account.workers.dev`
- 🌐 **前端应用**: `https://hello-chat-fe.pages.dev`
- 🤖 **AI 聊天功能**: 支持 Markdown 格式回复