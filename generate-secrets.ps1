# Generate secure secrets for PemBlle deployment
Write-Host "=== Generating Secure Secrets for PemBlle ===" -ForegroundColor Green
Write-Host ""

# Generate JWT Secret (32 bytes)
$jwtBytes = New-Object byte[] 32
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($jwtBytes)
$jwtSecret = [Convert]::ToBase64String($jwtBytes)

Write-Host "JWT_SECRET:" -ForegroundColor Yellow
Write-Host $jwtSecret
Write-Host ""

# Generate Postgres Password (24 bytes)
$dbBytes = New-Object byte[] 24
$rng.GetBytes($dbBytes)
$dbPassword = [Convert]::ToBase64String($dbBytes)

Write-Host "POSTGRES_PASSWORD:" -ForegroundColor Yellow
Write-Host $dbPassword
Write-Host ""

Write-Host "=== Copy these to Coolify Environment Variables ===" -ForegroundColor Green
Write-Host ""
Write-Host "Full environment configuration:" -ForegroundColor Cyan
Write-Host ""
Write-Host "POSTGRES_USER=pemblle"
Write-Host "POSTGRES_PASSWORD=$dbPassword"
Write-Host "POSTGRES_DB=pemblle"
Write-Host "JWT_SECRET=$jwtSecret"
Write-Host "FRONTEND_URL=https://pemblle.link"
Write-Host "SMTP_HOST=smtp.zoho.com"
Write-Host "SMTP_PORT=587"
Write-Host "SMTP_USER=info@pemblle.link"
Write-Host "SMTP_PASS=<YOUR_ZOHO_PASSWORD>"
Write-Host "SMTP_FROM=info@pemblle.link"
Write-Host "ALLOWED_ORIGINS=https://pemblle.link"
Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
