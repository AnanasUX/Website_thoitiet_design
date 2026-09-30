with open("src/main.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import App from './App'", "import App from './App'\nimport ErrorBoundary from './ErrorBoundary.jsx'")

with open("src/main.tsx", "w", encoding="utf-8") as f:
    f.write(content)