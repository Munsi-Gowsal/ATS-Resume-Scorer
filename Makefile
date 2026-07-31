IMAGE_NAME = ai-resume-intelligence:latest
COMPOSE_FILE = docker/docker-compose.yml

.PHONY: build up down test lint shell help

build:
	docker build -t $(IMAGE_NAME) -f docker/Dockerfile .

up:
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	docker-compose -f $(COMPOSE_FILE) down

test:
	docker run --rm $(IMAGE_NAME) python3 -m pytest

lint:
	docker run --rm $(IMAGE_NAME) python3 -m pytest tests/ --collect-only

shell:
	docker run --rm -it $(IMAGE_NAME) /bin/sh
