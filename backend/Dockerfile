# ==============================================================================
# ShopSphere Campus - Lightweight Single-Stage Backend Dockerfile
# Optimized for Railway, Render & Cloud Platforms
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy POM and sources
COPY pom.xml .
COPY src ./src

# Build JAR directly inside the container
RUN mvn clean package -DskipTests -B

# Expose dynamic HTTP port
EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Launch Spring Boot using wildcard match in target directory
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-default} -jar target/*.jar"]
