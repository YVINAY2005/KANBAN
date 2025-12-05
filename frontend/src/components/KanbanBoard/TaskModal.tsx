"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { KanbanTask, KanbanColumn, ActivityLogEntry } from "@/src/types/kanban.types"
import { Modal } from "@/src/components/primitives/Modal"
import { Button } from "@/src/components/primitives/Button"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: KanbanTask | null
  columns: KanbanColumn[]
  mode: "create" | "edit"
  defaultColumnId?: string
  onSave: (task: Omit<KanbanTask, "id" | "createdAt">) => void
  onDelete?: (taskId: string) => void
}

const priorities: KanbanTask["priority"][] = ["low", "medium", "high", "urgent"]

const priorityColors = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  urgent: "text-rose-600 dark:text-rose-400",
}

const formatActivityEntry = (entry: ActivityLogEntry): string => {
  const time = new Date(entry.timestamp).toLocaleString()
  switch (entry.action) {
    case "created":
      return `Created on ${time}`
    case "moved":
      return `Moved from "${entry.fromValue}" to "${entry.toValue}" on ${time}`
    case "updated":
      return `Updated on ${time}`
    case "priority_changed":
      return `Priority changed from "${entry.fromValue}" to "${entry.toValue}" on ${time}`
    case "assignee_changed":
      return `Assignee changed from "${entry.fromValue || "unassigned"}" to "${entry.toValue || "unassigned"}" on ${time}`
    default:
      return `Activity on ${time}`
  }
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  columns,
  mode,
  defaultColumnId,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    status: string
    priority: KanbanTask["priority"]
    assignee: string
    tags: string
    dueDate: string
  }>({
    title: "",
    description: "",
    status: defaultColumnId || columns[0]?.id || "",
    priority: "medium",
    assignee: "",
    tags: "",
    dueDate: "",
  })

  const [errors, setErrors] = useState<{ title?: string }>({})
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details")

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        setFormData({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority || "medium",
          assignee: task.assignee || "",
          tags: task.tags?.join(", ") || "",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        })
      } else {
        setFormData({
          title: "",
          description: "",
          status: defaultColumnId || columns[0]?.id || "",
          priority: "medium",
          assignee: "",
          tags: "",
          dueDate: "",
        })
      }
      setErrors({})
      setActiveTab("details")
    }
  }, [isOpen, task, mode, defaultColumnId, columns])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      setErrors({ title: "Title is required" })
      return
    }

    const taskData: Omit<KanbanTask, "id" | "createdAt"> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee.trim() || undefined,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    }

    onSave(taskData)
    onClose()
  }

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id)
      onClose()
    }
  }

  const inputStyles = `
    w-full px-4 py-2.5 
    bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm
    text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
    transition-all duration-200
    focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10
    hover:border-slate-300 dark:hover:border-slate-600
  `

  const labelStyles = "block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create New Task" : "Edit Task"}
      description={mode === "create" ? "Add a new task to your board" : "Update task details"}
    >
      {mode === "edit" && task?.activityLog && task.activityLog.length > 0 && (
        <div className="flex gap-1 mb-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "details"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "activity"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Activity ({task.activityLog.length})
          </button>
        </div>
      )}

      {activeTab === "activity" && task?.activityLog && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {task.activityLog.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {entry.action === "created" && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                  {entry.action === "moved" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  )}
                  {entry.action === "updated" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  )}
                  {(entry.action === "priority_changed" || entry.action === "assignee_changed") && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  )}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">{formatActivityEntry(entry)}</p>
                {entry.user && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">by {entry.user}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Tab */}
      {activeTab === "details" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="task-title" className={labelStyles}>
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }))
                if (errors.title) setErrors({})
              }}
              className={`${inputStyles} ${errors.title ? "border-rose-300 dark:border-rose-700 focus:border-rose-400 focus:ring-rose-500/10" : ""}`}
              placeholder="Enter task title"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="task-description" className={labelStyles}>
              Description
            </label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`${inputStyles} resize-none`}
              placeholder="Add a description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="task-status" className={labelStyles}>
                Status
              </label>
              <div className="relative">
                <select
                  id="task-status"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className={`${inputStyles} appearance-none cursor-pointer pr-10`}
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className={labelStyles}>
                Priority
              </label>
              <div className="relative">
                <select
                  id="task-priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: e.target.value as KanbanTask["priority"] }))
                  }
                  className={`${inputStyles} appearance-none cursor-pointer pr-10 ${priorityColors[formData.priority || "medium"]} font-medium`}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p ? p.charAt(0).toUpperCase() + p.slice(1) : "None"}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label htmlFor="task-assignee" className={labelStyles}>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Assignee
                </span>
              </label>
              <input
                id="task-assignee"
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData((prev) => ({ ...prev, assignee: e.target.value }))}
                className={inputStyles}
                placeholder="Enter name"
              />
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="task-due-date" className={labelStyles}>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Due Date
                </span>
              </label>
              <input
                id="task-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                className={`${inputStyles} cursor-pointer`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-tags" className={labelStyles}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Tags
              </span>
            </label>
            <input
              id="task-tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className={inputStyles}
              placeholder="design, frontend, urgent"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Separate multiple tags with commas</p>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-700">
            {mode === "edit" && onDelete ? (
              <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {mode === "create" ? (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}
