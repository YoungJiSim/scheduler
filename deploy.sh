#!/bin/bash

set -e

APP_DIR="/home/ec2-user/scheduler"
APP_NAME="scheduler"
TIME=$(date "+%Y-%m-%d %H:%M:%S")

echo "===================="
echo "[$TIME] Deploying..."
echo "===================="

cd $APP_DIR

echo ">>> Git Pulling..."
git pull origin main

echo ">>> npm installing..."
npm install

if pm2 list | grep -q "$APP_NAME"; then
    echo ">>> Restarting $APP_NAME..."
    pm2 restart $APP_NAME
else
    echo ">>> Starting $APP_NAME..."
    pm2 start server.js --name "$APP_NAME"
fi

echo "============================="
echo "[$TIME] Successfully Deplyed!"
echo "============================="
