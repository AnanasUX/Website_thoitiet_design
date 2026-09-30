with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
with open("img_usage.txt", "w", encoding="utf-8") as outf:
    for line in lines:
        if 'className="rounded-full shrink-0 size-11' in line:
            outf.write(line.strip() + "\n")