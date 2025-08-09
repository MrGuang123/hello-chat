import { DeepSeekClient } from './deepseek';

export interface Context {
  env: {
    DEEPSEEK_API_KEY: string;
    DEEPSEEK_API_URL: string;
  };
}

export const resolvers = {
  Query: {
    chat: async (
      _parent: any,
      args: { message: string; model?: string },
      context: Context
    ) => {
      if (!context.env.DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key not configured');
      }

      const client = new DeepSeekClient(
        context.env.DEEPSEEK_API_KEY,
        context.env.DEEPSEEK_API_URL
      );

      try {
        const result = await client.chat(args.message, args.model);
        return result;
      } catch (error) {
        throw new Error(`Failed to get response from DeepSeek: ${error.message}`);
      }
    }
  }
};