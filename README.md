# eslint-plugin-require-explicit-array-types

ESLint plugin that requires explicit type annotations for empty arrays. Catches `[]`, `new Array()`, and `Array()` in variable declarations and class properties.

## Why?

TypeScript infers empty arrays as an ["evolving any"](https://www.typescriptlang.org/play/?#code/MYewdgzgLgBAHjAvDA2gXQNwCg4DoAOArhABYAUAjAJTZYz1zYD0TMAegPxY4HHkDk-GtzIIIAQygBLCADMpAUwgwwhALYAjBQCd0w0TAnS5i5dG1SwAcz2168Zq04ixkmfKWGoF67awGjd1MVdS1dNH1XYw9lMnNLKxgAHxDNHSo-IA) type that evolves as you push elements. This is type-safe, but without an explicit annotation it's not immediately clear what type the array should contain.

This rule enforces explicit type annotations for empty arrays for **code clarity and consistency**.

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
  // Use the recommended config (enables the rule as 'error')
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

// Non-empty arrays don't need annotations
const numbers = [1, 2, 3];

// Type assertions are accepted
const typed = [] as string[];
```

### Suggestion fix

The rule provides a suggestion fix to add `: unknown[]`, which you can then narrow to the correct type.

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
