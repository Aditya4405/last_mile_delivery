# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies to cache them in docker layers
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Production execution stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/lastmile-backend-0.0.1-SNAPSHOT.jar app.jar

# Setup uploads mount directory
RUN mkdir -p /app/uploads

# Expose backend port
EXPOSE 8084

# Install curl for health check operations
RUN apk add --no-cache curl

# Add container health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8084/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
