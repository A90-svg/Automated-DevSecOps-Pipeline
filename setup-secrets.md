# GitHub Secrets Setup Guide

## Required Secrets for DevSecOps Pipeline

### 1. SonarCloud Secrets
- `SONAR_TOKEN`: Get from SonarCloud project setup
- `SONAR_PROJECT_KEY`: Set to "finsecure-devsecops-pipeline"  
- `SONAR_ORGANIZATION`: Your GitHub username

### 2. Snyk Secrets
- `SNYK_TOKEN`: Get from https://app.snyk.io/account/manage

### 3. Optional EmailJS (for OTP demo)
- `EMAILJS_SERVICE_ID`: Your EmailJS service ID
- `EMAILJS_TEMPLATE_ID`: Your EmailJS template ID  
- `EMAILJS_PUBLIC_KEY`: Your EmailJS public key
- `EMAILJS_PRIVATE_KEY`: Your EmailJS private key

## Setup Steps:

1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret above
5. Repository settings > Branches > Add branch protection rule
   - Require status checks to pass before merge
   - Require pull request reviews

## Pipeline Ready Status:
- ✅ Docker configuration fixed
- ✅ Security tools integrated
- ✅ Compliance features implemented
- ⏳ Waiting for secrets setup
