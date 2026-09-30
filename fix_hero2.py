import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix the dark mode toggle button shape (override the global 44px min-height)
# We add style={{ minHeight: '32px', minWidth: '32px', padding: 0 }}
old_btn = '<button onClick={() => setDarkMode(!darkMode)} className="ml-2 w-[32px] h-[32px] min-w-[32px] min-h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">'
new_btn = '<button onClick={() => setDarkMode(!darkMode)} style={{ minHeight: "32px", minWidth: "32px", padding: 0 }} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">'
content = content.replace(old_btn, new_btn)

# 2. Fix the Hero card background
# The user wants exact inline style dynamic gradient for dark mode.
# We will inject the dark mode check into the WeatherSection.
# Wait, WeatherSection doesn't have darkMode.
# But we can grab it from document.documentElement.classList.contains('dark')?
# No, React won't re-render WeatherSection automatically when that class changes unless we pass a prop or use context.
# Let's pass darkMode to WeatherSection.