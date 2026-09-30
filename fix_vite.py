import re
with open("vite.config.ts", "r", encoding="utf-8") as f:
    content = f.read()
if "import { VitePWA }" not in content:
    content = "import { VitePWA } from 'vite-plugin-pwa';\n" + content
    with open("vite.config.ts", "w", encoding="utf-8") as f:
        f.write(content)