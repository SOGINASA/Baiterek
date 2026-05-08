#!/bin/sh
set -e

echo "Initializing database..."
flask init-db

echo "Starting gunicorn..."
exec gunicorn --preload -w 4 --threads 10 -b 0.0.0.0:5252 --timeout 120 wsgi:app
