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

      const totalStartTime = Date.now();
      const client = new DeepSeekClient(
        context.env.DEEPSEEK_API_KEY,
        context.env.DEEPSEEK_API_URL
      );

      try {
        const apiStartTime = Date.now();
        // 使用更快的模型，如果用户没有指定模型
        const modelToUse = args.model || 'deepseek-chat';
        const result = await client.chat(args.message, modelToUse);
        const apiEndTime = Date.now();
        const totalEndTime = Date.now();
        
        console.log(`=== Performance Report ===`);
        console.log(`Total time: ${totalEndTime - totalStartTime}ms`);
        console.log(`DeepSeek API time: ${apiEndTime - apiStartTime}ms`);
        console.log(`Worker overhead: ${(totalEndTime - totalStartTime) - (apiEndTime - apiStartTime)}ms`);
        console.log(`Message length: ${args.message.length} chars`);
        console.log(`Response length: ${result.content.length} chars`);
        console.log(`Model: ${args.model || 'deepseek-chat'}`);
        console.log(`========================`);
        
        return result;
      } catch (error: any) {
        const totalEndTime = Date.now();
        console.error(`=== Error Report ===`);
        console.error(`Total time: ${totalEndTime - totalStartTime}ms`);
        console.error(`Error: ${error.message}`);
        console.error(`Message: ${args.message}`);
        console.error(`===================`);
        throw new Error(`Failed to get response from DeepSeek: ${error.message}`);
      }
    },

    chatStream: async (
      _parent: any,
      args: { message: string; model?: string },
      context: Context
    ) => {
      if (!context.env.DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key not configured');
      }

      const startTime = Date.now();
      const client = new DeepSeekClient(
        context.env.DEEPSEEK_API_KEY,
        context.env.DEEPSEEK_API_URL
      );

      try {
        const result = await client.chatStream(args.message, args.model);
        const endTime = Date.now();
        console.log(`ChatStream request completed in ${endTime - startTime}ms`);
        return result;
      } catch (error: any) {
        const endTime = Date.now();
        console.error(`ChatStream request failed after ${endTime - startTime}ms: ${error.message}`);
        throw new Error(`Failed to get response from DeepSeek: ${error.message}`);
      }
    }
  }
};