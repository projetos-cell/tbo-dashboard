import type { Database } from "@/lib/supabase/types";

export type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export interface ProjectSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTask?: (taskId: string) => void;
}

export interface SearchFilters {
  query: string;
  status: string[];
  priority: string[];
  assignee_id: string;
  project_id: string;
  bu: string;
  due_from: string;
  due_to: string;
}

export const EMPTY_FILTERS: SearchFilters = {
  query: "",
  status: [],
  priority: [],
  assignee_id: "",
  project_id: "",
  bu: "",
  due_from: "",
  due_to: "",
};
