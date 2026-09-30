import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the button class with a more elegant one
content = content.replace(
    'class="fixed bottom-6 right-6 z-[100] bg-white border border-[#e3e7ef] shadow-[0_8px_20px_rgba(23,33,51,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-full size-12 flex items-center justify-center text-[#ff315f] group animate-bounce hover:animate-none"',
    'className="fixed bottom-6 right-6 z-[100] bg-white border border-[#e3e7ef] shadow-[0_8px_20px_rgba(23,33,51,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-full size-12 flex items-center justify-center text-[#ff315f] group animate-[bounce_1s_infinite] sm:animate-none hover:shadow-[0_12px_24px_rgba(23,33,51,0.3)]"'
)

# And fix the class="fixed... to className="fixed... (Oops, my previous script used className already: `className="fixed bottom-6 right-6...`)
content = content.replace(
    'className="fixed bottom-6 right-6 z-[100] bg-white border border-[#e3e7ef] shadow-[0_8px_20px_rgba(23,33,51,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-full size-12 flex items-center justify-center text-[#ff315f] group animate-bounce hover:animate-none"',
    'className="fixed bottom-6 right-6 z-[100] bg-white border border-[#e3e7ef] shadow-[0_8px_20px_rgba(23,33,51,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-full size-12 flex items-center justify-center text-[#ff315f] group animate-fade-in"'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")