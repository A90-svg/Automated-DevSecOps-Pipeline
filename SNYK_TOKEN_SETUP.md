# Snyk Token Setup Guide

## Step 1: Get Your Snyk Token

1. **Go to Snyk**: https://app.snyk.io/
2. **Login or Sign up** for a free account
3. **Click your profile picture** (top right corner)
4. **Select "Account Settings"**
5. **Scroll to "API Token" section**
6. **Click "Show"** to reveal your token
7. **Copy the token** (it starts with `snk-`)

## Step 2: Add to GitHub Secrets

1. **Go to your GitHub repository**
2. **Click "Settings"** tab
3. **Click "Secrets and variables"** in the left sidebar
4. **Click "Actions"**
5. **Click "New repository secret"**
6. **Name**: `SNYK_TOKEN`
7. **Secret**: Paste your Snyk token
8. **Click "Add secret"**

## Step 3: Test the Pipeline

1. **Push your changes** to trigger the workflow
2. **Check the Actions tab** to see if Snyk scan works
3. **View artifacts** to see the scan results

## Troubleshooting

### If Snyk scan still fails:
- Make sure the token is copied correctly (no extra spaces)
- Check that your Snyk account is active
- Verify your repository is public (for free plan)

### Alternative: Use npm audit
If Snyk doesn't work, your pipeline already includes:
```bash
npm audit --production
```

This provides basic dependency security scanning for free.

## Free Plan Limitations

- **200 scans per month**
- **Public repositories only**
- **Limited vulnerability database**

For private repositories, consider:
- Making your repo public
- Using npm audit (already configured)
- GitHub Dependabot (automatic for free repos)
