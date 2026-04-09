# Summit2Shore Kafka Pipeline - Startup Script (PowerShell)
# Run from: C:\Users\vdondeti\Desktop\Podman_Machine\ (or wherever kafka/ folder is)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summit2Shore Kafka Pipeline" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Ensure Podman machine is running
Write-Host "`n[1/4] Checking Podman machine..." -ForegroundColor Yellow
$machineStatus = podman machine info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Starting Podman machine..." -ForegroundColor Yellow
    podman machine init 2>$null
    podman machine start
} else {
    Write-Host "  Podman machine is running" -ForegroundColor Green
}

# Step 2: Start Kafka containers
Write-Host "`n[2/4] Starting Kafka containers..." -ForegroundColor Yellow
podman compose -f compose.yml up -d
Start-Sleep -Seconds 10
podman ps

# Step 3: Install Python dependencies
Write-Host "`n[3/4] Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Step 4: Verify Kafka is ready
Write-Host "`n[4/4] Verifying Kafka..." -ForegroundColor Yellow
$maxRetries = 10
$retry = 0
while ($retry -lt $maxRetries) {
    $result = podman exec kafka kafka-topics --bootstrap-server localhost:9092 --list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Kafka is ready!" -ForegroundColor Green
        break
    }
    $retry++
    Write-Host "  Waiting for Kafka to start ($retry/$maxRetries)..."
    Start-Sleep -Seconds 3
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Ready! Run these in separate terminals:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Terminal 1 (Producer): python producer.py --watch" -ForegroundColor White
Write-Host "  Terminal 2 (Consumer): python consumer.py" -ForegroundColor White
Write-Host ""
Write-Host "  For testing:" -ForegroundColor Gray
Write-Host "    python producer.py --backfill   # Send all historical data" -ForegroundColor Gray
Write-Host "    python consumer.py --test       # Process 10 messages and stop" -ForegroundColor Gray
Write-Host ""
