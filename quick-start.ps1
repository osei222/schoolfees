# Quick Start Script for School Fee Management System
# This script helps you start both backend and frontend servers

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  School Fee Management System - Quick Start" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    Write-Host "  Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js" -ForegroundColor Red
    Write-Host "  Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service postgresql* -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq 'Running') {
    Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL not detected or not running" -ForegroundColor Yellow
    Write-Host "  Please install and start PostgreSQL" -ForegroundColor Yellow
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  What would you like to do?" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Install all dependencies" -ForegroundColor White
Write-Host "2. Initialize database" -ForegroundColor White
Write-Host "3. Start backend server only" -ForegroundColor White
Write-Host "4. Start frontend server only" -ForegroundColor White
Write-Host "5. Start BOTH servers (recommended)" -ForegroundColor Green
Write-Host "6. Run backend tests" -ForegroundColor White
Write-Host "7. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-7)"

switch ($choice) 
{
    "1" 
    {
        Write-Host ""
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        
        # Install backend dependencies
        Write-Host ""
        Write-Host "Installing backend Python packages..." -ForegroundColor Yellow
        Set-Location backend
        pip install -r requirements.txt
        Set-Location ..
        
        # Install frontend dependencies
        Write-Host ""
        Write-Host "Installing frontend npm packages..." -ForegroundColor Yellow
        Set-Location school-fee-management
        npm install
        Set-Location ..
        
        Write-Host ""
        Write-Host "✓ All dependencies installed!" -ForegroundColor Green
    }
    "2" 
    {
        Write-Host ""
        Write-Host "Initializing database..." -ForegroundColor Cyan
        Set-Location backend
        python init_db.py
        Set-Location ..
        Write-Host ""
        Write-Host "✓ Database initialized!" -ForegroundColor Green
    }
    "3" 
    {
        Write-Host ""
        Write-Host "Starting backend server..." -ForegroundColor Cyan
        Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Yellow
        Write-Host "API Documentation at: http://localhost:8000/docs" -ForegroundColor Yellow
        Write-Host ""
        Set-Location backend
        uvicorn app.main:app --reload
    }
    "4" 
    {
        Write-Host ""
        Write-Host "Starting frontend server..." -ForegroundColor Cyan
        Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Yellow
        Write-Host ""
        Set-Location school-fee-management
        npm run dev
    }
    "5" 
    {
        Write-Host ""
        Write-Host "Starting both servers..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Backend will be at: http://localhost:8000" -ForegroundColor Yellow
        Write-Host "Frontend will be at: http://localhost:5173" -ForegroundColor Yellow
        Write-Host "API Docs will be at: http://localhost:8000/docs" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Red
        Write-Host ""
        
        # Start backend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; uvicorn app.main:app --reload"
        
        # Wait a bit for backend to start
        Start-Sleep -Seconds 3
        
        # Start frontend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\school-fee-management'; Write-Host 'Starting Frontend Server...' -ForegroundColor Green; npm run dev"
        
        Write-Host "✓ Both servers started in separate windows!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Open http://localhost:5173 in your browser" -ForegroundColor White
        Write-Host "2. Register a new school account" -ForegroundColor White
        Write-Host "3. Start managing your school fees!" -ForegroundColor White
    }
    "6" 
    {
        Write-Host ""
        Write-Host "Running backend tests..." -ForegroundColor Cyan
        Set-Location backend
        python test_api.py
        Set-Location ..
    }
    "7" 
    {
        Write-Host ""
        Write-Host "Goodbye! 👋" -ForegroundColor Cyan
        exit 0
    }
    default 
    {
        Write-Host ""
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
