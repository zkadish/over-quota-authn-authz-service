#! /bin/bash

echo "STARTUP SCRIPT..."
service nginx start
node -v
# npm run debug
npm run debug:docker
# npm run dev
# npm start
