import typescript from 'rollup-plugin-typescript2';

const config = {
  input: './src/index.ts',
  output: {
    file: "./dist/index.js",
    format: "amd"
  },
  external: ["monaco-editor", "typescript", "preact"],
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          target: "es2016",
          module: "ES2015",
        }
      }
    })
  ]
}

export default config
