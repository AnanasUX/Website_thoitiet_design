with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("useEffect(() => {\n    let isMounted = true;")
end_idx = content.find("  const maxVal = Math.max(...chartData.real", idx)
with open("temp.txt", "w", encoding="utf-8") as f:
    f.write(content[idx:end_idx])