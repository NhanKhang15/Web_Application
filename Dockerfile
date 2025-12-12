# ===== BUILD STAGE =====
FROM maven:3.9.5-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/src ./src
RUN mvn -q -DskipTests clean package

# ===== RUN STAGE =====
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# tạo thư mục uploads
RUN mkdir -p /app/uploads
VOLUME ["/app/uploads"]

COPY --from=build /app/target/*.jar /app/app.jar

ENV SERVER_PORT=8081
EXPOSE 8081
# Cho phép thêm JVM flags qua JAVA_OPTS
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -jar /app/app.jar" ]
