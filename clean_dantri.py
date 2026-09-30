import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def clean_dantri(match):
    name = match.group(1)
    
    # 1. Strip the strange hyphen from Dân Trí
    name = name.replace("Dân Trí-", "Dân Trí")
    
    # 2. Reformat to exact bullet point if it has one
    # Note: the bullet character might have weird spaces, let's normalize
    name = re.sub(r'\s*[•-]\s*', ' • ', name)
    
    # 3. If there is just "Dân Trí • " (empty category), fix it
    name = name.replace("Dân Trí • ", "Dân Trí • ")
    if name.endswith(" • "):
        name = name[:-3]
        
    return f'name: "{name}"'

new_content = re.sub(r'name:\s*"([^"]+)"', clean_dantri, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Cleaned up Dân Trí and bullet points.")