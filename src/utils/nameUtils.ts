/**
 * Capitalizes the first letter of each word in a player name
 * @param name - The player name (can be lowercase from database)
 * @returns The properly capitalized name for display
 */
export function capitalizePlayerName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a player name for database storage (lowercase and trimmed)
 * @param name - The player name as entered by user
 * @returns The formatted name for database storage
 */
export function formatNameForDatabase(name: string): string {
  if (!name) return '';
  
  return name.trim().toLowerCase();
} 