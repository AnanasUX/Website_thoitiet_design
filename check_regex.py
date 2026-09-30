import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# DesktopLayout
desktop_block = re.search(r'(\{/\* Featured feed card \*/\}.*?</button>)', content, flags=re.DOTALL)
if desktop_block:
    old_block = desktop_block.group(1)
    new_block = "{isFetchingCategory ? <NewsSkeleton /> : (\n<div className=\"flex flex-col gap-[var(--grid-gap)] w-full\">\n" + old_block + "\n</div>\n)}"
    # Wait, the old_block might be too big or capture too much?
    # Let's check how many </button> are there.