import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# DesktopLayout wrapping
desktop_pattern = r'(\{/\* Featured feed card \*/\}.*?</button>)'
# Actually, it's easier to find `{/* Featured feed card */}` and `<button ...> Xem thêm` and replace

desktop_start = "{/* Featured feed card */}"
# Let's find the `Xem thêm` button or the end of the `News grid`
# Wait! Instead of wrapping, we can just do:
# return ( ...
# {isFetchingCategory ? <NewsSkeleton /> : (
#   <div className="flex flex-col gap-[var(--grid-gap)] w-full">
#      {/* Featured feed card */}...
#   </div>
# )}
# This might be much simpler.