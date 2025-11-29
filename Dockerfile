# This is a placeholder Dockerfile for Coolify compatibility
# The actual deployment uses docker-compose.yml with multiple services

FROM alpine:latest

RUN echo "This project uses Docker Compose for deployment."
RUN echo "Please ensure Coolify is configured to use docker-compose.yml"

CMD ["echo", "Please use docker-compose.yml for deployment"]
