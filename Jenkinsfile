pipeline {
    agent any

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
                    bat 'dotnet restore'
                    bat 'dotnet build --no-restore'
                }
            }
        }

        stage('Test .NET') {
            steps {
                dir('backend') {
                    bat 'dotnet test'
                }
            }
        }

        stage('Build React') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat """
                    dotnet-sonarscanner begin ^
                      /k:"TestProject" ^
                      /d:sonar.host.url=https://milo-multilighted-greetingly.ngrok-free.dev ^
                      /d:sonar.login=%SONAR_AUTH_TOKEN%

                    dotnet build backend

                    dotnet-sonarscanner end ^
                      /d:sonar.login=%SONAR_AUTH_TOKEN%
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
