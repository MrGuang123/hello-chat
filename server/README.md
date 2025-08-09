# DeepSeek GraphQL Worker

Cloudflare Worker that provides a GraphQL API for DeepSeek chat completions with markdown formatting.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set your DeepSeek API key:
```bash
wrangler secret put DEEPSEEK_API_KEY
```

3. Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Usage

The GraphQL endpoint supports the following query:

```graphql
query {
  chat(message: "Hello, how are you?", model: "deepseek-chat") {
    content
    model
    usage {
      prompt_tokens
      completion_tokens
      total_tokens
    }
  }
}
```

## Development

Run locally:
```bash
npm run dev
```

The worker will be available at `http://localhost:8787/graphql`.