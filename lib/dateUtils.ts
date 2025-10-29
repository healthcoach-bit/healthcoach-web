/**
 * Date and time formatting utilities
 */

/**
 * Format timestamp to localized date string
 * Example: "viernes, 24 de octubre de 2025" or "Friday, October 24, 2025"
 */
export function formatDate(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return locale === 'es' ? 'Fecha no disponible' : 'Date not available';
  }
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return locale === 'es' ? 'Fecha inválida' : 'Invalid date';
  }
  
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format timestamp to short localized date string
 * Example: "24/10/2025" or "10/24/2025"
 */
export function formatShortDate(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return '--/--/----';
  }
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return '--/--/----';
  }
  
  return date.toLocaleDateString(locale);
}

/**
 * ⚠️ CRITICAL: TIMESTAMP DISPLAY POLICY
 * 
 * Format timestamp to localized time string with AM/PM
 * 
 * IMPORTANT: Our timestamps are stored as "DISPLAY TIME" not actual UTC.
 * - Format: "2025-10-29T09:00:00.000Z"
 * - Meaning: 9:00 AM LOCAL time (NOT 9:00 AM UTC)
 * 
 * This function extracts time DIRECTLY from the string WITHOUT timezone conversion.
 * 
 * ❌ WRONG: new Date(timestamp).toLocaleTimeString()
 *    → This would convert 9:00 AM UTC to 2:00 AM local (in UTC-7)
 * 
 * ✅ CORRECT: Extract "09:00" from string directly
 *    → Displays 9:00 AM as intended
 * 
 * ⚠️ DO NOT use Date objects or toLocaleTimeString() for display!
 * 
 * @param timestamp - ISO string like "2025-10-29T09:00:00.000Z" (display time)
 * @param locale - 'es' or 'en'
 * @returns Formatted time like "9:00 a. m." or "9:00 AM"
 * 
 * @example
 * formatTime('2025-10-29T09:00:00.000Z', 'es') // "9:00 a. m."
 * formatTime('2025-10-29T14:30:00.000Z', 'es') // "2:30 p. m."
 */
export function formatTime(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return '--:--';
  }
  
  // Extract time directly from timestamp WITHOUT timezone conversion
  const timeMatch = timestamp.match(/T(\d{2}):(\d{2})/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2];
    const ampm = locale === 'es' 
      ? (hour >= 12 ? 'p. m.' : 'a. m.')
      : (hour >= 12 ? 'PM' : 'AM');
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }
  
  return '--:--';
}

/**
 * Format timestamp to date and time string
 * Example: "24/10/2025, 7:46 p. m."
 */
export function formatDateTime(timestamp: string | undefined | null, locale: string): string {
  return `${formatShortDate(timestamp, locale)}, ${formatTime(timestamp, locale)}`;
}
