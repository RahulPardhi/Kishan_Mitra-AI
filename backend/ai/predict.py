"""
Kishan Mitra AI - Prediction Entry Point
Executed by Node.js backend to evaluate crop disease images.
"""

import sys
import json
from disease_model import analyze_image_file

def main():
    image_path = sys.argv[1] if len(sys.argv) > 1 else ""
    result = analyze_image_file(image_path)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
