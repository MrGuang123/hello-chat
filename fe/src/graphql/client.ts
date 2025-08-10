import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:8787/graphql';

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const CHAT_QUERY = `
  query Chat($message: String!, $model: String) {
    chat(message: $message, model: $model) {
      content
      model
      usage {
        prompt_tokens
        completion_tokens
        total_tokens
      }
    }
  }
`;

export const CHAT_STREAM_QUERY = `
  query ChatStream($message: String!, $model: String) {
    chatStream(message: $message, model: $model) {
      content
      model
      isComplete
      usage {
        prompt_tokens
        completion_tokens
        total_tokens
      }
    }
  }
`;

export interface ChatResponse {
  chat: {
    content: string;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface ChatStreamResponse {
  chatStream: {
    content: string;
    model: string;
    isComplete: boolean;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export const sendChatMessage = async (message: string, model: string = 'deepseek-chat'): Promise<string> => {
  try {
    const response = await graphqlClient.request<ChatResponse>(CHAT_QUERY, {
      message,
      model
    });
    
    return response.chat.content;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw new Error('Failed to get response from server');
  }
};

export const sendChatMessageStream = async (
  message: string, 
  model: string = 'deepseek-chat',
  onChunk?: (content: string, isComplete: boolean) => void
): Promise<string> => {
  try {
    // 暂时使用普通的GraphQL查询，确保功能正常
    const response = await graphqlClient.request<ChatResponse>(CHAT_QUERY, {
      message,
      model
    });
    
    const content = response.chat.content;
    
    // 模拟流式效果：逐字符显示
    if (onChunk) {
      for (let i = 0; i <= content.length; i++) {
        const partialContent = content.substring(0, i);
        onChunk(partialContent, i === content.length);
        if (i < content.length) {
          await new Promise(resolve => setTimeout(resolve, 20)); // 20ms延迟
        }
      }
    }
    
    return content;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw new Error('Failed to get response from server');
  }
};