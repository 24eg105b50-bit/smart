# ==============================================================================
# ShopSphere Campus - Backend Dockerfile
# Multi-stage build for Spring Boot 3.3.4 (Java 21)
# ==============================================================================

# Stage 1: Build JAR using Maven on Temurin JDK 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

RUN apk add --no-cache maven

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root application user for container security
RUN addgroup -S shopsphere && adduser -S shopsphere -G shopsphere

# Copy compiled jar from build stage
COPY --from=builder /app/target/*.jar app.jar
RUN chown shopsphere:shopsphere app.jar


USER shopsphere

# Expose default Spring Boot application port (Railway sets $PORT dynamically)
EXPOSE 8080

# Production JVM ergonomics for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-default} -jar app.jar"]
