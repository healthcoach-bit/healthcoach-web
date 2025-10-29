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
 * Format timestamp to localized time string with AM/PM
 * Example: "7:46 PM" or "7:46 p. m."
 */
export function formatTime(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return '--:--';
  }
  
  // Extract time directly from timestamp WITHOUT timezone conversion
  // Our timestamps are stored as display time (local time with .000Z marker)
  // "2025-10-29T09:00:00.000Z" should display as "9:00 AM" (not converted)
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
