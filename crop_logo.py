from PIL import Image

def crop_logo():
    # Load image
    img = Image.open('public/2 - 1.png')
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        # Crop to bounding box (removes empty space)
        trimmed = img.crop(bbox)
        
        # We assume the text "corretora de seguros" is at the bottom.
        # Let's crop the bottom 25% of the image.
        width, height = trimmed.size
        # The text is usually small and at the bottom. Let's crop bottom 20%.
        new_height = int(height * 0.82)
        
        final_img = trimmed.crop((0, 0, width, new_height))
        
        # Save the final image
        final_img.save('public/logo-cajuina.png')
        print(f"Original size: {img.size}")
        print(f"Trimmed size: {trimmed.size}")
        print(f"Final size: {final_img.size}")
    else:
        print("Image is completely transparent.")

if __name__ == '__main__':
    crop_logo()
