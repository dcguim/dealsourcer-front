# React App Deployment Guide

This guide will help you deploy your React application to an Ubuntu server running Nginx with HTTPS.

## Prerequisites

- A built React application (`npm run build`)
- SSH access to your Ubuntu server
- The server has Nginx installed and configured with SSL

## Deployment Steps

### 1. Build Your React Application

```bash
# In your local development environment
npm run build
```

### 2. Transfer Files to Server

Transfer your build files to the server. You can use SCP for this:

```bash
# From your local machine, in the project directory
scp -r build/* username@server-ip:/tmp/react-build/
```

Replace `username@server-ip` with your actual server credentials.

### 3. Deploy Files to Web Root

SSH into your server and run these commands:

```bash
# Connect to your server
ssh username@server-ip

# Create a backup of the current website (recommended)
sudo tar -czf /var/www/backup-$(date +%Y%m%d%H%M%S).tar.gz -C /var/www/html .

# Remove existing files
sudo rm -rf /var/www/html/*

# Copy new build files to web root
sudo cp -r /tmp/react-build/* /var/www/html/

# Set proper ownership and permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Test Nginx configuration
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

### 4. Verify Deployment

Visit your website in a browser to verify the deployment was successful:
- https://dealsourcer.de

### 5. Troubleshooting

If you encounter issues:

1. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. Verify file permissions:
   ```bash
   ls -la /var/www/html
   ```

3. Ensure your Nginx configuration is correct:
   ```bash
   sudo nginx -t
   ```

4. Restore from backup if needed:
   ```bash
   # List available backups
   ls -la /var/www/backup-*.tar.gz
   
   # Restore a specific backup
   sudo rm -rf /var/www/html/*
   sudo tar -xzf /var/www/backup-TIMESTAMP.tar.gz -C /var/www/html
   sudo systemctl reload nginx
   ```

## Automated Deployment Script

For future deployments, you can create a script on your local machine:

```bash
#!/bin/bash

# Build the React app
npm run build

# Transfer files to server
scp -r build/* username@server-ip:/tmp/react-build/

# Execute deployment commands on the server
ssh username@server-ip << 'EOF'
  # Create backup
  sudo tar -czf /var/www/backup-$(date +%Y%m%d%H%M%S).tar.gz -C /var/www/html .
  
  # Deploy new files
  sudo rm -rf /var/www/html/*
  sudo cp -r /tmp/react-build/* /var/www/html/
  sudo chown -R www-data:www-data /var/www/html
  sudo chmod -R 755 /var/www/html
  
  # Reload Nginx
  sudo nginx -t && sudo systemctl reload nginx
  
  # Clean up
  rm -rf /tmp/react-build
  
  echo "✅ Deployment completed!"
EOF
```

Save this as `deploy.sh`, make it executable with `chmod +x deploy.sh`, and run it with `./deploy.sh`.

Remember to replace `username@server-ip` with your actual server credentials. 