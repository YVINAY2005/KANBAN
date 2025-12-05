/**
 * Reorders tasks within the same column
 */
export const reorderTasks = (tasks: string[], startIndex: number, endIndex: number): string[] => {
  const result = Array.from(tasks)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

/**
 * Moves task between columns
 */
export const moveTaskBetweenColumns = (
  sourceColumn: string[],
  destColumn: string[],
  sourceIndex: number,
  destIndex: number,
): { source: string[]; destination: string[] } => {
  const sourceClone = Array.from(sourceColumn)
  const destClone = Array.from(destColumn)
  const [removed] = sourceClone.splice(sourceIndex, 1)
  destClone.splice(destIndex, 0, removed)

  return {
    source: sourceClone,
    destination: destClone,
  }
}

/**
 * Gets column color for header styling
 */
export const getColumnHeaderColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    pink: "bg-pink-100 text-pink-700",
    indigo: "bg-indigo-100 text-indigo-700",
    orange: "bg-orange-100 text-orange-700",
  }
  return colorMap[color] || colorMap.gray
}

/**
 * Gets column dot color
 */
export const getColumnDotColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500",
    orange: "bg-orange-500",
  }
  return colorMap[color] || colorMap.gray
}
