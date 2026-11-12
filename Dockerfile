# Stage 1: Build the Spring Boot application using Maven & Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and backend pom.xml
COPY backend/.mvn backend/.mvn
COPY backend/mvnw backend/pom.xml backend/
RUN chmod +x backend/mvnw

# Copy backend source code and compile jar
COPY backend/src backend/src
WORKDIR /app/backend
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal runtime image with JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Expose Spring Boot default port
EXPOSE 8080

# Copy executable jar from build stage
COPY --from=build /app/backend/target/*.jar app.jar

# Run Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

