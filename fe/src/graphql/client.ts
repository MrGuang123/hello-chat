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