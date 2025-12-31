pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
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
        dependencyCheck additionalArguments: '''
            --scan .
            --out dependency-check-report
            --format XML
            --failOnCVSS 7
            --project "ReactApp OWASP"
        ''',
        odcInstallation: 'dependency-check'
    }
}
    }

    post {
        always {
             dependencyCheckPublisher pattern: 'dependency-check-report/dependency-check-report.xml'
        }
        failure {
            echo '❌ Build failed due to quality or security issues'
        }
    }
}
