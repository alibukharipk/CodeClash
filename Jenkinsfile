pipeline {
    agent any

 tools {
        dotnet 'dotnet'
        nodejs 'NodeJS'
    }

    environment {
        SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Restore & Build .NET') {
            steps {
                dir('backend') {
                    bat "${DOTNET_SDK}/dotnet restore"
                    bat "${DOTNET_SDK}/dotnet build --no-restore"
                }
            }
        }

        stage('Test .NET') {
            steps {
                dir('backend') {
                    bat "${DOTNET_SDK}/dotnet test --no-build --verbosity normal"
                }
            }
        }

        stage('Build ReactJS') {
            steps {
                dir('frontend') {
                    withEnv(["PATH+NODE=${NODEJS}/bin"]) {
                        bat "npm install"
                        bat "npm run build"
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('backend') {
                        bat "${DOTNET_SDK}/dotnet sonarscanner begin /k:\"TestProject\" /d:sonar.host.url=\"${SONAR_HOST_URL}\" /d:sonar.login=\"${SONAR_AUTH_TOKEN}\""
                        bat "${DOTNET_SDK}/dotnet build"
                        bat "${DOTNET_SDK}/dotnet sonarscanner end /d:sonar.login=\"${SONAR_AUTH_TOKEN}\""
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
        }
    }
}
