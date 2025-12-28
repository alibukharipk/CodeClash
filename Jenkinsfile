pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    stages {
        stage('Install & Build') {
            steps {
                sh '''
                  node -v
                  npm -v
                  npm install --legacy-peer-deps
                  npm run build
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                          ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=ReactApp \
                            -Dsonar.sources=src
                        """
                    }
                }
            }
        }

stage('OWASP Dependency-Check') {
    steps {
        // Optional: make sure folder exists
        sh 'mkdir -p dependency-check-reports'

        dependencyCheck additionalArguments: '''
            --scan package-lock.json
            --format XML
            --out dependency-check-reports/dependency-check-report.xml
            --failOnCVSS 7
            --project "ReactJS-SonarTest"
        ''',
        odcInstallation: 'dependency-check'
    }
}
    }

    post {
    always {
        dependencyCheckPublisher pattern: 'dependency-check-reports/dependency-check-report.xml'
    }
        failure {
            echo '❌ Build failed due to quality or security issues'
        }
    }
}
