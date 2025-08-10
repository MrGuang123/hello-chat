import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers, Context } from './resolvers';

const schema = createSchema({
  typeDefs,
  resolvers
});

const yoga = createYoga<Context>({
  schema,
  cors: {
    origin: ['http://localhost:3000', 'https://hello-chat-frontend.pages.dev'],
    credentials: true
  },
  context: ({ request, env }) => ({
    env
  })
});

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    return yoga.fetch(request, { env, ctx });
  }
};