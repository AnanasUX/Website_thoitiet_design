with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# For MobileLayout, find the news container. Wait, in MobileLayout, it's just rendered in the root.
# Let's add the transition to the root of MobileLayout, TabletLayout, DesktopLayout?
# No, let's just add it to the News columns in Tablet and Desktop, and the News container in Mobile.

# DesktopLayout:
content = content.replace(
    '<div className="flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden">',
    '<div className={`flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden transition-all duration-700 ease-in-out ${isLoading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

# TabletLayout:
content = content.replace(
    '<div className="flex flex-col gap-[var(--grid-gap)] items-start w-full">',
    '<div className={`flex flex-col gap-[var(--grid-gap)] items-start w-full transition-all duration-700 ease-in-out ${isLoading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

# Wait, TabletLayout has two columns? Let's check TabletLayout structure.
# Just applying to `App.tsx` root's layouts instead might be safer and universally smoother.