import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need a state for darkMode
if "const [darkMode, setDarkMode]" not in content:
    # find where to inject it (top of App component)
    content = content.replace(
        "export default function App() {",
        "export default function App() {\n  const [darkMode, setDarkMode] = React.useState(() => {\n    const saved = localStorage.getItem('theme');\n    if (saved) return saved === 'dark';\n    return window.matchMedia('(prefers-color-scheme: dark)').matches;\n  });\n\n  React.useEffect(() => {\n    const root = window.document.documentElement;\n    if (darkMode) {\n      root.classList.add('dark');\n      localStorage.setItem('theme', 'dark');\n    } else {\n      root.classList.remove('dark');\n      localStorage.setItem('theme', 'light');\n    }\n  }, [darkMode]);\n"
    )

# Inject the toggle button into the header
# Look for the date/time container in the header
# <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">
toggle_btn = """
          <button onClick={() => setDarkMode(!darkMode)} className="ml-2 w-8 h-8 rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0">
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
"""

# There are 3 layouts: Desktop, Tablet, Mobile. We should inject the toggle in all headers.
# Desktop header:
content = re.sub(
    r'(<p className="font-normal text-\[#5f687b\] text-\[12px\] whitespace-nowrap">\s*\{dateStr\} A \{timeStr\}\s*</p>\s*</div>)',
    r'\1' + toggle_btn,
    content
)

# Mobile/Tablet headers:
content = re.sub(
    r'(<p className="font-medium text-\[#5f687b\] text-\[13px\] whitespace-nowrap">\s*dY"\? \{WEATHER\.location\}\s*</p>\s*</div>)',
    r'\1' + toggle_btn,
    content
)

# And Mobile header 2:
content = re.sub(
    r'(<p className="font-medium text-\[#182033\] text-\[12px\] whitespace-nowrap text-right">\s*dY"\? \{WEATHER\.location\}\s*<br/>\s*<span className="text-\[#5f687b\] text-\[11px\]">\{dateStr\}</span>\s*</p>\s*</div>)',
    r'\1' + toggle_btn,
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected Dark Mode toggle")