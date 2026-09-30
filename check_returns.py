with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def get_return(func_name):
    idx = content.find("function " + func_name)
    ret_idx = content.find("return (", idx)
    return content[ret_idx:ret_idx+200]

print("Mobile:", get_return("MobileLayout"))
print("Tablet:", get_return("TabletLayout"))
print("Desktop:", get_return("DesktopLayout"))