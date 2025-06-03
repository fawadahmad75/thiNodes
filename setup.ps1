
# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
  Write-Host "Creating .env file..." -ForegroundColor Green
  @"
PORT=5000
NODE_ENV=development
JWT_SECRET_KEY=hospital-management-jwt-secret-key
DB_CLIENT=pg
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hospital_management
DB_PORT=5432
CORS_ORIGIN=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
  Write-Host ".env file created. Please update the database credentials." -ForegroundColor Yellow
} else {
  Write-Host ".env file already exists." -ForegroundColor Cyan
}

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Green
npm run migrate

Write-Host "Setup completed successfully!" -ForegroundColor Green
