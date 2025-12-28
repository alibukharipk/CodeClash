pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        // Fallback for regular jobs: set these manually if needed
        PR_KEY = "${env.CHANGE_ID ?: ''}"
        PR_BRANCH = "${env.CHANGE_BRANCH ?: ''}"
        PR_TARGET = "${env.CHANGE_TARGET ?: ''}"
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
            when {
                expression { 
                    return env.PR_KEY?.trim() != ''
                }
            }
            steps {
                script {
                    echo "Running SonarQube PR scan for PR #${env.PR_KEY}"
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                          ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=ReactJS-SonarTest \
                            -Dsonar.sources=src \
                            -Dsonar.pullrequest.key=${env.PR_KEY} \
                            -Dsonar.pullrequest.branch=${env.PR_BRANCH} \
                            -Dsonar.pullrequest.base=${env.PR_TARGET}
                        """
                    }
                }
            }
        }

        stage('OWASP Dependency-Check') {
            steps {
                dependencyCheck additionalArguments: '''
                    --scan .
                    --format ALL
                    --failOnCVSS 7
                    --project "ReactJS-SonarTest"
                ''',
                odcInstallation: 'dependency-check'
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
