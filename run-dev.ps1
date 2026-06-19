# Write-Host "Starting Client..." -ForegroundColor Green
# Start-Process powershell -ArgumentList "cd client; npm run dev"

# Write-Host "Starting Server..." -ForegroundColor Cyan
# Start-Process powershell -ArgumentList "cd server; npx tsx watch src/app.ts"

# Start-Job { cd client; npm run dev }
# Start-Job { cd server; npx tsx watch src/app.ts }

# Write-Host "Both running in background jobs..." -ForegroundColor Green
# Receive-Job -Keep

$client = Start-Process powershell -ArgumentList "cd client; npm run dev" -PassThru -NoNewWindow
$server = Start-Process powershell -ArgumentList "cd server; npx tsx watch src/app.ts" -PassThru -NoNewWindow

Wait-Process $client, $server