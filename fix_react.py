with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("React.useState", "useState")
content = content.replace("React.useEffect", "useEffect")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Removed React. prefix")