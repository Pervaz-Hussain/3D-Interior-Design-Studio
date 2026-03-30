#!/usr/bin/env python3
"""
Simple room generator model for interior design app

This script provides a basic implementation for generating room layouts
based on user prompts. It creates a simple JSON configuration that
can be used by the Three.js frontend.
"""

import sys
import json
import random
import uuid
import math
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def generate_room_design(prompt, room_type, style):
    """Generate a room design based on text prompt"""
    # Parse prompt for room size preferences
    width = random.randint(4, 7)  # 4-7 meters
    length = random.randint(4, 7)  # 4-7 meters
    height = 2.7  # Standard ceiling height
    
    # Analyze keywords in prompt
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
    
    # Generate furniture
    furniture = []
    
    if room_type == "living_room":
        # Sofa
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
            "rotation": {"x": 0, "y": math.pi, "z": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "color": "#444444" if style == "modern" else "#A0522D",
            "model": "/furniture/tv_stand.glb"
        })
    
    elif room_type == "bedroom":
        # Bed
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
    
    elif room_type == "kitchen":
        # Kitchen Counter
        furniture.append({
            "id": str(uuid.uuid4()),
            "name": "Kitchen Counter",
            "position": {"x": 0.6, "y": 0.5, "z": length/2},
            "rotation": {"x": 0, "y": math.pi/2, "z": 0},
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
        
        # Chairs (simplified)
        for i in range(4):
            angle = i * math.pi / 2
            chair_x = width*0.6 + 0.7 * math.cos(angle)
            chair_z = length*0.6 + 0.7 * math.sin(angle)
            
            furniture.append({
                "id": str(uuid.uuid4()),
                "name": "Dining Chair",
                "position": {"x": chair_x, "y": 0.25, "z": chair_z},
                "rotation": {"x": 0, "y": angle + math.pi, "z": 0},
                "scale": {"x": 0.8, "y": 0.8, "z": 0.8},
                "color": "#444444" if style == "modern" else "#A0522D",
                "model": "/furniture/dining_chair.glb"
            })
    
    # Add windows if mentioned
    windows = []
    if "window" in prompt.lower():
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
    
    # Add doors if mentioned
    doors = []
    if "door" in prompt.lower():
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
            "rotation": math.pi,
            "isOpen": False
        })
    
    # Create room config
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
    
    if windows:
        room_config["windows"] = windows
    if doors:
        room_config["doors"] = doors
    
    # Generate a simple thumbnail
    thumbnail = create_thumbnail(room_config)
    
    return {
        "config": room_config,
        "thumbnail": thumbnail
    }

def create_thumbnail(config):
    """Create a simple thumbnail representation of the room design"""
    width = 300
    height = 200
    
    # Create a new image with colored background
    style_colors = {
        'modern': (200, 200, 200),
        'minimalist': (240, 240, 240),
        'industrial': (180, 180, 180),
        'scandinavian': (240, 240, 245),
        'bohemian': (220, 200, 180),
        'traditional': (225, 215, 200)
    }
    
    bg_color = style_colors.get(config['style'], (220, 220, 220))
    image = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(image)
    
    # Draw room outline
    margin = 20
    room_rect = ((margin, margin), (width - margin, height - margin))
    draw.rectangle(room_rect, fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    
    # Add text label
    try:
        try:
            font = ImageFont.truetype('Arial', 16)
        except:
            font = ImageFont.load_default()
            
        room_label = f"{config['roomType']} ({config['style']})"
        draw.text((width // 2, height // 2), room_label, fill=(0, 0, 0), anchor="mm", font=font)
    except:
        # If text rendering fails, continue without text
        pass
    
    # Draw furniture (optional)
    if 'furniture' in config and config['furniture']:
        for item in config['furniture']:
            # Scale position to thumbnail
            rel_x = item['position']['x'] / config['dimensions']['width']
            rel_z = item['position']['z'] / config['dimensions']['length']
            
            x = margin + rel_x * (width - 2 * margin)
            y = margin + rel_z * (height - 2 * margin)
            
            # Draw as small rectangle
            size = 10
            rect_coords = ((x - size//2, y - size//2), (x + size//2, y + size//2))
            draw.rectangle(rect_coords, fill=(100, 100, 100))
    
    # Convert to base64
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def main():
    """Process command line arguments and generate room design"""
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

if __name__ == "__main__":
    main()