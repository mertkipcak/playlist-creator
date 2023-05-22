# Variables
IMAGE_NAME := spotygen

.PHONY: build

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker-compose up
