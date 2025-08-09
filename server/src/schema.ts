export const typeDefs = `
  type Query {
    chat(message: String!, model: String = "deepseek-chat"): ChatResponse!
  }

  type ChatResponse {
    content: String!
    model: String!
    usage: Usage
  }

  type Usage {
    prompt_tokens: Int!
    completion_tokens: Int!
    total_tokens: Int!
  }
`;