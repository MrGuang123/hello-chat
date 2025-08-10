export const typeDefs = `
  type Query {
    chat(message: String!, model: String = "deepseek-chat"): ChatResponse!
    chatStream(message: String!, model: String = "deepseek-chat"): ChatStreamResponse!
  }

  type ChatResponse {
    content: String!
    model: String!
    usage: Usage
  }

  type ChatStreamResponse {
    content: String!
    model: String!
    isComplete: Boolean!
    usage: Usage
  }

  type Usage {
    prompt_tokens: Int!
    completion_tokens: Int!
    total_tokens: Int!
  }
`;