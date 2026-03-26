import js from '@eslint/js'
import ts from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'no-console': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
)
