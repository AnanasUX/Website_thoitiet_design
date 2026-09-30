with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

skeleton_code = """
function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <div className="w-full h-[240px] bg-[#e3e7ef] animate-pulse rounded-[16px]"></div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-[14px] w-full p-[14px] bg-white rounded-[12px] border border-[#e3e7ef]">
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="w-full h-[18px] bg-[#e3e7ef] animate-pulse rounded"></div>
            <div className="w-3/4 h-[18px] bg-[#e3e7ef] animate-pulse rounded"></div>
            <div className="w-1/3 h-[14px] bg-[#e3e7ef] animate-pulse rounded mt-2"></div>
          </div>
          <div className="w-[110px] h-[80px] bg-[#e3e7ef] animate-pulse rounded-[8px] shrink-0"></div>
        </div>
      ))}
    </div>
  );
}
"""

if "function NewsSkeleton" not in content:
    content = content.replace("export function getNewspaperLogo", skeleton_code + "\nexport function getNewspaperLogo")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added NewsSkeleton")