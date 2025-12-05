"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import type { KanbanTask, KanbanColumn as KanbanColumnType, KanbanViewProps } from "@/src/types/kanban.types"
import { KanbanColumn } from "./KanbanColumn"
import { TaskModal } from "./TaskModal"
import { useDragAndDrop } from "@/src/hooks/useDragAndDrop"

interface KanbanBoardProps extends KanbanViewProps {
  onSearch?: (query: string) => void
  filterPriority?: KanbanTask["priority"] | "all"
  onFilterChange?: (priority: KanbanTask["priority"] | "all") => void
  onColumnReorder?: (fromIndex: number, toIndex: number) => void
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  tasks,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onSearch,
  filterPriority = "all",
  onFilterChange,
  onColumnReorder,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: "create" | "edit"
    task: KanbanTask | null
    columnId: string | null
  }>({
    isOpen: false,
    mode: "create",
    task: null,
    columnId: null,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [columnDragState, setColumnDragState] = useState<{
    isDragging: boolean
    draggedColumnId: string | null
    dropTargetColumnId: string | null
  }>({
    isDragging: false,
    draggedColumnId: null,
    dropTargetColumnId: null,
  })

  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDrop,
    handleDragEnd,
    keyboardDragState,
    startKeyboardDrag,
    moveKeyboardDrag,
    confirmKeyboardDrag,
    cancelKeyboardDrag,
  } = useDragAndDrop()

  // Filter tasks based on search and priority
  const filteredTasks = useMemo(() => {
    let filtered = { ...tasks }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(
          ([, task]) =>
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.assignee?.toLowerCase().includes(query) ||
            task.tags?.some((tag) => tag.toLowerCase().includes(query)),
        ),
      )
    }

    if (filterPriority && filterPriority !== "all") {
      filtered = Object.fromEntries(Object.entries(filtered).filter(([, task]) => task.priority === filterPriority))
    }

    return filtered
  }, [tasks, searchQuery, filterPriority])

  // Get tasks for each column
  const getColumnTasks = useCallback(
    (column: KanbanColumnType): KanbanTask[] => {
      return column.taskIds.map((id) => filteredTasks[id]).filter((task): task is KanbanTask => task !== undefined)
    },
    [filteredTasks],
  )

  // Handle task drop
  const handleTaskDrop = useCallback(
    (columnId: string, index: number) => {
      const result = handleDrop(columnId, index)
      if (result) {
        onTaskMove(result.taskId, result.fromColumn, result.toColumn, result.newIndex)
        setAnnouncement(
          `Task moved to ${columns.find((c) => c.id === columnId)?.title || columnId} at position ${index + 1}`,
        )
      }
    },
    [handleDrop, onTaskMove, columns],
  )

  // Handle task edit
  const handleTaskEdit = useCallback((task: KanbanTask) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      task,
      columnId: null,
    })
  }, [])

  // Handle task create
  const handleTaskCreateClick = useCallback((columnId: string) => {
    setModalState({
      isOpen: true,
      mode: "create",
      task: null,
      columnId,
    })
  }, [])

  const handleTaskDuplicate = useCallback(
    (task: KanbanTask) => {
      const duplicatedTask: KanbanTask = {
        ...task,
        id: "",
        title: `${task.title} (Copy)`,
        createdAt: new Date(),
        activityLog: [
          {
            id: crypto.randomUUID(),
            action: "created",
            timestamp: new Date(),
            user: "System",
          },
        ],
      }
      onTaskCreate(task.status, duplicatedTask)
      setAnnouncement(`Task "${task.title}" duplicated`)
    },
    [onTaskCreate],
  )

  const handleTaskSelect = useCallback((taskId: string, selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(taskId)
      } else {
        newSet.delete(taskId)
      }
      return newSet
    })
  }, [])

  const handleBulkDelete = useCallback(() => {
    selectedTaskIds.forEach((taskId) => {
      onTaskDelete(taskId)
    })
    setSelectedTaskIds(new Set())
    setAnnouncement(`${selectedTaskIds.size} tasks deleted`)
  }, [selectedTaskIds, onTaskDelete])

  const handleClearSelection = useCallback(() => {
    setSelectedTaskIds(new Set())
  }, [])

  // Handle modal save
  const handleModalSave = useCallback(
    (taskData: Omit<KanbanTask, "id" | "createdAt">) => {
      if (modalState.mode === "create" && modalState.columnId) {
        onTaskCreate(modalState.columnId, {
          ...taskData,
          id: "",
          createdAt: new Date(),
        } as KanbanTask)
      } else if (modalState.mode === "edit" && modalState.task) {
        onTaskUpdate(modalState.task.id, taskData)
      }
    },
    [modalState, onTaskCreate, onTaskUpdate],
  )

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalState({
      isOpen: false,
      mode: "create",
      task: null,
      columnId: null,
    })
  }, [])

  // Handle search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      onSearch?.(value)
    },
    [onSearch],
  )

  const handleColumnDragStart = useCallback((columnId: string) => {
    setColumnDragState({
      isDragging: true,
      draggedColumnId: columnId,
      dropTargetColumnId: null,
    })
  }, [])

  const handleColumnDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setColumnDragState((prev) => ({
      ...prev,
      dropTargetColumnId: columnId,
    }))
  }, [])

  const handleColumnDrop = useCallback(
    (targetColumnId: string) => {
      if (columnDragState.draggedColumnId && columnDragState.draggedColumnId !== targetColumnId) {
        const fromIndex = columns.findIndex((c) => c.id === columnDragState.draggedColumnId)
        const toIndex = columns.findIndex((c) => c.id === targetColumnId)
        if (fromIndex !== -1 && toIndex !== -1) {
          onColumnReorder?.(fromIndex, toIndex)
          setAnnouncement(`Column moved from position ${fromIndex + 1} to ${toIndex + 1}`)
        }
      }
      setColumnDragState({
        isDragging: false,
        draggedColumnId: null,
        dropTargetColumnId: null,
      })
    },
    [columnDragState.draggedColumnId, columns, onColumnReorder],
  )

  // Keyboard navigation for board
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyboardDragState.isActive) return

      const columnIds = columns.map((c) => c.id)
      const getTaskCount = (colId: string) => {
        const col = columns.find((c) => c.id === colId)
        return col ? getColumnTasks(col).length : 0
      }

      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          e.preventDefault()
          const direction = e.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right"
          const newPosition = moveKeyboardDrag(direction, columnIds, getTaskCount)
          if (newPosition) {
            const colName = columns.find((c) => c.id === newPosition.columnId)?.title
            setAnnouncement(`Moving to ${colName}, position ${newPosition.index + 1}`)
          }
          break
        case "Enter":
        case " ":
          e.preventDefault()
          const result = confirmKeyboardDrag()
          if (result) {
            onTaskMove(result.taskId, result.fromColumn, result.toColumn, result.newIndex)
            setAnnouncement("Task dropped")
          }
          break
        case "Escape":
          e.preventDefault()
          cancelKeyboardDrag()
          setAnnouncement("Drag cancelled")
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    keyboardDragState,
    columns,
    getColumnTasks,
    moveKeyboardDrag,
    confirmKeyboardDrag,
    cancelKeyboardDrag,
    onTaskMove,
  ])

  return (
    <div className="flex flex-col h-full">
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm 
                text-slate-800 placeholder:text-slate-400 transition-all duration-200
                focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10
                hover:border-slate-300"
              aria-label="Search tasks"
            />
          </div>

          {onFilterChange && (
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => onFilterChange(e.target.value as KanbanTask["priority"] | "all")}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm 
                  font-medium text-slate-700 cursor-pointer transition-all duration-200
                  focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10
                  hover:border-slate-300"
                aria-label="Filter by priority"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedTaskIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm font-medium text-indigo-700">{selectedTaskIds.size} selected</span>
              <button
                onClick={handleBulkDelete}
                className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                aria-label="Delete selected tasks"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                onClick={handleClearSelection}
                className="p-1 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="text-sm font-medium text-slate-700">{Object.keys(filteredTasks).length}</span>
            <span className="text-sm text-slate-500">tasks</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-slate-700">{columns.length}</span>
            <span className="text-sm text-slate-500">columns</span>
          </div>
        </div>
      </div>

      {/* Keyboard instructions for screen readers */}
      {keyboardDragState.isActive && (
        <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 text-sm text-indigo-700 flex items-center gap-2 animate-fade-up">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Use arrow keys to move task, Enter or Space to drop, Escape to cancel.
        </div>
      )}

      <div
        className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50/50"
        role="application"
        aria-label="Kanban board"
      >
        <div className="flex gap-5 h-full min-h-[500px]">
          {columns.map((column, index) => (
            <div key={column.id} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
              <KanbanColumn
                column={column}
                tasks={getColumnTasks(column)}
                dragState={dragState}
                keyboardDragTaskId={keyboardDragState.taskId}
                selectedTaskIds={selectedTaskIds}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={onTaskDelete}
                onTaskDuplicate={handleTaskDuplicate}
                onTaskSelect={handleTaskSelect}
                onTaskCreate={handleTaskCreateClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleTaskDrop}
                onDragEnd={handleDragEnd}
                onKeyboardDragStart={startKeyboardDrag}
                onColumnDragStart={onColumnReorder ? handleColumnDragStart : undefined}
                onColumnDragOver={onColumnReorder ? handleColumnDragOver : undefined}
                onColumnDrop={onColumnReorder ? handleColumnDrop : undefined}
                isColumnDragging={columnDragState.draggedColumnId === column.id}
                isColumnDropTarget={
                  columnDragState.dropTargetColumnId === column.id && columnDragState.draggedColumnId !== column.id
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        task={modalState.task}
        columns={columns}
        mode={modalState.mode}
        defaultColumnId={modalState.columnId || undefined}
        onSave={handleModalSave}
        onDelete={modalState.mode === "edit" ? onTaskDelete : undefined}
      />
    </div>
  )
}
