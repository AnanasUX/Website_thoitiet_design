with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("fetch(`/Website_thoitiet_design/mock-thanhnien.json`)", "fetch(`${import.meta.env.BASE_URL}mock-thanhnien.json`)")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed base URL for mock.")