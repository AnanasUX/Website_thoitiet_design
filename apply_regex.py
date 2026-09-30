import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# DesktopLayout
content = re.sub(
    r'(function DesktopLayout.*?\{/\* Featured feed card \*/\})',
    r'{isFetchingCategory ? <NewsSkeleton /> : (<>\n\1',
    content, flags=re.DOTALL
)
content = re.sub(
    r'(function DesktopLayout.*?)(\n          <div className="flex items-start justify-center py-2 w-full">)',
    r'\1\n          </>)}\2',
    content, flags=re.DOTALL
)

# TabletLayout
content = re.sub(
    r'(function TabletLayout.*?\{/\* Featured article \*/\})',
    r'{isFetchingCategory ? <NewsSkeleton /> : (<>\n\1',
    content, flags=re.DOTALL
)
# For Tablet, the end is exactly before:
#           </div>
#         </div>
#       </div>
#     </div>
#   );
# }
content = re.sub(
    r'(function TabletLayout.*?)(\n          </div>\n        </div>\n      </div>\n    </div>\n  \);\n\})',
    r'\1\n          </>)}\2',
    content, flags=re.DOTALL
)

# MobileLayout
content = re.sub(
    r'(function MobileLayout.*?\{/\* Featured article \*/\})',
    r'{isFetchingCategory ? <NewsSkeleton /> : (<>\n\1',
    content, flags=re.DOTALL
)
content = re.sub(
    r'(function MobileLayout.*?)(\n        </div>\n      </div>\n    </div>\n  \);\n\})',
    r'\1\n          </>)}\2',
    content, flags=re.DOTALL
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Regex replace applied")