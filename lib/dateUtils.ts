/**
 * Date and time formatting utilities
 * 
 * ✅ NEW APPROACH: Proper UTC Storage
 * - Store: Real UTC timestamps (e.g., "2025-11-03T21:00:00.000Z" = 9 PM UTC)
 * - Display: Convert to user's local timezone automatically
 * - Forms: Convert local input to UTC before saving
 */

/**
 * Convert local datetime string (from datetime-local input) to UTC ISO string
 * @param localDateTimeString - Format: "2025-11-03T14:56" (from datetime-local input)
 * @returns UTC ISO string: "2025-11-03T21:56:00.000Z" (if user is in PST UTC-7)
 * @example
 * // User in PST (UTC-7) enters 2:00 PM
 * localToUTC('2025-11-03T14:00') // Returns '2025-11-03T21:00:00.000Z' (2 PM + 7 hours)
 */
export function localToUTC(localDateTimeString: string): string {
  // datetime-local gives us "YYYY-MM-DDTHH:MM"
  // Browser's Date constructor interprets this as local time
  const localDate = new Date(localDateTimeString);
  return localDate.toISOString(); // Automatically converts to UTC
}

/**
 * Convert UTC ISO string to local datetime for datetime-local input
 * @param utcISOString - Format: "2025-11-03T21:56:00.000Z"
 * @returns Local datetime string: "2025-11-03T14:56" (for datetime-local input)
 * @example
 * // User in PST (UTC-7) viewing 9 PM UTC
 * utcToLocalInput('2025-11-03T21:00:00.000Z') // Returns '2025-11-03T14:00' (9 PM - 7 hours)
 */
export function utcToLocalInput(utcISOString: string): string {
  const date = new Date(utcISOString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get current local datetime string for datetime-local input
 * @param date - Optional date, defaults to now
 * @returns Local datetime string: "2025-11-03T14:56"
 */
export function getLocalDateTimeString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format UTC timestamp to localized date string
 * Automatically converts UTC to user's local timezone
 * Example: "viernes, 24 de octubre de 2025" or "Friday, October 24, 2025"
 * @param timestamp - UTC ISO string: "2025-11-03T21:00:00.000Z"
 * @param locale - 'es' or 'en'
 */
export function formatDate(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return locale === 'es' ? 'Fecha no disponible' : 'Date not available';
  }
  
  const date = new Date(timestamp); // Browser automatically converts UTC to local
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
 * Format UTC timestamp to short localized date string
 * Automatically converts UTC to user's local timezone
 * Example: "24/10/2025" or "10/24/2025"
 * @param timestamp - UTC ISO string: "2025-11-03T21:00:00.000Z"
 * @param locale - 'es' or 'en'
 */
export function formatShortDate(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return '--/--/----';
  }
  
  const date = new Date(timestamp); // Browser automatically converts UTC to local
  if (isNaN(date.getTime())) {
    return '--/--/----';
  }
  
  return date.toLocaleDateString(locale);
}

/**
 * ✅ NEW APPROACH: Proper UTC Handling
 * 
 * Format UTC timestamp to localized time string with AM/PM
 * Automatically converts UTC to user's local timezone
 * 
 * @param timestamp - UTC ISO string: "2025-11-03T21:00:00.000Z" (9 PM UTC)
 * @param locale - 'es' or 'en'
 * @returns Formatted time like "2:00 p. m." or "2:00 PM" (in user's local time)
 * 
 * @example
 * // User in PST (UTC-7) viewing 9 PM UTC timestamp
 * formatTime('2025-11-03T21:00:00.000Z', 'es') // "2:00 p. m." (9 PM - 7 hours)
 * formatTime('2025-11-03T21:00:00.000Z', 'en') // "2:00 PM"
 */
export function formatTime(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return '--:--';
  }
  
  // Convert UTC to local time
  const date = new Date(timestamp); // Browser automatically converts to local
  if (isNaN(date.getTime())) {
    return '--:--';
  }
  
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');
  const ampm = locale === 'es' 
    ? (hour >= 12 ? 'p. m.' : 'a. m.')
    : (hour >= 12 ? 'PM' : 'AM');
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

/**
 * Format timestamp to date and time string
 * Example: "24/10/2025, 7:46 p. m."
 */
export function formatDateTime(timestamp: string | undefined | null, locale: string): string {
  return `${formatShortDate(timestamp, locale)}, ${formatTime(timestamp, locale)}`;
}
