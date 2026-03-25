"use client";

import dynamic from "next/dynamic";

const TaskDescriptionEditor = dynamic(
  () => import("./task-description-editor").then((m) => ({ default: m.TaskDescriptionEditor })),
  { ssr: false, loading: () => <div className="h-[120px] animate-pulse rounded-md bg-muted" /> }
);

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
