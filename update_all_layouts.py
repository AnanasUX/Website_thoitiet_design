with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Desktop News column
content = content.replace(
    '<div className="flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden">',
    '<div className={`flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden transition-all duration-700 ease-in-out ${isLoading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

# Desktop Weather column (if we want to blur the whole column including Gold)
# Actually, Gold has its own blur, Weather has its own blur. 
# But wait, the user asked to extend it to other parts. 
# If I just apply it to the main content container of each layout, it's so much easier and covers everything.

# Let's find the container that holds the content in DesktopLayout
# In DesktopLayout:
# <div className="flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full max-w-[1440px] mx-auto">
content = content.replace(
    '<div className="flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full max-w-[1440px] mx-auto">',
    '<div className={`flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full max-w-[1440px] mx-auto transition-all duration-700 ease-in-out ${isLoading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

# In TabletLayout:
content = content.replace(
    '<div className="flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full">',
    '<div className={`flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full transition-all duration-700 ease-in-out ${isLoading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

# In MobileLayout:
# <div className="flex flex-col gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full">
content = content.replace(
    '<div className="flex flex-col gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full">',
    '<div className={`flex flex-col gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-4 w-full transition-all duration-700 ease-in-out ${isLoading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated all layout main content wrappers.")