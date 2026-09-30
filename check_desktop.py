with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

def wrap(func, start, end):
    in_func = False
    s_idx = -1
    e_idx = -1
    for i, line in enumerate(lines):
        if func in line:
            in_func = True
        if in_func and start in line and s_idx == -1:
            s_idx = i
        if in_func and end in line and s_idx != -1:
            e_idx = i
            break
    if s_idx != -1 and e_idx != -1:
        lines.insert(s_idx, "          {isFetchingCategory ? <NewsSkeleton /> : (<div className=\"w-full flex flex-col gap-[var(--grid-gap)]\">\n")
        lines.insert(e_idx + 2, "          </div>)}\n")
        return True
    return False

wrap("function DesktopLayout", "{/* Featured feed card */}", "{/* Weather column */}")
# Wait, Weather column is BEFORE News column in DesktopLayout? Yes!
# So what is AFTER the grid?