Write-Host "Starting CodeLeva Development Environment..." -ForegroundColor Cyan

# 1. Start Backend (Port 8001)
Write-Host "Launching Backend..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'python run_server.py'

# 2. Start AI Service (Port 8002)
Write-Host "Launching AI Service..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'uvicorn ai_service.main:app --host 0.0.0.0 --port 8002 --reload'

# 3. Start Frontend (Port 8080)
Write-Host "Launching Frontend..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm run dev'

Write-Host "All services attempted to start." -ForegroundColor Green
Write-Host "Frontend: http://localhost:8080"
Write-Host "Backend:  http://localhost:8001"
Write-Host "AI Service: http://localhost:8002"
