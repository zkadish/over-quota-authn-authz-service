#! /bin/bash

echo "STARTUP SCRIPT..."
service nginx start
node -v
npm run debug
# npm run dev
# npm start
