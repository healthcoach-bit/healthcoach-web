# Wallavi Health Profile Onboarding

## Overview

Wallavi automatically guides users to complete their health profile at the start of conversations if it's not configured.

---

## How It Works

### Profile Detection

`WallaviAuth` component:
- Fetches user's health profile using `useHealthProfile()` hook
- Checks if profile exists and has `date_of_birth` (marker for completion)
- Sends status to Wallavi via `_contextBuilder` and `_environmentContext`

### Onboarding Flow

**If profile incomplete:**

1. First message: "¡Hola! 👋 Veo que aún no tienes tu perfil configurado. ¿Te gustaría configurarlo?"
2. Guide step-by-step (ONE question at a time):
   - Fecha de nacimiento (YYYY-MM-DD)
   - Género (optional)
   - Peso actual (kg)
   - Altura (cm)
   - Peso objetivo (optional)
   - Objetivo de calorías (optional)
   - Nivel de actividad física
   - Objetivos de salud

3. Save via `POST /health-profile` API
4. Completion message: "¡Perfecto! ✅ Tu perfil está completo."

### Automatic Update

When profile is saved:
- React Query refetches profile
- `WallaviAuth` detects change via `useEffect([healthProfile])`
- Updates Wallavi context automatically
- Future conversations proceed normally

---

## User Experience Example

### First Time (No Profile)
```
Wallavi: ¡Hola! 👋 Veo que aún no tienes tu perfil de salud configurado...

User: Sí, ayúdame

Wallavi: ¿Cuál es tu fecha de nacimiento? (formato: YYYY-MM-DD)

User: 1992-08-20

Wallavi: ¿Cuál es tu género?

... (continues)

Wallavi: ¡Perfecto! ✅ Tu perfil está completo.
```

### After Profile Complete
```
Wallavi: ¡Hola! ¿En qué te puedo ayudar hoy?

User: registra mi desayuno

... (normal conversation)
```

---

## Implementation

### Profile Status Sent to Wallavi

```typescript
_contextBuilder: {
  user_id: userId,
  has_health_profile: 'yes' | 'no',
  profile_complete: 'yes' | 'no',
}

_environmentContext: {
  profile_status: 'Profile complete' | 'Profile incomplete - need onboarding',
  onboarding_instructions: '...' // Full instructions
}
```

### Auto-Update on Profile Change

```typescript
useEffect(() => {
  if (!isLoadingProfile && window.wallavi) {
    // Update Wallavi with new profile status
    window.wallavi.identify(metadata);
  }
}, [healthProfile, isLoadingProfile]);
```

---

## Configuration

### Modify Onboarding Questions

Edit `WallaviAuth.tsx` → `onboarding_instructions`:

```typescript
onboarding_instructions: `
At the START of the conversation (first message), say:
"Your custom greeting"

If user agrees, guide them step by step:
1. "First question"
2. "Second question"
...
`
```

### API Endpoint

**POST /health-profile**

Body format (camelCase):
```json
{
  "dateOfBirth": "1992-08-20",
  "gender": "male",
  "currentWeightKg": 75,
  "heightCm": 175,
  "targetWeightKg": 70,
  "calorieGoal": 2000,
  "activityLevel": "moderate",
  "healthGoals": ["lose_weight"]
}
```

---

## Testing

1. Delete health profile for test user
2. Open Wallavi chat
3. Should see onboarding prompt
4. Complete the flow
5. Check profile saved in DB
6. Refresh - should NOT see onboarding again

---

## Notes

- **Conversational**: ONE question at a time, friendly tone
- **Optional fields**: User can skip by saying "no" or "prefiero no decir"
- **Auto-update**: Context updates when profile saved (no refresh needed)
- **Completion marker**: `date_of_birth` field presence indicates complete profile
