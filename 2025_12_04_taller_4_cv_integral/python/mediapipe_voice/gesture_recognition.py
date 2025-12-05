"""
Multimodal Interaction System
Combines hand gesture recognition (MediaPipe) and voice commands
"""

import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Optional, Tuple
import time

class GestureRecognizer:
    """Hand gesture recognition using MediaPipe"""
    
    def __init__(self):
        """Initialize MediaPipe hands"""
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Gesture history
        self.current_gesture = None
        self.gesture_history = []
        
    def recognize_gesture(self, landmarks) -> Optional[str]:
        """
        Recognize hand gesture from landmarks
        
        Args:
            landmarks: MediaPipe hand landmarks
            
        Returns:
            Gesture name or None
        """
        if not landmarks:
            return None
        
        # Get landmark positions
        thumb_tip = landmarks[self.mp_hands.HandLandmark.THUMB_TIP]
        index_tip = landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_TIP]
        middle_tip = landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
        ring_tip = landmarks[self.mp_hands.HandLandmark.RING_FINGER_TIP]
        pinky_tip = landmarks[self.mp_hands.HandLandmark.PINKY_TIP]
        
        index_mcp = landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_MCP]
        middle_mcp = landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_MCP]
        ring_mcp = landmarks[self.mp_hands.HandLandmark.RING_FINGER_MCP]
        pinky_mcp = landmarks[self.mp_hands.HandLandmark.PINKY_MCP]
        
        # Check if fingers are extended
        index_extended = index_tip.y < index_mcp.y
        middle_extended = middle_tip.y < middle_mcp.y
        ring_extended = ring_tip.y < ring_mcp.y
        pinky_extended = pinky_tip.y < pinky_mcp.y
        
        # Recognize gestures
        if index_extended and middle_extended and not ring_extended and not pinky_extended:
            return "peace"  # ✌️ Peace sign
        elif not index_extended and not middle_extended and not ring_extended and not pinky_extended:
            return "fist"  # ✊ Fist
        elif index_extended and not middle_extended and not ring_extended and not pinky_extended:
            return "point"  # 👆 Pointing
        elif index_extended and middle_extended and ring_extended and pinky_extended:
            return "open_palm"  # ✋ Open palm
        elif thumb_tip.y < index_mcp.y and not index_extended:
            return "thumbs_up"  # 👍 Thumbs up
        
        return "unknown"
    
    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Optional[str]]:
        """
        Process frame and detect gestures
        
        Args:
            frame: Input BGR image
            
        Returns:
            Tuple of (annotated_frame, gesture_name)
        """
        # Convert to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.hands.process(rgb_frame)
        
        annotated_frame = frame.copy()
        gesture = None
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw hand landmarks
                self.mp_drawing.draw_landmarks(
                    annotated_frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing_styles.get_default_hand_landmarks_style(),
                    self.mp_drawing_styles.get_default_hand_connections_style()
                )
                
                # Recognize gesture
                gesture = self.recognize_gesture(hand_landmarks.landmark)
                
                if gesture:
                    self.current_gesture = gesture
                    self.gesture_history.append({
                        "timestamp": time.time(),
                        "gesture": gesture
                    })
        
        # Display current gesture
        if self.current_gesture:
            cv2.putText(annotated_frame, f"Gesture: {self.current_gesture}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        return annotated_frame, gesture
    
    def run_webcam(self, camera_id: int = 0):
        """Run gesture recognition on webcam"""
        cap = cv2.VideoCapture(camera_id)
        
        if not cap.isOpened():
            raise ValueError(f"Cannot open camera {camera_id}")
        
        print("Starting gesture recognition. Press 'q' to quit.")
        print("\nGestures:")
        print("  ✌️  Peace sign - Toggle detection")
        print("  ✊  Fist - Reset scene")
        print("  👆  Point - Select object")
        print("  ✋  Open palm - Stop")
        print("  👍  Thumbs up - Confirm\n")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process frame
                annotated_frame, gesture = self.process_frame(frame)
                
                # Display
                cv2.imshow('Gesture Recognition', annotated_frame)
                
                # Print gesture
                if gesture and gesture != "unknown":
                    print(f"Detected gesture: {gesture}")
                
                # Quit on 'q'
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
            self.hands.close()
    
    def __del__(self):
        """Cleanup"""
        if hasattr(self, 'hands'):
            self.hands.close()

def main():
    """Main function"""
    recognizer = GestureRecognizer()
    recognizer.run_webcam(camera_id=0)

if __name__ == "__main__":
    main()
