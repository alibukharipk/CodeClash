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
    tools {
        dependencyCheck 'dependency-check'  // Name from Global Tool Configuration
    }
    steps {
        dependencyCheck additionalArguments: '''
            --scan .
            --format ALL
            --failOnCVSS 7
            --project "ReactApp"
        '''
    }
}
    }

    post {
        always {
            dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
        }
        failure {
            echo '❌ Build failed due to quality or security issues'
        }
    }
}
