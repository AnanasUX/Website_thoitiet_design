with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("useEffect(() => {\n    let isMounted = true;\n    const fetchGold = async () => {")
end_idx = content.find("  const ptsReal = chartData.real", idx)
print(content[idx:end_idx])