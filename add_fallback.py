with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """        const res = await fetch(`/api/phuquy`);
        if (res.ok) {"""

replacement = """        let res;
        try {
          res = await fetch(`/api/phuquy`);
        } catch (err) {}
        
        if (!res || !res.ok) {
          // Fallback for GitHub Pages deployment
          res = await fetch(`https://cors-anywhere.herokuapp.com/https://phuquygroup.vn/`);
        }

        if (res && res.ok) {"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added cors-anywhere fallback.")