with open("doc_content.txt", "r", encoding="utf-8") as f:
    text = f.read()
    # Print ascii representation or safe string to avoid console crash
    print(text.encode("ascii", "ignore").decode("ascii")[:2000])