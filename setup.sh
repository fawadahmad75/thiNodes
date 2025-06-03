#!/bin/bash
# filepath: c:\Users\fawad\OneDrive\Desktop\code practice\thiNodes\setup.sh

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
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
EOF
  echo ".env file created. Please update the database credentials."
else
  echo ".env file already exists."
fi

# Run database migrations
echo "Running database migrations..."
npm run migrate

echo "Setup completed successfully!"
