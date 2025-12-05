"""
Real-time Object Detection with YOLOv8
Processes webcam feed and detects objects in real-time
"""

import cv2
import numpy as np
from ultralytics import YOLO
import time
from pathlib import Path
from typing import List, Dict, Tuple
import json

class ObjectDetector:
    """YOLOv8 Object Detection System"""
    
    def __init__(self, model_name: str = "yolov8n.pt", conf_threshold: float = 0.5):
        """
        Initialize YOLO detector
        
        Args:
            model_name: YOLO model variant (yolov8n, yolov8s, yolov8m, etc.)
            conf_threshold: Confidence threshold for detections
        """
        print(f"Loading YOLO model: {model_name}")
        self.model = YOLO(model_name)
        self.conf_threshold = conf_threshold
        self.class_names = self.model.names
        
        # Performance metrics
        self.fps = 0
        self.frame_count = 0
        self.start_time = time.time()
        
        # Detection history
        self.detection_history = []
        
    def detect(self, frame: np.ndarray) -> Tuple[np.ndarray, List[Dict]]:
        """
        Perform object detection on a frame
        
        Args:
            frame: Input image (BGR format)
            
        Returns:
            Tuple of (annotated_frame, detections_list)
        """
        # Run inference
        results = self.model(frame, conf=self.conf_threshold, verbose=False)
        
        # Parse results
        detections = []
        annotated_frame = frame.copy()
        
        for result in results:
            boxes = result.boxes
            
            for box in boxes:
                # Extract box coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = self.class_names[class_id]
                
                # Store detection
                detection = {
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "class_id": class_id
                }
                detections.append(detection)
                
                # Draw bounding box
                color = self._get_color(class_id)
                cv2.rectangle(annotated_frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                
                # Draw label
                label = f"{class_name}: {confidence:.2f}"
                label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                cv2.rectangle(annotated_frame, (int(x1), int(y1) - label_size[1] - 10),
                            (int(x1) + label_size[0], int(y1)), color, -1)
                cv2.putText(annotated_frame, label, (int(x1), int(y1) - 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Update metrics
        self.frame_count += 1
        elapsed_time = time.time() - self.start_time
        self.fps = self.frame_count / elapsed_time if elapsed_time > 0 else 0
        
        # Draw FPS
        cv2.putText(annotated_frame, f"FPS: {self.fps:.1f}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Store in history
        self.detection_history.append({
            "timestamp": time.time(),
            "detections": detections,
            "fps": self.fps
        })
        
        return annotated_frame, detections
    
    def _get_color(self, class_id: int) -> Tuple[int, int, int]:
        """Generate consistent color for each class"""
        np.random.seed(class_id)
        return tuple(np.random.randint(0, 255, 3).tolist())
    
    def run_webcam(self, camera_id: int = 0, save_output: bool = True):
        """
        Run detection on webcam feed
        
        Args:
            camera_id: Camera device ID
            save_output: Whether to save annotated video
        """
        cap = cv2.VideoCapture(camera_id)
        
        if not cap.isOpened():
            raise ValueError(f"Cannot open camera {camera_id}")
        
        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        # Video writer
        out = None
        if save_output:
            output_path = Path("../../results/videos/detection_output.mp4")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        
        print("Starting webcam detection. Press 'q' to quit.")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Detect objects
                annotated_frame, detections = self.detect(frame)
                
                # Display
                cv2.imshow('YOLO Detection', annotated_frame)
                
                # Save frame
                if out is not None:
                    out.write(annotated_frame)
                
                # Print detections
                if detections:
                    print(f"Detected: {[d['class'] for d in detections]}")
                
                # Quit on 'q'
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        
        finally:
            cap.release()
            if out is not None:
                out.release()
            cv2.destroyAllWindows()
            
            # Save detection history
            self.save_history()
    
    def save_history(self, output_path: str = "../../results/detection_history.json"):
        """Save detection history to JSON"""
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w') as f:
            json.dump(self.detection_history, f, indent=2)
        
        print(f"Detection history saved to {output_file}")

def main():
    """Main function to run detection"""
    detector = ObjectDetector(model_name="yolov8n.pt", conf_threshold=0.5)
    detector.run_webcam(camera_id=0, save_output=True)

if __name__ == "__main__":
    main()
