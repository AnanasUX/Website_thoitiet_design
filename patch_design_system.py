import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update App main wrappers to avoid the hardcoded `w-[min(100%-32px,1200px)] mx-auto` I added earlier
# Revert them back to `w-full` because we will manage padding INSIDE the components.
old_app1 = 'className="md:hidden w-[min(100%-32px,1200px)] mx-auto"'
new_app1 = 'className="md:hidden w-full"'
content = content.replace(old_app1, new_app1)

old_app2 = 'className="hidden md:block xl:hidden w-[min(100%-32px,1200px)] mx-auto"'
new_app2 = 'className="hidden md:block xl:hidden w-full"'
content = content.replace(old_app2, new_app2)

old_app3 = 'className="hidden xl:block w-[min(100%-32px,1200px)] mx-auto"'
new_app3 = 'className="hidden xl:block w-full"'
content = content.replace(old_app3, new_app3)

# 2. Update Header sizes and paddings in all layouts
# MobileLayout
content = re.sub(
    r'className="bg-white border-b border-\[\#e3e7ef\] flex h-\[72px\] items-center justify-between px-4 w-full shrink-0"',
    'className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0"',
    content
)
# TabletLayout / DesktopLayout
content = re.sub(
    r'className="bg-white border-b border-\[\#e3e7ef\] flex h-\[72px\] items-center justify-between px-6 w-full shrink-0"',
    'className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto"',
    content
)
# Wait, if we want the background of the header to stretch, we need to wrap the header contents or just let it stretch.
# Better to let it stretch and use padding, but if max-w-[1200px] is set, the background will truncate.
# I'll just change the inner padding and let it stretch, or create a container.
# Let's write a targeted function.

def patch_layout_header_and_body(content, layout_name):
    # Find the function
    match = re.search(r'function ' + layout_name + r'.*?return \(\s*<div className="bg-\[\#f4f6fa\] flex flex-col items-start w-full">(.*?)</div>\s*\);\s*\}', content, re.DOTALL)
    if not match: return content
    
    inner = match.group(1)
    # Replace header:
    inner = re.sub(
        r'<div className="bg-white border-b border-\[\#e3e7ef\] flex h-\[72px\] items-center justify-between px-[0-9]+ w-full shrink-0">',
        '<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0">',
        inner
    )
    
    # Replace body wrapper (the div after header):
    # Mobile has: <div className="flex flex-col gap-6 items-start p-4 w-full">
    # Tablet has: <div className="flex gap-5 items-start p-5 w-full">
    # Desktop has: <div className="flex gap-6 items-start p-6 w-full">
    inner = re.sub(
        r'<div className="flex (gap-[^\s]+|flex-col gap-[^\s]+) items-start p-[0-9]+ w-full">',
        r'<div className="flex \1 items-start px-[var(--page-padding)] py-[var(--section-gap)] w-full max-w-[1200px] mx-auto">',
        inner
    )
    
    # Grid gaps
    inner = inner.replace('gap-3', 'gap-[var(--grid-gap)]')
    inner = inner.replace('gap-4', 'gap-[var(--grid-gap)]')
    inner = inner.replace('gap-5', 'gap-[var(--grid-gap)]')
    inner = inner.replace('gap-6', 'gap-[var(--grid-gap)]')
    
    # Card padding/radius
    inner = re.sub(r'p-4 rounded-2xl', 'p-[var(--card-padding)] rounded-[var(--card-radius)]', inner)
    inner = re.sub(r'p-3 rounded-\[10px\]', 'p-[var(--card-padding)] rounded-[var(--card-radius)]', inner)
    inner = re.sub(r'rounded-2xl', 'rounded-[var(--card-radius)]', inner)
    
    new_func = f'function {layout_name}' + match.group(0).split(f'function {layout_name}')[1]
    new_func = new_func.replace(match.group(1), inner)
    
    return content.replace(match.group(0), new_func)

content = patch_layout_header_and_body(content, "MobileLayout")
content = patch_layout_header_and_body(content, "TabletLayout")
content = patch_layout_header_and_body(content, "DesktopLayout")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Success")