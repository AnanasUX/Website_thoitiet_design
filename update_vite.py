import re

with open("vite.config.ts", "r", encoding="utf-8") as f:
    content = f.read()

# add import
if "import { VitePWA } from 'vite-plugin-pwa'" not in content:
    content = content.replace("import { defineConfig, Plugin } from 'vite'", 
                              "import { defineConfig, Plugin } from 'vite'\nimport { VitePWA } from 'vite-plugin-pwa'")

# insert into plugins array
if "VitePWA({" not in content:
    content = content.replace(
        "plugins: [",
        "plugins: [\n    VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Thời Tiết AnX', short_name: 'AnX', theme_color: '#ffffff', icons: [{ src: '/vite.svg', sizes: '192x192', type: 'image/svg+xml' }, { src: '/vite.svg', sizes: '512x512', type: 'image/svg+xml' }] } }),"
    )

with open("vite.config.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Added VitePWA to vite.config.ts")