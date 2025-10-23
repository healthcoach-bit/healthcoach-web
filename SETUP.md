# HealthCoach Web Setup Guide

## Issues Fixed

### 1. ✅ Login Redirect Issue
- **Problem**: Users already signed in could still access `/login` page
- **Solution**: Added authentication check on mount that redirects to dashboard if user is already authenticated
- **Files Updated**: 
  - `app/login/page.tsx`
  - `app/signup/page.tsx`

### 2. ⚠️ API Configuration Required

## Environment Variables Setup

Your `.env.local` file needs the following variables:

```bash
# AWS Region
NEXT_PUBLIC_AWS_REGION=us-east-1

# Cognito User Pool (from your backend deployment)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=your-client-id

# API Gateway Endpoint (from your backend deployment)
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod

# S3 Bucket for photos (from your backend deployment)
NEXT_PUBLIC_S3_BUCKET=your-bucket-name

# Environment
NEXT_PUBLIC_ENV=development
```

## How to Get These Values

### Step 1: Deploy the Backend API

```bash
cd /Users/josiaspersonal/CascadeProjects/healthcoach-api
npm install
npm run deploy
```

### Step 2: Get CloudFormation Outputs

After deployment completes, run:

```bash
aws cloudformation describe-stacks \
  --stack-name HealthCoachStack \
  --query 'Stacks[0].Outputs' \
  --output table
```

This will show you:
- **UserPoolId** → Use for `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- **UserPoolClientId** → Use for `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`
- **APIEndpoint** → Use for `NEXT_PUBLIC_API_URL`
- **PhotoBucketName** → Use for `NEXT_PUBLIC_S3_BUCKET`

### Step 3: Update .env.local

1. Open `/Users/josiaspersonal/CascadeProjects/healthcoach-web/.env.local`
2. Replace the placeholder values with the actual values from CloudFormation
3. Save the file

### Step 4: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Current Error Explanation

### "Request failed with status code 500"
- **Cause**: `NEXT_PUBLIC_API_URL` is not configured or pointing to wrong endpoint
- **Fix**: Add the correct API Gateway URL to `.env.local`

### "There is already a signed in user"
- **Cause**: AWS Amplify detected an existing session but page didn't redirect
- **Fix**: ✅ Already fixed! The login/signup pages now check for existing auth and redirect automatically

## Testing After Setup

1. **Sign Up**: Go to `/signup` and create a new account
2. **Verify Email**: Enter the verification code sent to your email
3. **Login**: You should be redirected to `/dashboard`
4. **Dashboard**: Should load your food logs (empty initially)

## Troubleshooting

### If you see "User pool client does not exist"
- Your Cognito credentials in `.env.local` are incorrect
- Double-check the values from CloudFormation outputs

### If API calls fail with 500 error
- Your `NEXT_PUBLIC_API_URL` is not set or incorrect
- Make sure the backend API is deployed and running

### If redirects don't work
- Clear your browser cache and cookies
- Try in an incognito/private window

## Need Help?

Check the browser console (F12) for detailed error messages and warnings.
