with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def get_content_wrapper(func_name):
    idx = content.find("function " + func_name)
    ret_idx = content.find("return (", idx)
    header_end = content.find("</div>", content.find("var(--header-height)", ret_idx)) + 6
    return content[header_end:header_end+200]

print("Desktop:", get_content_wrapper("DesktopLayout"))