from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import time
import random
import base64
from io import BytesIO
from PIL import Image, ImageDraw

# Import AI modules
try:
    from ai.models import generate_room_3d, generate_room_thumbnail
    AI_MODULES_AVAILABLE = True
except ImportError:
    print("AI modules not available, using fallback implementation")
    AI_MODULES_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# In-memory storage for designs and furniture
designs = {}
furniture_items = []


# Initialize with some sample furniture
def init_furniture():
    global furniture_items
    furniture_items = [
        {
            "id": 1,
            "name": "Modern Sofa",
            "category": "seating",
            "thumbnail":
            "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "model_3d": "/models/modern-sofa.glb"
        },
        {
            "id": 2,
            "name": "Coffee Table",
            "category": "tables",
            "thumbnail":
            "https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "model_3d": "/models/coffee-table.glb"
        },
        {
            "id": 3,
            "name": "Floor Lamp",
            "category": "lighting",
            "thumbnail":
            "https://images.unsplash.com/photo-1551298370-9d3d53740c72?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "model_3d": "/models/floor-lamp.glb"
        },
        {
            "id": 4,
            "name": "Bookshelf",
            "category": "storage",
            "thumbnail":
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "model_3d": "/models/bookshelf.glb"
        },
        {
            "id": 5,
            "name": "Armchair",
            "category": "seating",
            "thumbnail":
            "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "model_3d": "/models/armchair.glb"
        },
        {
            "id": 6,
            "name": "Indoor Plant",
            "category": "decor",
            "thumbnail":
            "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "model_3d": "/models/indoor-plant.glb"
        },
    ]


# Generate a room design - fallback implementation
def generate_room_fallback(prompt, room_type, style):
    # Default configurations by style
    style_configs = {
        "modern": {
            "walls": "#F5F5F5",
            "floor": "#808080",
            "lighting": {
                "intensity": 70,
                "warmth": 50
            }
        },
        "scandinavian": {
            "walls": "#FFFFFF",
            "floor": "#DEB887",
            "lighting": {
                "intensity": 80,
                "warmth": 40
            }
        },
        "minimalist": {
            "walls": "#FFFFFF",
            "floor": "#F5F5F5",
            "lighting": {
                "intensity": 75,
                "warmth": 50
            }
        },
        "industrial": {
            "walls": "#D3D3D3",
            "floor": "#696969",
            "lighting": {
                "intensity": 60,
                "warmth": 30
            }
        },
        "traditional": {
            "walls": "#FFF8DC",
            "floor": "#8B4513",
            "lighting": {
                "intensity": 65,
                "warmth": 70
            }
        },
        "bohemian": {
            "walls": "#FFFAF0",
            "floor": "#CD853F",
            "lighting": {
                "intensity": 60,
                "warmth": 80
            }
        },
        "mid_century": {
            "walls": "#FFF8E1",
            "floor": "#A87329",
            "lighting": {
                "intensity": 70,
                "warmth": 60
            }
        }
    }

    # Default room dimensions by type
    room_dimensions = {
        "living_room": {
            "width": 5.0,
            "length": 6.0,
            "height": 2.8
        },
        "bedroom": {
            "width": 4.0,
            "length": 5.0,
            "height": 2.8
        },
        "kitchen": {
            "width": 4.5,
            "length": 5.0,
            "height": 2.8
        },
        "bathroom": {
            "width": 3.0,
            "length": 3.5,
            "height": 2.8
        },
        "office": {
            "width": 4.0,
            "length": 4.5,
            "height": 2.8
        },
        "dining": {
            "width": 4.5,
            "length": 5.0,
            "height": 2.8
        }
    }

    # Furniture by room type
    furniture_map = {
        "living_room": [{
            "name": "Sofa",
            "position": {
                "x": 1.5,
                "y": 0,
                "z": 0
            },
            "rotation": 0,
            "scale": 1.0
        }, {
            "name": "Coffee Table",
            "position": {
                "x": 0,
                "y": 0,
                "z": 1.2
            },
            "rotation": 0,
            "scale": 0.8
        }, {
            "name": "TV Stand",
            "position": {
                "x": -1.8,
                "y": 0,
                "z": 0
            },
            "rotation": 0,
            "scale": 1.0
        }],
        "bedroom": [{
            "name": "Bed",
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "rotation": 0,
            "scale": 1.0
        }, {
            "name": "Nightstand",
            "position": {
                "x": 1.2,
                "y": 0,
                "z": 0.6
            },
            "rotation": 0,
            "scale": 0.7
        }, {
            "name": "Wardrobe",
            "position": {
                "x": -1.5,
                "y": 0,
                "z": -1.5
            },
            "rotation": 90,
            "scale": 1.0
        }],
        "kitchen": [{
            "name": "Kitchen Counter",
            "position": {
                "x": 1.5,
                "y": 0,
                "z": 0
            },
            "rotation": 0,
            "scale": 1.0
        }, {
            "name": "Refrigerator",
            "position": {
                "x": 1.8,
                "y": 0,
                "z": 1.5
            },
            "rotation": 0,
            "scale": 1.0
        }, {
            "name": "Dining Table",
            "position": {
                "x": -1.2,
                "y": 0,
                "z": -0.5
            },
            "rotation": 0,
            "scale": 0.9
        }],
        "bathroom": [{
            "name": "Bathtub",
            "position": {
                "x": 0.8,
                "y": 0,
                "z": 0
            },
            "rotation": 0,
            "scale": 1.0
        }, {
            "name": "Sink",
            "position": {
                "x": -0.8,
                "y": 0,
                "z": 0.8
            },
            "rotation": 0,
            "scale": 0.7
        }, {
            "name": "Toilet",
            "position": {
                "x": -0.8,
                "y": 0,
                "z": -0.8
            },
            "rotation": 0,
            "scale": 0.7
        }],
        "office": [{
            "name": "Desk",
            "position": {
                "x": 0,
                "y": 0,
                "z": -1.0
            },
            "rotation": 0,
            "scale": 1.0
        }, {
            "name": "Office Chair",
            "position": {
                "x": 0,
                "y": 0,
                "z": -0.3
            },
            "rotation": 180,
            "scale": 0.9
        }, {
            "name": "Bookshelf",
            "position": {
                "x": 1.5,
                "y": 0,
                "z": 0
            },
            "rotation": 90,
            "scale": 1.0
        }],
        "dining": [{
            "name": "Dining Table",
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "rotation": 0,
            "scale": 1.0
        }, {
            "name": "Dining Chair",
            "position": {
                "x": 0,
                "y": 0,
                "z": 1.0
            },
            "rotation": 180,
            "scale": 0.8
        }, {
            "name": "Sideboard",
            "position": {
                "x": 1.8,
                "y": 0,
                "z": 0
            },
            "rotation": 90,
            "scale": 1.0
        }]
    }

    # Get style config
    style_config = style_configs.get(style, style_configs["modern"])

    # Get room dimensions and furniture
    dimensions = room_dimensions.get(room_type, {
        "width": 4.5,
        "length": 6.0,
        "height": 2.8
    })
    furniture = furniture_map.get(room_type, [])

    # Assign furniture IDs
    for i, item in enumerate(furniture):
        if "itemId" not in item:
            item["itemId"] = i + 1

    # Create configuration
    config = {
        "dimensions": dimensions,
        "colors": {
            "walls": style_config["walls"],
            "floor": style_config["floor"]
        },
        "lighting": style_config["lighting"],
        "furniture": furniture,
        "style": style
    }

    # Create thumbnail
    thumbnail = create_thumbnail_fallback(config)

    # Generate design ID
    design_id = f"design_{int(time.time())}_{random.randint(1000, 9999)}"

    return {
        "id": design_id,
        "scene3D": f"/api/models/{design_id}",
        "thumbnail": thumbnail,
        "config": config
    }


# Create a thumbnail - fallback implementation
def create_thumbnail_fallback(config):
    # Create a new image with room dimensions
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
    draw.rectangle([10, 10, width - 10, length - 10], fill=floor_color)

    # Draw some basic furniture outlines based on the room type
    if "furniture" in config and config["furniture"]:
        for furniture in config["furniture"]:
            # Convert 3D coordinates to 2D for thumbnail
            pos_x = int((furniture["position"]["x"] +
                         config["dimensions"]["width"] / 2) *
                        (width / config["dimensions"]["width"]))
            pos_z = int((furniture["position"]["z"] +
                         config["dimensions"]["length"] / 2) *
                        (length / config["dimensions"]["length"]))

            size = int(furniture["scale"] * 20)

            # Draw furniture as simple rectangles
            draw.rectangle(
                [pos_x - size, pos_z - size, pos_x + size, pos_z + size],
                fill="#777777",
                outline="#000000")

    # Save to BytesIO object
    buffered = BytesIO()
    img.save(buffered, format="JPEG", quality=85)

    # Encode to base64
    encoded_img = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return f"data:image/jpeg;base64,{encoded_img}"


# API Routes
@app.route('/api/generate', methods=['POST'])
def generate_room():
    data = request.json

    if not data or 'prompt' not in data or 'roomType' not in data or 'style' not in data:
        return jsonify(
            {'error': 'Missing required fields: prompt, roomType, style'}), 400

    prompt = data['prompt']
    room_type = data['roomType']
    style = data['style']

    try:
        # Generate room
        if AI_MODULES_AVAILABLE:
            config = generate_room_3d(prompt, room_type, style)
            thumbnail = generate_room_thumbnail(config)
            design_id = f"design_{int(time.time())}_{random.randint(1000, 9999)}"

            result = {
                "id": design_id,
                "scene3D": f"/api/models/{design_id}",
                "thumbnail": thumbnail,
                "config": config
            }
        else:
            result = generate_room_fallback(prompt, room_type, style)

        # Store the design
        designs[result['id']] = result

        return jsonify(result)
    except Exception as e:
        return jsonify({'error':
                        f'Failed to generate room design: {str(e)}'}), 500


@app.route('/api/furniture', methods=['GET'])
def get_all_furniture():
    return jsonify(furniture_items)


@app.route('/api/furniture/<int:furniture_id>', methods=['GET'])
def get_furniture_item(furniture_id):
    for item in furniture_items:
        if item['id'] == furniture_id:
            return jsonify(item)
    return jsonify({'error': 'Furniture item not found'}), 404


@app.route('/api/furniture/<int:furniture_id>/model', methods=['GET'])
def get_furniture_model(furniture_id):
    for item in furniture_items:
        if item['id'] == furniture_id:
            # In a real implementation, this would return an actual 3D model file
            # For this prototype, we return a JSON object with model information
            return jsonify({
                'id': item['id'],
                'name': item['name'],
                'modelUrl': item['model_3d']
            })
    return jsonify({'error': 'Furniture model not found'}), 404


@app.route('/api/designs', methods=['GET'])
def get_all_designs():
    return jsonify(list(designs.values()))


@app.route('/api/designs/<design_id>', methods=['GET'])
def get_design(design_id):
    if design_id in designs:
        return jsonify(designs[design_id])
    return jsonify({'error': 'Design not found'}), 404


@app.route('/api/designs', methods=['POST'])
def save_design():
    data = request.json

    if not data or 'name' not in data or 'config' not in data:
        return jsonify({'error': 'Missing required fields: name, config'}), 400

    # Generate ID if not provided
    if 'id' not in data:
        data['id'] = f"design_{int(time.time())}_{random.randint(1000, 9999)}"

    # Set creation/modification timestamps
    now = time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    if 'created' not in data:
        data['created'] = now

    data['lastModified'] = now

    # Store the design
    designs[data['id']] = data

    return jsonify(data), 201


@app.route('/api/designs/<design_id>', methods=['PUT'])
def update_design(design_id):
    if design_id not in designs:
        return jsonify({'error': 'Design not found'}), 404

    data = request.json

    if not data or 'name' not in data or 'config' not in data:
        return jsonify({'error': 'Missing required fields: name, config'}), 400

    # Preserve the ID
    data['id'] = design_id

    # Update modification timestamp
    data['lastModified'] = time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')

    # Store the updated design
    designs[design_id] = data

    return jsonify(data)


@app.route('/api/designs/<design_id>', methods=['DELETE'])
def delete_design(design_id):
    if design_id not in designs:
        return jsonify({'error': 'Design not found'}), 404

    del designs[design_id]

    return jsonify({'message': 'Design deleted successfully'})


# Serve frontend static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join('..', 'dist', 'public',
                                                  path)):
        return send_from_directory(os.path.join('..', 'dist', 'public'), path)
    else:
        return send_from_directory(os.path.join('..', 'dist', 'public'),
                                   'index.html')


# Initialize furniture on startup
init_furniture()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
