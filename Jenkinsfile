pipeline {
    agent any

//     environment {
//         MSSQL_SERVER = 'localhost'
//         MSSQL_DATABASE = 'carrental'
//         MSSQL_USERNAME = 'sa'
//         MSSQL_PASSWORD = credentials('mssql-password')
//     }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/phucanhprono1/rentalcar-group2.git'
            }
        }

        stage('Build Backend') {
            steps {
                dir('RentalCar-BE') {
                    sh 'mvn clean package'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('FE-RentalCarAngular') {
                    sh 'npm install'
                    sh 'ng build --prod'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('RentalCar-BE') {
                    sh 'mvn test'
                }
                dir('FE-RentalCarAngular') {
                    sh 'ng test --watch=false --browsers=ChromeHeadless'
                }
            }
        }

//         stage('Deploy Database') {
//             steps {
//                 script {
//                     // Run SQL scripts to update database schema
//                     sh "sqlcmd -S $MSSQL_SERVER -d $MSSQL_DATABASE -U $MSSQL_USERNAME -P $MSSQL_PASSWORD -i RentalCar-BE/src/main/resources/init.sql"
//                 }
//             }
//         }

        stage('Deploy') {
            steps {
                // Deploy backend
                sh 'docker build -t carrental-backend RentalCar-BE'
                sh 'docker run -d -p 8082:8082 carrental-backend'

                // Deploy frontend
                sh 'docker build -t carrental-frontend FE-RentalCarAngular'
                sh 'docker run -d -p 4200:80 carrental-frontend'
            }
        }
    }

    post {
        always {
            // Clean up
            sh 'docker system prune -f'
        }
    }
}