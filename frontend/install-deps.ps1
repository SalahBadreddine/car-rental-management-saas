# Install dependencies script
Write-Host "Installing dependencies..." -ForegroundColor Green

# Try npm first
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "Using npm..." -ForegroundColor Yellow
    npm install
} elseif (Get-Command bun -ErrorAction SilentlyContinue) {
    Write-Host "Using bun..." -ForegroundColor Yellow
    bun install
} else {
    Write-Host "ERROR: Neither npm nor bun found in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Or install Bun from https://bun.sh/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Dependencies installed successfully!" -ForegroundColor Green

