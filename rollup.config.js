import typescript from "rollup-plugin-typescript2";

export default {
  external: ["reflect-metadata"],
  output: [
    {
      file: "lib/index.js",
      format: "cjs",
      sourcemap: true
    },
    {
      file: "lib/index.es.js",
      format: "esm"
    },
    {
      file: "lib/index.umd.js",
      format: "umd",
      name: "EasyVAC"
    }
  ],
  input: "./src/index.ts",
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          rootDir: "src",
          declaration: true,
          declarationDir: "types"
        },
        include: ["src/**/*.ts", "src/**/*.tsx"]
      }
    })
  ]
};
