#!/bin/bash

docker build -f Dockerfile.base --tag app-base ./;

docker-compose -f docker-compose.yml -f docker-compose.prod.yml build;

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up;

#docker-compose up -d db;

#docker-compose -f docker-compose.yml -f docker-compose.test.yml down;