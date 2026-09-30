with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Check if there is an isLoading state for category news
if "isFetchingCategory" not in content and "setIsFetchingCategory" not in content:
    # Add the state
    content = content.replace("const [isLoadingMore, setIsLoadingMore] = useState(false);", "const [isLoadingMore, setIsLoadingMore] = useState(false);\n  const [isFetchingCategory, setIsFetchingCategory] = useState(false);")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("State added")