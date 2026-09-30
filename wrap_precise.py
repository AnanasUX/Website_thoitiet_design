with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

def wrap_func(func_name, start_marker, end_marker):
    s = -1
    e = -1
    in_func = False
    for i, line in enumerate(lines):
        if func_name in line:
            in_func = True
        if in_func and start_marker in line and s == -1:
            s = i
        if in_func and s != -1 and i > s and end_marker in line:
            e = i
            break
    if s != -1 and e != -1:
        lines.insert(s, "          {isFetchingCategory ? <NewsSkeleton /> : (<>\n")
        lines.insert(e + 2, "          </>)}\n")

# Desktop
wrap_func("function DesktopLayout", "{/* Featured feed card */}", "<div className=\"flex items-start justify-center py-2 w-full\">")
# Tablet ends after the grid map:
wrap_func("function TabletLayout", "{/* Featured article */}", "          </div>")
# Mobile ends after the map:
wrap_func("function MobileLayout", "{/* Featured article */}", "          </div>")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Wrapped precise")