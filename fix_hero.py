import os

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# The original block:
#         <div
#           className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full transition-transform duration-500 hover:scale-[1.02]"
#             style={{ background: "linear-gradient(21deg, rgb(72 141 203) 0%, rgb(51 106 214) 50%, rgb(79 196 255) 100%)" }}
#         >

# Let's replace the inline style and add hero-gradient to className
old_class = 'className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full transition-transform duration-500 hover:scale-[1.02]"'
old_style1 = 'style={{ background: "linear-gradient(21deg, rgb(72 141 203) 0%, rgb(51 106 214) 50%, rgb(79 196 255) 100%)" }}'
# Sometimes it might be indented differently, let's use replace

if old_class in content and old_style1 in content:
    # First replace the className
    new_class = 'className="hero-gradient flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full transition-transform duration-500 hover:scale-[1.02]"'
    content = content.replace(old_class, new_class)
    # Then remove the style prop entirely (with some whitespace if possible)
    # Actually, replacing it with empty string is fine.
    content = content.replace(old_style1, '')
    
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Could not find exact strings")