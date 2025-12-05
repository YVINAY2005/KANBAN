"use client"

import type React from "react"
import { memo, useCallback, useState } from "react"
import type { KanbanTask, KanbanColumn as KanbanColumnType } from "@/src/types/kanban.types"
import { KanbanCard } from "./KanbanCard"
import { Button } from "@/src/components/primitives/Button"

interface KanbanColumnProps {
  column: KanbanColumnType
  tasks: KanbanTask[]
  dragState: {
    isDragging: boolean
    draggedId: string | null
    dropTargetId: string | null
    dragOverIndex: number | null
  }
  keyboardDragTaskId: string | null
  selectedTaskIds?: Set<string>
  onTaskEdit: (task: KanbanTask) => void
  onTaskDelete: (taskId: string) => void
  onTaskDuplicate?: (task: KanbanTask) => void
  onTaskSelect?: (taskId: string, selected: boolean) => void
  onTaskCreate: (columnId: string) => void
  onDragStart: (taskId: string, columnId: string) => void
  onDragOver: (e: React.DragEvent, columnId: string, index: number) => void
  onDragEnter: (columnId: string) => void
  onDrop: (columnId: string, index: number) => void
  onDragEnd: () => void
  onKeyboardDragStart: (taskId: string, columnId: string) => void
  onToggleCollapse?: (columnId: string) => void
  onColumnDragStart?: (columnId: string) => void
  onColumnDragOver?: (e: React.DragEvent, columnId: string) => void
  onColumnDrop?: (columnId: string) => void
  isColumnDragging?: boolean
  isColumnDropTarget?: boolean
}

const getColumnColors = (color?: string) => {
  const colors: Record<string, { dot: string; bg: string; border: string }> = {
    blue: {
      dot: "bg-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
      border: "border-indigo-200 dark:border-indigo-800",
    },
    yellow: {
      dot: "bg-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-200 dark:border-amber-800",
    },
    purple: {
      dot: "bg-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/30",
      border: "border-purple-200 dark:border-purple-800",
    },
    green: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    red: { dot: "bg-rose-500", bg: "bg-rose-50 dark:bg-rose-900/30", border: "border-rose-200 dark:border-rose-800" },
    orange: {
      dot: "bg-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/30",
      border: "border-orange-200 dark:border-orange-800",
    },
    gray: {
      dot: "bg-slate-500",
      bg: "bg-slate-50 dark:bg-slate-800/50",
      border: "border-slate-200 dark:border-slate-700",
    },
  }
  return colors[color || "blue"] || colors.blue
}

export const KanbanColumn: React.FC<KanbanColumnProps> = memo(
  ({
    column,
    tasks,
    dragState,
    keyboardDragTaskId,
    selectedTaskIds,
    onTaskEdit,
    onTaskDelete,
    onTaskDuplicate,
    onTaskSelect,
    onTaskCreate,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDrop,
    onDragEnd,
    onKeyboardDragStart,
    onToggleCollapse,
    onColumnDragStart,
    onColumnDragOver,
    onColumnDrop,
    isColumnDragging,
    isColumnDropTarget,
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(column.isCollapsed || false)
    const isDropTarget = dragState.dropTargetId === column.id
    const isAtWipLimit = column.maxTasks ? tasks.length >= column.maxTasks : false
    const isNearWipLimit = column.maxTasks ? tasks.length >= column.maxTasks - 1 : false
    const colors = getColumnColors(column.color)

    const handleDragOver = useCallback(
      (e: React.DragEvent, index: number) => {
        e.preventDefault()
        onDragOver(e, column.id, index)
      },
      [column.id, onDragOver],
    )

    const handleDrop = useCallback(
      (e: React.DragEvent, index: number) => {
        e.preventDefault()
        onDrop(column.id, index)
        onDragEnd()
      },
      [column.id, onDrop, onDragEnd],
    )

    const handleToggleCollapse = () => {
      setIsCollapsed(!isCollapsed)
      onToggleCollapse?.(column.id)
    }

    const handleColumnDragStart = (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("column-id", column.id)
      onColumnDragStart?.(column.id)
    }

    const handleColumnDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      onColumnDragOver?.(e, column.id)
    }

    const handleColumnDrop = (e: React.DragEvent) => {
      e.preventDefault()
      onColumnDrop?.(column.id)
    }

    return (
      <div
        role="region"
        aria-label={`${column.title} column. ${tasks.length} tasks${column.maxTasks ? `. Limit: ${column.maxTasks}` : ""}.`}
        draggable={!!onColumnDragStart}
        onDragStart={handleColumnDragStart}
        onDragOver={handleColumnDragOver}
        onDrop={handleColumnDrop}
        className={`
          flex flex-col min-w-[320px] max-h-full rounded-2xl
          bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60
          shadow-sm transition-all duration-300
          ${isCollapsed ? "w-16 min-w-16" : "w-[320px]"}
          ${
            isDropTarget && dragState.isDragging
              ? "ring-2 ring-indigo-500/50 ring-offset-2 bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700"
              : "hover:shadow-md"
          }
          ${isColumnDragging ? "opacity-50 scale-95" : ""}
          ${isColumnDropTarget ? "ring-2 ring-purple-500/50" : ""}
        `}
        onDragEnter={() => onDragEnter(column.id)}
      >
        <div
          className={`sticky top-0 z-10 rounded-t-2xl p-4 border-b ${colors.bg} ${colors.border} ${onColumnDragStart ? "cursor-grab active:cursor-grabbing" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleCollapse}
                className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                aria-label={isCollapsed ? "Expand column" : "Collapse column"}
              >
                <svg
                  className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              {!isCollapsed && (
                <>
                  <div className={`w-3 h-3 rounded-full ${colors.dot} shadow-sm`} />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight">{column.title}</h3>
                </>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <span
                  className={`
                    text-xs px-2.5 py-1 rounded-full font-semibold transition-colors
                    ${
                      isAtWipLimit
                        ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:ring-rose-700"
                        : isNearWipLimit
                          ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-700"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }
                  `}
                >
                  {tasks.length}
                  {column.maxTasks && <span className="text-slate-400 dark:text-slate-500">/{column.maxTasks}</span>}
                </span>
              </div>
            )}
          </div>

          {/* Collapsed state - vertical title */}
          {isCollapsed && (
            <div className="mt-4 flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${colors.dot} shadow-sm mb-3`} />
              <span
                className="text-sm font-semibold text-slate-800 dark:text-slate-100 writing-vertical whitespace-nowrap"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                {column.title}
              </span>
              <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{tasks.length}</span>
            </div>
          )}

          {!isCollapsed && isAtWipLimit && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              WIP limit reached
            </div>
          )}
        </div>

        {/* Content area - hidden when collapsed */}
        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: "120px" }}>
              {tasks.length === 0 ? (
                <div
                  className="empty-state py-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-colors"
                  onDragOver={(e) => handleDragOver(e, 0)}
                  onDrop={(e) => handleDrop(e, 0)}
                >
                  <svg
                    className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No tasks yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Drop tasks here or create new</p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <div key={task.id}>
                    {dragState.isDragging &&
                      dragState.dropTargetId === column.id &&
                      dragState.dragOverIndex === index && (
                        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-3 animate-pulse shadow-sm shadow-indigo-500/50" />
                      )}
                    <div onDragOver={(e) => handleDragOver(e, index)} onDrop={(e) => handleDrop(e, index)}>
                      <KanbanCard
                        task={task}
                        isDragging={dragState.draggedId === task.id}
                        isKeyboardDragging={keyboardDragTaskId === task.id}
                        isSelected={selectedTaskIds?.has(task.id)}
                        onEdit={onTaskEdit}
                        onDelete={onTaskDelete}
                        onDuplicate={onTaskDuplicate}
                        onSelect={onTaskSelect}
                        onDragStart={(taskId) => onDragStart(taskId, column.id)}
                        onKeyboardDragStart={(taskId) => onKeyboardDragStart(taskId, column.id)}
                      />
                    </div>
                  </div>
                ))
              )}

              {tasks.length > 0 && (
                <div
                  className={`h-20 rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragState.isDragging &&
                    dragState.dropTargetId === column.id &&
                    dragState.dragOverIndex === tasks.length
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-transparent"
                  }`}
                  onDragOver={(e) => handleDragOver(e, tasks.length)}
                  onDrop={(e) => handleDrop(e, tasks.length)}
                />
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-700">
              <Button
                variant="ghost"
                size="md"
                onClick={() => onTaskCreate(column.id)}
                disabled={isAtWipLimit}
                className="w-full justify-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </Button>
            </div>
          </>
        )}
      </div>
    )
  },
)

KanbanColumn.displayName = "KanbanColumn"
