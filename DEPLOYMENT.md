# Hello Chat 部署总结

## 部署状态 ✅

项目已成功部署到Cloudflare平台：

### 后端 (Cloudflare Workers)
- **项目名称**: `deepseek-worker`
- **部署URL**: https://deepseek-worker.ytg.workers.dev
- **自定义域名**: https://api.plaguang.uk
- **GraphQL端点**: https://api.plaguang.uk/graphql
- **环境变量**: 
  - `DEEPSEEK_API_URL`: https://api.deepseek.com/v1/chat/completions
  - `DEEPSEEK_API_KEY`: [已设置为secret]

### 前端 (Cloudflare Pages)
- **项目名称**: `hello-chat-frontend`
- **部署URL**: https://9ad291df.hello-chat-frontend.pages.dev
- **自定义域名**: https://chat.plaguang.uk
- **环境变量**:
  - `REACT_APP_GRAPHQL_ENDPOINT`: https://api.plaguang.uk/graphql

## 部署步骤回顾

### 1. 后端部署
```bash
cd server
npx wrangler deploy
npx wrangler secret put DEEPSEEK_API_KEY
```

### 2. 前端部署
```bash
cd fe
npm run build
npx wrangler pages deploy build --project-name hello-chat-frontend
npx wrangler pages secret put REACT_APP_GRAPHQL_ENDPOINT --project-name hello-chat-frontend
```

## 访问应用

现在你可以通过以下URL访问应用：
- **前端应用**: https://chat.plaguang.uk
- **后端API**: https://api.plaguang.uk/graphql
- **原始URL**:
  - 前端: https://hello-chat-frontend.pages.dev
  - 后端: https://deepseek-worker.ytg.workers.dev/graphql

## 注意事项

1. 前端使用环境变量 `REACT_APP_GRAPHQL_ENDPOINT` 来连接后端API
2. 后端需要有效的 DeepSeek API Key 才能正常工作
3. 如果需要更新部署，只需要重新运行相应的部署命令即可

## 自定义域名 (可选)

如果需要使用自定义域名：
1. 在Cloudflare Dashboard中为Pages项目添加自定义域名
2. 在Cloudflare Dashboard中为Workers项目添加自定义域名
3. 更新前端环境变量中的GraphQL端点URL