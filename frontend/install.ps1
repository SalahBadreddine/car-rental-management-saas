# Install Dependencies Script
Write-Host "Searching for npm..." -ForegroundColor Yellow

# Try to find npm
$npmPath = $null

# Check common locations
$locations = @(
    "C:\Program Files\nodejs\npm.cmd",
    "C:\Program Files (x86)\nodejs\npm.cmd",
    "$env:APPDATA\npm\npm.cmd",
    "$env:LOCALAPPDATA\Programs\nodejs\npm.cmd"
)

foreach ($loc in $locations) {
    if (Test-Path $loc) {
        $npmPath = $loc
        Write-Host "Found npm at: $npmPath" -ForegroundColor Green
        break
    }
}

# Try where.exe
if (-not $npmPath) {
    try {
        $whereResult = where.exe npm 2>&1
        if ($whereResult -and $whereResult -notmatch "INFO:") {
            $npmPath = $whereResult.Trim()
            Write-Host "Found npm via where.exe: $npmPath" -ForegroundColor Green
        }
    } catch {
        Write-Host "where.exe did not find npm" -ForegroundColor Yellow
    }
}

# Install if found
if ($npmPath) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    & $npmPath install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nDependencies installed successfully!" -ForegroundColor Green
        Write-Host "Please restart the TypeScript server in VS Code:" -ForegroundColor Yellow
        Write-Host "  Press Ctrl+Shift+P, then type: TypeScript: Restart TS Server" -ForegroundColor Yellow
    } else {
        Write-Host "`n✗ Installation failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "`n✗ npm not found!" -ForegroundColor Red
    Write-Host "`nPlease install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart VS Code and run this script again." -ForegroundColor Yellow
    exit 1
}

