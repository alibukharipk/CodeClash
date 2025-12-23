pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18' // Must match NodeJS configured in Jenkins
    }

    environment {
        SONARQUBE = 'SonarQube' // Must match the SonarQube server name in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '  npm install --legacy-peer-deps'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Scan') {
            environment {
                scannerHome = tool 'SonarScanner' // SonarQube Scanner configured in Jenkins
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=react-app -Dsonar.sources=src -Dsonar.host.url=http://localhost:9000 -Dsonar.login=YOUR_SONAR_TOKEN"
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
