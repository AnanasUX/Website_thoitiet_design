import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('import { useState, useEffect, useRef } from "react";', 'import { useState, useEffect, useRef, useCallback } from "react";')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")