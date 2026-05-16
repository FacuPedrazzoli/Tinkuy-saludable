#!/bin/bash
# Generate self-signed SSL certificates for local development
# Usage: ./scripts/generate-certs.sh

mkdir -p certs

openssl req -x509 -newkey rsa:2048 \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -days 365 \
  -nodes \
  -subj "/CN=localhost"

echo "Certificates generated in certs/"
echo "WARNING: Only use these for local development!"
