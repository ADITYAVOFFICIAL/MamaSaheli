import { addDays, differenceInWeeks, isValid, parseISO } from 'date-fns';

/**
 * Calculates the number of completed weeks of pregnancy from the Last Menstrual Period (LMP).
 *
 * @param lmpDate - The date of the last menstrual period in 'YYYY-MM-DD' format.
 * @returns The number of completed weeks pregnant, or null if the date is invalid.
 */
export function calculateWeeksPregnant(lmpDate: string): number | null {
  const lmp = parseISO(lmpDate);
  if (!isValid(lmp)) {
    return null;
  }
  
  const now = new Date();
  // differenceInWeeks calculates the number of full weeks between two dates.
  return differenceInWeeks(now, lmp);
}

/**
 * Calculates the estimated due date (EDD) based on the Last Menstrual Period (LMP).
 * The standard calculation is LMP + 280 days (40 weeks).
 *
 * @param lmpDate - The date of the last menstrual period in 'YYYY-MM-DD' format.
 * @returns The estimated due date in 'YYYY-MM-DD' format, or null if the input date is invalid.
 */
export function calculateEstimatedDueDate(lmpDate: string): string | null {
  const lmp = parseISO(lmpDate);
  if (!isValid(lmp)) {
    return null;
  }
  
  const dueDate = addDays(lmp, 280);
  
  // Format the date back to YYYY-MM-DD string
  return dueDate.toISOString().split('T')[0];
}

/**
 * Determines the current trimester of the pregnancy.
 *
 * @param weeksPregnant - The current number of completed weeks of pregnancy.
 * @returns The current trimester (1, 2, or 3), or null if the input is invalid.
 */
export function getTrimester(weeksPregnant: number | null): 1 | 2 | 3 | null {
    if (weeksPregnant === null || weeksPregnant < 0) {
        return null;
    }
    if (weeksPregnant <= 13) { // First trimester is up to week 13
        return 1;
    }
    if (weeksPregnant <= 27) { // Second trimester is from week 14 to 27
        return 2;
    }
    return 3; // Third trimester is from week 28 onwards
}