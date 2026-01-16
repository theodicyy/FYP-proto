#!/bin/bash
cd backend
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOL
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=capability_statement_db
LOG_LEVEL=info
EOL
  echo "⚠️  Please edit backend/.env and add your MySQL password!"
  echo "Press Enter after updating .env to continue..."
  read
fi

if [ ! -d node_modules ]; then
  echo "Installing backend dependencies..."
  npm install
fi

echo "Starting backend server..."
npm run dev
