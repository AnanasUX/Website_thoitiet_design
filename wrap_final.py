import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# DESKTOP
desktop_target = re.search(r'(\{/\* Featured feed card \*/\}.*?)(<div className="flex items-start justify-center py-2 w-full">)', content, flags=re.DOTALL)
if desktop_target:
    inner = desktop_target.group(1)
    # The inner matches from {/* Featured feed card */} to just before the closing </div>
    # But wait, there is a </button> or </a>?
    # desktop_target.group(1) contains the featured block and the news grid block.
    # Let's verify it doesn't leak into TabletLayout.
    if "function TabletLayout" not in inner:
        new_inner = "{isFetchingCategory ? <NewsSkeleton /> : (<div className=\"w-full flex flex-col gap-[var(--grid-gap)]\">\n" + inner + "</div>)}\n          "
        content = content.replace(inner, new_inner)

# TABLET
tablet_target = re.search(r'function TabletLayout.*?(\{/\* Featured article \*/\}.*?)(<div className="flex items-start justify-center py-2 w-full">)', content, flags=re.DOTALL)
if tablet_target:
    inner = tablet_target.group(1)
    if "function MobileLayout" not in inner:
        new_inner = "{isFetchingCategory ? <NewsSkeleton /> : (<div className=\"w-full flex flex-col gap-[var(--grid-gap)]\">\n" + inner + "</div>)}\n          "
        content = content.replace(inner, new_inner)

# MOBILE
mobile_target = re.search(r'function MobileLayout.*?(\{/\* Featured article \*/\}.*?)(<div className="flex items-start justify-center py-2 w-full">)', content, flags=re.DOTALL)
if mobile_target:
    inner = mobile_target.group(1)
    if "InfiniteScrollTrigger" not in inner: # Just to be safe
        new_inner = "{isFetchingCategory ? <NewsSkeleton /> : (<div className=\"w-full flex flex-col gap-[var(--grid-gap)]\">\n" + inner + "</div>)}\n          "
        content = content.replace(inner, new_inner)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Wrapped Desktop, Tablet, Mobile")