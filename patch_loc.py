import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_loc = """      const loc     = ((json.location as string) ?? "Hà Nội").split(",")[0].trim();"""
new_loc = """      let rawLoc = json.location;
      if (typeof rawLoc === 'object' && rawLoc !== null && (rawLoc as any).name) {
          rawLoc = (rawLoc as any).name;
      }
      const locStr = (typeof rawLoc === 'string' ? rawLoc : "Hà Nội");
      const loc = locStr.split(",")[0].trim();"""

content = content.replace(old_loc, new_loc)

old_loc_full = """        locationFull:   (json.location as string) ?? loc,"""
new_loc_full = """        locationFull:   locStr,"""

content = content.replace(old_loc_full, new_loc_full)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")