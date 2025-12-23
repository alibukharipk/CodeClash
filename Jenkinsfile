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
                script {
                    echo "Starting OWASP Dependency-Check..."
                    
                    // Verify tool is available
                    def odcHome = tool name: 'dependency-check', type: 'hudson.plugins.dependencycheck.DependencyCheckInstallation'
                    echo "Dependency-Check installed at: ${odcHome}"
                    
                    sh """
                      # List tool directory to verify
                      ls -la "${odcHome}" || echo "Directory not found"
                      
                      # Check version
                      "${odcHome}/bin/dependency-check.sh" --version || echo "Version check failed"
                    """
                }
                
                dependencyCheck additionalArguments: '''
                    --scan .
                    --format ALL
                    --failOnCVSS 7
                    --project "ReactApp"
                    --out reports/dependency-check
                ''',
                odcInstallation: 'dependency-check'
            }
        }
    }

    post {
        always {
            script {
                // List all reports for debugging
                sh '''
                  echo "=== Generated Reports ==="
                  find . -name "*.html" -o -name "*.json" -o -name "*.xml" -o -name "*.csv" | grep -v node_modules | head -20
                  echo "=== Reports Directory ==="
                  ls -la reports/ 2>/dev/null || echo "No reports directory found"
                '''
                
                // Publish dependency check results
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                
                // Archive all reports
                archiveArtifacts artifacts: 'reports/**/*, **/*dependency-check*', allowEmptyArchive: true
            }
        }
        success {
            echo '✅ Build successful!'
            echo 'SonarQube Analysis: http://host.docker.internal:9000/dashboard?id=ReactApp'
        }
        failure {
            echo '❌ Build failed - check console output'
        }
    }
}
