export interface ComplexityLimitConfig {
  maxComplexity: number;
  ignoreIntrospection?: boolean;
}

interface Field {
  name?: { value: string };
  selectionSet?: { selections: Field[] };
}

interface Definition {
  kind?: string;
  selectionSet?: { selections: (Field | Definition)[] };
  arguments?: unknown[];
}

export function complexityLimitPlugin({ maxComplexity, ignoreIntrospection = true }: ComplexityLimitConfig) {
  return {
    onExecute({ args }: { args: { schema: unknown; document: { definitions: unknown[] }; variableValues?: Record<string, unknown> } }) {
      const complexity = calculateComplexity(args.document.definitions[0], args.variableValues);
      
      if (complexity > maxComplexity) {
        throw new Error(`Query complexity limit exceeded. Maximum complexity: ${maxComplexity}, actual: ${complexity}`);
      }
      
      return { skip: false };
    },
  };
}

function calculateComplexity(
  definition: unknown,
  variableValues?: Record<string, unknown>
): number {
  if (!definition || typeof definition !== 'object') return 0;
  
  const def = definition as Definition;
  
  if (def.kind === 'Field') {
    const field = def as Field;
    let childComplexity = 0;
    
    if (field.selectionSet) {
      childComplexity = field.selectionSet.selections.reduce(
        (sum, sel) => sum + calculateComplexity(sel, variableValues),
        0
      );
    }
    
    return 1 + childComplexity;
  }
  
    if (def.kind === 'InlineFragment' || def.kind === 'FragmentSpread') {
    const fragment = def as { selectionSet?: { selections: (Field | Definition)[] } };
    if (fragment.selectionSet) {
      return fragment.selectionSet.selections.reduce(
        (sum: number, sel) => sum + calculateComplexity(sel, variableValues),
        0
      );
    }
  }
  
  return 0;
}
