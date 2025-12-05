"use client"

import type React from "react"

import { useState, useCallback } from "react"
import type { KanbanTask, KanbanColumn } from "@/src/types/kanban.types"
import { generateId } from "@/src/utils/task.utils"
import { reorderTasks, moveTaskBetweenColumns } from "@/src/utils/column.utils"

interface UseKanbanBoardReturn {
  columns: KanbanColumn[]
  tasks: Record<string, KanbanTask>
  moveTask: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => void
  createTask: (columnId: string, taskData: Omit<KanbanTask, "id" | "createdAt">) => void
  updateTask: (taskId: string, updates: Partial<KanbanTask>) => void
  deleteTask: (taskId: string) => void
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>
  setTasks: React.Dispatch<React.SetStateAction<Record<string, KanbanTask>>>
  reorderColumns: (fromIndex: number, toIndex: number) => void
  toggleColumnCollapse: (columnId: string) => void
}

export const useKanbanBoard = (
  initialColumns: KanbanColumn[],
  initialTasks: Record<string, KanbanTask>,
): UseKanbanBoardReturn => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [tasks, setTasks] = useState<Record<string, KanbanTask>>(initialTasks)

  const moveTask = useCallback((taskId: string, fromColumn: string, toColumn: string, newIndex: number) => {
    setColumns((prevColumns) => {
      const sourceColumn = prevColumns.find((col) => col.id === fromColumn)
      const destColumn = prevColumns.find((col) => col.id === toColumn)

      if (!sourceColumn || !destColumn) return prevColumns

      const sourceIndex = sourceColumn.taskIds.indexOf(taskId)
      if (sourceIndex === -1) return prevColumns

      // Same column reorder
      if (fromColumn === toColumn) {
        return prevColumns.map((col) => {
          if (col.id === fromColumn) {
            return {
              ...col,
              taskIds: reorderTasks(col.taskIds, sourceIndex, newIndex),
            }
          }
          return col
        })
      }

      // Move between columns
      const { source, destination } = moveTaskBetweenColumns(
        sourceColumn.taskIds,
        destColumn.taskIds,
        sourceIndex,
        newIndex,
      )

      return prevColumns.map((col) => {
        if (col.id === fromColumn) {
          return { ...col, taskIds: source }
        }
        if (col.id === toColumn) {
          return { ...col, taskIds: destination }
        }
        return col
      })
    })

    // Update task status and add activity log entry
    setTasks((prevTasks) => {
      const existingTask = prevTasks[taskId]
      const activityEntry = {
        id: generateId(),
        action: "moved" as const,
        timestamp: new Date(),
        fromValue: fromColumn,
        toValue: toColumn,
      }

      return {
        ...prevTasks,
        [taskId]: {
          ...existingTask,
          status: toColumn,
          activityLog: [...(existingTask.activityLog || []), activityEntry],
        },
      }
    })
  }, [])

  const createTask = useCallback((columnId: string, taskData: Omit<KanbanTask, "id" | "createdAt">) => {
    const newTask: KanbanTask = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      activityLog: [
        {
          id: generateId(),
          action: "created",
          timestamp: new Date(),
        },
      ],
    }

    setTasks((prev) => ({
      ...prev,
      [newTask.id]: newTask,
    }))

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            taskIds: [...col.taskIds, newTask.id],
          }
        }
        return col
      }),
    )
  }, [])

  const updateTask = useCallback((taskId: string, updates: Partial<KanbanTask>) => {
    setTasks((prev) => {
      const existingTask = prev[taskId]
      const activityEntries: KanbanTask["activityLog"] = [...(existingTask.activityLog || [])]

      if (updates.priority && updates.priority !== existingTask.priority) {
        activityEntries.push({
          id: generateId(),
          action: "priority_changed",
          timestamp: new Date(),
          fromValue: existingTask.priority,
          toValue: updates.priority,
        })
      }

      if (updates.assignee !== undefined && updates.assignee !== existingTask.assignee) {
        activityEntries.push({
          id: generateId(),
          action: "assignee_changed",
          timestamp: new Date(),
          fromValue: existingTask.assignee,
          toValue: updates.assignee,
        })
      }

      // Add general update entry if other fields changed
      if (updates.title !== existingTask.title || updates.description !== existingTask.description) {
        activityEntries.push({
          id: generateId(),
          action: "updated",
          timestamp: new Date(),
        })
      }

      return {
        ...prev,
        [taskId]: {
          ...existingTask,
          ...updates,
          activityLog: activityEntries,
        },
      }
    })
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const newTasks = { ...prev }
      delete newTasks[taskId]
      return newTasks
    })

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        taskIds: col.taskIds.filter((id) => id !== taskId),
      })),
    )
  }, [])

  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    setColumns((prev) => {
      const result = Array.from(prev)
      const [removed] = result.splice(fromIndex, 1)
      result.splice(toIndex, 0, removed)
      return result
    })
  }, [])

  const toggleColumnCollapse = useCallback((columnId: string) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, isCollapsed: !col.isCollapsed } : col)))
  }, [])

  return {
    columns,
    tasks,
    moveTask,
    createTask,
    updateTask,
    deleteTask,
    setColumns,
    setTasks,
    reorderColumns,
    toggleColumnCollapse,
  }
}
