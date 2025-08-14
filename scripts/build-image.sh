#!/usr/bin/env bash

# Build the Docker image for the application
docker build -t <DOCKER_USERNAME>/<PROJECT_NAME>:latest .
# Tag the image with the latest tag
docker tag <DOCKER_USERNAME>/<PROJECT_NAME>:latest <DOCKER_USERNAME>/<PROJECT_NAME>:latest
# Push the image to the Docker registry
docker push <DOCKER_USERNAME>/<PROJECT_NAME>:latest
