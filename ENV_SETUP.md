# Environment Setup Guide

## 1. Create `.env.local` File

Create a file named `.env.local` in the project root with these variables:

```bash
# AWS Backend Configuration
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=1234567890abcdefghijk
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## 2. Get Values from AWS Deployment

After deploying the backend (`healthcoach-api`), get the values:

### From Deployment Outputs
```bash
cd ../healthcoach-api
./deploy.sh
# Look for outputs at the end
```

### Or from AWS CLI
```bash
# API Endpoint
aws cloudformation describe-stacks \
  --stack-name healthcoach-api-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`APIEndpoint`].OutputValue' \
  --output text

# User Pool ID
aws cloudformation describe-stacks \
  --stack-name healthcoach-api-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text

# Client ID
aws cloudformation describe-stacks \
  --stack-name healthcoach-api-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text
```

### Or from AWS Console
1. Go to CloudFormation → Stacks → healthcoach-api-stack
2. Click "Outputs" tab
3. Copy the values

## 3. Verify Setup

Once `.env.local` is created with real values:

```bash
npm run dev
```

Visit http://localhost:3000 and try to sign up/login!
