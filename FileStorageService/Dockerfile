ARG image_name=FileStorageService

FROM openjdk:17
EXPOSE 8082
ADD target/FileStorageService-0.0.1-SNAPSHOT.jar FileStorageService-0.0.1-SNAPSHOT.jar
ENTRYPOINT ["java", "-jar", "/FileStorageService-0.0.1-SNAPSHOT.jar"]

LABEL image.name=$image_name