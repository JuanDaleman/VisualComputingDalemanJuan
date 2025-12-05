# System Architecture

## Overview

The Visual Computing Integrated System is a full-stack application that combines computer vision, deep learning, multimodal interaction, and 3D visualization into a cohesive real-time system.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   React    │  │  Three.js  │  │  React Three Fiber   │  │
│  │    UI      │  │   Scene    │  │    (R3F)             │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket (Real-time)
┌────────────────────────▼────────────────────────────────────┐
│                     Backend Layer                            │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  FastAPI   │  │ WebSocket  │  │   REST API           │  │
│  │  Server    │  │  Manager   │  │   Endpoints          │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Processing Layer                           │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   YOLO     │  │ MediaPipe  │  │  Voice Recognition   │  │
│  │ Detection  │  │  Gestures  │  │   (Speech API)       │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│  ┌────────────┐  ┌────────────┐                            │
│  │   Custom   │  │  ResNet50  │                            │
│  │    CNN     │  │Fine-tuning │                            │
│  └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend (React + Three.js)

**Technologies:**
- React 18 for UI components
- React Three Fiber for 3D rendering
- Three.js for WebGL graphics
- Zustand for state management (optional)

**Key Components:**
- `App.jsx` - Main application container
- `Scene3D.jsx` - 3D scene with animated objects
- `Dashboard.jsx` - Metrics and controls panel
- `DetectionOverlay.jsx` - Real-time detection display
- `useWebSocket.js` - WebSocket connection hook

**Responsibilities:**
- Render interactive 3D scene
- Display real-time metrics
- Handle user interactions
- Communicate with backend via WebSocket

### 2. Backend (FastAPI + WebSockets)

**Technologies:**
- FastAPI for HTTP and WebSocket server
- Uvicorn as ASGI server
- Python asyncio for concurrent operations

**Key Modules:**
- `server.py` - Main FastAPI application
- `ConnectionManager` - WebSocket connection handling
- Message routing and broadcasting
- Metrics aggregation

**Responsibilities:**
- Manage WebSocket connections
- Route messages between frontend and vision pipeline
- Aggregate and broadcast metrics
- Provide REST API endpoints

### 3. Vision Pipeline

#### 3.1 Object Detection (YOLO)

**File:** `python/detection/yolo_detector.py`

**Features:**
- Real-time object detection with YOLOv8
- Webcam integration
- Bounding box visualization
- Detection history logging
- FPS monitoring

**Output:**
- Annotated video frames
- JSON detection data
- Performance metrics

#### 3.2 Gesture Recognition (MediaPipe)

**File:** `python/mediapipe_voice/gesture_recognition.py`

**Features:**
- Hand landmark detection
- Gesture classification (peace, fist, thumbs up, etc.)
- Real-time tracking
- Gesture history

**Gestures Supported:**
- ✌️ Peace sign - Toggle detection
- ✊ Fist - Reset scene
- 👆 Point - Select object
- ✋ Open palm - Stop
- 👍 Thumbs up - Confirm

#### 3.3 Voice Recognition

**File:** `python/mediapipe_voice/voice_recognition.py`

**Features:**
- Speech-to-text with Google Speech API
- Text-to-speech with pyttsx3
- Command mapping
- Voice feedback

**Commands Supported:**
- "change color" - Change scene colors
- "rotate" - Toggle rotation
- "stop" - Stop animations
- "reset" - Reset to default state
- "zoom in/out" - Camera control
- "light on/off" - Lighting control

### 4. Deep Learning Module

**File:** `python/training/cnn_trainer.py`

#### 4.1 Custom CNN

**Architecture:**
- 4 convolutional blocks
- Batch normalization
- Max pooling
- Dropout regularization
- 3 fully connected layers

**Parameters:** ~2.5M trainable parameters

#### 4.2 Transfer Learning (ResNet50)

**Approach:**
- Pretrained ResNet50 backbone
- Frozen early layers
- Custom classification head
- Fine-tuning on target dataset

**Parameters:** ~23M total (3M trainable)

**Training Features:**
- Cross-validation
- Learning rate scheduling
- Early stopping
- Metrics visualization
- Confusion matrix generation

## Data Flow

### 1. Detection Flow

```
Webcam → YOLO → Detections → WebSocket → Frontend → 3D Overlay
```

### 2. Gesture Flow

```
Webcam → MediaPipe → Gesture → Command → WebSocket → Frontend → Scene Update
```

### 3. Voice Flow

```
Microphone → Speech Recognition → Command → WebSocket → Frontend → Action
```

### 4. Training Flow

```
Dataset → DataLoader → Model → Training Loop → Metrics → Visualization
```

## Communication Protocol

### WebSocket Messages

#### Client → Server

```json
{
  "type": "command",
  "command": "change color"
}
```

```json
{
  "type": "frame",
  "data": "<base64_encoded_image>"
}
```

#### Server → Client

```json
{
  "type": "detection",
  "detections": [
    {
      "class": "person",
      "confidence": 0.95,
      "bbox": [100, 100, 200, 300]
    }
  ],
  "timestamp": "2025-12-04T00:00:00"
}
```

```json
{
  "type": "metrics",
  "data": {
    "fps": 30,
    "latency": 25,
    "detections": 3,
    "active_connections": 1
  },
  "timestamp": "2025-12-04T00:00:00"
}
```

## Performance Considerations

### Frontend Optimization

- **LOD (Level of Detail):** Reduce polygon count for distant objects
- **Instancing:** Reuse geometries for particles
- **Frustum Culling:** Only render visible objects
- **Texture Compression:** Use compressed texture formats

### Backend Optimization

- **Async Processing:** Non-blocking I/O operations
- **Connection Pooling:** Efficient WebSocket management
- **Message Batching:** Group updates to reduce overhead
- **Caching:** Store frequently accessed data

### Vision Pipeline Optimization

- **GPU Acceleration:** CUDA for YOLO and PyTorch
- **Frame Skipping:** Process every Nth frame if needed
- **Resolution Scaling:** Reduce input resolution for faster processing
- **Model Quantization:** Use INT8 models for deployment

## Deployment

### Development

```bash
# Backend
cd python/websockets_api
python server.py

# Frontend
cd threejs
npm run dev
```

### Production

```bash
# Backend
uvicorn python.websockets_api.server:app --host 0.0.0.0 --port 8000

# Frontend
cd threejs
npm run build
npm run preview
```

## Security Considerations

- **CORS:** Configured for development (restrict in production)
- **WebSocket Authentication:** Add token-based auth for production
- **Input Validation:** Validate all incoming messages
- **Rate Limiting:** Prevent abuse of API endpoints

## Scalability

- **Horizontal Scaling:** Multiple backend instances with load balancer
- **Redis:** For shared state across instances
- **Message Queue:** RabbitMQ or Kafka for processing pipeline
- **CDN:** Serve static frontend assets

## Monitoring

- **Metrics Collection:** FPS, latency, detection count
- **Error Logging:** Centralized logging system
- **Performance Profiling:** Identify bottlenecks
- **User Analytics:** Track usage patterns

---

**Last Updated:** 2025-12-04
