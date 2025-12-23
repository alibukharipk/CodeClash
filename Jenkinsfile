pipeline {
    agent any

    stages {

        stage('Install & Build') {
            steps {
                sh '''
                  npm install --legacy-peer-deps
                  npm run build
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                      sonar-scanner \
                        -Dsonar.projectKey=ReactApp \
                        -Dsonar.sources=src
                    '''
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('OWASP Dependency-Check') {
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
