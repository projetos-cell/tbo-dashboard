"use client";

import { TaskDescriptionEditor } from "./task-description-editor";

interface TaskDetailDescriptionProps {
  taskId: string;
  description: string | null;
}

export function TaskDetailDescription({
  taskId,
  description,
}: TaskDetailDescriptionProps) {
  return <TaskDescriptionEditor taskId={taskId} description={description} />;
}
