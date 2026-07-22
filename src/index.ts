import requireExplicitArrayTypes from './rules/require-explicit-array-types';

const rules = {
  'require-explicit-array-types': requireExplicitArrayTypes,
};

const plugin = {
  meta: {
    name: 'eslint-plugin-require-explicit-array-types',
    version: '2.0.0',
  },
  rules,
  configs: {} as {
    recommended: object;
    'recommended-type-checked': object;
  },
};

// Requires typed linting, since the rule is type-aware. Exposed under both
// `recommended` and `recommended-type-checked`.
const recommended = {
  name: 'require-explicit-array-types/recommended',
  plugins: {
    get 'require-explicit-array-types'() {
      return plugin;
    },
  },
  rules: {
    'require-explicit-array-types/require-explicit-array-types': 'error',
  },
};

plugin.configs.recommended = recommended;
plugin.configs['recommended-type-checked'] = recommended;

export = plugin;
