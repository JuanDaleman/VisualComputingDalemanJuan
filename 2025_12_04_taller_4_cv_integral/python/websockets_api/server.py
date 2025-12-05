"""
FastAPI WebSocket Server for Visual Computing System
Handles real-time communication between vision pipeline and frontend
"""

import asyncio
import json
import time
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from datetime import datetime
import base64

app = FastAPI(title="Visual Computing API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.metrics = {
            "fps": 0,
            "detections": 0,
            "latency": 0,
            "active_connections": 0
        }
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.metrics["active_connections"] = len(self.active_connections)
        print(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        self.metrics["active_connections"] = len(self.active_connections)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """Send message to all connected clients"""
        print(f"📡 Broadcasting to {len(self.active_connections)} clients")
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending message: {e}")

manager = ConnectionManager()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Visual Computing API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics")
async def get_metrics():
    """Get current system metrics"""
    return JSONResponse(content=manager.metrics)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time communication"""
    await manager.connect(websocket)
    
    try:
        # Send initial connection message
        await manager.send_personal_message({
            "type": "connection",
            "status": "connected",
            "timestamp": datetime.now().isoformat()
        }, websocket)
        
        while True:
            # Receive data from client
            data = await websocket.receive_json()
            
            # Process different message types
            message_type = data.get("type", "unknown")
            
            if message_type == "ping":
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }, websocket)
            
            elif message_type == "command":
                # Handle voice/gesture commands
                command = data.get("command", "")
                print(f"📥 Server received command: {command}")
                await process_command(command, websocket)
            
            elif message_type == "detection":
                # Broadcast detections to all clients (frontend)
                await manager.broadcast(data)

            elif message_type == "eeg":
                # Broadcast EEG data to all clients
                await manager.broadcast(data)

            elif message_type == "frame":
                # Process video frame (if sent from client)
                frame_data = data.get("data", "")
                await process_frame(frame_data, websocket)
            
            else:
                await manager.send_personal_message({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def process_command(command: str, websocket: WebSocket):
    """Process voice or gesture commands"""
    response = {
        "type": "command_response",
        "command": command,
        "status": "processed",
        "timestamp": datetime.now().isoformat()
    }
    
    # Map commands to actions
    # Frontend expects: color_change, rotate, stop, reset
    actions = {
        # Voice Commands (mapped from VoiceController)
        "voice_color_change": {"action": "color_change", "value": np.random.rand(3).tolist()},
        "voice_rotate_object": {"action": "rotate", "value": True},
        "voice_stop_animation": {"action": "stop", "value": True},
        "voice_reset_scene": {"action": "reset", "value": True},
        
        # Gesture Commands (mapped from GestureRecognizer)
        "gesture_point": {"action": "color_change", "value": np.random.rand(3).tolist()},
        "gesture_open_palm": {"action": "rotate", "value": True},
        "gesture_fist": {"action": "stop", "value": True},
        "gesture_thumbs_up": {"action": "reset", "value": True},
        
        # Direct commands (legacy/testing)
        "change color": {"action": "color_change", "value": np.random.rand(3).tolist()},
        "rotate": {"action": "rotate", "value": True},
        "stop": {"action": "stop", "value": True},
        "reset": {"action": "reset", "value": True},
    }
    
    # Check if command exists in actions
    # We handle case-insensitive matching for direct commands, but prefixes should be exact
    cmd_key = command.lower()
    if command in actions:
        response["action"] = actions[command]
    elif cmd_key in actions:
        response["action"] = actions[cmd_key]
    else:
        # Try to match partials if needed, or just return unknown
        print(f"⚠️ Unknown command received: {command}")
        response["action"] = {"action": "unknown", "value": None}
    
    # Broadcast the response to all clients (so frontend sees it)
    print(f"📢 Broadcasting action: {response.get('action')}")
    await manager.broadcast(response)

async def process_frame(frame_data: str, websocket: WebSocket):
    """Process incoming video frame"""
    try:
        # Decode base64 frame
        frame_bytes = base64.b64decode(frame_data)
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Here you would run YOLO detection, MediaPipe, etc.
        # For now, send back a mock detection
        response = {
            "type": "detection",
            "detections": [
                {
                    "class": "person",
                    "confidence": 0.95,
                    "bbox": [100, 100, 200, 300]
                }
            ],
            "timestamp": datetime.now().isoformat()
        }
        
        await manager.send_personal_message(response, websocket)
    
    except Exception as e:
        print(f"Error processing frame: {e}")

async def metrics_broadcaster():
    """Periodically broadcast system metrics"""
    while True:
        await asyncio.sleep(1)  # Update every second
        
        # Update metrics
        manager.metrics["fps"] = np.random.randint(25, 35)  # Mock FPS
        manager.metrics["latency"] = np.random.randint(10, 50)  # Mock latency in ms
        
        # Broadcast to all clients
        await manager.broadcast({
            "type": "metrics",
            "data": manager.metrics,
            "timestamp": datetime.now().isoformat()
        })

@app.on_event("startup")
async def startup_event():
    """Start background tasks on server startup"""
    asyncio.create_task(metrics_broadcaster())
    print("🚀 Visual Computing Server started!")
    print("📊 Metrics broadcaster running")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on server shutdown"""
    print("🛑 Server shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
