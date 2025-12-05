"""
Test Script for Phase 1: Segmentation and Embeddings
"""

import cv2
import numpy as np
import sys
from pathlib import Path
import time

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from detection.segmentation import SegmentationSystem
from detection.embeddings import EmbeddingVisualizer

def main():
    print("🚀 Starting Phase 1 Test...")
    
    # 1. Initialize Systems
    print("\n1. Initializing Segmentation System...")
    try:
        seg_system = SegmentationSystem(model_name="yolov8n-seg.pt")
        print("✅ Segmentation System initialized")
    except Exception as e:
        print(f"❌ Failed to initialize Segmentation: {e}")
        return

    print("\n2. Initializing Embedding System (this might download CLIP model)...")
    try:
        embed_system = EmbeddingVisualizer()
        print("✅ Embedding System initialized")
    except Exception as e:
        print(f"❌ Failed to initialize Embeddings: {e}")
        return

    # 3. Open Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Cannot open camera")
        return

    print("\n🎥 Starting Camera Feed...")
    print("Controls:")
    print("  's' - Save current frame embedding")
    print("  'p' - Toggle PCA/t-SNE plot")
    print("  'q' - Quit")

    show_plot = False
    plot_img = None
    last_plot_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # --- Segmentation ---
        annotated_frame, results = seg_system.segment(frame)
        
        # --- Embeddings Logic ---
        # If we have detections, let's extract embedding from the largest one
        if results.boxes:
            # Find largest box
            boxes = results.boxes.xyxy.cpu().numpy()
            areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
            largest_idx = np.argmax(areas)
            
            x1, y1, x2, y2 = boxes[largest_idx].astype(int)
            
            # Ensure coordinates are within frame
            h, w = frame.shape[:2]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            
            if x2 > x1 and y2 > y1:
                crop = frame[y1:y2, x1:x2]
                
                # Draw rectangle on annotated frame to show what we are embedding
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 255), 3)
                
                # Auto-add sample every 2 seconds if plot is shown
                current_time = time.time()
                if show_plot and current_time - last_plot_time > 2.0:
                    label = results.names[int(results.boxes.cls[largest_idx])]
                    embed_system.add_sample(crop, label)
                    plot_img = embed_system.generate_plot()
                    last_plot_time = current_time

        # Display
        cv2.imshow("Segmentation", annotated_frame)
        
        if show_plot and plot_img is not None:
            cv2.imshow("Embeddings", plot_img)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            # Manually add sample
            if results.boxes:
                label = results.names[int(results.boxes.cls[largest_idx])]
                embed_system.add_sample(crop, label)
                plot_img = embed_system.generate_plot()
                print(f"Added sample: {label}")
        elif key == ord('p'):
            show_plot = not show_plot
            if show_plot:
                cv2.namedWindow("Embeddings", cv2.WINDOW_NORMAL)
            else:
                cv2.destroyWindow("Embeddings")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
