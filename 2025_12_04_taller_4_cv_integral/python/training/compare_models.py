"""
Model Comparison Script (Phase 3)
Trains and compares Custom CNN vs ResNet50 on CIFAR-10
"""

import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, Subset
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
import numpy as np
from pathlib import Path
import sys
import time

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from training.cnn_trainer import CustomCNN, ModelTrainer, create_resnet_model

def get_data_loaders(batch_size=32, subset_size=2000):
    """
    Get CIFAR-10 data loaders
    Using a subset for faster demonstration
    """
    print("📥 Downloading/Loading CIFAR-10 dataset...")
    
    transform_train = transforms.Compose([
        transforms.Resize((224, 224)),  # ResNet expects 224x224
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
    ])
    
    transform_test = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
    ])
    
    # Download dataset
    train_dataset = datasets.CIFAR10(root='./data', train=True, download=True, transform=transform_train)
    test_dataset = datasets.CIFAR10(root='./data', train=False, download=True, transform=transform_test)
    
    # Create subsets for faster training in this demo
    indices = torch.randperm(len(train_dataset))[:subset_size]
    train_subset = Subset(train_dataset, indices)
    
    test_indices = torch.randperm(len(test_dataset))[:subset_size//2]
    test_subset = Subset(test_dataset, test_indices)
    
    train_loader = DataLoader(train_subset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_subset, batch_size=batch_size, shuffle=False)
    
    classes = ('plane', 'car', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck')
    
    return train_loader, test_loader, classes

def evaluate_model(model, test_loader, device, classes):
    """
    Evaluate model and return predictions for confusion matrix
    """
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            
    return all_labels, all_preds

def plot_confusion_matrix(labels, preds, classes, title, save_path):
    """
    Plot and save confusion matrix
    """
    cm = confusion_matrix(labels, preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)
    plt.title(title)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(save_path)
    plt.close()

def main():
    print("🚀 Starting Model Comparison (Phase 3)...")
    
    # 1. Prepare Data
    train_loader, test_loader, classes = get_data_loaders(subset_size=1000) # Small subset for speed
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    # 2. Train Custom CNN
    print("\n🧠 Training Custom CNN (Scratch)...")
    custom_model = CustomCNN(num_classes=10)
    custom_trainer = ModelTrainer(custom_model, device=device)
    custom_metrics = custom_trainer.train(train_loader, test_loader, num_epochs=3)
    custom_trainer.plot_metrics("../../results/images/custom_cnn_metrics.png")
    
    # 3. Train ResNet50 (Fine-tuning)
    print("\n🧠 Training ResNet50 (Transfer Learning)...")
    resnet_model = create_resnet_model(num_classes=10, pretrained=True)
    resnet_trainer = ModelTrainer(resnet_model, device=device)
    resnet_metrics = resnet_trainer.train(train_loader, test_loader, num_epochs=3)
    resnet_trainer.plot_metrics("../../results/images/resnet_metrics.png")
    
    # 4. Compare Results
    print("\n📊 Generating Comparison Plots...")
    
    # Confusion Matrices
    _, custom_preds = evaluate_model(custom_model, test_loader, device, classes)
    _, resnet_preds = evaluate_model(resnet_model, test_loader, device, classes)
    labels = [y for _, y in test_loader.dataset] # Get all labels correctly
    
    # Note: evaluate_model returns lists, we need to make sure labels match
    # Re-running evaluate to get matched pairs
    labels_custom, preds_custom = evaluate_model(custom_model, test_loader, device, classes)
    labels_resnet, preds_resnet = evaluate_model(resnet_model, test_loader, device, classes)
    
    plot_confusion_matrix(labels_custom, preds_custom, classes, 
                         "Custom CNN Confusion Matrix", 
                         "../../results/images/confusion_matrix_custom.png")
                         
    plot_confusion_matrix(labels_resnet, preds_resnet, classes, 
                         "ResNet50 Confusion Matrix", 
                         "../../results/images/confusion_matrix_resnet.png")
    
    # Comparison Bar Chart
    plt.figure(figsize=(10, 6))
    models = ['Custom CNN', 'ResNet50']
    accuracies = [custom_metrics['val_accuracies'][-1], resnet_metrics['val_accuracies'][-1]]
    
    bars = plt.bar(models, accuracies, color=['blue', 'green'])
    plt.title('Final Validation Accuracy Comparison')
    plt.ylabel('Accuracy (%)')
    plt.ylim(0, 100)
    
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.1f}%', ha='center', va='bottom')
                
    plt.savefig("../../results/images/model_comparison.png")
    plt.close()
    
    print("\n✅ Phase 3 Complete!")
    print("Results saved in 'results/images/':")
    print("  - custom_cnn_metrics.png")
    print("  - resnet_metrics.png")
    print("  - confusion_matrix_custom.png")
    print("  - confusion_matrix_resnet.png")
    print("  - model_comparison.png")

if __name__ == "__main__":
    main()
