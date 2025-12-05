# Demo Routines - Step-by-Step Guide

## Quick Start (5 minutes)

### 1. Backend Setup

```bash
cd python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.in
```

### 2. Start WebSocket Server

```bash
cd python/websockets_api
python server.py
```

Expected output:
```
🚀 Visual Computing Server started!
📊 Metrics broadcaster running
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 3. Start Frontend (New Terminal)

```bash
cd threejs
cp package.pkg package.json  # Rename package file
npm install
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### 4. Open Browser

Navigate to `http://localhost:5173` and you should see the 3D scene!

---

## Full Demo Routine (30 minutes)

### Demo 1: Object Detection

**Duration:** 5 minutes

1. **Start YOLO detector:**
   ```bash
   cd python/detection
   python yolo_detector.py
   ```

2. **Expected behavior:**
   - Webcam window opens
   - Objects are detected in real-time
   - Bounding boxes drawn around objects
   - FPS displayed in top-left corner

3. **Test cases:**
   - Show different objects to camera
   - Move objects closer/farther
   - Multiple objects simultaneously
   - Press 'q' to quit

4. **Outputs generated:**
   - `results/videos/detection_output.mp4`
   - `results/detection_history.json`

### Demo 2: Gesture Recognition

**Duration:** 5 minutes

1. **Start gesture recognizer:**
   ```bash
   cd python/mediapipe_voice
   python gesture_recognition.py
   ```

2. **Test gestures:**
   - ✌️ **Peace sign** (index + middle fingers up)
   - ✊ **Fist** (all fingers closed)
   - 👆 **Point** (index finger up)
   - ✋ **Open palm** (all fingers extended)
   - 👍 **Thumbs up**

3. **Expected behavior:**
   - Hand landmarks drawn on video
   - Gesture name displayed
   - Console prints detected gestures

### Demo 3: Voice Commands

**Duration:** 5 minutes

1. **Start voice controller:**
   ```bash
   cd python/mediapipe_voice
   python voice_recognition.py
   ```

2. **Test commands:**
   - Say: "change color"
   - Say: "rotate"
   - Say: "stop"
   - Say: "reset"
   - Say: "quit" to exit

3. **Expected behavior:**
   - System confirms each command
   - Voice feedback provided
   - Commands logged to console

### Demo 4: Integrated System

**Duration:** 10 minutes

1. **Start all components:**

   **Terminal 1 - Backend:**
   ```bash
   cd python/websockets_api
   python server.py
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd threejs
   npm run dev
   ```

   **Terminal 3 - Integrated Demo:**
   ```bash
   cd python/utils
   python integrated_demo.py
   ```

2. **Test integration:**
   - Show objects to camera → See detections in overlay
   - Make hand gestures → See scene respond
   - Type commands in dashboard → See 3D scene change
   - Monitor metrics in real-time

3. **Interactive features:**
   - Rotate 3D view with mouse
   - Zoom with scroll wheel
   - Click quick command buttons
   - Watch FPS and latency metrics

### Demo 5: CNN Training

**Duration:** 5 minutes (or longer for full training)

1. **Quick model test:**
   ```bash
   cd python/training
   python cnn_trainer.py
   ```

2. **Expected output:**
   ```
   Creating custom CNN...
   Creating ResNet50 model...
   Models created successfully!
   Custom CNN parameters: 2,547,210
   ResNet50 parameters: 23,512,130
   ```

3. **For full training (requires dataset):**
   - Prepare dataset in `data/raw/`
   - Modify training script with dataset path
   - Run training for 10-20 epochs
   - View metrics plots in `results/images/`

---

## Recording Demos for Submission

### Video Recording (30-60 seconds)

**Recommended structure:**

1. **0-10s:** Show system overview
   - Pan across all three windows (backend, frontend, demo)
   - Highlight the 3D scene

2. **10-25s:** Object detection demo
   - Show camera detecting objects
   - Display bounding boxes
   - Show detection overlay updating

3. **25-40s:** Gesture interaction
   - Perform peace sign → scene changes
   - Perform fist → scene resets
   - Show hand landmarks tracking

4. **40-55s:** Voice commands
   - Type "change color" → colors change
   - Type "rotate" → rotation toggles
   - Show metrics updating

5. **55-60s:** Final overview
   - Show all components working together
   - Display metrics dashboard

### GIF Creation (6+ required)

**GIF 1: Object Detection**
```bash
# Record 5 seconds of YOLO detection
# Show multiple objects being detected
```

**GIF 2: Gesture Recognition**
```bash
# Show hand gestures being recognized
# Display landmarks and gesture names
```

**GIF 3: 3D Scene Interaction**
```bash
# Rotate camera around scene
# Show objects animating
```

**GIF 4: Color Change Command**
```bash
# Type "change color" command
# Show scene colors changing
```

**GIF 5: Metrics Dashboard**
```bash
# Show FPS, latency, detections updating
# Highlight real-time metrics
```

**GIF 6: Integrated Demo**
```bash
# Show all systems working together
# Detection + gestures + 3D scene
```

**Tools for GIF creation:**
- **Linux:** `peek`, `byzanz`
- **macOS:** `LICEcap`, `Gifox`
- **Windows:** `ScreenToGif`, `LICEcap`
- **Command line:** `ffmpeg`

```bash
# Example with ffmpeg
ffmpeg -i input_video.mp4 -vf "fps=15,scale=800:-1:flags=lanczos" output.gif
```

---

## Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd python
pip install -r requirements.in
```

### Frontend won't start

**Error:** `Cannot find module 'react'`

**Solution:**
```bash
cd threejs
npm install
```

### Camera not detected

**Error:** `Cannot open camera 0`

**Solution:**
- Try different camera ID: `camera_id=1` or `camera_id=2`
- Check camera permissions
- Ensure no other app is using camera

### WebSocket connection failed

**Error:** `Failed to connect to WebSocket`

**Solution:**
- Ensure backend server is running
- Check port 8000 is not in use
- Verify firewall settings

### Low FPS

**Possible causes:**
- CPU-only mode (no GPU)
- High resolution input
- Too many detections

**Solutions:**
- Use smaller YOLO model: `yolov8n.pt` instead of `yolov8x.pt`
- Reduce camera resolution
- Increase confidence threshold

---

## Performance Benchmarks

### Expected Performance

**Hardware:** Mid-range laptop (Intel i5, 8GB RAM, no GPU)
- YOLO FPS: 15-25
- MediaPipe FPS: 25-35
- Integrated System FPS: 12-20
- WebSocket Latency: 10-30ms

**Hardware:** Gaming PC (Intel i7, 16GB RAM, NVIDIA GTX 1660)
- YOLO FPS: 40-60
- MediaPipe FPS: 50-70
- Integrated System FPS: 35-50
- WebSocket Latency: 5-15ms

---

## Presentation Tips

1. **Start with overview:** Show architecture diagram
2. **Live demo:** Run integrated system
3. **Highlight features:** Detection, gestures, 3D visualization
4. **Show metrics:** FPS, latency, accuracy
5. **Code walkthrough:** Key components
6. **Results:** Training metrics, confusion matrices
7. **Q&A:** Be ready to explain technical decisions

---

**Last Updated:** 2025-12-04
