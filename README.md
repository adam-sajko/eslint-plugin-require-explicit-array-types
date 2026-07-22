# eslint-plugin-require-explicit-array-types

ESLint plugin that requires explicit type annotations for empty arrays. Catches `[]`, `new Array()`, and `Array()` in variable declarations, class properties, and object literal properties **only when their element type isn't already known from context**.

## Why?

TypeScript infers a bare empty array as an ["evolving any"](https://www.typescriptlang.org/play/?#code/MYewdgzgLgBAHjAvDA2gXQNwCg4DoAOArhABYAUAjAJTZYz1zYD0TMAegPxY4HHkDk-GtzIIIAQygBLCADMpAUwgwwhALYAjBQCd0w0TAnS5i5dG1SwAcz2168Zq04ixkmfKWGoF67awGjd1MVdS1dNH1XYw9lMnNLKxgAHxDNHSo-IA) type that evolves as you push elements. This is type-safe, but without an explicit annotation it's not immediately clear what type the array should contain.

This rule enforces explicit type annotations for empty arrays for **code clarity and consistency**.

## Type information required

> [!IMPORTANT]
> This is a **type-aware** rule. It asks the TypeScript type checker whether each empty array already has a contextual type, so it only flags the arrays that are genuinely ambiguous evolving-`any`s. You must therefore enable [typed linting](https://typescript-eslint.io/getting-started/typed-linting/) (`parserOptions.projectService` or `parserOptions.project`). Without type information the rule will throw a parser-services error.

Because the decision is made from the checker's contextual type, an empty array whose type is already known is **never** flagged — including cases a syntactic rule cannot see, such as function return positions, contextually-typed arguments, typed array elements, `satisfies` clauses, and deeply nested typed objects.

```ts
// ✅ Not flagged: `plugins` already has a known type from `Config`
const prettierConfig: Config = {
  plugins: [],
};
```

## Installation

```bash
npm install --save-dev eslint-plugin-require-explicit-array-types
```

## Usage

### Flat config (ESLint v9+)

```js
// eslint.config.js
import requireExplicitArrayTypes from 'eslint-plugin-require-explicit-array-types';

export default [
  // Enable typed linting so the rule can access type information.
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Use the recommended config (enables the rule as 'error').
  // `configs['recommended-type-checked']` is an alias for the same config.
  requireExplicitArrayTypes.configs.recommended,

  // Or configure manually
  {
    plugins: {
      'require-explicit-array-types': requireExplicitArrayTypes,
    },
    rules: {
      'require-explicit-array-types/require-explicit-array-types': 'error',
    },
  },
];
```

## Rule: `require-explicit-array-types`

### What it catches

```ts
// ❌ These will be flagged
const arr = [];
let items = [];
const data = new Array();
const extra = Array();

class Foo {
  items = [];
  data = new Array();
}

const obj = {
  items: [],
  data: new Array(),
};
```

```ts
// ✅ These are fine
const arr: string[] = [];
let items: number[] = [];
const data: boolean[] = new Array();
const extra = new Array<string>();

class Foo {
  items: string[] = [];
  data: number[] = new Array();
}

// Object literal properties use a type assertion on the value
const obj = {
  items: [] as string[],
  data: new Array<number>(),
};

// Non-empty arrays don't need annotations
const numbers = [1, 2, 3];

// Type assertions are accepted
const typed = [] as string[];

// Contextually-typed empty arrays are accepted — the element type is
// already known, so no annotation is needed:
const config: Config = { plugins: [] };            // enclosing typed object
function make(): { items: string[] } {             // function return type
  return { items: [] };
}
const list: { items: string[] }[] = [{ items: [] }]; // typed array element
const sat = { items: [] } satisfies { items: string[] };
```

### Suggestion fix

The rule provides a suggestion fix which you can then narrow to the correct type. For variable declarations and class properties it adds a `: unknown[]` type annotation; for object literal properties it adds an `as unknown[]` type assertion (since properties can't carry an inline annotation).

### Options

#### `ignoreMutableVariables`

Type: `boolean`  
Default: `false`

When `true`, `let` and `var` declarations are ignored. Useful if you rely on TypeScript's evolving array type for mutable variables. `const` declarations and class properties are always checked.

```js
'require-explicit-array-types/require-explicit-array-types': ['error', {
  ignoreMutableVariables: true,
}]
```

```ts
// With ignoreMutableVariables: true
let arr = [];        // ✅ ignored
var list = [];       // ✅ ignored
const arr = [];      // ❌ still flagged

class Foo {
  items = [];        // ❌ still flagged
}
```

## License

MIT
