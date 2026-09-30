import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def fix_name(match):
    name = match.group(1)
    
    # Remove any existing bullets, hyphens or weird spaces between the site and category
    name = name.replace(" • ", " ").replace("- ", " ")
    
    # Specific sites to split
    sites = ["VnExpress", "Tuổi Trẻ", "Thanh Niên", "Dân Trí"]
    
    for site in sites:
        if name.startswith(site) and len(name) > len(site):
            # There is a category after the site name
            category = name[len(site):].strip()
            # Remove any leading dashes or bullets in category
            category = re.sub(r'^[-\•]\s*', '', category).strip()
            
            if category:
                new_name = f"{site} • {category}"
                return f'name: "{new_name}"'
            
    return match.group(0)

new_content = re.sub(r'name:\s*"([^"]+)"', fix_name, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Names fixed successfully.")