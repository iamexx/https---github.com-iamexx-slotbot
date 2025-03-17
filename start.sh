#!/bin/bash

# Make sure we have the right Node.js version
export NODE_VERSION=16.x
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use $NODE_VERSION || nvm install $NODE_VERSION

# Start the application
npm start 