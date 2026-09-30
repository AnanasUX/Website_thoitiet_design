with open("temp.txt", "r", encoding="utf-8") as f:
    content = f.read()
print(content[-500:])