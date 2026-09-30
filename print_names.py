import json

with open("names.json", "r", encoding="utf-8") as f:
    names = json.load(f)

with open("out_utf8.txt", "w", encoding="utf-8") as f:
    for name in names:
        f.write(name + "\n")