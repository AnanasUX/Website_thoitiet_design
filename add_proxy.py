with open("vite.config.ts", "r", encoding="utf-8") as f:
    content = f.read()

target = "plugins: ["
replacement = """server: {
    proxy: {
      '/api/phuquy': {
        target: 'https://phuquygroup.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api\\/phuquy/, '')
      }
    }
  },
  plugins: ["""

if "proxy:" not in content:
    content = content.replace(target, replacement)
    with open("vite.config.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Added proxy to vite.config.ts")
else:
    print("Proxy already exists or different structure.")