"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import type { DragState } from "@/src/types/kanban.types"

interface UseDragAndDropReturn {
  dragState: DragState
  handleDragStart: (taskId: string, columnId: string) => void
  handleDragOver: (e: React.DragEvent, columnId: string, index: number) => void
  handleDragEnter: (columnId: string) => void
  handleDragLeave: () => void
  handleDrop: (
    columnId: string,
    index: number,
  ) => { taskId: string; fromColumn: string; toColumn: string; newIndex: number } | null
  handleDragEnd: () => void
  // Keyboard drag support
  keyboardDragState: { isActive: boolean; taskId: string | null; columnId: string | null }
  startKeyboardDrag: (taskId: string, columnId: string) => void
  moveKeyboardDrag: (
    direction: "up" | "down" | "left" | "right",
    columns: string[],
    getTaskCount: (columnId: string) => number,
  ) => { columnId: string; index: number } | null
  confirmKeyboardDrag: () => { taskId: string; fromColumn: string; toColumn: string; newIndex: number } | null
  cancelKeyboardDrag: () => void
}

export const useDragAndDrop = (): UseDragAndDropReturn => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedId: null,
    sourceColumnId: null,
    dropTargetId: null,
    dragOverIndex: null,
  })

  const [keyboardDragState, setKeyboardDragState] = useState<{
    isActive: boolean
    taskId: string | null
    columnId: string | null
    originalColumnId: string | null
    currentIndex: number
  }>({
    isActive: false,
    taskId: null,
    columnId: null,
    originalColumnId: null,
    currentIndex: 0,
  })

  const draggedTaskRef = useRef<{ taskId: string; sourceColumnId: string } | null>(null)

  const handleDragStart = useCallback((taskId: string, columnId: string) => {
    draggedTaskRef.current = { taskId, sourceColumnId: columnId }
    setDragState({
      isDragging: true,
      draggedId: taskId,
      sourceColumnId: columnId,
      dropTargetId: columnId,
      dragOverIndex: null,
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string, index: number) => {
    e.preventDefault()
    setDragState((prev) => ({
      ...prev,
      dropTargetId: columnId,
      dragOverIndex: index,
    }))
  }, [])

  const handleDragEnter = useCallback((columnId: string) => {
    setDragState((prev) => ({
      ...prev,
      dropTargetId: columnId,
    }))
  }, [])

  const handleDragLeave = useCallback(() => {
    // Only reset if leaving the entire board area
  }, [])

  const handleDrop = useCallback((columnId: string, index: number) => {
    const dragged = draggedTaskRef.current
    if (!dragged) return null

    const result = {
      taskId: dragged.taskId,
      fromColumn: dragged.sourceColumnId,
      toColumn: columnId,
      newIndex: index,
    }

    return result
  }, [])

  const handleDragEnd = useCallback(() => {
    draggedTaskRef.current = null
    setDragState({
      isDragging: false,
      draggedId: null,
      sourceColumnId: null,
      dropTargetId: null,
      dragOverIndex: null,
    })
  }, [])

  // Keyboard drag support
  const startKeyboardDrag = useCallback((taskId: string, columnId: string) => {
    setKeyboardDragState({
      isActive: true,
      taskId,
      columnId,
      originalColumnId: columnId,
      currentIndex: 0,
    })
  }, [])

  const moveKeyboardDrag = useCallback(
    (direction: "up" | "down" | "left" | "right", columns: string[], getTaskCount: (columnId: string) => number) => {
      if (!keyboardDragState.isActive || !keyboardDragState.columnId) return null

      const currentColumnIndex = columns.indexOf(keyboardDragState.columnId)
      let newColumnId = keyboardDragState.columnId
      let newIndex = keyboardDragState.currentIndex

      if (direction === "left" && currentColumnIndex > 0) {
        newColumnId = columns[currentColumnIndex - 1]
        newIndex = 0
      } else if (direction === "right" && currentColumnIndex < columns.length - 1) {
        newColumnId = columns[currentColumnIndex + 1]
        newIndex = 0
      } else if (direction === "up") {
        newIndex = Math.max(0, keyboardDragState.currentIndex - 1)
      } else if (direction === "down") {
        const maxIndex = getTaskCount(newColumnId)
        newIndex = Math.min(maxIndex, keyboardDragState.currentIndex + 1)
      }

      setKeyboardDragState((prev) => ({
        ...prev,
        columnId: newColumnId,
        currentIndex: newIndex,
      }))

      return { columnId: newColumnId, index: newIndex }
    },
    [keyboardDragState],
  )

  const confirmKeyboardDrag = useCallback(() => {
    if (
      !keyboardDragState.isActive ||
      !keyboardDragState.taskId ||
      !keyboardDragState.originalColumnId ||
      !keyboardDragState.columnId
    ) {
      return null
    }

    const result = {
      taskId: keyboardDragState.taskId,
      fromColumn: keyboardDragState.originalColumnId,
      toColumn: keyboardDragState.columnId,
      newIndex: keyboardDragState.currentIndex,
    }

    setKeyboardDragState({
      isActive: false,
      taskId: null,
      columnId: null,
      originalColumnId: null,
      currentIndex: 0,
    })

    return result
  }, [keyboardDragState])

  const cancelKeyboardDrag = useCallback(() => {
    setKeyboardDragState({
      isActive: false,
      taskId: null,
      columnId: null,
      originalColumnId: null,
      currentIndex: 0,
    })
  }, [])

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    keyboardDragState: {
      isActive: keyboardDragState.isActive,
      taskId: keyboardDragState.taskId,
      columnId: keyboardDragState.columnId,
    },
    startKeyboardDrag,
    moveKeyboardDrag,
    confirmKeyboardDrag,
    cancelKeyboardDrag,
  }
}
