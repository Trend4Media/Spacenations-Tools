module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        // Allow console statements for debugging
        'no-console': 'off',
        // Allow unused variables that start with underscore
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        // Allow == and != for null checks
        'eqeqeq': ['error', 'smart'],
        // Prefer const/let over var
        'no-var': 'error',
        'prefer-const': 'error',
        // Semicolons
        'semi': ['error', 'always'],
        // Quotes
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
        // Indentation
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        // Line endings
        'linebreak-style': 'off',
        // Trailing comma
        'comma-dangle': ['error', 'never'],
        // Object curly spacing
        'object-curly-spacing': ['error', 'always'],
        // Array bracket spacing
        'array-bracket-spacing': ['error', 'never'],
        // No multiple empty lines
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }]
    },
    globals: {
        // Firebase globals
        'firebase': 'readonly',
        'db': 'readonly',
        // Chart.js
        'Chart': 'readonly',
        // Other common globals
        'bootstrap': 'readonly',
        '$': 'readonly',
        'jQuery': 'readonly',
        // Custom globals
        'Logger': 'readonly',
        'showLoginSuccess': 'readonly',
        'hideLoginMessages': 'readonly',
        'showLoadingOverlay': 'readonly'
    }
};