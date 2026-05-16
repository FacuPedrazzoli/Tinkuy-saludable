# Generate self-signed certificates for testing:
# openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"

# For production with Let's Encrypt:
# certbot --nginx -d yourdomain.com
