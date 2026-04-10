import requireExplicitArrayTypes from './rules/require-explicit-array-types';

const rules = {
  'require-explicit-array-types': requireExplicitArrayTypes,
};

const plugin = {
  meta: {
    name: 'eslint-plugin-require-explicit-array-types',
    version: '1.0.0',
  },
  rules,
  configs: {
    recommended: {
      plugins: {
        get 'require-explicit-array-types'() {
          return plugin;
        },
      },
      rules: {
        'require-explicit-array-types/require-explicit-array-types': 'error',
      },
    },
  },
};

export = plugin;
