ARG image_name=RentalCar-BE

FROM openjdk:17
EXPOSE 8081
ADD target/RentalCar-BE-0.0.1-SNAPSHOT.jar RentalCar-BE-0.0.1-SNAPSHOT.jar
ENTRYPOINT ["java", "-jar", "/RentalCar-BE-0.0.1-SNAPSHOT.jar"]

LABEL image.name=$image_name