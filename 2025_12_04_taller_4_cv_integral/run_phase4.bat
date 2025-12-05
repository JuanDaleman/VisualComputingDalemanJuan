@echo off
echo Starting Phase 4: Integrated System...

echo 1. Starting WebSocket Server...
start "WebSocket Server" cmd /k "cd python && venv\Scripts\activate && python websockets_api/server.py"

echo 2. Starting Frontend...
start "React Frontend" cmd /k "cd threejs && npm install && npm run dev"

echo 3. Waiting for server...
ping 127.0.0.1 -n 11 > nul

echo 4. Starting Vision Backend...
start "Vision Backend" cmd /k "cd python && venv\Scripts\activate && python utils/integrated_demo.py"

echo System started!
pause
