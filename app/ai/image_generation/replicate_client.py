import replicate
import json
import time
from tqdm import tqdm 
import os 

def read_text(filepath):
    with open(filepath, "r") as file:
        lines = file.readlines()
    return [line.strip() for line in lines]

def read_json(filepath):
    with open(filepath, "r") as file:
        return json.load(file) 

def write_json(filepath, data):
    with open(filepath, "w") as file:
        json.dump(data, file, indent=4)

vocab_json = "/home/tuyendt/Desktop/snap-learn-app/app/ai/vocab_generation/vocab.json"
image_out_folder = "/home/tuyendt/Desktop/snap-learn-app/app/ai/image_generation/final_images"
metadata_out = "final_metadata.json"
model_name = "openai/gpt-image-1.5"

objects = read_json(vocab_json)

for vocab in tqdm(objects):

    object_name = vocab["word_en"]
    prompt = f"""
    A vibrant, high-quality 3D cartoon-style illustration of a single {object_name}, designed for a children's educational flashcard app. The object is centered, large, and takes up most of the frame. It has smooth rounded shapes, bright cheerful colors, and a friendly, toy-like appearance.
    Lighting is soft and even, with gentle shadows to give depth. The background is a clean pastel gradient (light blue, soft yellow, or pink), with no clutter or distractions.
    The style is consistent, modern, and visually appealing to kids, similar to collectible learning cards. No text, no multiple objects, no watermark.
    """.strip()

    output = replicate.run(
        model_name,
        input={
            "prompt": prompt,
            "quality": "medium",
            "background": "auto",
            "moderation": "auto",
            "aspect_ratio": "1:1",
            "output_format": "png",
            "input_fidelity": "low",
            "number_of_images": 1,
            "output_compression": 90
        }
    )

    # To write the file to disk:
    image_path = os.path.join(image_out_folder, f"{object_name}.png")
    with open(image_path, "wb") as file:
        file.write(output[0].read())
    vocab["photo_url"] = image_path
    write_json(metadata_out, objects)
    
    time.sleep(1)