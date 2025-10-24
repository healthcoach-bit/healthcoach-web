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
 * Example: "7:46 p. m." or "7:46 PM"
 */
export function formatTime(timestamp: string | undefined | null, locale: string): string {
  if (!timestamp) {
    return '--:--';
  }
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return '--:--';
  }
  
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format timestamp to date and time string
 * Example: "24/10/2025, 7:46 p. m."
 */
export function formatDateTime(timestamp: string | undefined | null, locale: string): string {
  return `${formatShortDate(timestamp, locale)}, ${formatTime(timestamp, locale)}`;
}
