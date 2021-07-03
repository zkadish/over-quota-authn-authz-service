#! /bin/bash

echo "STARTUP SCRIPT..."
service nginx start
# npm start
node -v
# npm run dev
npm run debug
