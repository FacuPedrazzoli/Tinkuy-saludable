import { createHash } from 'crypto';

export interface DepthLimitConfig {
  maxDepth: number;
}

export function depthLimitPlugin({ maxDepth }: DepthLimitConfig) {
  return {
    onExecute({ args }: { args: { schema: unknown; document: { definitions: unknown[] }; variableValues?: Record<string, unknown> } }) {
      const depth = calculateDepth(args.document.definitions[0], args.variableValues);
      
      if (depth > maxDepth) {
        throw new Error(`Query depth limit exceeded. Maximum depth: ${maxDepth}, actual: ${depth}`);
      }
      
      return { skip: false };
    },
  };
}

function calculateDepth(
  definition: unknown,
  variableValues?: Record<string, unknown>
): number {
  if (!definition || typeof definition !== 'object') return 0;
  
  const def = definition as { kind?: string; selectionSet?: { selections: unknown[] } };
  
  if (def.kind === 'Field') {
    const field = def as { name?: { value: string }; selectionSet?: { selections: unknown[] } };
    if (field.selectionSet) {
      const childDepths = field.selectionSet.selections.map((sel) =>
        calculateDepth(sel, variableValues)
      );
      return 1 + Math.max(0, ...childDepths);
    }
    return 1;
  }
  
  if (def.kind === 'InlineFragment' || def.kind === 'FragmentSpread') {
    const fragment = def as { selectionSet?: { selections: unknown[] } };
    if (fragment.selectionSet) {
      return Math.max(0, ...fragment.selectionSet.selections.map((sel) =>
        calculateDepth(sel, variableValues)
      ));
    }
  }
  
  return 0;
}
