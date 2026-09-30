with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("export default function App")
end_idx = content.find("function NewsDetailView", idx)

if end_idx == -1:
    end_idx = len(content)

with open("app_bottom.txt", "w", encoding="utf-8") as f:
    f.write(content[end_idx-1000:end_idx])