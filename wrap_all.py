with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

def wrap_layout(func_name, start_marker, end_marker):
    start_idx = -1
    end_idx = -1
    in_func = False
    
    for i, line in enumerate(lines):
        if func_name in line:
            in_func = True
        
        if in_func and start_marker in line and start_idx == -1:
            start_idx = i
            
        if in_func and end_marker in line and start_idx != -1:
            end_idx = i
            break
            
    if start_idx != -1 and end_idx != -1:
        lines.insert(start_idx, "          {isFetchingCategory ? <NewsSkeleton /> : (<div className=\"w-full flex flex-col gap-[var(--grid-gap)]\">\n")
        lines.insert(end_idx + 2, "          </div>)}\n") # end_idx+1 is due to insert above

wrap_layout("function DesktopLayout", "{/* Featured feed card */}", "</button>")
wrap_layout("function TabletLayout", "{/* Featured article */}", "</button>")
wrap_layout("function MobileLayout", "{/* Featured article */}", "</button>")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Wrapped layouts!")