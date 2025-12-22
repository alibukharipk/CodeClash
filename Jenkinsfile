pipeline {
    agent any

tools {
    dotnetsdk 'dotnet-sdk-8'
    nodejs 'node-18'
}

    environment {
        SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/alibukharipk/CodeClash.git'
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
                    bat 'dotnet test --collect:"XPlat Code Coverage"'
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
                    %SONAR_SCANNER_HOME%\\bin\\sonar-scanner
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
