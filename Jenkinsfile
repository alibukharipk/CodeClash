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
        // Remove the mkdir command as the plugin should create it
        dependencyCheck additionalArguments: '''
            --scan .
            --format ALL
            --out ./reports
            --failOnCVSS 7
            --project "ReactJS-SonarTest"
        ''',
        odcInstallation: 'dependency-check'
        
        // Check if report was created
        sh 'ls -la reports/ || echo "No reports directory found"'
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
