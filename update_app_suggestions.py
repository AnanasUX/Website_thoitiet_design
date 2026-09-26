import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update MUA_NHO
content = content.replace(
    '"? Điều khiển phương tiện: Giảm tốc độ, giữ khoảng cách an toàn, tránh phanh gấp."',
    '"? Điều khiển phương tiện: Giảm tốc độ, giữ khoảng cách an toàn, tránh phanh gấp."'
)
content = content.replace(
    '"? Trang bị: Nên mặc áo mưa, bọc kỹ thiết bị điện tử."',
    '"? Trang bị: Nên mặc áo mưa, bọc kỹ thiết bị điện tử."'
)
# Note: In App.tsx it might be using the emoji list bullets.
# Let's write a smarter regex or just replace the exact text.