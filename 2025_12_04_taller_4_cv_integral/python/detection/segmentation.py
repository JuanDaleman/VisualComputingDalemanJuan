"""
Real-time Instance Segmentation with YOLOv8-seg
"""

import cv2
import numpy as np
from ultralytics import YOLO
import time

class SegmentationSystem:
    """YOLOv8 Instance Segmentation System"""
    
    def __init__(self, model_name: str = "yolov8n-seg.pt", conf_threshold: float = 0.5):
        """
        Initialize YOLO segmentation
        
        Args:
            model_name: YOLO segmentation model variant (yolov8n-seg, yolov8s-seg, etc.)
            conf_threshold: Confidence threshold for detections
        """
        print(f"Loading Segmentation model: {model_name}")
        self.model = YOLO(model_name)
        self.conf_threshold = conf_threshold
        
    def segment(self, frame: np.ndarray):
        """
        Perform instance segmentation on a frame
        
        Args:
            frame: Input image (BGR format)
            
        Returns:
            Tuple of (annotated_frame, results)
        """
        # Run inference
        results = self.model(frame, conf=self.conf_threshold, verbose=False)
        
        # Get annotated frame directly from ultralytics
        annotated_frame = results[0].plot()
        
        return annotated_frame, results[0]
