# FinSecure Application's Automated DevSecOps Pipeline

Automated DevSecOps pipeline for a demo fintech application, demonstrating SAST, SCA, and DAST integration with GitHub Actions.

## Project Overview

This project implements a comprehensive DevSecOps pipeline for the demo fintech app called FinSecure, demonstrating secure software development practices including:

- **SAST** (Static Application Security Testing) with SonarCloud
- **SCA** (Software Composition Analysis) with Snyk
- **DAST** (Dynamic Application Security Testing) with OWASP ZAP
- **Docker** containerization with security best practices
- **PDPL** and **CBB Cybersecurity Framework** compliance


## Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Docker 20.10+ and Docker Compose
- SonarCloud account (for code quality analysis)
- Snyk account (for vulnerability scanning)
- OWASP ZAP (for dynamic application security testing)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/finsecure-app.git
   cd finsecure-app
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

## Configuration

Configure the following environment variables in your `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Email Service (Example using Resend)
RESEND_API_KEY=your_resend_api_key

# OTP Configuration
OTP_EXPIRY_MINUTES=15
OTP_LENGTH=6
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

## Security

This application includes several security measures:

- **SAST**: SonarCloud integration for static code analysis
- **SCA**: Snyk for dependency vulnerability scanning
- **DAST**: OWASP ZAP for dynamic application security testing
- **Secrets Management**: Environment variables and GitHub Secrets
- **Docker Security**: Non-root user, minimal base image

## CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Build and Test**
   - Node.js setup
   - Dependency installation
   - Build verification
   - Unit testing with coverage
   - Code linting

2. **Security Scans**
   - SAST with SonarCloud
   - SCA with Snyk
   - DAST with OWASP ZAP
   - Docker image scanning with Trivy

3. **Docker Build**
   - Multi-stage build
   - Image scanning
   - Push to container registry

4. **Deployment**
   - Automated deployment to production
   - Health checks
   - Smoke tests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
