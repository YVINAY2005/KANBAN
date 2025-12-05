export interface KanbanTask {
  id: string
  title: string
  description?: string
  status: string
  priority?: "low" | "medium" | "high" | "urgent"
  assignee?: string
  tags?: string[]
  createdAt: Date
  dueDate?: Date
  activityLog?: ActivityLogEntry[]
  commentsCount?: number
  attachmentsCount?: number
}

export interface ActivityLogEntry {
  id: string
  action: "created" | "moved" | "updated" | "priority_changed" | "assignee_changed"
  timestamp: Date
  fromValue?: string
  toValue?: string
  user?: string
}

export interface KanbanColumn {
  id: string
  title: string
  color: string
  taskIds: string[]
  maxTasks?: number
  isCollapsed?: boolean
}

export interface KanbanViewProps {
  columns: KanbanColumn[]
  tasks: Record<string, KanbanTask>
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => void
  onTaskCreate: (columnId: string, task: KanbanTask) => void
  onTaskUpdate: (taskId: string, updates: Partial<KanbanTask>) => void
  onTaskDelete: (taskId: string) => void
}

export interface DragState {
  isDragging: boolean
  draggedId: string | null
  sourceColumnId: string | null
  dropTargetId: string | null
  dragOverIndex: number | null
}
