import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

injection = """
function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return now;
}
"""

if "function useCurrentTime" not in content:
    content = content.replace(
        'const assetPathPrefix = "/assets";',
        'const assetPathPrefix = "/assets";\n' + injection
    )

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Injected useCurrentTime.")
