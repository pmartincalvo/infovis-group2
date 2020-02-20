#!/bin/bash
source .env
docker build -t reddit_links_db:latest .
docker run --name reddit_links_db -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" -e POSTGRES_USER="$POSTGRES_USER" -e POSTGRES_DB="$POSTGRES_DB" -p 5432:"$DB_PORT" -v reddit_links_db_volume -d reddit_links_db
