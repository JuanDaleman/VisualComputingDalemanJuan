"""
EEG Simulator
Simulates brainwave data (Focus, Relaxation, Blinks) for multimodal interaction
"""

import time
import random
import threading
from typing import Dict, Any

class EEGSimulator:
    """Simulates EEG headset data"""
    
    def __init__(self):
        self.running = False
        self.data = {
            "focus": 0.0,
            "relaxation": 0.0,
            "blink": False,
            "signal_quality": 100
        }
        self._thread = None

    def start(self):
        """Start simulation thread"""
        self.running = True
        self._thread = threading.Thread(target=self._update_loop, daemon=True)
        self._thread.start()
        print("🧠 EEG Simulator started")

    def stop(self):
        """Stop simulation"""
        self.running = False
        if self._thread:
            self._thread.join(timeout=1.0)

    def _update_loop(self):
        """Update simulated values smoothly"""
        while self.running:
            # Simulate smooth changes in focus/relaxation
            # Random walk behavior
            change_focus = random.uniform(-5, 5)
            change_relax = random.uniform(-5, 5)
            
            self.data["focus"] = max(0, min(100, self.data["focus"] + change_focus))
            self.data["relaxation"] = max(0, min(100, self.data["relaxation"] + change_relax))
            
            # Simulate random blinks (approx every 3-5 seconds)
            self.data["blink"] = random.random() < 0.05  # 5% chance per update
            
            time.sleep(0.2)  # Update 5 times per second

    def get_data(self) -> Dict[str, Any]:
        """Get current EEG metrics"""
        return self.data.copy()
