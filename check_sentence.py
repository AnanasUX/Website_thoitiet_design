with open("DOCS_ANX.md", "r", encoding="utf-8") as f:
    text = f.read()
    print("Length:", len(text))
    # just print the exact sentence to confirm
    import re
    match = re.search(r'Đã nạp thành công toàn bộ dữ liệu hệ thống AnX. Xin mời đưa ra yêu cầu nâng cấp tiếp theo!', text)
    print("Sentence found!" if match else "Sentence not found - maybe encoded differently?")