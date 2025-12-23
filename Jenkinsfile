pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'      // Name from Global Tool Configuration
        dotnetsdk 'dotnet-sdk-8'  // Name from Global Tool Configuration
    }

    environment {
        // Optional: output folder for Dependency-Check reports
        ODC_REPORTS = "${WORKSPACE}/dependency-check-reports"
    }

    stages {

        stage('Checkout') {
            steps {
                git url: 'https://github.com/alibukharipk/CodeClash.git', branch: 'master'
            }
        }

        stage('Install & Build ReactJS') {
            steps {
                sh 'npm install --legacy-peer-deps'
                sh 'npm run build'
            }
        }

        stage('Build .NET Core') {
            steps {
                sh 'dotnet restore'
                sh 'dotnet build --configuration Release'
            }
        }

        stage('OWASP Dependency-Check') {
            steps {
                // Run Dependency-Check scan
                dependencyCheck additionalArguments: """
                    --scan ./           # Scan current workspace
                    --format ALL
                    --project "CodeClash"
                    --out ${ODC_REPORTS}
                """,
                odcInstallation: 'dependency-check'
            }
        }
    }

    post {
        always {
            // Publish Dependency-Check report in Jenkins
            dependencyCheckPublisher pattern: "${ODC_REPORTS}/dependency-check-report.xml"
        }
    }
}
