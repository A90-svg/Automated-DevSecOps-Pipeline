# FinSecure Application's Automated DevSecOps Pipeline

Automated DevSecOps pipeline for a demo fintech application, demonstrating SAST, SCA, and DAST integration with GitHub Actions. **Scope: Proof-of-concept pipeline supporting PDPL and CBB Cybersecurity Framework compliance.**

## Project Overview

This project implements a comprehensive DevSecOps pipeline for the demo fintech app called FinSecure, demonstrating secure software development practices including:

- **SAST** (Static Application Security Testing) with SonarCloud
- **SCA** (Software Composition Analysis) with Snyk  
- **DAST** (Dynamic Application Security Testing) with OWASP ZAP
- **Docker** containerization with security best practices
- **PDPL** and **CBB Cybersecurity Framework** compliance
- **Security Gates** with merge blocking for high-severity vulnerabilities
- **Automated Reporting** with severity levels and compliance metrics

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
- GitHub repository with Actions enabled
- SonarCloud account (free tier)
- Snyk account (free tier)

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

# Security
# SESSION_SECRET=your_session_secret_here
# JWT_SECRET=your_jwt_secret_here
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
- ✅ Synthetic data only (no personal information)
- ✅ Secure credential management via GitHub Secrets
- ✅ Audit trail maintained in pipeline logs
- ✅ Data minimization principles applied

### CBB Cybersecurity Framework
- ✅ Automated security testing implemented
- ✅ Access controls via branch protection
- ✅ Vulnerability management and scanning
- ✅ Continuous monitoring and reporting

## Demo Application Features

The FinSecure demo app includes:
- **Login/Signup**: Email-based authentication
- **OTP Verification**: EmailJS integration (demo mode available)
- **Dashboard**: Account balance display
- **Transaction History**: 40+ mock transactions
- **Logout**: Session management
- **Responsive Design**: Mobile-friendly interface

## Quality Metrics

### Performance Requirements Met
- ✅ **SAST completion**: ≤10 minutes (actual: ~3 minutes)
- ✅ **DAST completion**: ≤15 minutes (actual: ~8 minutes)  
- ✅ **Docker build**: ≤5 minutes (actual: ~2 minutes)
- ✅ **Pipeline runtime**: ≤15 minutes (actual: ~13 minutes)

### Security Requirements Met
- ✅ **Automated scanning**: On every push/PR
- ✅ **Severity reporting**: High/Medium/Low classification
- ✅ **Merge blocking**: High-severity vulnerabilities
- ✅ **Secrets masking**: 100% via GitHub Secrets
- ✅ **Compliance reporting**: PDPL + CBB Framework metrics

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Note:** All contributions must pass the automated security pipeline before merge.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.

---

**Project Status:** ✅ Ready for testing | **Last Updated:** 2025-11-28
