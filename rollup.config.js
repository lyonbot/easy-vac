const commonConfig = {
  input: './tmp/lib/index.js',
}

export default [
  {
    output: {
      file: "./dist/index.umd.js",
      name: "EasyVAC",
      format: "umd"
    },
  },
  {
    output: {
      file: "./dist/index.js",
      name: "EasyVAC",
      format: "cjs"
    },
  }
].map(it => ({ ...commonConfig, ...it }))