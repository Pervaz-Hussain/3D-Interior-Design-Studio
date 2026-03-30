"""
Local AI Model Implementation for Interior Design Generation

This module provides a local implementation of the interior design generation algorithm
that can be used when external APIs are not allowed (academic setting).

The actual AI functionality would be replaced by a custom-trained model that
the user will train separately in Google Colab.
"""

import os
import json
import base64
import random
import time
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from io import BytesIO
import numpy as np
import math

# Constants for room generation
ROOM_TYPES = ['living_room', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining']
STYLES = ['modern', 'scandinavian', 'minimalist', 'industrial', 'traditional', 'bohemian', 'mid_century']
FURNITURE_CATEGORIES = ['seating', 'tables', 'storage', 'beds', 'lighting', 'decor']

class LocalRoomGenerator:
    """
    A local implementation of room layout generation based on deterministic algorithms
    instead of neural networks. This serves as a placeholder until the real model
    is trained and integrated.
    """
    
    def __init__(self):
        """Initialize the generator with default parameters"""
        self.random_seed = int(time.time())
        random.seed(self.random_seed)
        
        # Initialize color schemes
        self.color_schemes = {
            "modern": {
                "walls": "#F5F5F5",
                "floor": "#808080",
                "ceiling": "#FFFFFF",
                "accent": "#3498DB"
            },
            "scandinavian": {
                "walls": "#FFFFFF",
                "floor": "#DEB887",
                "ceiling": "#FFFFFF",
                "accent": "#5D8AA8"
            },
            "minimalist": {
                "walls": "#FFFFFF",
                "floor": "#F5F5F5",
                "ceiling": "#FFFFFF",
                "accent": "#000000"
            },
            "industrial": {
                "walls": "#D3D3D3",
                "floor": "#696969",
                "ceiling": "#A9A9A9",
                "accent": "#B87333"
            },
            "traditional": {
                "walls": "#FFF8DC",
                "floor": "#8B4513",
                "ceiling": "#FFFAF0",
                "accent": "#800020"
            },
            "bohemian": {
                "walls": "#FFFAF0",
                "floor": "#CD853F",
                "ceiling": "#FFF8DC",
                "accent": "#FF7F50"
            },
            "mid_century": {
                "walls": "#FFF8E1",
                "floor": "#A87329",
                "ceiling": "#FAFAFA",
                "accent": "#F4A460"
            }
        }
        
        # Initialize room dimensions by type
        self.room_dimensions = {
            "living_room": {"width": 5.0, "length": 6.0, "height": 2.8},
            "bedroom": {"width": 4.0, "length": 5.0, "height": 2.8},
            "kitchen": {"width": 4.5, "length": 5.0, "height": 2.8},
            "bathroom": {"width": 3.0, "length": 3.5, "height": 2.8},
            "office": {"width": 4.0, "length": 4.5, "height": 2.8},
            "dining": {"width": 4.5, "length": 5.0, "height": 2.8}
        }
        
        # Initialize lighting configs
        self.lighting_config = {
            "modern": {"intensity": 70, "warmth": 50},
            "scandinavian": {"intensity": 80, "warmth": 40},
            "minimalist": {"intensity": 75, "warmth": 50},
            "industrial": {"intensity": 60, "warmth": 30},
            "traditional": {"intensity": 65, "warmth": 70},
            "bohemian": {"intensity": 60, "warmth": 80},
            "mid_century": {"intensity": 70, "warmth": 60}
        }
        
        # Initialize standard furniture layouts by room type
        self.furniture_layouts = {
            "living_room": [
                {"name": "Sofa", "position": {"x": 1.5, "y": 0, "z": 0}, "rotation": 0, "scale": 1.0},
                {"name": "Coffee Table", "position": {"x": 0, "y": 0, "z": 1.2}, "rotation": 0, "scale": 0.8},
                {"name": "TV Stand", "position": {"x": -1.8, "y": 0, "z": 0}, "rotation": 0, "scale": 1.0},
                {"name": "Side Table", "position": {"x": 2.5, "y": 0, "z": 0.8}, "rotation": 0, "scale": 0.7},
                {"name": "Floor Lamp", "position": {"x": 2.5, "y": 0, "z": 1.5}, "rotation": 0, "scale": 0.9}
            ],
            "bedroom": [
                {"name": "Bed", "position": {"x": 0, "y": 0, "z": 0}, "rotation": 0, "scale": 1.0},
                {"name": "Nightstand", "position": {"x": 1.2, "y": 0, "z": 0.6}, "rotation": 0, "scale": 0.7},
                {"name": "Wardrobe", "position": {"x": -1.5, "y": 0, "z": -1.5}, "rotation": 90, "scale": 1.0},
                {"name": "Dresser", "position": {"x": 1.5, "y": 0, "z": -1.5}, "rotation": 0, "scale": 0.9},
                {"name": "Reading Lamp", "position": {"x": 1.2, "y": 0.5, "z": 0.6}, "rotation": 0, "scale": 0.5}
            ],
            "kitchen": [
                {"name": "Kitchen Counter", "position": {"x": 1.5, "y": 0, "z": 0}, "rotation": 0, "scale": 1.0},
                {"name": "Refrigerator", "position": {"x": 1.8, "y": 0, "z": 1.5}, "rotation": 0, "scale": 1.0},
                {"name": "Dining Table", "position": {"x": -1.2, "y": 0, "z": -0.5}, "rotation": 0, "scale": 0.9},
                {"name": "Dining Chair", "position": {"x": -1.2, "y": 0, "z": 0.2}, "rotation": 180, "scale": 0.8},
                {"name": "Kitchen Island", "position": {"x": 0, "y": 0, "z": 0}, "rotation": 0, "scale": 0.9}
            ],
            "bathroom": [
                {"name": "Bathtub", "position": {"x": 0.8, "y": 0, "z": 0}, "rotation": 0, "scale": 1.0},
                {"name": "Sink", "position": {"x": -0.8, "y": 0, "z": 0.8}, "rotation": 0, "scale": 0.7},
                {"name": "Toilet", "position": {"x": -0.8, "y": 0, "z": -0.8}, "rotation": 0, "scale": 0.7},
                {"name": "Bathroom Cabinet", "position": {"x": -0.8, "y": 0.8, "z": 0.8}, "rotation": 0, "scale": 0.6},
                {"name": "Towel Rack", "position": {"x": 0.8, "y": 0.8, "z": 0.8}, "rotation": 0, "scale": 0.5}
            ],
            "office": [
                {"name": "Desk", "position": {"x": 0, "y": 0, "z": -1.0}, "rotation": 0, "scale": 1.0},
                {"name": "Office Chair", "position": {"x": 0, "y": 0, "z": -0.3}, "rotation": 180, "scale": 0.9},
                {"name": "Bookshelf", "position": {"x": 1.5, "y": 0, "z": 0}, "rotation": 90, "scale": 1.0},
                {"name": "File Cabinet", "position": {"x": -1.5, "y": 0, "z": -1.0}, "rotation": 0, "scale": 0.8},
                {"name": "Desk Lamp", "position": {"x": 0.5, "y": 0.5, "z": -1.0}, "rotation": 45, "scale": 0.5}
            ],
            "dining": [
                {"name": "Dining Table", "position": {"x": 0, "y": 0, "z": 0}, "rotation": 0, "scale": 1.0},
                {"name": "Dining Chair", "position": {"x": 0, "y": 0, "z": 1.0}, "rotation": 180, "scale": 0.8},
                {"name": "Dining Chair", "position": {"x": 0, "y": 0, "z": -1.0}, "rotation": 0, "scale": 0.8},
                {"name": "Dining Chair", "position": {"x": 1.0, "y": 0, "z": 0}, "rotation": 90, "scale": 0.8},
                {"name": "Dining Chair", "position": {"x": -1.0, "y": 0, "z": 0}, "rotation": 270, "scale": 0.8},
                {"name": "Sideboard", "position": {"x": 1.8, "y": 0, "z": 0}, "rotation": 90, "scale": 1.0}
            ]
        }
    
    def generate_room(self, prompt, room_type, style):
        """
        Generate a room design based on prompt, room type, and style
        
        Args:
            prompt (str): User's description of desired room
            room_type (str): Type of room (living_room, bedroom, etc.)
            style (str): Design style (modern, scandinavian, etc.)
            
        Returns:
            dict: Room configuration data including dimensions, colors, furniture
        """
        # Validate inputs
        room_type = room_type.lower() if room_type in ROOM_TYPES else random.choice(ROOM_TYPES)
        style = style.lower() if style in STYLES else random.choice(STYLES)
        
        # Set random seed based on prompt for deterministic generation
        # This allows the same prompt to produce the same room
        self.random_seed = sum(ord(c) for c in prompt + room_type + style)
        random.seed(self.random_seed)
        
        # Get base room dimensions for the room type
        dimensions = dict(self.room_dimensions[room_type])
        
        # Modify dimensions based on prompt keywords
        self._adjust_dimensions_from_prompt(dimensions, prompt)
        
        # Get colors for the style
        colors = dict(self.color_schemes[style])
        
        # Get lighting settings
        lighting = dict(self.lighting_config[style])
        
        # Generate furniture layout
        furniture = self._generate_furniture_layout(room_type, style, prompt, dimensions)
        
        # Generate windows and doors
        windows = self._generate_windows(dimensions, prompt)
        doors = self._generate_doors(dimensions, prompt)
        
        # Combine everything into room configuration
        config = {
            "dimensions": dimensions,
            "colors": colors,
            "lighting": lighting,
            "furniture": furniture,
            "windows": windows,
            "doors": doors,
            "style": style
        }
        
        # Generate a thumbnail
        thumbnail = self.generate_thumbnail(config)
        
        return {
            "configuration": config,
            "thumbnail": thumbnail
        }
    
    def _adjust_dimensions_from_prompt(self, dimensions, prompt):
        """
        Adjust room dimensions based on keywords in the prompt
        
        Args:
            dimensions (dict): Base dimensions to adjust
            prompt (str): User's prompt to analyze
        """
        prompt_lower = prompt.lower()
        
        # Size adjustments
        if "large" in prompt_lower or "big" in prompt_lower or "spacious" in prompt_lower:
            dimensions["width"] *= random.uniform(1.2, 1.4)
            dimensions["length"] *= random.uniform(1.2, 1.4)
        elif "small" in prompt_lower or "tiny" in prompt_lower or "compact" in prompt_lower:
            dimensions["width"] *= random.uniform(0.7, 0.9)
            dimensions["length"] *= random.uniform(0.7, 0.9)
        
        # Height adjustments
        if "high ceiling" in prompt_lower or "tall ceiling" in prompt_lower:
            dimensions["height"] = random.uniform(3.2, 3.8)
        elif "low ceiling" in prompt_lower:
            dimensions["height"] = random.uniform(2.4, 2.6)
        
        # Round to 1 decimal place for cleaner values
        dimensions["width"] = round(dimensions["width"], 1)
        dimensions["length"] = round(dimensions["length"], 1)
        dimensions["height"] = round(dimensions["height"], 1)
    
    def _generate_furniture_layout(self, room_type, style, prompt, dimensions):
        """
        Generate furniture layout based on room type, style, and prompt
        
        Args:
            room_type (str): Type of room
            style (str): Design style
            prompt (str): User's prompt
            dimensions (dict): Room dimensions
            
        Returns:
            list: List of furniture items with positions
        """
        # Get base furniture for the room type
        base_furniture = self.furniture_layouts.get(room_type, [])
        
        # Create a copy to modify
        furniture = []
        for item in base_furniture:
            # Add some random variation to positions
            new_item = dict(item)
            
            # Scale positions relative to room dimensions
            width_ratio = dimensions["width"] / self.room_dimensions[room_type]["width"]
            length_ratio = dimensions["length"] / self.room_dimensions[room_type]["length"]
            
            # Adjust positions based on room size
            new_position = {
                "x": item["position"]["x"] * length_ratio,
                "y": item["position"]["y"],
                "z": item["position"]["z"] * width_ratio
            }
            
            # Add slight random variation for more natural placement
            new_position["x"] += random.uniform(-0.2, 0.2)
            new_position["z"] += random.uniform(-0.2, 0.2)
            
            # Adjust rotation and scale
            rotation = item["rotation"] + random.randint(-15, 15)
            scale = item["scale"] * random.uniform(0.9, 1.1)
            
            new_item["position"] = new_position
            new_item["rotation"] = rotation
            new_item["scale"] = scale
            
            furniture.append(new_item)
        
        # Check for style-specific additions
        style_items = []
        if style == "modern":
            style_items.append({
                "name": "Modern Art Piece",
                "position": {"x": -dimensions["length"]/3, "y": 1.5, "z": -dimensions["width"]/3},
                "rotation": 0,
                "scale": 0.8
            })
        elif style == "scandinavian":
            style_items.append({
                "name": "Indoor Plant",
                "position": {"x": dimensions["length"]/3, "y": 0, "z": -dimensions["width"]/3},
                "rotation": 0,
                "scale": 0.8
            })
        elif style == "bohemian":
            style_items.append({
                "name": "Decorative Rug",
                "position": {"x": 0, "y": 0.01, "z": 0},
                "rotation": 0,
                "scale": 1.2
            })
        
        # Add style-specific items
        furniture.extend(style_items)
        
        # Add IDs for reference
        for i, item in enumerate(furniture):
            item["itemId"] = i + 1
        
        return furniture
    
    def _generate_windows(self, dimensions, prompt):
        """
        Generate window configurations based on room dimensions and prompt
        
        Args:
            dimensions (dict): Room dimensions
            prompt (str): User's prompt
            
        Returns:
            list: Window configurations
        """
        windows = []
        
        # Default window positions
        window_configs = [
            {
                "wall": "back",
                "width": 1.2,
                "height": 1.0,
                "position": {"x": 0, "y": dimensions["height"]/2 + 0.2}
            }
        ]
        
        # Additional windows for larger rooms
        if dimensions["width"] > 4:
            window_configs.append({
                "wall": "left",
                "width": 1.2,
                "height": 1.0,
                "position": {"x": dimensions["length"]/3, "y": dimensions["height"]/2 + 0.2}
            })
        
        # More windows if mentioned in prompt
        prompt_lower = prompt.lower()
        if "many windows" in prompt_lower or "lots of windows" in prompt_lower:
            window_configs.append({
                "wall": "right",
                "width": 1.2,
                "height": 1.0,
                "position": {"x": -dimensions["length"]/3, "y": dimensions["height"]/2 + 0.2}
            })
        
        # Add windows
        windows.extend(window_configs)
        
        return windows
    
    def _generate_doors(self, dimensions, prompt):
        """
        Generate door configurations based on room dimensions and prompt
        
        Args:
            dimensions (dict): Room dimensions
            prompt (str): User's prompt
            
        Returns:
            list: Door configurations
        """
        doors = []
        
        # Default door on front wall
        door_config = {
            "wall": "front",
            "width": 0.9,
            "height": 2.0,
            "position": {"x": dimensions["width"]/4, "y": 1.0}
        }
        
        doors.append(door_config)
        
        # Additional door if mentioned in prompt
        prompt_lower = prompt.lower()
        if "double door" in prompt_lower or "french doors" in prompt_lower:
            second_door = {
                "wall": "front",
                "width": 0.9,
                "height": 2.0,
                "position": {"x": -dimensions["width"]/4, "y": 1.0}
            }
            doors.append(second_door)
        
        return doors
    
    def generate_thumbnail(self, config):
        """
        Generate a thumbnail image for a room configuration
        
        Args:
            config (dict): Room configuration data
            
        Returns:
            str: Base64 encoded image data
        """
        # Create a new image with room dimensions
        # Scale down real dimensions to fit in an image
        width = int(config["dimensions"]["width"] * 50)
        length = int(config["dimensions"]["length"] * 50)
        
        # Ensure minimum size
        width = max(width, 300)
        length = max(length, 300)
        
        # Create base image with wall color
        img = Image.new('RGB', (width, length), color=config["colors"]["walls"])
        draw = ImageDraw.Draw(img)
        
        # Draw floor
        floor_color = config["colors"]["floor"]
        draw.rectangle([10, 10, width-10, length-10], fill=floor_color)
        
        # Draw furniture outlines
        if "furniture" in config and config["furniture"]:
            for furniture in config["furniture"]:
                # Convert 3D coordinates to 2D for thumbnail
                pos_x = int((furniture["position"]["x"] + config["dimensions"]["width"]/2) * 
                            (width / config["dimensions"]["width"]))
                pos_z = int((furniture["position"]["z"] + config["dimensions"]["length"]/2) * 
                            (length / config["dimensions"]["length"]))
                
                size = int(furniture["scale"] * 20)
                
                # Draw furniture as simple rectangles with rotation
                if furniture["rotation"] % 90 == 0:
                    # Straight rectangles for 90-degree rotations
                    draw.rectangle([pos_x-size, pos_z-size, pos_x+size, pos_z+size], 
                                  fill="#777777", outline="#000000")
                else:
                    # Draw a circle for irregular rotations
                    draw.ellipse([pos_x-size, pos_z-size, pos_x+size, pos_z+size],
                                fill="#777777", outline="#000000")
        
        # Draw windows as blue rectangles on the walls
        if "windows" in config and config["windows"]:
            for window in config["windows"]:
                if window["wall"] == "left":
                    wx = int(window["position"]["x"] * (width / config["dimensions"]["length"]))
                    wy = int(window["position"]["y"] * (length / config["dimensions"]["height"]))
                    draw.rectangle([0, wy-15, 10, wy+15], fill="#AACCFF", outline="#000000")
                elif window["wall"] == "right":
                    wx = int(window["position"]["x"] * (width / config["dimensions"]["length"]))
                    wy = int(window["position"]["y"] * (length / config["dimensions"]["height"]))
                    draw.rectangle([width-10, wy-15, width, wy+15], fill="#AACCFF", outline="#000000")
                elif window["wall"] == "back":
                    wx = int(window["position"]["x"] * (width / config["dimensions"]["width"]))
                    wy = int(window["position"]["y"] * (length / config["dimensions"]["height"]))
                    draw.rectangle([wx-15, 0, wx+15, 10], fill="#AACCFF", outline="#000000")
                elif window["wall"] == "front":
                    wx = int(window["position"]["x"] * (width / config["dimensions"]["width"]))
                    wy = int(window["position"]["y"] * (length / config["dimensions"]["height"]))
                    draw.rectangle([wx-15, length-10, wx+15, length], fill="#AACCFF", outline="#000000")
        
        # Draw doors as brown rectangles on the walls
        if "doors" in config and config["doors"]:
            for door in config["doors"]:
                if door["wall"] == "front":
                    dx = int(door["position"]["x"] * (width / config["dimensions"]["width"]))
                    draw.rectangle([dx-15, length-10, dx+15, length], fill="#8B4513", outline="#000000")
                elif door["wall"] == "back":
                    dx = int(door["position"]["x"] * (width / config["dimensions"]["width"]))
                    draw.rectangle([dx-15, 0, dx+15, 10], fill="#8B4513", outline="#000000")
                elif door["wall"] == "left":
                    dy = int(door["position"]["y"] * (length / config["dimensions"]["height"]))
                    draw.rectangle([0, dy-20, 10, dy+20], fill="#8B4513", outline="#000000")
                elif door["wall"] == "right":
                    dy = int(door["position"]["y"] * (length / config["dimensions"]["height"]))
                    draw.rectangle([width-10, dy-20, width, dy+20], fill="#8B4513", outline="#000000")
        
        # Apply some image enhancements for a better look
        img = img.filter(ImageFilter.SMOOTH)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)
        
        # Add style text
        try:
            # Try to load a font, fall back to default if not available
            font = ImageFont.truetype("arial.ttf", 16)
        except IOError:
            font = ImageFont.load_default()
        
        draw = ImageDraw.Draw(img)
        style_text = f"Style: {config['style'].title()}"
        draw.text((10, 10), style_text, fill="#000000", font=font)
        
        # Save to BytesIO object
        buffered = BytesIO()
        img.save(buffered, format="JPEG", quality=85)
        
        # Encode to base64
        encoded_img = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded_img}"


# Create a global instance of the generator for reuse
room_generator = LocalRoomGenerator()

def generate_room_design(prompt, room_type, style):
    """
    Public function to generate a room design
    
    Args:
        prompt (str): User's text description
        room_type (str): Type of room (living_room, bedroom, etc)
        style (str): Design style (modern, minimalist, etc)
        
    Returns:
        dict: Room configuration data and thumbnail
    """
    return room_generator.generate_room(prompt, room_type, style)


# Integration points for the custom-trained model
def load_custom_model(model_path):
    """
    Load a custom trained model from the provided path
    
    This function would load a PyTorch or TensorFlow model that has been
    trained in Google Colab and saved to disk.
    
    Args:
        model_path (str): Path to the saved model file
        
    Returns:
        object: The loaded model
    """
    # In a real implementation, this would load the actual model
    # For example:
    # 
    # import torch
    # model = torch.load(model_path)
    # model.eval()
    # return model
    
    print(f"Would load custom model from: {model_path}")
    return None


def generate_with_custom_model(model, prompt, room_type, style):
    """
    Generate a room design using a custom trained model
    
    Args:
        model: The loaded custom model
        prompt (str): User's text description
        room_type (str): Type of room
        style (str): Design style
        
    Returns:
        dict: Room configuration data and thumbnail
    """
    # In a real implementation, this would use the model for generation
    # For example:
    #
    # import torch
    # with torch.no_grad():
    #     prompt_embedding = encode_prompt(prompt)
    #     style_embedding = encode_style(style)
    #     room_layout, furniture_layout = model(prompt_embedding, style_embedding)
    #     return convert_to_room_config(room_layout, furniture_layout)
    
    # For now, fall back to the local generator
    return generate_room_design(prompt, room_type, style)


# Helper functions for the future custom model integration
def encode_prompt(prompt):
    """Convert text prompt to embedding for model input"""
    # This would encode the prompt using a text encoder
    # For now, return a placeholder
    return np.random.rand(128).astype(np.float32)


def encode_style(style):
    """Convert style name to embedding for model input"""
    # This would encode the style using a style encoder or lookup
    # For now, return a placeholder
    return np.random.rand(128).astype(np.float32)


def convert_to_room_config(room_layout, furniture_layout):
    """Convert model outputs to room configuration"""
    # This would convert the model outputs to the expected format
    # For now, return a placeholder
    return room_generator.generate_room("", "living_room", "modern")