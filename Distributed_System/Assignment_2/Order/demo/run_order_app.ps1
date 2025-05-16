# Order Service Build and Run PowerShell Script
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Building and Running Order Service Application" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Set Java to version 17
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.15.6-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Using Java version:" -ForegroundColor Yellow
java -version
Write-Host ""

# Change to the script's directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Building Order Service with Maven..." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Build the application
mvn clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check the error messages above." -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit"
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "Build successful! Starting the Order Service..." -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Run the application
mvn spring-boot:run

Read-Host -Prompt "Press Enter to exit"
