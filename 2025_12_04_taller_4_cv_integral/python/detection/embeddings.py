"""
CLIP Embeddings Visualization Module
Extracts embeddings from images and visualizes them using PCA/t-SNE
"""

import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
import io
import cv2

class EmbeddingVisualizer:
    """CLIP Embedding Extraction and Visualization"""
    
    def __init__(self, model_name: str = "openai/clip-vit-base-patch32"):
        """
        Initialize CLIP model
        """
        print(f"Loading CLIP model: {model_name}...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        
        # Storage for embeddings
        self.embeddings_history = []
        self.labels_history = []
        self.thumbnails = []
        
        print(f"CLIP model loaded on {self.device}")

    def extract_embedding(self, image_bgr: np.ndarray):
        """
        Extract embedding from a BGR image (numpy array)
        """
        # Convert BGR to RGB and then to PIL
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)
        
        # Process image
        inputs = self.processor(images=pil_image, return_tensors="pt").to(self.device)
        
        # Get features
        with torch.no_grad():
            image_features = self.model.get_image_features(**inputs)
        
        # Normalize
        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
        
        return image_features.cpu().numpy().flatten()

    def add_sample(self, image_crop: np.ndarray, label: str):
        """
        Add a sample to the history
        """
        embedding = self.extract_embedding(image_crop)
        self.embeddings_history.append(embedding)
        self.labels_history.append(label)
        
        # Keep only last 50 samples to avoid overcrowding
        if len(self.embeddings_history) > 50:
            self.embeddings_history.pop(0)
            self.labels_history.pop(0)

    def generate_plot(self, method: str = "pca") -> np.ndarray:
        """
        Generate a 2D plot of the embeddings
        Returns: BGR image of the plot
        """
        if len(self.embeddings_history) < 3:
            return np.zeros((480, 640, 3), dtype=np.uint8)

        X = np.array(self.embeddings_history)
        
        # Reduce dimensions
        if method == "tsne" and len(X) > 5:
            reducer = TSNE(n_components=2, perplexity=min(5, len(X)-1), random_state=42)
        else:
            reducer = PCA(n_components=2)
            
        X_embedded = reducer.fit_transform(X)
        
        # Plot
        plt.figure(figsize=(8, 6))
        
        # Create scatter plot
        unique_labels = list(set(self.labels_history))
        colors = plt.cm.rainbow(np.linspace(0, 1, len(unique_labels)))
        
        for i, label in enumerate(unique_labels):
            mask = [l == label for l in self.labels_history]
            plt.scatter(X_embedded[mask, 0], X_embedded[mask, 1], 
                       c=[colors[i]], label=label, alpha=0.7)
            
        plt.title(f"CLIP Embeddings ({method.upper()})")
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Convert plot to image
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        plt.close()
        
        # Convert buffer to numpy array
        plot_arr = np.frombuffer(buf.getvalue(), dtype=np.uint8)
        plot_img = cv2.imdecode(plot_arr, 1)
        
        return plot_img
