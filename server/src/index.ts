import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers, Context } from './resolvers';
import { DeepSeekClient } from './deepseek';

interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

const schema = createSchema({
  typeDefs,
  resolvers
});

const yoga = createYoga<Context>({
  schema,
  cors: {
    origin: [
      'http://localhost:3000', 
      'https://hello-chat-frontend.pages.dev',
      'https://chat.plaguang.uk'
    ],
    credentials: true
  },
  context: ({ request, env }) => ({
    env
  })
});

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // 健康检查端点
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 流式聊天端点
    if (url.pathname === '/stream-chat') {
      return handleStreamChat(request, env);
    }
    
    return yoga.fetch(request, env);
  }
};

async function handleStreamChat(request: Request, env: any): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const message = url.searchParams.get('message');
    const model = url.searchParams.get('model') || 'deepseek-chat';
    
    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const client = new DeepSeekClient(
            env.DEEPSEEK_API_KEY,
            env.DEEPSEEK_API_URL
          );

          const request: DeepSeekRequest = {
            model,
            messages: [
              {
                role: 'user',
                content: `Please respond in markdown format:\n\n${message}`
              }
            ],
            max_tokens: 2000,
            temperature: 0.7,
            stream: true
          };

          const response = await fetch(env.DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify(request)
          });

          if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Failed to get response reader');
          }

          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices && parsed.choices[0]) {
                      const choice = parsed.choices[0];
                      if (choice.delta && choice.delta.content) {
                        const content = choice.delta.content;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                      }
                    }
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } catch (error: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': 'https://chat.plaguang.uk',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}