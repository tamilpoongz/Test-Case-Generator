Write-Host "Testing Backend API..." -ForegroundColor Cyan

$payload = @{
    title = "User Login"
    description = "Test login feature"
    acceptanceCriteria = @("Username", "Password", "Button")
} | ConvertTo-Json

Write-Host "Sending request to backend..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/testcases/generate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -TimeoutSec 10

    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Test Cases: $($response.draftTestCases.Count)" -ForegroundColor Green
    Write-Host "Response: " -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
