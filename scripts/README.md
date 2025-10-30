# Health Profile Testing Scripts

Scripts for testing health profile onboarding in Wallavi.

---

## Quick Usage

### Option 1: Interactive (Easiest)

```bash
npm run clear-profile
```

This will:
1. Show list of all users
2. Let you select which one
3. Ask for confirmation
4. Delete the health profile

### Option 2: Direct Delete (Fast)

```bash
npm run delete-profile <email>
```

Example:
```bash
npm run delete-profile yayahay345@dwakm.com
```

---

## Scripts

### `clear-my-profile.sh`

**Interactive script** - shows all users and lets you choose.

```bash
./scripts/clear-my-profile.sh
```

Output:
```
👥 Available users in system:

 1. user-id-1    email1@example.com
 2. user-id-2    email2@example.com

Enter the number of the user to clear profile:
```

### `delete-health-profile.sh`

**Direct delete** - requires email as argument.

```bash
./scripts/delete-health-profile.sh yayahay345@dwakm.com
```

Output:
```
🔍 Finding user by email: yayahay345@dwakm.com
✅ Found user ID: 948874c8-2011-70c5-6013-0d9d5f8c9000
✅ Health profile found
🗑️  Deleting health profile...
✅ Health profile deleted successfully!
```

---

## Testing Onboarding

After deleting profile:

1. **Open the app** as the user
2. **Open Wallavi chat**
3. **First message** should be:
   ```
   ¡Hola! 👋 Veo que aún no tienes tu perfil de salud configurado.
   ¿Te gustaría que te ayude a configurarlo ahora?
   ```
4. **Complete the flow** by answering questions
5. **Verify** profile saved in DB
6. **Refresh** - onboarding should NOT appear again ✅

---

## Requirements

- AWS CLI configured
- Access to Cognito user pool: `us-east-1_x7sXqGfsa`
- Access to DynamoDB table: `healthcoach-health-profiles`

---

## Troubleshooting

### "User not found"
- Check email is correct
- Verify user exists in Cognito

### "No health profile found"
- User may have never created profile
- This is normal for new users

### "Failed to delete"
- Check AWS credentials
- Verify table name is correct
- Check permissions

---

## Notes

- **Safe to use**: Only deletes health profile, not user account
- **Reversible**: User can recreate profile via Wallavi onboarding
- **Testing only**: Don't use in production on real user data
