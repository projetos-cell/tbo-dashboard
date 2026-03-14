import { create } from "zustand"

export type WorkspaceId = "tbo-os" | "tbo-academy"

interface WorkspaceInfo {
  id: WorkspaceId
  label: string
  description: string
  icon: string // emoji or icon key
  href: string // default landing page
}

export const WORKSPACES: WorkspaceInfo[] = [
  {
    id: "tbo-os",
    label: "TBO OS",
    description: "Gestão & Operações",
    icon: "🏠",
    href: "/dashboard",
  },
  {
    id: "tbo-academy",
    label: "TBO Academy",
    description: "Aprendizado & Desenvolvimento",
    icon: "🎓",
    href: "/academy",
  },
]

interface WorkspaceState {
  activeWorkspace: WorkspaceId
  setActiveWorkspace: (id: WorkspaceId) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: "tbo-os",
  setActiveWorkspace: (id) => set({ activeWorkspace: id }),
}))
