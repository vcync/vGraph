module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "prettier-standard/lib/base",
    "prettier",
    "prettier/standard"
  ],
  rules: {
    'prettier/prettier': 'error',
  }
}
