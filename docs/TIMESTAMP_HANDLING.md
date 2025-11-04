# ⚠️ CRITICAL: Timestamp Handling Documentation

## Overview

Our system uses **proper UTC** for timestamps (changed Nov 3, 2025). This follows industry standards and fixes date shifting bugs with Wallavi integration.

## The Problem We Solved

### Before (BROKEN - Display Time Approach):
- User enters: 10 PM local time
- Stored as: `"2025-11-03T22:00:00.000Z"` (fake UTC, actually 10 PM local)
- Wallavi interpreted as: 10 PM UTC = 3 PM local (for PST)
- **OR** date shifted to next day ❌

### After (CORRECT - Real UTC):
- User enters: 10 PM local (PST, UTC-7)
- Frontend converts: 10 PM + 7 hours = 5 AM UTC next day
- Stored as: `"2025-11-04T05:00:00.000Z"` (real UTC)
- Frontend displays: Converts back to 10 PM local ✅
- Wallavi works correctly: Receives timezone info, converts properly ✅

---

## Architecture

### Timestamp Format
```
"2025-11-03T21:00:00.000Z"
```

**MEANING:**
- IS 9:00 PM UTC (actual UTC time)
- `.000Z` indicates true UTC timezone
- Frontend auto-converts to local for display
- Wallavi receives timezone info to convert properly

### Why This Approach?

1. **Industry Standard:** How AWS, Google, Facebook, etc. handle timestamps
2. **Wallavi Integration:** OpenAI/Wallavi expect and work with real UTC
3. **Fixes Date Shifting:** No more next-day bugs with evening meals
4. **Multi-timezone Ready:** Data portable across timezones
5. **Proper Date Filtering:** Midnight boundaries work correctly

---

## Implementation Rules

### 🔴 Backend (Lambda - foodLogs.ts)

#### CREATE & UPDATE Handlers

```typescript
// Backend receives UTC timestamps from frontend
// The "stripping" logic still exists but now works with real UTC:
const stripped = timestamp
  .replace(/Z$/, '')           // Remove Z
  .replace(/\+00:00$/, '')     // Remove +00:00
  .replace(/[+-]\d{2}:\d{2}$/, '') // Remove any offset
  .replace(/\.\d+$/, '');      // Remove milliseconds
ts = stripped + '.000Z';
// Result: Normalized UTC timestamp for MySQL TIMESTAMP column
```

**KEY CHANGE:**
- Frontend NOW sends real UTC (not display time)
- Backend normalization still works correctly
- MySQL TIMESTAMP stores in UTC
- No backend code changes needed! ✅

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-api/lambda/handlers/foodLogs.ts`
- Lines 133-173 (CREATE)
- Lines 316-333 (UPDATE)

---

### 🔵 Frontend Display (dateUtils.ts)

#### formatTime() Function

```typescript
// NOW: Uses Date object for proper UTC to local conversion
const date = new Date(timestamp); // Browser converts UTC to local
const hour = date.getHours(); // Gets local hour
const minute = date.getMinutes().toString().padStart(2, '0');
const ampm = hour >= 12 ? 'p. m.' : 'a. m.';
const displayHour = hour % 12 || 12;
return `${displayHour}:${minute} ${ampm}`;
```

**NEW APPROACH:**
- ✅ Use `new Date(timestamp)` - Browser auto-converts UTC to local
- ✅ Use `getHours()`, `getMinutes()` - These return local time
- ✅ Simple and correct - Let the browser handle timezone conversion

**OLD APPROACH (REMOVED):**
- ❌ Regex extraction: `timestamp.match(/T(\d{2}):(\d{2})/)`
- ❌ Manual string manipulation
- ❌ Only worked with fake UTC

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-web/lib/dateUtils.ts`
- Lines 117-135

---

### 🟢 Frontend Forms (new-log page)

#### Sending Timestamps

```typescript
// NEW: Convert local to UTC using utility function
import { localToUTC } from '@/lib/dateUtils';

// datetime-local gives: "2025-11-03T14:00" (2 PM local PST)
const formattedTimestamp = localToUTC(timestamp);
// Result: "2025-11-03T21:00:00.000Z" (9 PM UTC = 2 PM + 7 hours)
```

#### Loading for Edit

```typescript
// NEW: Convert UTC to local using utility function
import { utcToLocalInput } from '@/lib/dateUtils';

// Backend returns: "2025-11-03T21:00:00.000Z" (9 PM UTC)
setTimestamp(utcToLocalInput(foodLog.timestamp));
// Result: "2025-11-03T14:00" (2 PM local for datetime-local input)
```

**NEW UTILITY FUNCTIONS:**
- ✅ `localToUTC()` - Converts datetime-local input to UTC
- ✅ `utcToLocalInput()` - Converts UTC to datetime-local format
- ✅ `getLocalDateTimeString()` - Gets current local datetime

**OLD APPROACH (REMOVED):**
- ❌ String concatenation: `${timestamp}:00.000Z`
- ❌ Regex extraction for loading
- ❌ Manual string manipulation

**Location:** `/Users/josiaspersonal/CascadeProjects/healthcoach-web/app/dashboard/new-log/page.tsx`
- Lines 186, 223 (Sending with localToUTC)
- Line 102 (Loading with utcToLocalInput)

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

### ❌ WRONG - NOT converting to UTC when saving

```typescript
// User enters 2 PM, you send it as-is
const timestamp = '2025-11-03T14:00:00.000Z'; // WRONG! This is NOT UTC
await createFoodLog({ timestamp }); // ❌ Stores local time as UTC
```

### ✅ CORRECT - Convert local to UTC

```typescript
import { localToUTC } from '@/lib/dateUtils';
// User enters 2 PM local
const timestamp = '2025-11-03T14:00'; // From datetime-local
const utcTimestamp = localToUTC(timestamp); // "2025-11-03T21:00:00.000Z"
await createFoodLog({ timestamp: utcTimestamp }); // ✅ Stores real UTC
```

---

### ❌ WRONG - Using .slice() for form loading

```typescript
// Don't do this anymore!
const timestamp = foodLog.timestamp.slice(0, 16); // ❌ Wrong time shown
setTimestamp(timestamp);
```

### ✅ CORRECT - Use utcToLocalInput()

```typescript
import { utcToLocalInput } from '@/lib/dateUtils';
// Backend returns UTC, convert to local for editing
setTimestamp(utcToLocalInput(foodLog.timestamp)); // ✅ Correct local time
```

---

### ❌ WRONG - Manual string manipulation

```typescript
// Don't extract with regex anymore
const match = timestamp.match(/T(\d{2}):(\d{2})/);
const time = `${match[1]}:${match[2]}`; // ❌ Old approach
```

### ✅ CORRECT - Use Date objects

```typescript
// Let the browser handle conversion
const date = new Date(timestamp); // Browser converts UTC to local
const hours = date.getHours(); // ✅ Local time
const minutes = date.getMinutes(); // ✅ Local time
```

---

## Integration Notes

### Wallavi
- Receives: `user_timezone`, `user_utc_offset_hours`, `current_local_date`, `current_local_time`
- User says: "desayuno a las 7 AM"
- Wallavi converts: 7 AM + user_utc_offset_hours = UTC time
- Sends: `"2025-11-03T14:00:00.000Z"` (real UTC)
- Backend: Receives and stores UTC correctly ✅

### Frontend Manual Entry
- User enters: `"2025-11-03T14:00"` in datetime-local input (2 PM local)
- Frontend converts: `localToUTC("2025-11-03T14:00")` → `"2025-11-03T21:00:00.000Z"`
- Backend: Receives and stores UTC correctly ✅

Both sources now send real UTC!

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

- **2025-11-03:** ✅ **MAJOR CHANGE: Switched to proper UTC**
  - Reason: Date shifting bug with Wallavi (evening meals registered as next day)
  - Frontend: Added `localToUTC()`, `utcToLocalInput()`, `getLocalDateTimeString()` utilities
  - Frontend: Updated all forms to use UTC conversion functions
  - Frontend: Updated `formatTime()` and `formatDate()` to use Date objects
  - WallaviAuth: Added timezone info to `_environmentContext`
  - WallaviAuth: Updated timestamp_rules to require UTC conversion
  - OpenAPI: Updated all timestamp descriptions to require UTC
  - Backend: No changes needed (normalization still works)
  - Benefits: Fixes date shifting, industry standard, multi-timezone ready

- **2025-10-29:** Initial implementation of display time approach (DEPRECATED)
  - Backend: Strip timezone markers
  - Frontend: Extract time from string with regex
  - Tests: Unit tests and smoke tests added
  - Documentation: This document created
  - Status: ❌ Replaced by UTC approach on 2025-11-03

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
