// pregnancyUtils.ts
// Utility functions for pregnancy calculations

export function calculateWeeksPregnant(lmpDate: string): number {
  const lmp = new Date(lmpDate);
  const now = new Date();
  const diffMs = now.getTime() - lmp.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

export function calculateEstimatedDueDate(lmpDate: string): string {
  const lmp = new Date(lmpDate);
  const dueDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000); // 280 days = 40 weeks
  return dueDate.toISOString().split('T')[0]; // YYYY-MM-DD
}
