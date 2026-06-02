import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/adam-sajko/eslint-plugin-require-explicit-array-types#rule-require-explicit-array-types',
);

export interface Config {
  ignoreMutableVariables?: boolean;
}

export type Options = [Config];
export type MessageIds =
  | 'missingTypeAnnotation'
  | 'missingTypeAnnotationNewArray'
  | 'missingTypeAnnotationProperty'
  | 'missingTypeAnnotationNewArrayProperty'
  | 'suggestUnknownArray'
  | 'suggestUnknownArrayAssertion';

export default createRule<Options, MessageIds>({
  name: 'require-explicit-array-types',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require explicit type annotations for empty arrays for code clarity',
    },
    hasSuggestions: true,
    messages: {
      missingTypeAnnotation:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: Type[] = []` instead.',
      missingTypeAnnotationNewArray:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: Type[] = new Array()` or `{{name}}: Type[] = []` instead.',
      missingTypeAnnotationProperty:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: [] as Type[]` instead.',
      missingTypeAnnotationNewArrayProperty:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: new Array<Type>()` or `{{name}}: [] as Type[]` instead.',
      suggestUnknownArray: 'Add `: unknown[]` type annotation.',
      suggestUnknownArrayAssertion: 'Add `as unknown[]` type assertion.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreMutableVariables: {
            type: 'boolean',
            description:
              'Whether to ignore `let` and `var` declarations, since their type will evolve as elements are added.',
          },
        },
      },
    ],
  },
  defaultOptions: [{ ignoreMutableVariables: false }],
  create(context, [option]) {
    function isEmptyArrayLiteral(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.ArrayExpression &&
        node.elements.length === 0
      );
    }

    function isEmptyNewArray(node: TSESTree.Node): boolean {
      return (
        (node.type === AST_NODE_TYPES.NewExpression ||
          node.type === AST_NODE_TYPES.CallExpression) &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'Array' &&
        node.arguments.length === 0 &&
        !node.typeArguments
      );
    }

    function checkVariableDeclarator(node: TSESTree.VariableDeclarator): void {
      const id = node.id;
      if (id.type !== AST_NODE_TYPES.Identifier || id.typeAnnotation) {
        return;
      }

      if (!node.init) {
        return;
      }

      if (option.ignoreMutableVariables && node.parent.kind !== 'const') {
        return;
      }

      const isNewArray = isEmptyNewArray(node.init);
      if (!isEmptyArrayLiteral(node.init) && !isNewArray) {
        return;
      }

      context.report({
        node,
        messageId: isNewArray
          ? 'missingTypeAnnotationNewArray'
          : 'missingTypeAnnotation',
        data: { name: id.name },
        suggest: [
          {
            messageId: 'suggestUnknownArray',
            fix(fixer) {
              return fixer.insertTextAfter(id, ': unknown[]');
            },
          },
        ],
      });
    }

    function checkPropertyDefinition(
      node: TSESTree.PropertyDefinition | TSESTree.AccessorProperty,
    ): void {
      if (node.typeAnnotation) {
        return;
      }

      if (
        !node.value ||
        (!isEmptyArrayLiteral(node.value) && !isEmptyNewArray(node.value))
      ) {
        return;
      }

      const key = node.key;
      const name =
        key.type === AST_NODE_TYPES.Identifier
          ? key.name
          : key.type === AST_NODE_TYPES.Literal
            ? String(key.value)
            : '(computed)';

      const isNewArray = isEmptyNewArray(node.value);

      context.report({
        node,
        messageId: isNewArray
          ? 'missingTypeAnnotationNewArray'
          : 'missingTypeAnnotation',
        data: { name },
        suggest:
          key.type === AST_NODE_TYPES.Identifier
            ? [
                {
                  messageId: 'suggestUnknownArray',
                  fix(fixer) {
                    return fixer.insertTextAfter(key, ': unknown[]');
                  },
                },
              ]
            : [],
      });
    }

    function checkProperty(node: TSESTree.Property): void {
      // Only object literal properties, not destructuring patterns.
      if (node.parent.type !== AST_NODE_TYPES.ObjectExpression) {
        return;
      }

      // Shorthand (`{ arr }`) and methods (`{ arr() {} }`) cannot hold an
      // empty array literal value, so there is nothing to annotate.
      if (node.shorthand || node.method) {
        return;
      }

      const value = node.value;
      if (
        value.type === AST_NODE_TYPES.AssignmentPattern ||
        (!isEmptyArrayLiteral(value) && !isEmptyNewArray(value))
      ) {
        return;
      }

      const key = node.key;
      const name =
        key.type === AST_NODE_TYPES.Identifier
          ? key.name
          : key.type === AST_NODE_TYPES.Literal
            ? String(key.value)
            : '(computed)';

      const isNewArray = isEmptyNewArray(value);

      context.report({
        node,
        messageId: isNewArray
          ? 'missingTypeAnnotationNewArrayProperty'
          : 'missingTypeAnnotationProperty',
        data: { name },
        suggest: [
          {
            messageId: 'suggestUnknownArrayAssertion',
            fix(fixer) {
              return fixer.insertTextAfter(value, ' as unknown[]');
            },
          },
        ],
      });
    }

    return {
      AccessorProperty: checkPropertyDefinition,
      Property: checkProperty,
      PropertyDefinition: checkPropertyDefinition,
      VariableDeclarator: checkVariableDeclarator,
    };
  },
});
