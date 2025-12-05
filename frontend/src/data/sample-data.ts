import type { KanbanTask, KanbanColumn } from "@/src/types/kanban.types"

export const sampleColumns: KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "gray",
    taskIds: ["task-1", "task-2", "task-3"],
  },
  {
    id: "todo",
    title: "To Do",
    color: "blue",
    taskIds: ["task-4", "task-5"],
    maxTasks: 5,
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "yellow",
    taskIds: ["task-6", "task-7"],
    maxTasks: 3,
  },
  {
    id: "review",
    title: "In Review",
    color: "purple",
    taskIds: ["task-8"],
  },
  {
    id: "done",
    title: "Done",
    color: "green",
    taskIds: ["task-9", "task-10"],
  },
]

export const sampleTasks: Record<string, KanbanTask> = {
  "task-1": {
    id: "task-1",
    title: "Research competitor analysis",
    description: "Analyze top 5 competitors and create a detailed report on their features and pricing.",
    status: "backlog",
    priority: "low",
    assignee: "Sarah Wilson",
    tags: ["research", "analysis"],
    createdAt: new Date("2024-01-15"),
    dueDate: new Date("2024-02-01"),
    commentsCount: 3,
    attachmentsCount: 2,
    activityLog: [{ id: "al-1", action: "created", timestamp: new Date("2024-01-15"), user: "Sarah Wilson" }],
  },
  "task-2": {
    id: "task-2",
    title: "Design system documentation",
    description: "Create comprehensive documentation for all design tokens and components.",
    status: "backlog",
    priority: "medium",
    assignee: "Michael Chen",
    tags: ["documentation", "design"],
    createdAt: new Date("2024-01-16"),
    commentsCount: 5,
    activityLog: [{ id: "al-2", action: "created", timestamp: new Date("2024-01-16"), user: "Michael Chen" }],
  },
  "task-3": {
    id: "task-3",
    title: "User feedback integration",
    description: "Implement feedback collection widget in the app.",
    status: "backlog",
    priority: "high",
    tags: ["feature", "ux"],
    createdAt: new Date("2024-01-17"),
    dueDate: new Date("2024-01-25"),
    attachmentsCount: 1,
    activityLog: [{ id: "al-3", action: "created", timestamp: new Date("2024-01-17") }],
  },
  "task-4": {
    id: "task-4",
    title: "Implement authentication flow",
    description: "Set up OAuth2 authentication with Google and GitHub providers.",
    status: "todo",
    priority: "urgent",
    assignee: "Alex Johnson",
    tags: ["backend", "security"],
    createdAt: new Date("2024-01-10"),
    dueDate: new Date("2024-01-20"),
    commentsCount: 8,
    attachmentsCount: 3,
    activityLog: [
      { id: "al-4", action: "created", timestamp: new Date("2024-01-10"), user: "Alex Johnson" },
      {
        id: "al-5",
        action: "priority_changed",
        timestamp: new Date("2024-01-12"),
        fromValue: "high",
        toValue: "urgent",
        user: "Team Lead",
      },
    ],
  },
  "task-5": {
    id: "task-5",
    title: "Create onboarding screens",
    description: "Design and implement user onboarding experience.",
    status: "todo",
    priority: "high",
    assignee: "Emily Davis",
    tags: ["design", "ux"],
    createdAt: new Date("2024-01-12"),
    commentsCount: 2,
    activityLog: [{ id: "al-6", action: "created", timestamp: new Date("2024-01-12"), user: "Emily Davis" }],
  },
  "task-6": {
    id: "task-6",
    title: "Build dashboard widgets",
    description: "Create reusable chart and metric components for the dashboard.",
    status: "in-progress",
    priority: "high",
    assignee: "David Kim",
    tags: ["frontend", "charts"],
    createdAt: new Date("2024-01-08"),
    dueDate: new Date("2024-01-22"),
    commentsCount: 12,
    attachmentsCount: 5,
    activityLog: [
      { id: "al-7", action: "created", timestamp: new Date("2024-01-08"), user: "David Kim" },
      {
        id: "al-8",
        action: "moved",
        timestamp: new Date("2024-01-10"),
        fromValue: "todo",
        toValue: "in-progress",
        user: "David Kim",
      },
    ],
  },
  "task-7": {
    id: "task-7",
    title: "API endpoint optimization",
    description: "Optimize slow database queries and add caching layer.",
    status: "in-progress",
    priority: "urgent",
    assignee: "Alex Johnson",
    tags: ["backend", "performance"],
    createdAt: new Date("2024-01-09"),
    commentsCount: 6,
    activityLog: [
      { id: "al-9", action: "created", timestamp: new Date("2024-01-09"), user: "Alex Johnson" },
      {
        id: "al-10",
        action: "moved",
        timestamp: new Date("2024-01-11"),
        fromValue: "todo",
        toValue: "in-progress",
        user: "Alex Johnson",
      },
    ],
  },
  "task-8": {
    id: "task-8",
    title: "Mobile responsive design",
    description: "Ensure all pages work properly on mobile devices.",
    status: "review",
    priority: "medium",
    assignee: "Emily Davis",
    tags: ["frontend", "mobile"],
    createdAt: new Date("2024-01-05"),
    dueDate: new Date("2024-01-18"),
    commentsCount: 4,
    attachmentsCount: 2,
    activityLog: [
      { id: "al-11", action: "created", timestamp: new Date("2024-01-05"), user: "Emily Davis" },
      {
        id: "al-12",
        action: "moved",
        timestamp: new Date("2024-01-08"),
        fromValue: "todo",
        toValue: "in-progress",
        user: "Emily Davis",
      },
      {
        id: "al-13",
        action: "moved",
        timestamp: new Date("2024-01-15"),
        fromValue: "in-progress",
        toValue: "review",
        user: "Emily Davis",
      },
    ],
  },
  "task-9": {
    id: "task-9",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment.",
    status: "done",
    priority: "high",
    assignee: "Sarah Wilson",
    tags: ["devops", "automation"],
    createdAt: new Date("2024-01-01"),
    commentsCount: 7,
    attachmentsCount: 1,
    activityLog: [
      { id: "al-14", action: "created", timestamp: new Date("2024-01-01"), user: "Sarah Wilson" },
      {
        id: "al-15",
        action: "moved",
        timestamp: new Date("2024-01-03"),
        fromValue: "todo",
        toValue: "in-progress",
        user: "Sarah Wilson",
      },
      {
        id: "al-16",
        action: "moved",
        timestamp: new Date("2024-01-05"),
        fromValue: "in-progress",
        toValue: "done",
        user: "Sarah Wilson",
      },
    ],
  },
  "task-10": {
    id: "task-10",
    title: "Project kickoff meeting",
    description: "Initial team sync and project planning session.",
    status: "done",
    priority: "medium",
    assignee: "Michael Chen",
    tags: ["meeting"],
    createdAt: new Date("2024-01-01"),
    commentsCount: 15,
    activityLog: [
      { id: "al-17", action: "created", timestamp: new Date("2024-01-01"), user: "Michael Chen" },
      {
        id: "al-18",
        action: "moved",
        timestamp: new Date("2024-01-01"),
        fromValue: "todo",
        toValue: "done",
        user: "Michael Chen",
      },
    ],
  },
}

// Generate large dataset for performance testing
export const generateLargeDataset = (taskCount = 50) => {
  const statuses = ["backlog", "todo", "in-progress", "review", "done"]
  const priorities: KanbanTask["priority"][] = ["low", "medium", "high", "urgent"]
  const assignees = [
    "Sarah Wilson",
    "Michael Chen",
    "Alex Johnson",
    "Emily Davis",
    "David Kim",
    "Lisa Wang",
    "James Brown",
  ]
  const tagSets = [
    ["frontend", "react"],
    ["backend", "api"],
    ["design", "ux"],
    ["devops", "infrastructure"],
    ["documentation"],
    ["testing", "qa"],
    ["feature", "enhancement"],
    ["bugfix", "critical"],
  ]

  const tasks: Record<string, KanbanTask> = {}
  const columns: KanbanColumn[] = [
    { id: "backlog", title: "Backlog", color: "gray", taskIds: [] },
    { id: "todo", title: "To Do", color: "blue", taskIds: [], maxTasks: 10 },
    { id: "in-progress", title: "In Progress", color: "yellow", taskIds: [], maxTasks: 5 },
    { id: "review", title: "In Review", color: "purple", taskIds: [] },
    { id: "done", title: "Done", color: "green", taskIds: [] },
  ]

  for (let i = 1; i <= taskCount; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const taskId = `task-${i}`

    tasks[taskId] = {
      id: taskId,
      title: `Task ${i}: ${["Implement", "Design", "Fix", "Update", "Create", "Review"][Math.floor(Math.random() * 6)]} ${["feature", "component", "page", "module", "service", "API"][Math.floor(Math.random() * 6)]}`,
      description:
        Math.random() > 0.3 ? `Description for task ${i}. This is a sample task for testing purposes.` : undefined,
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assignee: Math.random() > 0.2 ? assignees[Math.floor(Math.random() * assignees.length)] : undefined,
      tags: Math.random() > 0.3 ? tagSets[Math.floor(Math.random() * tagSets.length)] : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      dueDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      commentsCount: Math.floor(Math.random() * 20),
      attachmentsCount: Math.floor(Math.random() * 10),
      activityLog: [],
    }

    const column = columns.find((c) => c.id === status)
    if (column) {
      column.taskIds.push(taskId)
    }
  }

  return { columns, tasks }
}
