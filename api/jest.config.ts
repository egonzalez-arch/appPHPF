export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.ts', '!main.ts', '!**/index.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};