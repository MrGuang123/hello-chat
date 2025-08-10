interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekClient {
  private apiKey: string;
  private apiUrl: string;
  private cache: Map<string, any> = new Map();

  constructor(apiKey: string, apiUrl: string = 'https://api.deepseek.com/v1/chat/completions') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async chat(message: string, model: string = 'deepseek-chat'): Promise<{
    content: string;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    // 简单的缓存机制 - 对于短消息
    if (message.length < 50) {
      const cacheKey = `${model}:${message}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for message: ${message.substring(0, 20)}...`);
        return cached;
      }
    }
    
    const requestStartTime = Date.now();
    
    // 使用流式请求来避免响应读取慢的问题
    const request: DeepSeekRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: `你是一个友好、专业、有同理心的AI助手。请按照以下方式与用户交流：

## 交流风格：
- 用自然、亲切的语气，就像朋友间的对话
- 保持逻辑清晰，但不要过于机械
- 适当表达理解和共鸣
- 用简单易懂的语言解释复杂概念
- 在合适的时候使用表情符号或语气词

## 回答原则：
1. **理解优先**：先理解用户真正想问什么
2. **循序渐进**：从简单到复杂，逐步深入
3. **实用导向**：提供具体、可操作的答案
4. **人性化**：承认不确定性，表达同理心
5. **鼓励互动**：主动询问是否需要进一步解释

## 格式要求：
- 使用Markdown格式让内容更清晰
- 代码块用 \`\`\`语言名 开始，\`\`\` 结束
- 标题用 # ## ### 等
- 列表用 - 或 1. 2. 3.
- 强调用 **粗体** 或 *斜体*
- 行内代码用 \`代码\`

## 特殊情况处理：
- 如果用户表达困惑，先安慰再解释
- 如果问题很复杂，主动提出分步骤解答
- 如果不确定答案，诚实说明并建议其他资源
- 如果用户情绪低落，给予鼓励和支持

记住：你是一个有温度、有智慧的助手，目标是帮助用户解决问题，同时让交流变得愉快和有意义。`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500, // 进一步减少token数量以提高速度
      temperature: 0.1, // 进一步降低温度，提高确定性
      stream: true, // 启用流式响应
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 减少到15秒

    let response: Response;
    const fetchStartTime = Date.now();
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: DeepSeek API took too long to respond');
      }
      throw error;
    }

    const fetchEndTime = Date.now();
    const streamStartTime = Date.now();
    
    // 使用流式读取，避免一次性读取整个响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let content = '';
    let usage: any = null;
    let modelName = model;

    let chunkCount = 0;
    let firstChunkTime = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunkCount++;
        if (chunkCount === 1) {
          firstChunkTime = Date.now();
          console.log(`First chunk received after: ${firstChunkTime - streamStartTime}ms`);
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              const streamEndTime = Date.now();
              console.log(`=== DeepSeek API Details ===`);
              console.log(`Request preparation: ${fetchStartTime - requestStartTime}ms`);
              console.log(`Network request: ${fetchEndTime - fetchStartTime}ms`);
              console.log(`First chunk time: ${firstChunkTime - streamStartTime}ms`);
              console.log(`Stream processing: ${streamEndTime - streamStartTime}ms`);
              console.log(`Total chunks: ${chunkCount}`);
              console.log(`Total API time: ${streamEndTime - requestStartTime}ms`);
              console.log(`Response status: ${response.status}`);
              console.log(`Content length: ${content.length} chars`);
              console.log(`Model: ${modelName}`);
              console.log(`===========================`);
              
              const result = {
                content,
                model: modelName,
                usage: usage || {
                  prompt_tokens: 0,
                  completion_tokens: 0,
                  total_tokens: 0
                }
              };
              
              // 缓存结果
              if (message.length < 50) {
                const cacheKey = `${model}:${message}`;
                this.cache.set(cacheKey, result);
              }
              
              return result;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0]) {
                const choice = parsed.choices[0];
                if (choice.delta && choice.delta.content) {
                  content += choice.delta.content;
                }
                if (parsed.model) {
                  modelName = parsed.model;
                }
                if (parsed.usage) {
                  usage = parsed.usage;
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

    throw new Error('Stream ended unexpectedly');
  }

  async chatStream(message: string, model: string = 'deepseek-chat'): Promise<{
    content: string;
    model: string;
    isComplete: boolean;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    const request: DeepSeekRequest = {
      model,
      messages: [
        {
          role: 'system',
          content: `你是一个友好、专业、有同理心的AI助手。请按照以下方式与用户交流：

## 交流风格：
- 用自然、亲切的语气，就像朋友间的对话
- 保持逻辑清晰，但不要过于机械
- 适当表达理解和共鸣
- 用简单易懂的语言解释复杂概念
- 在合适的时候使用表情符号或语气词

## 回答原则：
1. **理解优先**：先理解用户真正想问什么
2. **循序渐进**：从简单到复杂，逐步深入
3. **实用导向**：提供具体、可操作的答案
4. **人性化**：承认不确定性，表达同理心
5. **鼓励互动**：主动询问是否需要进一步解释

## 格式要求：
- 使用Markdown格式让内容更清晰
- 代码块用 \`\`\`语言名 开始，\`\`\` 结束
- 标题用 # ## ### 等
- 列表用 - 或 1. 2. 3.
- 强调用 **粗体** 或 *斜体*
- 行内代码用 \`代码\`

## 特殊情况处理：
- 如果用户表达困惑，先安慰再解释
- 如果问题很复杂，主动提出分步骤解答
- 如果不确定答案，诚实说明并建议其他资源
- 如果用户情绪低落，给予鼓励和支持

记住：你是一个有温度、有智慧的助手，目标是帮助用户解决问题，同时让交流变得愉快和有意义。`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      stream: true
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: DeepSeek API took too long to respond');
      }
      throw error;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let content = '';
    let usage: any = null;

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
              return {
                content,
                model,
                isComplete: true,
                usage
              };
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0]) {
                const choice = parsed.choices[0];
                if (choice.delta && choice.delta.content) {
                  content += choice.delta.content;
                }
                if (parsed.usage) {
                  usage = parsed.usage;
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

    return {
      content,
      model,
      isComplete: true,
      usage
    };
  }
}