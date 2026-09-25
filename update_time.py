import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add useCurrentTime at the top
content = content.replace(
    'const imgMoreHorizontal = `${assetPathPrefix}/c681b.svg`;',
    'const imgMoreHorizontal = `${assetPathPrefix}/c681b.svg`;\n\nfunction useCurrentTime() {\n  const [now, setNow] = useState(new Date());\n  useEffect(() => {\n    const t = setInterval(() => setNow(new Date()), 60000);\n    return () => clearInterval(t);\n  }, []);\n  return now;\n}'
)

# Replace in DesktopLayout
content = content.replace(
    '  const now = new Date();\n  const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });',
    '  const now = useCurrentTime();\n  const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });\n  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;'
)

# Replace WEATHER.time with timeStr
content = content.replace(
    '{dateStr} · {WEATHER.time}',
    '{dateStr} · {timeStr}'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated time logic.")
