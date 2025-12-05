"use client"

import type React from "react"
import { memo } from "react"
import type { KanbanTask } from "@/src/types/kanban.types"
import { Avatar } from "@/src/components/primitives/Avatar"
import { formatDate, isOverdue } from "@/src/utils/task.utils"

interface KanbanCardProps {
  task: KanbanTask
  isDragging: boolean
  isKeyboardDragging?: boolean
  isSelected?: boolean
  onEdit: (task: KanbanTask) => void
  onDelete: (taskId: string) => void
  onDuplicate?: (task: KanbanTask) => void
  onSelect?: (taskId: string, selected: boolean) => void
  onDragStart: (taskId: string) => void
  onKeyboardDragStart: (taskId: string) => void
}

const getPriorityStyles = (priority?: KanbanTask["priority"]) => {
  const styles = {
    low: {
      badge:
        "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:ring-emerald-700",
      border: "border-l-emerald-500",
    },
    medium: {
      badge:
        "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-700",
      border: "border-l-amber-500",
    },
    high: {
      badge:
        "bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:ring-orange-700",
      border: "border-l-orange-500",
    },
    urgent: {
      badge: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:ring-rose-700",
      border: "border-l-rose-500",
    },
  }
  return styles[priority || "medium"] || styles.medium
}

export const KanbanCard: React.FC<KanbanCardProps> = memo(
  ({
    task,
    isDragging,
    isKeyboardDragging,
    isSelected,
    onEdit,
    onDelete,
    onDuplicate,
    onSelect,
    onDragStart,
    onKeyboardDragStart,
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (e.key === " ") {
          onKeyboardDragStart(task.id)
        } else {
          onEdit(task)
        }
      }
    }

    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("text/plain", task.id)
      onDragStart(task.id)
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation()
      onSelect?.(task.id, e.target.checked)
    }

    const dueDate = task.dueDate ? new Date(task.dueDate) : null
    const overdue = dueDate ? isOverdue(dueDate) : false
    const priorityStyles = getPriorityStyles(task.priority)

    return (
      <div
        role="button"
        tabIndex={0}
        draggable
        onDragStart={handleDragStart}
        onKeyDown={handleKeyDown}
        onClick={() => onEdit(task)}
        aria-label={`${task.title}. Status: ${task.status}. Priority: ${task.priority || "medium"}. Press space to drag, enter to edit.`}
        aria-grabbed={isDragging || isKeyboardDragging}
        className={`
          group relative bg-white dark:bg-slate-800 rounded-xl p-4 
          border border-slate-200/80 dark:border-slate-700 border-l-4 ${priorityStyles.border}
          shadow-sm cursor-grab active:cursor-grabbing
          transition-all duration-200 ease-out
          hover:shadow-md hover:border-slate-300/80 dark:hover:border-slate-600 hover:-translate-y-0.5
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
          ${isDragging ? "opacity-60 shadow-xl rotate-2 scale-105" : ""}
          ${isKeyboardDragging ? "ring-2 ring-indigo-500 ring-offset-2 shadow-lg shadow-indigo-500/20" : ""}
          ${isSelected ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : ""}
        `}
      >
        {onSelect && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 
                focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
              aria-label={`Select ${task.title}`}
            />
          </div>
        )}

        <div className={`flex items-start justify-between gap-3 mb-2 ${onSelect ? "ml-6 group-hover:ml-6" : ""}`}>
          <h4 className="font-medium text-sm text-slate-800 dark:text-slate-100 line-clamp-2 flex-1 leading-snug">
            {task.title}
          </h4>
          {task.priority && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${priorityStyles.badge}`}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">+{task.tags.length - 3} more</span>
            )}
          </div>
        )}

        {(task.commentsCount || task.attachmentsCount) && (
          <div className="flex items-center gap-3 mb-3 text-slate-400 dark:text-slate-500">
            {task.commentsCount && task.commentsCount > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {task.commentsCount}
              </span>
            )}
            {task.attachmentsCount && task.attachmentsCount > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                {task.attachmentsCount}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {task.assignee && <Avatar name={task.assignee} size="sm" />}
            {dueDate && (
              <span
                className={`text-xs flex items-center gap-1.5 font-medium ${
                  overdue ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(task)
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                aria-label="Duplicate task"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              aria-label="Edit task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              aria-label="Delete task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  },
)

KanbanCard.displayName = "KanbanCard"
