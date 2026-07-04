import { defineConfig } from 'vite'
import typescript from "@rollup/plugin-typescript"
import { resolve } from "path"
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2015",
    lib: {
      entry: resolve(__dirname, 'src/index'),
      name: 'vueHooks',
      fileName: 'vue-hooks',
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        dir: resolve(__dirname, "dist"),
        globals: {
          'vue': 'Vue',
          'vue-router': 'VueRouter'
        }
      },
      plugins: [typescript()],
    },
  }
})
