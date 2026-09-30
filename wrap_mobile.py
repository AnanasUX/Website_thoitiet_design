with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

def wrap_layout(func, start_marker, end_marker, exact=False):
    s_idx = -1
    e_idx = -1
    in_func = False
    
    for i, line in enumerate(lines):
        if func in line:
            in_func = True
        if in_func and start_marker in line and s_idx == -1:
            s_idx = i
        if in_func and s_idx != -1 and i > s_idx:
            if exact:
                if line.strip('\n') == end_marker:
                    e_idx = i
                    break
            else:
                if end_marker in line:
                    e_idx = i
                    break
                    
    if s_idx != -1 and e_idx != -1:
        lines.insert(s_idx, "          {isFetchingCategory ? <NewsSkeleton /> : (<div className=\"w-full flex flex-col gap-[var(--grid-gap)]\">\n")
        lines.insert(e_idx + 2, "          </div>)}\n")
        return True
    return False

print("Mobile:", wrap_layout("function MobileLayout", "{/* Featured article */}", "        </div>", exact=True))

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Finished wrapping Mobile!")