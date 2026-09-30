import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# For DesktopLayout
desktop_match = re.search(r'(function DesktopLayout.*?\{/\* Featured feed card \*/\}.*?)(?=\{/\* Featured feed card \*/\})', content, flags=re.DOTALL)
# Actually, it's easier to find the block of featured and listNews and wrap it in the ternary.
# Let's do a simple string replace for each layout.

desktop_target = """{/* Featured feed card */}
          {featured && ("""
if desktop_target in content:
    content = content.replace(desktop_target, """{isFetchingCategory ? <NewsSkeleton /> : (
            <>
          {/* Featured feed card */}
          {featured && (""")

desktop_end = """</div>
        </div>
      </div>"""
# Wait, this is too fragile. Let's use regex.

# In DesktopLayout, it's:
# {/* Featured feed card */} ... </a>)}
# <div className="flex flex-col gap-[var(--list-gap)] items-start w-full"> ... </div>
# Then the button for loading more.