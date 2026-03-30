import random
import base64
import os
import json
from io import BytesIO
from PIL import Image, ImageDraw

def create_thumbnail(config):
    """
    Create a simple thumbnail image representation of the room design
    
    In a production environment, this would use the actual 3D engine to render a thumbnail
    For this prototype, we generate a simple colored rectangle
    
    Args:
        config (dict): Room configuration
        
    Returns:
        str: Base64 encoded thumbnail image
    """
    # Create a new image with room dimensions
    # Scale down real dimensions to fit in an image
    width = int(config["dimensions"]["width"] * 50)
    length = int(config["dimensions"]["length"] * 50)
    
    # Ensure minimum size
    width = max(width, 300)
    length = max(length, 300)
    
    # Create base image
    img = Image.new('RGB', (width, length), color=config["colors"]["walls"])
    draw = ImageDraw.Draw(img)
    
    # Draw floor
    floor_color = config["colors"]["floor"]
    draw.rectangle([10, 10, width-10, length-10], fill=floor_color)
    
    # Draw some basic furniture outlines based on the room type
    if "furniture" in config and config["furniture"]:
        for furniture in config["furniture"]:
            # Convert 3D coordinates to 2D for thumbnail
            pos_x = int((furniture["position"]["x"] + config["dimensions"]["width"]/2) * 
                        (width / config["dimensions"]["width"]))
            pos_z = int((furniture["position"]["z"] + config["dimensions"]["length"]/2) * 
                        (length / config["dimensions"]["length"]))
            
            size = int(furniture["scale"] * 20)
            
            # Draw furniture as simple rectangles
            draw.rectangle([pos_x-size, pos_z-size, pos_x+size, pos_z+size], 
                          fill="#777777", outline="#000000")
    
    # Save to BytesIO object
    buffered = BytesIO()
    img.save(buffered, format="JPEG", quality=85)
    
    # Encode to base64
    encoded_img = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return f"data:image/jpeg;base64,{encoded_img}"

def generate_default_config(room_type, style):
    """
    Generate default room configuration based on room type and style
    
    Args:
        room_type (str): Type of room (living_room, bedroom, etc.)
        style (str): Design style (modern, scandinavian, etc.)
        
    Returns:
        dict: Default room configuration
    """
    # Base configurations by room type
    room_configs = {
        "living_room": {
            "dimensions": {"width": 5.0, "length": 6.0, "height": 2.8},
            "furniture": [
                {
                    "name": "Sofa", 
                    "position": {"x": 1.5, "y": 0, "z": 0}, 
                    "rotation": 0, 
                    "scale": 1.0
                },
                {
                    "name": "Coffee Table", 
                    "position": {"x": 0, "y": 0, "z": 1.2}, 
                    "rotation": 0, 
                    "scale": 0.8
                },
                {
                    "name": "TV Stand", 
                    "position": {"x": -1.8, "y": 0, "z": 0}, 
                    "rotation": 0, 
                    "scale": 1.0
                }
            ]
        },
        "bedroom": {
            "dimensions": {"width": 4.0, "length": 5.0, "height": 2.8},
            "furniture": [
                {
                    "name": "Bed", 
                    "position": {"x": 0, "y": 0, "z": 0}, 
                    "rotation": 0, 
                    "scale": 1.0
                },
                {
                    "name": "Nightstand", 
                    "position": {"x": 1.2, "y": 0, "z": 0.6}, 
                    "rotation": 0, 
                    "scale": 0.7
                },
                {
                    "name": "Wardrobe", 
                    "position": {"x": -1.5, "y": 0, "z": -1.5}, 
                    "rotation": 90, 
                    "scale": 1.0
                }
            ]
        },
        "kitchen": {
            "dimensions": {"width": 4.5, "length": 5.0, "height": 2.8},
            "furniture": [
                {
                    "name": "Kitchen Counter", 
                    "position": {"x": 1.5, "y": 0, "z": 0}, 
                    "rotation": 0, 
                    "scale": 1.0
                },
                {
                    "name": "Refrigerator", 
                    "position": {"x": 1.8, "y": 0, "z": 1.5}, 
                    "rotation": 0, 
                    "scale": 1.0
                },
                {
                    "name": "Dining Table", 
                    "position": {"x": -1.2, "y": 0, "z": -0.5}, 
                    "rotation": 0, 
                    "scale": 0.9
                }
            ]
        },
        "bathroom": {
            "dimensions": {"width": 3.0, "length": 3.5, "height": 2.8},
            "furniture": [
                {
                    "name": "Bathtub", 
                    "position": {"x": 0.8, "y": 0, "z": 0}, 
                    "rotation": 0, 
                    "scale": 1.0
                },
                {
                    "name": "Sink", 
                    "position": {"x": -0.8, "y": 0, "z": 0.8}, 
                    "rotation": 0, 
                    "scale": 0.7
                },
                {
                    "name": "Toilet", 
                    "position": {"x": -0.8, "y": 0, "z": -0.8}, 
                    "rotation": 0, 
                    "scale": 0.7
                }
            ]
        },
        "office": {
            "dimensions": {"width": 4.0, "length": 4.5, "height": 2.8},
            "furniture": [
                {
                    "name": "Desk", 
                    "position": {"x": 0, "y": 0, "z": -1.0}, 
                    "rotation": 0, 
                    "scale": 1.0
                },
                {
                    "name": "Office Chair", 
                    "position": {"x": 0, "y": 0, "z": -0.3}, 
                    "rotation": 180, 
                    "scale": 0.9
                },
                {
                    "name": "Bookshelf", 
                    "position": {"x": 1.5, "y": 0, "z": 0}, 
                    "rotation": 90, 
                    "scale": 1.0
                }
            ]
        },
        "dining": {
            "dimensions": {"width": 4.5, "length": 5.0, "height": 2.8},
            "furniture": [
                {
                    "name": "Dining Table", 
                    "position": {"x": 0, "y": 0, "z": 0}, 
                    "rotation": 0, 
                    "scale": 1.0
                },
                {
                    "name": "Dining Chair", 
                    "position": {"x": 0, "y": 0, "z": 1.0}, 
                    "rotation": 180, 
                    "scale": 0.8
                },
                {
                    "name": "Sideboard", 
                    "position": {"x": 1.8, "y": 0, "z": 0}, 
                    "rotation": 90, 
                    "scale": 1.0
                }
            ]
        }
    }
    
    # Default room if type not found
    default_room = {
        "dimensions": {"width": 4.5, "length": 6.0, "height": 2.8},
        "furniture": []
    }
    
    # Get base config by room type
    config = room_configs.get(room_type, default_room)
    
    # Style-based color schemes
    style_colors = {
        "modern": {
            "walls": "#F5F5F5",
            "floor": "#808080"
        },
        "scandinavian": {
            "walls": "#FFFFFF",
            "floor": "#DEB887"
        },
        "minimalist": {
            "walls": "#FFFFFF",
            "floor": "#F5F5F5"
        },
        "industrial": {
            "walls": "#D3D3D3",
            "floor": "#696969"
        },
        "traditional": {
            "walls": "#FFF8DC",
            "floor": "#8B4513"
        },
        "bohemian": {
            "walls": "#FFFAF0",
            "floor": "#CD853F"
        },
        "mid_century": {
            "walls": "#FFF8E1",
            "floor": "#A87329"
        }
    }
    
    # Get colors by style
    colors = style_colors.get(style, style_colors["modern"])
    config["colors"] = colors
    
    # Set lighting based on style
    lighting_config = {
        "modern": {"intensity": 70, "warmth": 50},
        "scandinavian": {"intensity": 80, "warmth": 40},
        "minimalist": {"intensity": 75, "warmth": 50},
        "industrial": {"intensity": 60, "warmth": 30},
        "traditional": {"intensity": 65, "warmth": 70},
        "bohemian": {"intensity": 60, "warmth": 80},
        "mid_century": {"intensity": 70, "warmth": 60}
    }
    
    config["lighting"] = lighting_config.get(style, {"intensity": 70, "warmth": 50})
    config["style"] = style
    
    return config
