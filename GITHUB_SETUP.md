# GitHub Actions 自动部署设置

## 设置步骤

### 1. 创建 Cloudflare API Token

1. 访问 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择 **Custom token**
4. 配置权限：
   - **Account**: Cloudflare Pages:Edit
5. 点击 **Continue to summary**
6. 点击 **Create Token**
7. 复制生成的Token

### 2. 设置 GitHub Secrets

1. 在你的GitHub仓库中，进入 **Settings** > **Secrets and variables** > **Actions**
2. 点击 **New repository secret**
3. 添加以下secret：
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: 你刚才创建的API Token

### 3. 推送代码触发部署

现在当你推送代码到 `main` 或 `master` 分支时，如果 `fe/` 目录有更改，GitHub Actions会自动：

1. 安装依赖
2. 构建前端项目
3. 部署到Cloudflare Pages

## 工作流说明

- **触发条件**: 推送到 `main` 或 `master` 分支，且 `fe/` 目录有更改
- **构建命令**: `cd fe && REACT_APP_GRAPHQL_ENDPOINT=https://deepseek-worker.ytg.workers.dev/graphql npm run build`
- **部署目标**: Cloudflare Pages 项目 `hello-chat-frontend`

## 注意事项

- API Token 只需要设置一次
- 每次推送都会触发新的部署
- 部署状态可以在 GitHub Actions 页面查看
