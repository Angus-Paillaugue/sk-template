#!/usr/bin/env bash

HERE=$(dirname "$(readlink -f "$0")")
PROJECT_ROOT=$(realpath "$HERE/..")
config_file="$PROJECT_ROOT/config.json"

function get_config_value() {
  local key="$1"
  local value=$(jq -r ".$key" "$config_file")
  echo "$value"
}


# Check if .env file exists
if [ ! -f "$config_file" ]; then
  echo "Config file not found at $config_file"
  exit 1
fi
if [[ ! -f "$PROJECT_ROOT/.env" && -f "$PROJECT_ROOT/.env.example" ]]; then
  mv "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
fi
# Await user input to continue
echo "Please fill in the .env and config.json files with your configuration details."
read -p "Press Enter to continue after editing these files..."
. "$PROJECT_ROOT/.env"

# Handle Postgres .sql files
sed -i "s/<POSTGRES_USER>/$POSTGRES_USER/g" "$PROJECT_ROOT/sql/init.sql"
sed -i "s/<PROJECT_NAME>/$(get_config_value "project_name")/g" "$PROJECT_ROOT/sql/init.sql"

# Handle docker files
docker_username=$(docker info | sed '/Username:/!d;s/.* //');
if [ -z "$docker_username" ]; then
  echo "Docker username not found. Please enter it manually."
  read -p "Enter your Docker username: " docker_username
  if [ -z "$docker_username" ]; then
    echo "Docker username cannot be empty."
    exit 1
  fi
fi
sed -i "s/<DOCKER_USERNAME>/$docker_username/g" "$PROJECT_ROOT/scripts/build-image.sh"
sed -i "s/<PROJECT_NAME>/$(get_config_value "project_name")/g" "$PROJECT_ROOT/scripts/build-image.sh"
sed -i "s/<DOCKER_USERNAME>/$docker_username/g" "$PROJECT_ROOT/docker-compose.yaml"
sed -i "s/<PROJECT_NAME>/$(get_config_value "project_name")/g" "$PROJECT_ROOT/docker-compose.yaml"
