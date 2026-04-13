#!/usr/bin/env powershell

# Quick Test Script for Test Case Generator

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Test Case Generator - Quick Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n1️⃣  Testing Backend API..." -ForegroundColor Yellow

$testPayload = @{
    title = "User Login Feature"
    description = "Users should be able to login with valid credentials"
    acceptanceCriteria = @("Username field", "Password field", "Login button")
} | ConvertTo-Json

Write-Host "📤 Sending test request..." -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/testcases/generate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testPayload `
        -TimeoutSec 10

    Write-Host "`n✅ Response Received:" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Test Cases Count: $($response.draftTestCases.Count)" -ForegroundColor Green
    Write-Host "Summary: total=$($response.summary.totalTestCases), confidence=$($response.summary.averageConfidence)" -ForegroundColor Green
    
    if ($response.draftTestCases.Count -gt 0) {
        Write-Host "`n🎉 SUCCESS! Backend is returning test cases:" -ForegroundColor Green
        $response.draftTestCases | ForEach-Object {
            Write-Host "  • $($_.testCaseId): $($_.testCaseTitle)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "`n❌ ERROR: Backend returned 0 test cases" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ ERROR: Could not connect to backend" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nMake sure backend is running on http://localhost:3001" -ForegroundColor Yellow
    Exit 1
}

Write-Host "`n2️⃣  Testing Frontend Connection..." -ForegroundColor Yellow
Write-Host "Frontend URL: http://127.0.0.1:5173" -ForegroundColor White
Write-Host "`n✅ STEPS:" -ForegroundColor Green
Write-Host "1. Open browser and go to: http://127.0.0.1:5173" -ForegroundColor White
Write-Host "2. Press F12 to open Developer Tools" -ForegroundColor White
Write-Host "3. Go to Console tab" -ForegroundColor White
Write-Host "4. Fill in the form with:" -ForegroundColor White
Write-Host "   Title: User Login Feature" -ForegroundColor Cyan
Write-Host "   Description: Users should be able to login with valid credentials" -ForegroundColor Cyan
Write-Host "   Criteria: Username field, Password field, Login button" -ForegroundColor Cyan
Write-Host "5. Click Generate Test Cases button" -ForegroundColor White
Write-Host "6. Check console for logs starting with emojis" -ForegroundColor White
Write-Host "`n❌ If still showing 0, share those console logs with developer" -ForegroundColor Yellow

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
