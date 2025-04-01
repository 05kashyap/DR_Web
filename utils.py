import torch
import torch.nn as nn
import timm

def load_xception_model(model_path: str, device: torch.device = torch.device('cpu')) -> nn.Module:
    """
    Load a trained Xception model for evaluation.

    Args:
        model_path: Path to the saved model checkpoint
        device: Device to load the model onto (default: CPU)
    Returns:
        Loaded Xception model ready for evaluation
    """
    try:
        # Initialize Xception model
        model = timm.create_model('xception', pretrained=False)  # Don't load pretrained weights
        print("Initialized Xception model")

        # Modify classifier for binary classification (2 classes)
        in_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(p=0.2),
            nn.Linear(in_features, 2)
        )

        # Load checkpoint
        checkpoint = torch.load(model_path, map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])
        print(f"Loaded checkpoint from {model_path}")

        # Move model to device and set to evaluation mode
        model = model.to(device)
        model.eval()

        # Print metadata for verification
        print(f"Checkpoint metadata:")
        print(f"  Unfrozen layers: {checkpoint.get('unfrozen_layers', 'N/A')}")
        print(f"  Learning rate: {checkpoint.get('learning_rate', 'N/A')}")
        print(f"  Trainable parameters: {checkpoint.get('trainable_params', 'N/A')}")
        if 'history' in checkpoint:
            print(f"  Final training accuracy: {checkpoint['history']['train_acc'][-1]:.4f}")
            print(f"  Final training loss: {checkpoint['history']['train_loss'][-1]:.4f}")

        return model

    except Exception as e:
        print(f"Error loading Xception model: {str(e)}")
        raise