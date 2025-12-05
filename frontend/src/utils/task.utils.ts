import type { KanbanTask } from "@/src/types/kanban.types"

/**
 * Checks if a task is overdue
 */
export const isOverdue = (dueDate: Date): boolean => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return now > due
}

/**
 * Gets initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Formats a date for display
 */
export const formatDate = (date: Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

/**
 * Gets priority color classes
 */
export const getPriorityColor = (priority: KanbanTask["priority"]): string => {
  const colors = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  }
  return colors[priority || "medium"]
}

/**
 * Gets priority border color for card left border
 */
export const getPriorityBorderColor = (priority: KanbanTask["priority"]): string => {
  const colors = {
    low: "border-l-blue-500",
    medium: "border-l-yellow-500",
    high: "border-l-orange-500",
    urgent: "border-l-red-500",
  }
  return colors[priority || "medium"]
}

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
