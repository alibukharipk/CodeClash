pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    environment {
        SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/alibukharipk/CodeClash'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                npm install
                '''
            }
        }

        stage('Build React App') {
            steps {
                sh '''
                npm run build
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                      -Dsonar.projectKey=react-app \
                      -Dsonar.sources=src \
                      -Dsonar.language=js \
                      -Dsonar.sourceEncoding=UTF-8
                    '''
                }
            }
        }
    }
}
