from PIL import Image
img = Image.open("public/profile.jpg")
img.thumbnail((64, 64))
img.save("public/favicon.png", "PNG")