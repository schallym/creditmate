.DEFAULT_GOAL := help
help:
	@echo "⚠️  Caution: those targets are written for dev environement."
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

start-db: ## Start the database container
	@echo "Starting database container..."
	@docker run --name creditmate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=creditmate -p 5432:5432 -d postgres:15
	@echo "Waiting for the database to be ready..."
	@while ! docker exec creditmate-postgres pg_isready -U postgres; do sleep 1; done
	@echo "Database is ready."

stop-db: ## Stop the database container
	@echo "Stopping database container..."
	@docker stop creditmate-postgres || true

down-db: ## Remove the database container
	@echo "Removing database container..."
	@docker container rm creditmate-postgres || true

start-server: ## Run the development server
	@echo "Starting the development server..."
	@npm run dev
