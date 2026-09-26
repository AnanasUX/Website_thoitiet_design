import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the text inside the strings, ignoring the prefix icon:
content = content.replace("Tầm nhìn xa tốt, lái xe bình thường.", "Giao thông thuận lợi, chú ý chống chói khi lái xe.")
content = content.replace("Mang theo kính mát, áo khoác mỏng nếu di chuyển lâu.", "Nên đội mũ, đeo kính râm, bôi kem chống nắng nếu ra ngoài lâu.")
content = content.replace("Tránh di chuyển khung giờ 11h-15h. Đeo kính râm che chắn tốt.", "Hạn chế di chuyển giờ cao điểm nắng (11h-15h). Đỗ xe ở nơi có bóng râm, kiểm tra áp suất lốp.")
content = content.replace("Áo chống nắng dày, bôi kem chống nắng, mang theo nước uống.", "Bắt buộc đội mũ rộng vành, đeo kính râm UV400, mang theo nước uống, bôi kem chống nắng SPF50+.")
content = content.replace("Bật đèn chiếu gần (đèn sương mù) để tăng độ nhận diện. Chú ý quan sát.", "Tầm nhìn hơi giảm, nên bật đèn chiếu gần khi đi vào khu vực tối.")
content = content.replace("Mang theo áo mưa dự phòng vì có thể mưa bất chợt.", "Mang theo áo mưa mỏng phòng trường hợp mưa bất ngờ.")
content = content.replace("Giảm tốc độ, giữ khoảng cách an toàn.", "Giảm tốc độ, giữ khoảng cách an toàn, tránh phanh gấp.")
content = content.replace("Mang theo áo mưa mỏng hoặc ô dự phòng.", "Nên mặc áo mưa, bọc kỹ thiết bị điện tử.")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced all default strings in App.tsx")