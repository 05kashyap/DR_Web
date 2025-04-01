from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
from torchvision import transforms
import numpy as np
from utils import load_xception_model

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from GitHub Pages
origins = [
    "http://localhost:3000", # For local React development
    "https://05kashyap.github.io" # For deployed frontend
]
# Set device (use GPU if available, else CPU)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Load the model
model_path = 'Xception_Multilevel_epochs_70.pth'
model = load_xception_model(model_path, device)

# Define image preprocessing (Xception-specific)
preprocess = transforms.Compose([
    transforms.Resize((299, 299)),  # Xception expects 299x299
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # Xception normalization
])

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if an image was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        # Read and preprocess the image
        file = request.files['image']
        image = Image.open(file).convert('RGB')
        image_tensor = preprocess(image).unsqueeze(0).to(device)

        # Run inference
        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.softmax(output, dim=1).cpu().numpy()[0]
            predicted_class = np.argmax(probabilities)

        # Return predictions
        return jsonify({
            'class': int(predicted_class),
            'probabilities': probabilities.tolist()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'API is running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)