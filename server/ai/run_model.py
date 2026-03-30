import sys
import json
from models import generate_room_3d, generate_room_thumbnail

def main():
    """
    Main entry point for room generation script
    
    Expects command line arguments:
    1. text prompt
    2. room type
    3. style
    
    Outputs a JSON string with the generated room design
    """
    # Check arguments
    if len(sys.argv) < 4:
        print(json.dumps({
            "error": "Missing arguments. Required: prompt, room_type, style"
        }))
        sys.exit(1)
    
    prompt = sys.argv[1]
    room_type = sys.argv[2]
    style = sys.argv[3]
    
    try:
        # Generate the 3D room configuration
        config = generate_room_3d(prompt, room_type, style)
        
        # Generate a thumbnail
        thumbnail = generate_room_thumbnail(config)
        
        # Create a unique ID for the design
        design_id = f"design_{int(time.time())}_{random.randint(1000, 9999)}"
        
        # Prepare the response
        result = {
            "id": design_id,
            "scene3D": f"/api/models/{design_id}",
            "thumbnail": thumbnail,
            "config": config
        }
        
        # Output the result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "error": f"Error generating room: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    import time
    import random
    main()
