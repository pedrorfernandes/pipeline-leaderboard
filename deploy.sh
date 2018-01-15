#!/bin/bash

docker build -f Dockerfile.base --tag app-base --no-cache ./;

docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache;

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --force-recreate;

#docker-compose up -d db;

#docker-compose -f docker-compose.yml -f docker-compose.test.yml down;