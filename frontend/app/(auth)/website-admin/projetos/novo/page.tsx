import { ProjectEditor } from "@/features/website-admin/components/project-editor";

export default function NewWebsiteProjectPage() {
  return (
    <div className="p-6">
      <ProjectEditor mode="create" />
    </div>
  );
}
