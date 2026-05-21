import SchemaBuilder from '@pothos/core';
import { PrismaPlugin } from '@pothos/plugin-prisma';
import type { Context } from '@/graphql/types/context';
import { depthLimitPlugin } from './plugins/depth-limit';
import { complexityLimitPlugin } from './plugins/complexity';

export const builder = new SchemaBuilder<{ Context: Context }>({
  plugins: [
    PrismaPlugin,
    depthLimitPlugin({ maxDepth: 10 }),
    complexityLimitPlugin({ maxComplexity: 1000 }),
  ] as any,
  prisma: {
    client: () => import('@/lib/prisma').then(m => m.prisma),
  } as any,
});

export const schema = builder.toSchema();
