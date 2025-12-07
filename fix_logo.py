from PIL import Image
import os

def make_transparent(input_path, output_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 200 and item[1] > 200 and item[2] > 200:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully saved transparent logo to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

# Use the original uploaded JPG source to avoid "renamed png" issues
source =r"C:\Users\Darshan C P\OneDrive\Desktop\god\static\logo.png" 
# Note: It was copied as logo.png but might still be jpg content. PIL handles content detection.
make_transparent(source, r"C:\Users\Darshan C P\OneDrive\Desktop\god\static\logo.png")
