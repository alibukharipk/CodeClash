pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =======================
           .NET 8 BACKEND
        ======================= */

        stage('Build .NET Backend') {
            steps {
                dir('backend') {
                    sh 'dotnet restore'
                    sh 'dotnet build --no-restore'
                    sh 'dotnet test --no-build'
                }
            }
        }

        stage('SonarQube Scan - .NET') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('backend') {
                        sh """
                        dotnet tool install --global dotnet-sonarscanner || true
                        export PATH="\$PATH:\$HOME/.dotnet/tools"

                        dotnet sonarscanner begin \
                          /k:"my-fullstack-app-backend" \
                          /n:"Backend" \
                          /d:sonar.host.url=\$SONAR_HOST_URL \
                          /d:sonar.login=\$SONAR_AUTH_TOKEN

                        dotnet build

                        dotnet sonarscanner end \
                          /d:sonar.login=\$SONAR_AUTH_TOKEN
                        """
                    }
                }
            }
        }

        /* =======================
           REACT FRONTEND
        ======================= */

        stage('Build React Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Scan - React') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('frontend') {
                        sh """
                        \$SONAR_SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=my-fullstack-app-frontend \
                        -Dsonar.projectName=Frontend \
                        -Dsonar.sources=src \
                        -Dsonar.exclusions=node_modules/**,build/** \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }

        /* =======================
           QUALITY GATE
        ======================= */

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
