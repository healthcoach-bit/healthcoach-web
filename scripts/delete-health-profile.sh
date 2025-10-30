#!/bin/bash

# Script to delete health profile for testing onboarding
# Usage: ./scripts/delete-health-profile.sh <user_email>

if [ -z "$1" ]; then
  echo "❌ Error: Email required"
  echo "Usage: ./scripts/delete-health-profile.sh <user_email>"
  echo "Example: ./scripts/delete-health-profile.sh yayahay345@dwakm.com"
  exit 1
fi

USER_EMAIL="$1"

echo "🔍 Finding user by email: $USER_EMAIL"

# Get user ID from Cognito
USER_ID=$(aws cognito-idp list-users \
  --user-pool-id us-east-1_x7sXqGfsa \
  --filter "email = \"$USER_EMAIL\"" \
  --query 'Users[0].Username' \
  --output text)

if [ "$USER_ID" = "None" ] || [ -z "$USER_ID" ]; then
  echo "❌ User not found with email: $USER_EMAIL"
  exit 1
fi

echo "✅ Found user ID: $USER_ID"
echo ""

# Check if health profile exists
echo "🔍 Checking if health profile exists..."

aws dynamodb get-item \
  --table-name healthcoach-health-profiles \
  --key "{\"userId\":{\"S\":\"$USER_ID\"}}" \
  --query 'Item' \
  --output json > /tmp/profile.json 2>&1

if grep -q "null" /tmp/profile.json || [ ! -s /tmp/profile.json ]; then
  echo "⚠️  No health profile found for this user"
  exit 0
fi

echo "✅ Health profile found"
echo ""

# Delete the profile
echo "🗑️  Deleting health profile..."

aws dynamodb delete-item \
  --table-name healthcoach-health-profiles \
  --key "{\"userId\":{\"S\":\"$USER_ID\"}}"

if [ $? -eq 0 ]; then
  echo "✅ Health profile deleted successfully!"
  echo ""
  echo "📝 User can now test onboarding in Wallavi"
  echo "   Email: $USER_EMAIL"
  echo "   User ID: $USER_ID"
else
  echo "❌ Failed to delete health profile"
  exit 1
fi

# Clean up
rm /tmp/profile.json 2>/dev/null
