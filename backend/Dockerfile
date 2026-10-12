# ==============================================================================
# ShopSphere Campus - Backend Dockerfile
# Multi-stage build for Spring Boot 3.3.4 (Java 21)
# ==============================================================================

# Stage 1: Build JAR using Maven
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependency download layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application (skip tests during container packaging)
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root application user for container security
RUN addgroup -S shopsphere && adduser -S shopsphere -G shopsphere

# Copy compiled jar from build stage
COPY --from=builder /app/target/shopsphere-backend-*.jar app.jar
RUN chown shopsphere:shopsphere app.jar

USER shopsphere

# Expose Spring Boot application port
EXPOSE 8080

# Production JVM ergonomics for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Container healthcheck via Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
