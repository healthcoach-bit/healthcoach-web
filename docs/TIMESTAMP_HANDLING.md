# ⚠️ CRITICAL: Timestamp Handling Documentation

## Overview

Our system uses a **"Display Time"** approach for timestamps, NOT actual UTC time. This is a critical architectural decision that must be preserved.

## The Problem We Solved

### Before (BROKEN):
- Wallavi sends: `"2025-10-29T09:00:00.000Z"` (9 AM local time with UTC marker)
- Backend stores: `09:00:00.000Z`
- Frontend displays: `new Date("...").toLocaleTimeString()` → **2:00 AM** ❌ (9 AM UTC - 7 hours)

### After (CORRECT):
- Wallavi sends: `"2025-10-29T09:00:00.000Z"` (9 AM local time with UTC marker)
- Backend strips timezone, stores: `09:00:00.000Z` (as display time)
- Frontend extracts time from string → **9:00 AM** ✅ (no conversion)

---

## Architecture

### Timestamp Format
```
"2025-10-29T09:00:00.000Z"
```

**MEANING:**
- NOT 9:00 AM UTC
- IS 9:00 AM local time (display time)
- `.000Z` is just a marker, not an actual timezone

### Why This Approach?

1. **Wallavi Integration:** Wallavi sends local time with incorrect UTC markers
2. **Simplicity:** No timezone conversion = no bugs
3. **User Experience:** Users see exactly what they entered
4. **Multi-timezone:** Works for users in any timezone

---

## Implementation Rules

### 🔴 Backend (Lambda - foodLogs.ts)

#### CREATE & UPDATE Handlers

```typescript
// ALWAYS strip timezone markers and re-add .000Z
const stripped = timestamp
  .replace(/Z$/, '')           // Remove Z
  .replace(/\+00:00$/, '')     // Remove +00:00
  .replace(/[+-]\d{2}:\d{2}$/, '') // Remove any offset
  .replace(/\.\d+$/, '');      // Remove milliseconds
ts = stripped + '.000Z';
```

**DO NOT:**
- ❌ Use `new Date()` to parse timestamps
- ❌ Apply any timezone conversions
- ❌ Store as actual UTC time

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-api/lambda/handlers/foodLogs.ts`
- Lines 133-173 (CREATE)
- Lines 316-333 (UPDATE)

---

### 🔵 Frontend Display (dateUtils.ts)

#### formatTime() Function

```typescript
// Extract time DIRECTLY from string
const timeMatch = timestamp.match(/T(\d{2}):(\d{2})/);
// "2025-10-29T09:00:00.000Z" → "09:00"
// Format to "9:00 a. m."
```

**DO NOT:**
- ❌ `new Date(timestamp).toLocaleTimeString()` - Applies timezone conversion
- ❌ `new Date(timestamp).getHours()` - Converts from UTC to local

**DO:**
- ✅ Extract time with regex from string
- ✅ Format manually for display

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-web/lib/dateUtils.ts`
- Lines 44-89

---

### 🟢 Frontend Forms (new-log page)

#### Sending Timestamps

```typescript
// datetime-local gives: "2025-10-29T14:00"
const formattedTimestamp = `${timestamp}:00.000Z`;
// Send: "2025-10-29T14:00:00.000Z"
```

#### Loading for Edit

```typescript
// Extract datetime WITHOUT Date object
const timestampMatch = foodLog.timestamp.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
const result = `${timestampMatch[1]}T${timestampMatch[2]}`;
// "2025-10-29T09:00:00.000Z" → "2025-10-29T09:00"
```

**DO NOT:**
- ❌ `new Date(timestamp)` - Applies timezone conversion
- ❌ `date.getHours()`, `date.getMinutes()` - Uses local timezone

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-web/app/dashboard/new-log/page.tsx`
- Lines 188-195 (Sending)
- Lines 104-124 (Loading)

---

## Testing

### Unit Tests

Run before committing any changes:

```bash
cd healthcoach-web
npm test lib/__tests__/dateUtils.test.ts
```

**Critical tests:**
- ✅ `9:00 AM` displays as `9:00 AM` (not `2:00 AM`)
- ✅ Edit form shows `09:00` (not `02:00`)

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-web/lib/__tests__/dateUtils.test.ts`

---

### Smoke Tests

Run after deploying to staging/production:

```bash
cd healthcoach-web
export TEST_USER_TOKEN="your-token"
npm run smoke-test
```

**Tests:**
1. CREATE with `09:00:00.000Z` → Stores correctly
2. GET → Returns `09:00:00.000Z`
3. UPDATE to `14:00:00.000Z` → Updates correctly
4. DELETE → Cleans up

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-web/scripts/smoke-test.ts`

---

## Common Mistakes to Avoid

### ❌ WRONG - Using Date objects for display

```typescript
// This applies timezone conversion!
const date = new Date('2025-10-29T09:00:00.000Z');
const time = date.toLocaleTimeString(); // 2:00 AM ❌
```

### ✅ CORRECT - Extract from string

```typescript
const match = timestamp.match(/T(\d{2}):(\d{2})/);
const time = `${match[1]}:${match[2]}`; // 09:00 ✅
```

---

### ❌ WRONG - Using Date for form input

```typescript
const date = new Date(foodLog.timestamp);
setTimestamp(getLocalDateTimeString(date)); // Converts timezone ❌
```

### ✅ CORRECT - Extract with regex

```typescript
const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
setTimestamp(`${match[1]}T${match[2]}`); // No conversion ✅
```

---

## Integration Notes

### Wallavi
- Sends: `"2025-10-29T09:00:00.000Z"` or `"2025-10-29T09:00:00.00+00:00"`
- Backend: Strips timezone markers
- Result: Works correctly

### Frontend Manual Entry
- Sends: `"2025-10-29T14:00:00.000Z"` (formatted from datetime-local)
- Backend: Strips and re-adds `.000Z`
- Result: Works correctly

Both sources handled identically.

---

## Deployment Checklist

Before deploying changes to timestamp handling:

- [ ] Read this document
- [ ] Review backend code in `foodLogs.ts`
- [ ] Review frontend code in `dateUtils.ts` and `new-log/page.tsx`
- [ ] Run unit tests: `npm test`
- [ ] Test manually in local environment
- [ ] Deploy to staging
- [ ] Run smoke tests against staging
- [ ] Test with Wallavi integration
- [ ] Deploy to production
- [ ] Run smoke tests against production
- [ ] Monitor CloudWatch logs for first few requests

---

## Support

If timestamp display breaks:

1. Check CloudWatch logs for received timestamps
2. Verify backend normalization is working
3. Check frontend display is using string extraction (not Date objects)
4. Run smoke tests to identify which step is broken

**Most common issue:** Someone used `new Date()` or `toLocaleTimeString()` somewhere

---

## Change History

- **2025-10-29:** Initial implementation of display time approach
  - Backend: Strip timezone markers
  - Frontend: Extract time from string
  - Tests: Unit tests and smoke tests added
  - Documentation: This document created

---

## Related Files

### Backend
- `/lambda/handlers/foodLogs.ts` - CREATE & UPDATE handlers

### Frontend
- `/lib/dateUtils.ts` - Display utilities
- `/app/dashboard/new-log/page.tsx` - Form handling
- `/app/dashboard/page.tsx` - Dashboard display
- `/app/dashboard/food-logs/[id]/page.tsx` - Detail page display

### Tests
- `/lib/__tests__/dateUtils.test.ts` - Unit tests
- `/scripts/smoke-test.ts` - Integration smoke tests

### Docs
- This file: `/docs/TIMESTAMP_HANDLING.md`
