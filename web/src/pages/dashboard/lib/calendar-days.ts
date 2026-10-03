/** Compare calendar dates in UTC only after extracting the local calendar fields. */
export const getCalendarDaysUntil = (date: string, now: Date): number => {
  const target = new Date(`${date}T12:00:00`)
  const targetDay = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())

  return Math.round((targetDay - today) / 86_400_000)
}
