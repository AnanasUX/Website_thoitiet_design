with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start = max(0, 43224 - 500)
end = min(len(content), 43484 + 500)
print(content[start:end])