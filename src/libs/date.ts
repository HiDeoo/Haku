export function isDateEqual(dateLeft: Date | undefined, dateRight: Date | undefined) {
  if (!dateLeft || !dateRight) {
    return false
  }

  return dateLeft.getTime() === dateRight.getTime()
}

export function isDateAfter(date: Date | undefined, dateToCompare: Date | undefined) {
  if (!date || !dateToCompare) {
    return false
  }

  return date.getTime() > dateToCompare.getTime()
}
