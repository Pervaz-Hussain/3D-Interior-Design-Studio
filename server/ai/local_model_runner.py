#!/usr/bin/env python3
"""
Runner script for local_model.py

This script is used to invoke the local AI model for room design generation
from the Node.js server. It takes command line arguments and returns JSON output.
"""

import sys
import json
import random
import uuid
import os
import math
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def generate_room_design(prompt, room_type, style):
    """
    Generate a room design based on text prompt
    
    Args:
        prompt (str): User's text description
        room_type (str): Type of room (living_room, bedroom, etc)
        style (str): Design style (modern, minimalist, etc)
        
    Returns:
        dict: Room configuration data
    """
    # Parse prompt for room size preferences
    width = random.randint(4, 7)  # 4-7 meters
    length = random.randint(4, 7)  # 4-7 meters
    height = 2.7  # Standard ceiling height
    
    # Analyzing keywords in prompt
    if "small" in prompt.lower():
        width = max(3, width - 1)
        length = max(3, length - 1)
    elif "large" in prompt.lower() or "spacious" in prompt.lower():
        width += 1
        length += 1
    
    # Wall colors based on style
    wall_colors = {
        "modern": "#FFFFFF",
        "minimalist": "#F5F5F5",
        "industrial": "#E0E0E0",
        "scandinavian": "#FFFFFF",
        "bohemian": "#F5F5DC",
        "traditional": "#FFF8E1"
    }
    
    # Floor textures based on style
    floor_textures = {
        "modern": "wood_floor",
        "minimalist": "light_wood",
        "industrial": "concrete",
        "scandinavian": "light_wood",
        "bohemian": "carpet",
        "traditional": "wood_floor"
    }
    
    wall_color = wall_colors.get(style, "#FFFFFF")
    floor_texture = floor_textures.get(style, "wood_floor")
    
    # Generate the walls
    walls = [
        {
            "id": str(uuid.uuid4()),
            "start": {"x": 0, "z": 0},
            "end": {"x": width, "z": 0},
            "height": height,
            "color": wall_color
        },
        {
            "id": str(uuid.uuid4()),
            "start": {"x": width, "z": 0},
            "end": {"x": width, "z": length},
            "height": height,
            "color": wall_color
        },
        {
            "id": str(uuid.uuid4()),
            "start": {"x": width, "z": length},
            "end": {"x": 0, "z": length},
            "height": height,
            "color": wall_color
        },
        {
            "id": str(uuid.uuid4()),
            "start": {"x": 0, "z": length},
            "end": {"x": 0, "z": 0},
            "height": height,
            "color": wall_color
        }
    ]
    
    # Generate furniture based on room type
    furniture = generate_furniture(room_type, style, width, length)
    
    # Generate room config
    room_config = {
        "dimensions": {
            "width": width,
            "length": length,
            "height": height
        },
        "walls": walls,
        "floor": {
            "color": "#CCCCCC" if style == "modern" else "#AA8866",
            "texture": floor_texture
        },
        "ceiling": {
            "color": "#FFFFFF"
        },
        "roomType": room_type,
        "style": style,
        "furniture": furniture
    }
    
    # Generate windows and doors if mentioned in prompt
    if "window" in prompt.lower():
        room_config["windows"] = generate_windows(width, length)
    
    if "door" in prompt.lower():
        room_config["doors"] = generate_doors(width, length)
    
    # Generate thumbnail
    thumbnail = create_room_thumbnail(room_config)
    
    return {
        "config": room_config,
        "thumbnail": thumbnail
    }

def generate_windows(width, length):
    """Generate window placements"""
    windows = []
    
    # Add a window to one wall
    wall_choice = random.randint(0, 3)
    
    if wall_choice == 0:  # North wall
        windows.append({
            "id": str(uuid.uuid4()),
            "position": {
                "x": width / 2,
                "y": 1.2,
                "z": 0.1
            },
            "dimensions": {
                "width": 1.5,
                "height": 1.2
            },
            "rotation": 0
        })
    elif wall_choice == 1:  # East wall
        windows.append({
            "id": str(uuid.uuid4()),
            "position": {
                "x": width - 0.1,
                "y": 1.2,
                "z": length / 2
            },
            "dimensions": {
                "width": 1.5,
                "height": 1.2
            },
            "rotation": 1.57 # PI/2
        })
    elif wall_choice == 2:  # South wall
        windows.append({
            "id": str(uuid.uuid4()),
            "position": {
                "x": width / 2,
                "y": 1.2,
                "z": length - 0.1
            },
            "dimensions": {
                "width": 1.5,
                "height": 1.2
            },
            "rotation": math.PI
        })
    else:  # West wall
        windows.append({
            "id": str(uuid.uuid4()),
            "position": {
                "x": 0.1,
                "y": 1.2,
                "z": length / 2
            },
            "dimensions": {
                "width": 1.5,
                "height": 1.2
            },
            "rotation": 3 * math.PI / 2
        })
    
    return windows

def generate_doors(width, length):
    """Generate door placements"""
    doors = []
    
    # Add a door to one wall (typically the south or west wall)
    wall_choice = random.randint(2, 3)
    
    if wall_choice == 2:  # South wall
        doors.append({
            "id": str(uuid.uuid4()),
            "position": {
                "x": width / 4,
                "y": 1.1,
                "z": length - 0.1
            },
            "dimensions": {
                "width": 0.9,
                "height": 2.1
            },
            "rotation": math.PI,
            "isOpen": False
        })
    else:  # West wall
        doors.append({
            "id": str(uuid.uuid4()),
            "position": {
                "x": 0.1,
                "y": 1.1,
                "z": length / 4
            },
            "dimensions": {
                "width": 0.9,
                "height": 2.1
            },
            "rotation": 3 * math.PI / 2,
            "isOpen": False
        })
    
    return doors

def generate_furniture(room_type, style, width, length):
    """Generate furniture based on room type and style"""
    furniture = []
    
    if room_type == "living_room":
        # Sofa placement
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Sofa",
            "position": {"x": width/4, "y": 0.4, "z": length/2},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "color": "#555555" if style == "modern" else "#8B4513",
            "model": "/furniture/sofa.glb"
        })
        
        # Coffee table
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Coffee Table",
            "position": {"x": width/4, "y": 0.2, "z": length/2 + 1},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "scale": {"x": 0.8, "y": 0.8, "z": 0.8},
            "color": "#333333" if style == "modern" else "#8B4513",
            "model": "/furniture/coffee_table.glb"
        })
        
        # TV Stand
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "TV Stand",
            "position": {"x": 3*width/4, "y": 0.3, "z": length/2},
            "rotation": {"x": 0, "y": math.PI, "z": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "color": "#444444" if style == "modern" else "#A0522D",
            "model": "/furniture/tv_stand.glb"
        })
        
    elif room_type == "bedroom":
        # Bed placement
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Bed",
            "position": {"x": width/2, "y": 0.3, "z": length/2},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "color": "#555555" if style == "modern" else "#8B4513",
            "model": "/furniture/bed.glb"
        })
        
        # Nightstand
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Nightstand",
            "position": {"x": width/2 + 1, "y": 0.25, "z": length/2 - 0.6},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "scale": {"x": 0.7, "y": 0.7, "z": 0.7},
            "color": "#444444" if style == "modern" else "#A0522D",
            "model": "/furniture/nightstand.glb"
        })
        
        # Wardrobe
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Wardrobe",
            "position": {"x": width - 0.6, "y": 1, "z": length/4},
            "rotation": {"x": 0, "y": math.PI/2, "z": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "color": "#444444" if style == "modern" else "#A0522D",
            "model": "/furniture/wardrobe.glb"
        })
        
    elif room_type == "kitchen":
        # Kitchen Counter
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Kitchen Counter",
            "position": {"x": 0.6, "y": 0.5, "z": length/2},
            "rotation": {"x": 0, "y": math.PI/2, "z": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "color": "#EEEEEE" if style == "modern" else "#F5F5DC",
            "model": "/furniture/kitchen_counter.glb"
        })
        
        # Dining Table
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Dining Table",
            "position": {"x": width*0.6, "y": 0.4, "z": length*0.6},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "color": "#555555" if style == "modern" else "#8B4513",
            "model": "/furniture/dining_table.glb"
        })
        
        # Add chairs around the table
        for i in range(4):
            angle = i * math.PI / 2
            chair_x = width*0.6 + 0.7 * math.cos(angle)
            chair_z = length*0.6 + 0.7 * math.sin(angle)
            
            furniture.append({
                "id": str(uuid.uuid4()),
                "name": "Dining Chair",
                "position": {"x": chair_x, "y": 0.25, "z": chair_z},
                "rotation": {"x": 0, "y": angle + math.PI, "z": 0},
                "scale": {"x": 0.8, "y": 0.8, "z": 0.8},
                "color": "#444444" if style == "modern" else "#A0522D",
                "model": "/furniture/dining_chair.glb"
            })
    
    # Add a plant for decoration in all room types
    furniture.append({
        "id": str(uuid.uuid4()),
        "name": "Plant",
        "position": {"x": width - 0.8, "y": 0, "z": length - 0.8},
        "rotation": {"x": 0, "y": 0, "z": 0},
        "scale": {"x": 0.8, "y": 0.8, "z": 0.8},
        "model": "/furniture/plant.glb"
    })
    
    return furniture

def create_room_thumbnail(config):
    """
    Create a simple thumbnail representation of the room design
    
    Args:
        config (dict): Room configuration
        
    Returns:
        str: Base64 encoded thumbnail image
    """
    # Create a simple colored rectangle as a placeholder
    # In a real application, this would be a proper rendering
    
    width = 300
    height = 200
    
    # Create a new image with white background
    image = Image.new('RGB', (width, height), config.get('style', 'modern'))
    
    # Get a drawing context
    draw = ImageDraw.Draw(image)
    
    # Set background color based on style
    style_colors = {
        'modern': (200, 200, 200),
        'minimalist': (240, 240, 240),
        'industrial': (180, 180, 180),
        'scandinavian': (240, 240, 245),
        'bohemian': (220, 200, 180),
        'traditional': (225, 215, 200)
    }
    
    bg_color = style_colors.get(config['style'], (220, 220, 220))
    draw.rectangle([(0, 0), (width, height)], fill=bg_color)
    
    # Draw room outline
    margin = 20
    draw.rectangle(
        [(margin, margin), (width - margin, height - margin)], 
        fill=(255, 255, 255), 
        outline=(0, 0, 0), 
        width=2
    )
    
    # Try to add text
    try:
        # Try to load a font, use default if not available
        try:
            font = ImageFont.truetype('Arial', 16)
        except IOError:
            font = ImageFont.load_default()
            
        room_label = f"{config['roomType']} ({config['style']})"
        text_width = draw.textlength(room_label, font=font)
        draw.text(
            (width // 2 - text_width // 2, height // 2 - 8),
            room_label,
            fill=(0, 0, 0),
            font=font
        )
    except Exception as e:
        # If text rendering fails, continue without text
        pass
    
    # Draw a simple representation of furniture
    if 'furniture' in config and config['furniture']:
        for furniture in config['furniture']:
            # Scale furniture position to thumbnail
            rel_x = furniture['position']['x'] / config['dimensions']['width']
            rel_z = furniture['position']['z'] / config['dimensions']['length']
            
            x = margin + rel_x * (width - 2 * margin)
            y = margin + rel_z * (height - 2 * margin)
            
            # Draw furniture as small rectangles
            size = 10
            draw.rectangle(
                [(x - size // 2, y - size // 2), (x + size // 2, y + size // 2)], 
                fill=(100, 100, 100)
            )
    
    # Convert the image to base64
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def main():
    """
    Main entry point for the script.
    Expects three arguments:
    1. User prompt
    2. Room type
    3. Style
    """
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Missing arguments. Requires prompt, room_type, style"}))
        sys.exit(1)
    
    prompt = sys.argv[1]
    room_type = sys.argv[2]
    style = sys.argv[3]
    
    try:
        result = generate_room_design(prompt, room_type, style)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

# Python module compatibility
if __name__ == "__main__":
    main()