# easy-vac tests

All tests are under directories, in TypeScript.z
Files that is directly under `test` dir will be ignored while running all tests.

To run tests (with built `dist/index.js`):

- `npm test` :   run all test
- `npm test VObject/partial` : run *VObject/partial.ts*
- `npm test xxx xxx ...` : run multi tests

To debug a test (with source `src/index.ts`):

1. Open the test .ts file with VSCode
2. Go to the debug panel (Ctrl+Shift+D)
3. Choose `Debug with ts-node` and run
