Write-Host "Starting Phase 4: Integrated System..." -ForegroundColor Cyan

Write-Host "1. Starting WebSocket Server..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd python && venv\Scripts\activate && python websockets_api/server.py" -Title "WebSocket Server"

Write-Host "2. Starting Frontend..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd threejs && npm install && npm run dev" -Title "React Frontend"

Write-Host "3. Waiting for server (10s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "4. Starting Vision Backend..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd python && venv\Scripts\activate && python utils/integrated_demo.py" -Title "Vision Backend"

Write-Host "System started!" -ForegroundColor Cyan
Read-Host "Press Enter to exit launcher..."
