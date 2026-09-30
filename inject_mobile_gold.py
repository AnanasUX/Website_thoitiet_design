with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace specifically in MobileLayout
old_str = """        <div className="flex flex-col gap-[var(--grid-gap)] items-start w-full">
          
                  <div className="flex items-center justify-between w-full mb-1 sticky top-[calc(var(--header-height)-1px)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">"""

new_str = """        <div className="flex flex-col gap-[var(--grid-gap)] items-start w-full">
          <GoldPriceSection />
                  <div className="flex items-center justify-between w-full mb-1 sticky top-[calc(var(--header-height)-1px)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">"""

if old_str in content:
    content = content.replace(old_str, new_str)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Injected into MobileLayout")
else:
    print("Could not find the target string in MobileLayout")