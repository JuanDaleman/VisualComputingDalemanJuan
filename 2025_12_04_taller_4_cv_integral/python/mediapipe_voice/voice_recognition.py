"""
Voice Command Recognition System
Uses SpeechRecognition for voice input and pyttsx3 for voice output
"""

import speech_recognition as sr
import pyttsx3
from typing import Optional, List, Dict
import time
import threading

class VoiceController:
    """Voice command recognition and synthesis"""
    
    def __init__(self):
        """Initialize voice recognition and synthesis"""
        # Speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Text-to-speech
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)  # Speed
        self.engine.setProperty('volume', 0.9)  # Volume
        
        # Command mapping
        self.commands = {
            "change color": "color_change",
            "rotate": "rotate_object",
            "stop": "stop_animation",
            "reset": "reset_scene",
            "zoom in": "zoom_in",
            "zoom out": "zoom_out",
            "light on": "light_on",
            "light off": "light_off",
            "start detection": "start_detection",
            "stop detection": "stop_detection"
        }
        
        # Command history
        self.command_history = []
        self.is_listening = False
        
        # Adjust for ambient noise
        print("Calibrating microphone for ambient noise...")
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
        print("Microphone calibrated!")
    
    def speak(self, text: str):
        """
        Convert text to speech
        
        Args:
            text: Text to speak
        """
        print(f"🔊 Speaking: {text}")
        self.engine.say(text)
        self.engine.runAndWait()
    
    def listen(self, timeout: int = 5) -> Optional[str]:
        """
        Listen for voice command
        
        Args:
            timeout: Maximum time to wait for speech
            
        Returns:
            Recognized text or None
        """
        try:
            with self.microphone as source:
                print("🎤 Listening...")
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=5)
            
            print("🔄 Recognizing...")
            text = self.recognizer.recognize_google(audio)
            print(f"✅ Recognized: {text}")
            return text.lower()
        
        except sr.WaitTimeoutError:
            print("⏱️  No speech detected")
            return None
        except sr.UnknownValueError:
            print("❌ Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"❌ Recognition error: {e}")
            return None
    
    def process_command(self, text: str) -> Optional[Dict]:
        """
        Process voice command and map to action
        
        Args:
            text: Recognized text
            
        Returns:
            Command dictionary or None
        """
        text = text.lower().strip()
        
        # Check for exact matches
        for command, action in self.commands.items():
            if command in text:
                command_data = {
                    "timestamp": time.time(),
                    "text": text,
                    "command": command,
                    "action": action
                }
                self.command_history.append(command_data)
                return command_data
        
        return None
    
    def run_interactive(self):
        """Run interactive voice command loop"""
        print("\n" + "="*50)
        print("🎤 Voice Command System Active")
        print("="*50)
        print("\nAvailable commands:")
        for cmd in self.commands.keys():
            print(f"  • {cmd}")
        print("\nSay 'quit' or 'exit' to stop")
        print("="*50 + "\n")
        
        self.speak("Voice command system activated")
        self.is_listening = True
        
        try:
            while self.is_listening:
                # Listen for command
                text = self.listen(timeout=10)
                
                if text:
                    # Check for exit command
                    if any(word in text for word in ["quit", "exit", "stop listening"]):
                        self.speak("Goodbye")
                        break
                    
                    # Process command
                    command = self.process_command(text)
                    
                    if command:
                        self.speak(f"Executing {command['command']}")
                        print(f"✅ Command: {command['action']}")
                    else:
                        self.speak("Command not recognized")
                        print("❌ Unknown command")
        
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
        
        finally:
            self.is_listening = False
            print("\n🛑 Voice command system stopped")
    
    def listen_once(self) -> Optional[Dict]:
        """
        Listen for a single command
        
        Returns:
            Command dictionary or None
        """
        text = self.listen()
        if text:
            return self.process_command(text)
        return None

class VoiceGestureIntegration:
    """Integrates voice and gesture commands"""
    
    def __init__(self):
        """Initialize integrated system"""
        self.voice_controller = VoiceController()
        self.last_command = None
        self.command_queue = []
    
    def add_gesture_command(self, gesture: str):
        """
        Add gesture command to queue
        
        Args:
            gesture: Gesture name
        """
        command = {
            "type": "gesture",
            "value": gesture,
            "timestamp": time.time()
        }
        self.command_queue.append(command)
        self.last_command = command
    
    def add_voice_command(self, command: Dict):
        """
        Add voice command to queue
        
        Args:
            command: Voice command dictionary
        """
        command["type"] = "voice"
        self.command_queue.append(command)
        self.last_command = command
    
    def get_latest_command(self) -> Optional[Dict]:
        """Get most recent command"""
        if self.command_queue:
            return self.command_queue[-1]
        return None
    
    def clear_queue(self):
        """Clear command queue"""
        self.command_queue.clear()

def main():
    """Main function for testing"""
    controller = VoiceController()
    controller.run_interactive()

if __name__ == "__main__":
    main()
