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

       stage('SonarQube Quality Gate') {
    steps {
        timeout(time: 5, unit: 'MINUTES') {
            script {
                try {
                    waitForQualityGate abortPipeline: true
                } catch (Exception e) {
                    echo "SonarQube quality gate failed: ${e.message}"
                    // Continue to security checks anyway
                    currentBuild.result = 'UNSTABLE'
                }
            }
        }
    }
}

stage('OWASP Dependency-Check') {
    when {
        expression { currentBuild.result != 'ABORTED' }
    }
    steps {
        dependencyCheck additionalArguments: '''
            --scan .
            --format ALL
            --failOnCVSS 7
            --project "ReactApp"
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
