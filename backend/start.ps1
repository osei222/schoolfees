# PowerShell Script to Start Backend Server
# Run this from the backend directory

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "School Fee Management Backend - Startup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "✓ Activating virtual environment..." -ForegroundColor Green
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "⚠ No virtual environment found" -ForegroundColor Yellow
    $createVenv = Read-Host "Create virtual environment? (y/n)"
    if ($createVenv -eq "y") {
        Write-Host "Creating virtual environment..." -ForegroundColor Yellow
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        Write-Host "✓ Virtual environment created" -ForegroundColor Green
        
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        pip install -r requirements.txt
        Write-Host "✓ Dependencies installed" -ForegroundColor Green
    }
}

Write-Host ""

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠ .env file not found!" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env from .env.example" -ForegroundColor Green
        Write-Host "⚠ Please edit .env with your database credentials" -ForegroundColor Yellow
        Write-Host ""
        pause
    }
}

# Check if database is initialized
Write-Host "Checking database..." -ForegroundColor Cyan
$initDb = Read-Host "Initialize database tables? (y/n)"
if ($initDb -eq "y") {
    python init_db.py
    Write-Host ""
}

# Start the server
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Starting FastAPI Server..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Yellow
Write-Host "  - API: http://localhost:8000" -ForegroundColor White
Write-Host "  - Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Health: http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
