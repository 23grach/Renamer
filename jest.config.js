module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2017',
        lib: ['ES2017', 'DOM'],
        module: 'CommonJS',
        moduleResolution: 'Node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
        skipLibCheck: true,
        typeRoots: [
          './node_modules/@types',
          './node_modules/@figma'
        ]
      }
    }]
  },
  collectCoverageFrom: [
    'code.ts',
    '!**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
}; 