FROM openjdk:17-jdk-slim

WORKDIR /app

# 빌드된 JAR 파일 복사 (plain jar 제외)
COPY build/libs/sca-be-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]

