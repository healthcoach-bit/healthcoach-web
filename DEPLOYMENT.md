# Deployment Guide - HealthCoach Web

## Prerequisites

1. **Backend API deployed** to AWS
2. **Vercel account** (free tier works great)
3. **Environment variables** from AWS deployment

---

## Step 1: Get AWS Backend Values

After deploying the backend API, get these values:

```bash
cd ../healthcoach-api

# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name healthcoach-api-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`APIEndpoint`].OutputValue' \
  --output text

# Get User Pool ID
aws cloudformation describe-stacks \
  --stack-name healthcoach-api-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text

# Get Client ID
aws cloudformation describe-stacks \
  --stack-name healthcoach-api-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text
```

**Save these values!** You'll need them for Vercel.

---

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy from project directory**:
```bash
cd /Users/josiaspersonal/CascadeProjects/healthcoach-web
vercel
```

4. **Add environment variables** when prompted:
   - `NEXT_PUBLIC_API_URL`: Your API Gateway endpoint
   - `NEXT_PUBLIC_COGNITO_USER_POOL_ID`: Your Cognito User Pool ID
   - `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`: Your Cognito Client ID
   - `NEXT_PUBLIC_AWS_REGION`: `us-east-1`

5. **Deploy to production**:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. **Go to** https://vercel.com/new

2. **Import Git Repository**:
   - Push your code to GitHub first:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/your-username/healthcoach-web.git
     git push -u origin main
     ```
   - Import the repository in Vercel

3. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=1234567890abcdefghijk
   NEXT_PUBLIC_AWS_REGION=us-east-1
   ```

5. **Click Deploy**

---

## Step 3: Configure Cognito for Vercel Domain

After deployment, you'll get a Vercel URL like: `https://healthcoach-web.vercel.app`

**Update Cognito to allow this domain**:

```bash
# Get your Vercel URL
VERCEL_URL="https://your-app.vercel.app"

# Update Cognito User Pool App Client
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-id 1234567890abcdefghijk \
  --callback-urls "https://your-app.vercel.app/dashboard" \
  --logout-urls "https://your-app.vercel.app" \
  --allowed-o-auth-flows "code" "implicit" \
  --allowed-o-auth-scopes "email" "openid" "profile"
```

Or manually in AWS Console:
1. Go to Cognito → User Pools → Your Pool
2. App integration → App clients → Your client
3. Edit Hosted UI settings
4. Add your Vercel URL to callback/logout URLs

---

## Step 4: Test Your Deployment

1. **Visit your Vercel URL**
2. **Click "Sign Up"**
3. **Create an account** (you'll get email verification)
4. **Verify email** and login
5. **Add a food log**

---

## Step 5: Set Up Custom Domain (Optional)

### In Vercel:
1. Go to your project → Settings → Domains
2. Add your custom domain (e.g., `healthcoach.com`)
3. Follow Vercel's DNS instructions

### Update Cognito:
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-id 1234567890abcdefghijk \
  --callback-urls "https://healthcoach.com/dashboard" \
  --logout-urls "https://healthcoach.com"
```

---

## Troubleshooting

### Error: "Invalid auth state"
- Check environment variables in Vercel dashboard
- Make sure all 4 variables are set
- Redeploy after adding variables

### Error: "Network request failed"
- Check API_URL is correct
- Verify API Gateway is deployed and accessible
- Check CORS settings in API Gateway

### Error: "User pool does not exist"
- Verify COGNITO_USER_POOL_ID is correct
- Check AWS region matches

### Email verification not working
- Check Cognito email settings in AWS Console
- Make sure SES is configured if using custom email

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically builds and deploys!
```

---

## Costs

**Vercel Pricing**:
- **Hobby (Free)**: Perfect for personal projects
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - **Total: $0/month**

**Combined Stack**:
- AWS Backend: ~$20-25/month
- Vercel Frontend: $0/month
- **Total: ~$20-25/month**

---

## What's Next?

1. ✅ Backend API deployed to AWS
2. ✅ Frontend deployed to Vercel
3. 🔲 Add photo upload functionality
4. 🔲 Integrate AI food analysis (AWS Bedrock/OpenAI)
5. 🔲 Add analytics dashboard
6. 🔲 Implement habit tracking
7. 🔲 Add social features

**Your full-stack serverless app is live!** 🎉
