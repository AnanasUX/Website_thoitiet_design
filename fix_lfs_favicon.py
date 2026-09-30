import os
import base64
import re

os.makedirs("public/icon_web", exist_ok=True)
# Copy favicon to icon_web
with open("public/favicon.png", "rb") as f:
    img_data = f.read()

with open("public/icon_web/favicon.png", "wb") as f:
    f.write(img_data)

# Create a bypass in gitattributes
with open(".gitattributes", "a", encoding="utf-8") as f:
    f.write("\npublic/icon_web/* -text -filter -merge -diff\n")

b64_str = base64.b64encode(img_data).decode("utf-8")
data_uri = f"data:image/png;base64,{b64_str}"

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace the favicon link with Base64 for guaranteed success, 
# but also add the icon_web link as an alternative or just use icon_web.
# Since the user specifically wants to link to icon_web, let's use the icon_web link in HTML!
html = re.sub(r'<link rel="icon".*?>', '<link rel="icon" type="image/png" href="/icon_web/favicon.png" />', html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Success")