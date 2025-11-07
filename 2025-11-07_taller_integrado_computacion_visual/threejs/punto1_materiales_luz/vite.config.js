import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3001, // Different port from taller 1
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.exr', '**/*.jpg', '**/*.png']
})
