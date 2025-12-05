"use client"

import { useState } from "react"
import { KanbanBoard } from "@/src/components/KanbanBoard/KanbanBoard"
import { useKanbanBoard } from "@/src/hooks/useKanbanBoard"
import { sampleColumns, sampleTasks } from "@/src/data/sample-data"
import type { KanbanTask } from "@/src/types/kanban.types"

export default function KanbanPage() {
  const { columns, tasks, moveTask, createTask, updateTask, deleteTask, reorderColumns } = useKanbanBoard(
    sampleColumns,
    sampleTasks,
  )
  const [filterPriority, setFilterPriority] = useState<KanbanTask["priority"] | "all">("all")

  return (
    <div className="min-h-screen glassy-bg noise-overlay">
      {/* Floating orbs for depth */}
      <div className="orb-1 floating-orb" />
      <div className="orb-2 floating-orb" />
      <div className="orb-3 floating-orb" />
      <div className="orb-4 floating-orb" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pattern-grid pointer-events-none z-0" />

      {/* Header - Updated to glass-header */}
      <header className="sticky top-0 z-20 glass-header">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kanban Board</h1>
                <p className="text-sm text-slate-500 mt-0.5">Organize your workflow with drag and drop</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
                <kbd className="px-1.5 py-0.5 bg-white/80 rounded text-xs font-mono font-medium text-slate-700 shadow-sm border border-slate-200/50">
                  Space
                </kbd>
                <span>grab</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
                <kbd className="px-1.5 py-0.5 bg-white/80 rounded text-xs font-mono font-medium text-slate-700 shadow-sm border border-slate-200/50">
                  ↑↓←→
                </kbd>
                <span>move</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
                <kbd className="px-1.5 py-0.5 bg-white/80 rounded text-xs font-mono font-medium text-slate-700 shadow-sm border border-slate-200/50">
                  Enter
                </kbd>
                <span>drop</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Board - Added relative and z-10 for proper layering */}
      <main className="h-[calc(100vh-73px)] relative z-10">
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          onTaskMove={moveTask}
          onTaskCreate={createTask}
          onTaskUpdate={updateTask}
          onTaskDelete={deleteTask}
          filterPriority={filterPriority}
          onFilterChange={setFilterPriority}
          onColumnReorder={reorderColumns}
        />
      </main>
    </div>
  )
}
