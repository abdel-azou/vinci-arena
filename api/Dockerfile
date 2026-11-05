# Etape 1: compilation avec Maven
FROM maven:3.9.9-amazoncorretto-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Etape 2: execution avec un JRE leger
FROM eclipse-temurin:21-jre-jammy AS prod

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 3000

CMD ["java", "-jar", "app.jar"]
