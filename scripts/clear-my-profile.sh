#!/bin/bash

# Quick script to delete YOUR health profile for testing
# Lists all users and lets you choose which one to clear

echo "👥 Available users in system:"
echo ""

# List all users with email
aws cognito-idp list-users \
  --user-pool-id us-east-1_x7sXqGfsa \
  --query 'Users[*].[Username,Attributes[?Name==`email`].Value|[0]]' \
  --output text | \
  nl -w2 -s'. '

echo ""
echo "Enter the number of the user to clear profile:"
read -r selection

# Get the selected user
USER_INFO=$(aws cognito-idp list-users \
  --user-pool-id us-east-1_x7sXqGfsa \
  --query 'Users[*].[Username,Attributes[?Name==`email`].Value|[0]]' \
  --output text | \
  sed -n "${selection}p")

USER_ID=$(echo "$USER_INFO" | awk '{print $1}')
USER_EMAIL=$(echo "$USER_INFO" | awk '{print $2}')

if [ -z "$USER_ID" ]; then
  echo "❌ Invalid selection"
  exit 1
fi

echo ""
echo "Selected user:"
echo "  Email: $USER_EMAIL"
echo "  ID: $USER_ID"
echo ""
echo "⚠️  This will DELETE the health profile for this user."
echo "Are you sure? (type 'yes' to confirm)"
read -r confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled"
  exit 0
fi

echo ""
echo "🗑️  Deleting health profile..."

# Delete the profile
aws dynamodb delete-item \
  --table-name healthcoach-health-profiles \
  --key "{\"userId\":{\"S\":\"$USER_ID\"}}" \
  2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Health profile deleted successfully!"
  echo ""
  echo "📝 Next steps:"
  echo "   1. Open Wallavi in the app"
  echo "   2. You should see onboarding prompt"
  echo "   3. Complete the profile setup"
else
  echo ""
  echo "❌ Failed to delete (profile may not exist)"
  echo "ℹ️  This is normal if user never had a profile"
fi
