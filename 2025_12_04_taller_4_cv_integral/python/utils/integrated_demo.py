"""
Integrated Demo Script (Phase 2 Complete)
Combines YOLO detection, Segmentation, Embeddings, MediaPipe gestures, Voice, EEG, and WebSocket communication
"""

import cv2
import asyncio
import json
from pathlib import Path
import sys
import threading
import time

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from detection.yolo_detector import ObjectDetector
from detection.segmentation import SegmentationSystem
from detection.embeddings import EmbeddingVisualizer
from mediapipe_voice.gesture_recognition import GestureRecognizer
from mediapipe_voice.voice_recognition import VoiceController
from utils.eeg_simulator import EEGSimulator
import websockets

class IntegratedDemo:
    """Integrated visual computing demo"""
    
    def __init__(self, websocket_url: str = "ws://localhost:8000/ws"):
        """Initialize demo components"""
        print("🚀 Initializing Integrated Visual Computing System...")
        
        # 1. Vision Modules
        print("   - Loading Vision Modules...")
        self.detector = ObjectDetector(model_name="yolov8n.pt", conf_threshold=0.5)
        self.segmenter = SegmentationSystem(model_name="yolov8n-seg.pt")
        self.embedder = EmbeddingVisualizer()
        
        # 2. Interaction Modules
        print("   - Loading Interaction Modules...")
        self.gesture_recognizer = GestureRecognizer()
        self.voice_controller = VoiceController()
        self.eeg_sim = EEGSimulator()
        
        # 3. Communication
        self.websocket_url = websocket_url
        self.websocket = None
        
        # State
        self.running = True
        self.frame_count = 0
        self.last_voice_command = None
        self.voice_thread = None
        
        print("✅ System initialized!")
    
    async def connect_websocket(self):
        """Connect to WebSocket server"""
        try:
            self.websocket = await websockets.connect(self.websocket_url)
            print(f"✅ Connected to WebSocket: {self.websocket_url}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to WebSocket: {e}")
            print("⚠️  Continuing without WebSocket connection...")
            return False
    
    async def send_data(self, message_type: str, data: dict):
        """Generic sender"""
        if self.websocket and self.websocket.open:
            try:
                message = {
                    "type": message_type,
                    **data
                }
                await self.websocket.send(json.dumps(message))
            except Exception as e:
                print(f"Error sending {message_type}: {e}")

    def voice_listen_loop(self):
        """Background thread for voice listening"""
        print("🎤 Voice listening thread started")
        while self.running:
            command = self.voice_controller.listen(timeout=2)
            if command:
                # Check if it matches a known command
                action = self.voice_controller.commands.get(command)
                if action:
                    self.last_voice_command = action
                    print(f"🗣️ Voice Command: {command} -> {action}")
                    self.voice_controller.speak(f"Executing {command}")
            time.sleep(0.1)

    async def process_frame(self, frame):
        """Process single frame with all modules"""
        
        # 1. Segmentation (Visuals)
        # We use segmentation frame as base because it looks cool
        seg_frame, seg_results = self.segmenter.segment(frame)
        
        # 2. Object Detection (Bounding Boxes & Logic)
        # We run this to get clean bbox data for the frontend
        _, detections = self.detector.detect(frame)
        
        # 3. Gesture Recognition
        final_frame, gesture = self.gesture_recognizer.process_frame(seg_frame)
        
        # 4. Embeddings (Optional: Extract from largest detection every 30 frames)
        if self.frame_count % 30 == 0 and detections:
            # Logic to extract embedding could go here
            pass

        # 5. EEG Data
        eeg_data = self.eeg_sim.get_data()

        # --- Send Data to Frontend ---
        
        # Detections
        if detections:
            await self.send_data("detection", {"detections": detections})
            
        # Gestures
        if gesture and gesture != "unknown":
            await self.send_data("command", {"command": f"gesture_{gesture}"})
            
        # Voice
        if self.last_voice_command:
            cmd_str = f"voice_{self.last_voice_command}"
            print(f"📤 Sending Voice Command to Server: {cmd_str}")
            await self.send_data("command", {"command": cmd_str})
            self.last_voice_command = None # Reset after sending
            
        # EEG
        await self.send_data("eeg", {"data": eeg_data})

        return final_frame
    
    async def run(self, camera_id: int = 0):
        """Run integrated demo"""
        # Start EEG
        self.eeg_sim.start()
        
        # Start Voice Thread
        self.voice_thread = threading.Thread(target=self.voice_listen_loop, daemon=True)
        self.voice_thread.start()
        
        # Connect to WebSocket
        await self.connect_websocket()
        
        # Open camera
        cap = cv2.VideoCapture(camera_id)
        if not cap.isOpened():
            raise ValueError(f"Cannot open camera {camera_id}")
            
        print("🎥 Starting Main Loop. Press 'q' to quit.")
        
        try:
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    break
                
                self.frame_count += 1
                
                # Process
                processed_frame = await self.process_frame(frame)
                
                # Display
                cv2.imshow("Integrated System (Phase 2)", processed_frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    self.running = False
                    break
                    
                # Small sleep to yield to asyncio loop
                await asyncio.sleep(0.001)
                
        finally:
            self.running = False
            self.eeg_sim.stop()
            cap.release()
            cv2.destroyAllWindows()
            if self.websocket:
                await self.websocket.close()

if __name__ == "__main__":
    # Run the async loop
    demo = IntegratedDemo()
    asyncio.run(demo.run())
