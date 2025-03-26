#!/bin/bash

# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install nginx -y

# Create nginx configuration
sudo tee /etc/nginx/sites-available/react-app << EOF
server {
    listen 80;
    server_name dealsourcer.de www.dealsourcer.de;
    
    root /var/www/html/build;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# Default server block for IP access
server {
    listen 80 default_server;
    server_name _;
    
    root /var/www/html/build;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Create web directory
sudo mkdir -p /var/www/html/build

# Copy build files
sudo cp -r build/* /var/www/html/build/

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Restart nginx
sudo systemctl restart nginx

# Print success message
echo "Deployment completed! Your React app should be running on http://your-ec2-ip" 