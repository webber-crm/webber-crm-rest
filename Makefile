run:
	docker run -d -p 80:8888 --env-file ./config/.env --name node-crm-container --rm node-crm:env
stop:
	docker stop node-crm-container
build:
	docker build -t node-crm:env .
