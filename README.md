# FinSecure Application's Automated DevSecOps Pipeline

Automated DevSecOps pipeline demonstrating SAST, SCA, and DAST integration with GitHub Actions for a fintech demo application. Supports PDPL and CBB Cybersecurity Framework compliance.

## Overview

This project implements a comprehensive DevSecOps pipeline for the demo fintech app called **FinSecure**, demonstrating secure software development practices including:

- **SAST**: SonarCloud for static code analysis
- **SCA**: Snyk for dependency vulnerability scanning  
- **DAST**: OWASP ZAP for dynamic security testing
- **Docker**: Containerized deployment with security best practices
- **Compliance**: PDPL and CBB Cybersecurity Framework reporting
- **Security Gates**: Automated merge blocking on high-severity vulnerabilities

### Application Features

The FinSecure demo application includes:
- **Authentication**: Login, signup, and password reset
- **MFA/OTP**: Two-factor authentication via email verification
- **Dashboard**: Account balance and transaction history
- **SPA Architecture**: Single-page application with client-side routing
- **Responsive Design**: Mobile-friendly UI with modern styling
- **Security Headers**: Helmet.js for XSS, clickjacking protection
- **Rate Limiting**: Express-rate-limit for DoS protection

## Scope

**In-Scope:**

- Automated DevSecOps pipeline using GitHub Actions
- Free/open-source security tools (SonarCloud, Snyk, OWASP ZAP)
- Demo fintech app (FinSecure) with basic features
- Docker containerization and deployment
- GitHub Secrets for credential management
- Compliance reporting (PDPL, CBB Framework)

**Out-of-Scope:**

- Production-grade fintech system
- Real financial transactions
- Paid enterprise tools
- Multi-language support

## Prerequisites

- Node.js **22.20.0** or higher
- npm 10.x or higher
- Docker 28.4+ and Docker Compose
- **GitHub account** (for forking and configuration)
- SonarCloud account (free tier)
- Snyk account (free tier)
- EmailJS account (optional, for OTP demo)

**IMPORTANT**: You must fork this repository before cloning. Do not clone directly as you won't be able to configure the pipeline for your account.

## **Complete Setup Guide for New GitHub Account**

Follow these steps **exactly** in order. Do not skip any steps.

### **STEP 1: Fork Repository (DO NOT CLONE DIRECTLY)**

1. Go to https://github.com/A90-svg/Automated-DevSecOps-Pipeline
2. Click the **"Fork"** button in the top-right
3. Choose your GitHub account to fork to
4. **Wait for fork to complete** (may take 30 seconds)

### **STEP 2: Clone Your Fork**

```bash
# Clone YOUR fork (not the original)
# Replace YOUR_USERNAME with your actual GitHub username
git clone https://github.com/YOUR_USERNAME/Automated-DevSecOps-Pipeline.git
cd Automated-DevSecOps-Pipeline
```

### **STEP 3: Update SonarCloud Configuration**

Edit the file `sonar-project.properties`:

**Find these lines:**
```properties
sonar.projectKey=A90-svg_Automated-DevSecOps-Pipeline
sonar.organization=a90-svg
```

**Replace with:**
```properties
# Replace YOUR_USERNAME with your actual GitHub username
sonar.projectKey=YOUR_USERNAME_Automated-DevSecOps-Pipeline
# Replace your-sonarcloud-organization with your SonarCloud org name
sonar.organization=your-sonarcloud-organization
```

### **STEP 4: Update GitHub Actions Workflow**

**IMPORTANT:** The workflow file contains hardcoded references that must be updated for your account.

Edit the file `.github/workflows/automated-devsecops-pipeline.yml`:

**Find these lines (around line 206-207):**
```yaml
-Dsonar.projectKey=A90-svg_Automated-DevSecOps-Pipeline
-Dsonar.organization=a90-svg
```

**Replace with:**
```yaml
# Replace YOUR_USERNAME with your actual GitHub username
-Dsonar.projectKey=YOUR_USERNAME_Automated-DevSecOps-Pipeline
# Replace your-sonarcloud-organization with your SonarCloud org name
-Dsonar.organization=your-sonarcloud-organization
```

**Find these lines (around line 233):**
```yaml
dotnet-sonarscanner begin /k:"A90-svg_Automated-DevSecOps-Pipeline" /o:"a90-svg"
```

**Replace with:**
```yaml
# Replace YOUR_USERNAME and your-sonarcloud-organization
dotnet-sonarscanner begin /k:"YOUR_USERNAME_Automated-DevSecOps-Pipeline" /o:"your-sonarcloud-organization"
```

**Find these lines (around line 264):**
```yaml
PROJECT_KEY="${{ secrets.SONAR_PROJECT_KEY || 'A90-svg_Automated-DevSecOps-Pipeline' }}"
```

**Replace with:**
```yaml
# Replace YOUR_USERNAME
PROJECT_KEY="${{ secrets.SONAR_PROJECT_KEY || 'YOUR_USERNAME_Automated-DevSecOps-Pipeline' }}"
```

### **STEP 5: Create New SonarCloud Project**

1. Go to https://sonarcloud.io/
2. Sign in with **your GitHub account**
3. Click **"+"** → **"Create new organization"**
4. Choose "Free" plan
5. Enter organization name (e.g., `your-github-username`)
6. Click **"Create new project"**
7. Choose **"Manual"** (not GitHub import)
8. Project key: `YOUR_USERNAME_Automated-DevSecOps-Pipeline`
9. Click **"Set up"**
10. Go to **"My Account"** → **"Security"**
11. Generate new token → **Copy immediately** (you won't see it again)

### **STEP 6: Configure Snyk**

1. Go to https://snyk.io/
2. Sign up with **your GitHub account**
3. Click **"Integrations"** → **"GitHub"**
4. Click **"Connect"** and authorize Snyk
5. Click **"Add repositories"**
6. Find **YOUR forked repository** (not the original)
7. Click **"Add"** to import it
8. Go to **Account Settings** → **API Tokens**
9. Click **"Generate Token"** → **Copy token**

### **STEP 7: Optional EmailJS Setup (for OTP demo)**

If you want the OTP email functionality to work:

1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Click **"Email Services"** → **"Add New Service"**
4. Choose your email provider (Gmail, Outlook, etc.)
5. Connect your email account
6. Go to **"Email Templates"** → **"Create New Template"**
7. Create an OTP template with variables: `{{otp_code}}`, `{{user_email}}`
8. Go to **"Integration"** → **"API Keys"** → **"Create API Key"**
9. Copy your Public Key and Private Key
10. Note your Service ID and Template ID

### **STEP 8: Create GitHub Personal Access Token**

1. Go to GitHub → **Settings** → **Developer settings**
2. Click **"Personal access tokens"** → **"Tokens (classic)"**
3. Click **"Generate new token"**
4. Give it a name (e.g., "DevSecOps Pipeline")
5. Set expiration (recommend 90 days)
6. Check these permissions:
   - ✓ `repo` (Full control of private repositories)
   - ✓ `workflow` (Update GitHub Action workflows)
7. Click **"Generate token"** → **Copy token**

### **STEP 11: Add All Secrets to GitHub**

Go to your forked repository → **Settings** → **Secrets and variables** → **Actions** → **"New repository secret"**

Add these secrets one by one:

```
SONAR_TOKEN=your_sonarcloud_token_from_step_4
SONAR_PROJECT_KEY=YOUR_USERNAME_Automated-DevSecOps-Pipeline
SONAR_ORGANIZATION=your-sonarcloud-organization
SNYK_TOKEN=your_snyk_token_from_step_5
GIT_TOKEN=your_github_token_from_step_10
```

Optional (for OTP demo):
```
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
```

### **STEP 12: Install Dependencies**

```bash
npm ci
```

### **STEP 13: Set Up Environment Variables**

```bash
copy .env.example .env
# Edit .env with your configuration
```

### **STEP 14: Test Your Setup**

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Configure for new GitHub account"
   git push origin main
   ```

2. Go to your forked repository → **Actions** tab
3. Click **"Run workflow"** to test the pipeline
4. Verify all jobs complete successfully

### **Setup Verification Checklist**

Before proceeding, verify all items are completed:

- [ ] **Repository Forked** (not cloned directly)
- [ ] **sonar-project.properties** updated with your username
- [ ] **GitHub Actions workflow** updated with your username
- [ ] **SonarCloud project** created under your account
- [ ] **Snyk integration** configured for your fork
- [ ] **GitHub Personal Access Token** created with correct permissions
- [ ] **All GitHub Secrets** added correctly
- [ ] **Dependencies installed** with `npm ci`
- [ ] **Environment variables** configured in `.env`
- [ ] **Pipeline runs successfully** on test commit

### **Setup Time & Cost Estimates**

- **Setup Time**: 45-60 minutes for first-time users
- **Pipeline Runtime**: 4-15 minutes per run (varies by code size and scan depth)
- **Costs**: 
  - SonarCloud: Free (up to 250,000 code lines/month)
  - Snyk: Free tier (unlimited scans for open source)
  - GitHub Actions: Free (2,000 minutes/month for public repos)
  - EmailJS: Free (200 emails/month)

### **Quick Verification Commands**

After setup, verify each service:

```bash
# Verify Node.js version
node --version  # Should show 22.20.0+

# Verify npm version  
npm --version   # Should show 10.x+

# Test application locally
npm run dev     # Should start on http://localhost:3000

# Run tests locally
npm test        # Should pass all tests

# Check Docker build
docker build -t test-app .  # Should build successfully
```

### **Using Pipeline Docker Artifacts**

After pipeline runs, you'll get a Docker image artifact (e.g., `finsecure-app:e6daeff547tyhgbn687`):

1. **Download the Docker image artifact** from GitHub Actions
2. **Load the image locally**:
   ```bash
   docker load -i finsecure-app.tar
   ```
3. **Run the tested image**:
   ```bash
   docker run -p 3000:3000 finsecure-app:e6daeff547tyhgbn687
   ```
4. **Tag as latest** (optional):
   ```bash
   docker tag finsecure-app:e6daeff547tyhgbn687 finsecure-app:latest
   docker run -p 3000:3000 finsecure-app:latest
   ```

**Note**: The long tag ensures you're using the exact image that passed all security scans.


## Configuration

Your `.env` file should contain:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
NODE_VERSION=22.20.0

# EmailJS Configuration (optional, for OTP demo)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key

# Security
ALLOWED_ORIGINS=http://localhost:3000
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
npm start
```


## Testing

Run the test suite with coverage:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run security audit:

```bash
npm run security:audit
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/automated-devsecops-pipeline.yml`) includes:

### Pipeline Stages

1. **Build and Test** (~5 minutes)
   - Node.js 22.20.0 setup
   - Dependency installation
   - Docker image build
   - Unit testing with coverage
   - Code linting

2. **Security Scans** (~13 minutes total)
   - **SAST** with SonarCloud (~3 minutes)
   - **SCA** with Snyk (~2 minutes)
   - **DAST** with OWASP ZAP (~8 minutes)

3. **Security Gate**
   - Evaluates scan results
   - Blocks merge on high-severity vulnerabilities
   - Generates pass/fail summary

4. **Docker Compose Deployment**
   - Builds and starts containers using docker-compose
   - Performs health checks on deployed services
   - Tests application endpoints
   - Ensures proper cleanup on completion

5. **Reporting**
   - Executive summary with compliance metrics
   - Artifact storage (30 days)
   - PDPL and CBB Framework compliance status

### Pipeline Performance

- **Total runtime**: ≤15 minutes
- **Automated triggers**: Push to main/develop, Pull requests
- **Manual trigger**: workflow_dispatch available
- **Artifact retention**: 30 days

## Security Features

This application includes several security measures:

- **SAST**: SonarCloud integration for static code analysis
- **SCA**: Snyk for dependency vulnerability scanning
- **DAST**: OWASP ZAP for dynamic application security testing
- **Secrets Management**: GitHub Secrets with automatic masking
- **Docker Security**: Non-root user, minimal Alpine base image
- **Security Headers**: Helmet.js with CSP, XSS protection
- **Rate Limiting**: Express rate-limit middleware
- **Input Validation**: Joi schema validation

## Compliance

### PDPL (Bahrain Personal Data Protection Law)

- Synthetic data only (no personal information)
- Secure credential management via GitHub Secrets
- Audit trail maintained in pipeline logs
- Data minimization principles applied

### CBB Cybersecurity Framework

- Automated security testing implemented
- Access controls via branch protection
- Vulnerability management and scanning
- Continuous monitoring and reporting

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GITHUB REPOSITORY                                 │
│                  A90-svg/Automated-DevSecOps-Pipeline                       │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼ (Push to main/develop or Pull Request)
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS WORKFLOW                             │
│                     automated-devsecops-pipeline.yml                        │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       JOB 1: BUILD AND TEST                                 │
│        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│        │  Setup Node.js  │  │ Install Deps    │  │   Unit Tests    │        │
│        │    (22.20.0)    │  │    (npm ci)     │  │   (npm test)    │        │
│        └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│        │   Code Linting  │  │  Docker Build   │  │  Save Artifact  │        │
│        │  (npm run lint) │  │ (multi-stage)   │  │   (docker img)  │        │
│        └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │ (Parallel Execution)
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
      ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
      │   JOB 2     │  │   JOB 3     │  │   JOB 4     │
      │   SAST      │  │   SCA       │  │   DAST      │
      │ (SonarCloud)│  │  (Snyk)     │  │ (OWASP ZAP) │
      └─────────────┘  └─────────────┘  └─────────────┘
           │                 │                 │
           ▼                 ▼                 ▼
   ┌──────────────┐  ┌───────────────┐  ┌─────────────┐
   │ Code Quality │  │ Dependency    │  │ Dynamic     │
   │ Analysis     │  │ Vulnerability │  │ Security    │
   │ Report       │  │ Scan Report   │  │ Test Report │
   └──────────────┘  └───────────────┘  └─────────────┘
                          │
                          ▼ (All jobs complete)
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JOB 5: SECURITY GATE                                 │
│        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│        │  Evaluate SAST  │  │  Evaluate SCA   │  │  Evaluate DAST  │        │
│        │    Results      │  │    Results      │  │    Results      │        │
│        └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│        │ Severity Check  │  │ Merge Decision  │  │ Status Summary  │        │
│        │ (High/Med/Low)  │  │ (Block/Allow)   │  │ (Pass/Fail)     │        │
│        └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JOB 6: DOCKER COMPOSE DEPLOYMENT                     │
│        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│        │  Build & Start  │  │  Health Check   │  │  Test Endpoints │        │
│        │  Containers     │  │  (Docker)       │  │  (Curl Tests)   │        │
│        └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│        │  Verify         │  │  Cleanup        │  │  Log Collection │        │
│        │  Deployment     │  │  (On Complete)  │  │  (If Failed)    │        │
│        └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       JOB 7: REPORT GENERATION                              │
│     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│     │ Executive       │  │ Compliance      │  │ Artifact        │           │
│     │ Summary         │  │ Metrics         │  │ Storage         │           │
│     │ Report          │  │ (PDPL/CBB)      │  │ (30 days)       │           │
│     └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PIPELINE OUTCOMES                                    │
│     ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐          │
│     │   Merge Status  │  │ Security Reports │  │ Compliance      │          │
│     │ (Blocked/Allow) │  │ (Artifacts)      │  │ Status          │          │
│     └─────────────────┘  └──────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY INTEGRATIONS                              │
│     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│     │   GITHUB        │  │   SONARCLOUD    │  │     SNYK        │           │
│     │   SECRETS       │  │   (SAST)        │  │    (SCA)        │           │
│     │ (Token Mgmt)    │  │ (Code Quality)  │  │ (Dependencies)  │           │
│     └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│     │   OWASP ZAP     │  │     DOCKER      │  │   COMPLIANCE    │           │
│     │    (DAST)       │  │ (Container)     │  │ (PDPL/CBB)      │           │
│     │ (Dynamic Test)  │  │ (Security)      │  │ (Framework)     │           │
│     └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          COMPLIANCE FRAMEWORKS                                         │
│     ┌───────────────────┐                    ┌──────────────────────────────┐          │
│     │   PDPL            │                    │   CBB FRAMEWORK              │          │
│     │ (Bahrain)         │                    │  (Cybersecurity)             │          │
│     │ • Data Privacy    │                    │ • Auto Testing               │          │
│     │ • Synthetic Data  │                    │ • Access Control             │          │
│     │ • Audit Trail     │                    │ • Vulnerability Management   │          │
|     | • Secure Storage  │                    │ • Continuous Monitoring      │          |          
│     └───────────────────┘                    └──────────────────────────────┘          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Common Issues

**Pipeline fails on SAST scan:**

- Verify SONAR_TOKEN is correct
- Check SonarCloud organization access
- Ensure project key matches

**Pipeline fails on SCA scan:**

- Verify SNYK_TOKEN is valid
- Check Snyk account permissions

**Docker build fails:**

- Ensure Node.js 22.20.0 compatibility
- Check Docker daemon is running
- Verify .dockerignore isn't excluding needed files

**Application won't start:**

- Check .env file configuration
- Verify port 3000 is available
- Review server logs for errors

### Branch Protection Setup

1. Go to repository **Settings > Branches**
2. Click **Add branch protection rule**
3. **Branch name pattern**: `main`
4. **Require status checks to pass before merge**: ✅
5. **Require pull request reviews**: ✅
6. Select these required checks:
   - `Build and Test`
   - `SAST Scan (SonarCloud)`
   - `SCA Scan (Snyk)`
   - `Security Gate`

## Copyright

**© 2025 A90-svg - All Rights Reserved**

This project is for educational and demonstration purposes only. No part of this project may be reproduced, distributed, or used for any commercial purposes without explicit written permission from the copyright holder.

---

**Project Status:** Ready for testing | **Last Updated:** 2025-12-26

## Code Documentation

The codebase has been thoroughly documented with comprehensive comments:

### Backend (`server.js`)
- **Security Middleware**: Helmet for XSS/clickjacking protection, CORS configuration
- **Rate Limiting**: Express-rate-limit to prevent DoS attacks
- **Request Validation**: Joi schema validation for all inputs
- **Error Handling**: Centralized error handling with development stack traces
- **Health Endpoint**: For Docker/Kubernetes health checks
- **OTP Service**: EmailJS integration for two-factor authentication
- **Graceful Shutdown**: Proper handling of SIGTERM and uncaught exceptions

### Frontend (`public/app.js`)
- **SPA Architecture**: Client-side routing with hash-based navigation
- **State Management**: Centralized state with localStorage persistence
- **Authentication**: Login, signup, password reset with MFA support
- **Security**: Input clearing, secure random generation, XSS prevention
- **UI Components**: Card rendering, transaction history, search functionality
- **OTP Flow**: 6-digit input fields with automatic navigation and resend timer

### Configuration Files
- **Dockerfile**: Multi-stage build with non-root user and health checks
- **docker-compose.yml**: Deployment-ready configuration with restart policies
- **GitHub Actions**: Complete DevSecOps pipeline with SAST/SCA/DAST
- **Tests**: Jest test suite with comprehensive endpoint coverage

## Security Implementation

This project demonstrates multiple security best practices:

### Application Security
- **Content Security Policy**: Restricts resource loading to prevent XSS
- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **Input Validation**: All user inputs validated with Joi schemas
- **Password Security**: Demo uses plain text (production would use bcrypt)
- **Session Management**: localStorage-based (demo only)

### Infrastructure Security
- **Non-root Containers**: Docker containers run as nodejs user (UID 1001)
- **Minimal Base Images**: Alpine Linux reduces attack surface
- **Health Checks**: Container health monitoring
- **Secrets Management**: GitHub Secrets with automatic masking

### DevSecOps Pipeline
- **SAST**: SonarCloud for static code analysis
- **SCA**: Snyk for dependency vulnerability scanning
- **DAST**: OWASP ZAP for dynamic security testing
- **Security Gates**: Blocks merges on high-severity vulnerabilities

## Compliance Metrics

The pipeline generates compliance reports for:
- **PDPL** (Bahrain Personal Data Protection Law)
- **CBB Cybersecurity Framework**
- **OWASP Top 10** coverage
- **Vulnerability severity levels**

---

**© 2025 A90-svg - All Rights Reserved**

This project is for educational and demonstration purposes only.