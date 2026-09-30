import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace React.useMemo with useMemo
content = content.replace("React.useMemo", "useMemo")
content = content.replace("React.useEffect", "useEffect")

# Add useMemo to the imports
if "useMemo" not in content[:500]:
    content = content.replace("import { useState, useEffect, useRef, useCallback } from \"react\";", "import { useState, useEffect, useRef, useCallback, useMemo } from \"react\";")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed React undefined error.")