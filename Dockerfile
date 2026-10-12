# ==============================================================================
# ShopSphere Campus - Root Level Backend Dockerfile for Railway / Cloud
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

RUN apk add --no-cache maven

# Copy backend pom.xml and sources
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Build JAR
RUN mvn clean package -DskipTests -B

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-default} -jar target/*.jar"]
