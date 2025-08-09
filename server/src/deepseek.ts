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
    const request: DeepSeekRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: `Please respond in markdown format:\n\n${message}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from DeepSeek API');
    }

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  }
}