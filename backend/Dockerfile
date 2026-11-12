# Stage 1: Build the Spring Boot application using Maven & Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and pom.xml first to leverage Docker cache for dependencies
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy application source code and compile
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal runtime image with JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Expose Spring Boot default port
EXPOSE 8080

# Copy executable jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Run Spring Boot app
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
