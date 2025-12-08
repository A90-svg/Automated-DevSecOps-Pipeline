# FinSecure Application's Automated DevSecOps Pipeline

Automated DevSecOps pipeline for a demo fintech application, demonstrating SAST, SCA, and DAST integration with GitHub Actions. **Scope: Proof-of-concept pipeline supporting PDPL and CBB Cybersecurity Framework compliance.**

## Project Overview

This project implements a comprehensive DevSecOps pipeline for the demo fintech app called **FinSecure**, demonstrating secure software development practices including:

- **SAST** (Static Application Security Testing) with SonarCloud
- **SCA** (Software Composition Analysis) with Snyk
- **DAST** (Dynamic Application Security Testing) with OWASP ZAP
- **Docker** containerization with security best practices
- **PDPL** and **CBB Cybersecurity Framework** compliance
- **Security Gates** with merge blocking for high-severity vulnerabilities
- **Automated Reporting** with severity levels and compliance metrics

### Application Features

The FinSecure demo application includes:
- **Authentication**: Login, signup, and password reset
- **MFA/OTP**: Two-factor authentication via email verification
- **Dashboard**: Account balance and transaction history
- **SPA Architecture**: Single-page application with client-side routing
- **Responsive Design**: Mobile-friendly UI with modern styling
- **Security Headers**: Helmet.js for XSS, clickjacking protection
- **Rate Limiting**: Express-rate-limit for DoS protection

## 🎯 Scope

**✅ In-Scope:**

- Automated DevSecOps pipeline using GitHub Actions
- Free/open-source security tools (SonarCloud, Snyk, OWASP ZAP)
- Demo fintech app (FinSecure) with basic features
- Docker containerization and deployment
- GitHub Secrets for credential management
- Compliance reporting (PDPL, CBB Framework)

**❌ Out-of-Scope:**

- Production-grade fintech system
- Real financial transactions
- Paid enterprise tools
- Multi-language support

## 📋 Prerequisites

- Node.js **22.20.0** or higher
- npm 10.x or higher
- Docker 28.4+ and Docker Compose
- GitHub repository with Actions enabled
- SonarCloud account (free tier)
- Snyk account (free tier)
- EmailJS account (optional, for OTP demo)


## External Service Setup

### SonarCloud Setup (SAST)
1. Go to [SonarCloud](https://sonarcloud.io/) and sign in with GitHub
2. Create a new organization (if you don't have one)
3. Create a new project manually
4. Generate a token in your account security settings
5. Copy the token (you won't see it again)

### Snyk Setup (SCA)
1. Sign up at [Snyk](https://snyk.io/) with GitHub
2. Go to Account Settings > API Tokens
3. Generate a new token and copy it



## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/A90-svg/Automated-DevSecOps-Pipeline.git
   cd Automated-DevSecOps-Pipeline
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## GitHub Secrets Setup

Required secrets for pipeline functionality:

```bash
# Repository > Settings > Secrets and variables > Actions
SONAR_TOKEN=your_sonarcloud_token
SONAR_PROJECT_KEY=your_project_key
SONAR_ORGANIZATION=your_github_username
SNYK_TOKEN=your_snyk_token
EMAILJS_SERVICE_ID=your_emailjs_service_id (optional)
EMAILJS_TEMPLATE_ID=your_emailjs_template_id (optional)
EMAILJS_PUBLIC_KEY=your_emailjs_public_key (optional)
EMAILJS_PRIVATE_KEY=your_emailjs_private_key (optional)
GIT_TOKEN=your_github_personal_access_token (for deployment)
```

## Configuration

Configure the following environment variables in your `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# EmailJS Configuration (for OTP demo)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
EMAILJS_FROM_EMAIL=finsecureapp@gmail.com

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
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

### Using Docker

1. Build the Docker image:

   ```bash
   docker build -t finsecure-app .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env finsecure-app
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

4. **Reporting**
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

┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPLIANCE FRAMEWORKS                              │
│     ┌───────────────────┐                    ┌───────────────────┐          │
│     │   PDPL            │                    │   CBB FRAMEWORK   │          │
│     │ (Bahrain)         │                    │  (Cybersecurity)  │          │
│     │ • Data Privacy    │                    │ • Auto Testing    │          │
│     │ • Synthetic Data  │                    │ • Access Control  │          │
│     │ • Audit Trail     │                    │ • Vulnerability   │          │
│     └───────────────────┘                    └───────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Pipeline Flow Summary

**Trigger:** Code push to `main`/`develop` or Pull Request  
**Runtime:** ~13 minutes total  
**Security Tools:** SonarCloud (SAST) + Snyk (SCA) + OWASP ZAP (DAST)  
**Decision Point:** Security Gate blocks merge on high-severity findings  
**Output:** Compliance reports + artifacts + merge decision

## Demo Application Features

The FinSecure demo app includes:

- **Login/Signup**: Email-based authentication
- **OTP Verification**: EmailJS integration
- **Dashboard**: Account balance display
- **Transaction History**: 50+ mock transactions
- **Logout**: Session management
- **Responsive Design**: web-friendly interface

## Quality Metrics

### Performance Requirements Met

- **SAST completion**: ≤10 minutes (actual: ~3 minutes)
- **DAST completion**: ≤15 minutes (actual: ~8 minutes)
- **Docker build**: ≤5 minutes (actual: ~2 minutes)
- **Pipeline runtime**: ≤15 minutes (actual: ~13 minutes)

### Security Requirements Met

- **Automated scanning**: On every push/PR
- **Severity reporting**: High/Medium/Low classification
- **Merge blocking**: High-severity vulnerabilities
- **Secrets masking**: 100% via GitHub Secrets
- **Compliance reporting**: PDPL + CBB Framework metrics

### Docker Compose (Recommended for Development)

```bash
docker-compose up -d
```

This builds and runs the application with all dependencies.

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

**Project Status:** Ready for testing | **Last Updated:** 2025-12-02

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
- **docker-compose.yml**: Production-ready configuration with restart policies
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

## Quick Start

1. **Clone and Install**:
   ```bash
   git clone https://github.com/A90-svg/Automated-DevSecOps-Pipeline.git
   cd Automated-DevSecOps-Pipeline
   npm ci
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run Development**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   - URL: http://localhost:3000
   - Default User: finsecureapp@gmail.com
   - Default Password: FinSecure123!

---

**© 2025 A90-svg - All Rights Reserved**

This project is for educational and demonstration purposes only.