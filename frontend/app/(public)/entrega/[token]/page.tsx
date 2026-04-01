import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { DeliveryView } from "./delivery-view";

interface Props {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Deliverable {
  title: string;
  description: string;
  type: string;
  url: string;
  icon?: string;
  file_size?: string;
}

interface DeliveryRecord {
  id: string;
  token: string;
  title: string;
  description: string | null;
  client_name: string | null;
  client_company: string | null;
  project_name: string | null;
  delivered_by: string | null;
  delivery_date: string | null;
  deliverables: Deliverable[];
  hero_subtitle: string | null;
  hero_gradient_from: string | null;
  hero_gradient_to: string | null;
  accent_color: string | null;
  cover_image_url: string | null;
  access_count: number;
  first_accessed_at: string | null;
  last_accessed_at: string | null;
}

export default async function DeliveryPage({ params }: Props) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: delivery } = await supabase
    .from("project_deliveries" as never)
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (!delivery) notFound();

  const record = delivery as unknown as DeliveryRecord;

  // Track access (fire-and-forget)
  const now = new Date().toISOString();
  supabase
    .from("project_deliveries" as never)
    .update({
      access_count: record.access_count + 1,
      last_accessed_at: now,
      ...(record.first_accessed_at ? {} : { first_accessed_at: now }),
    } as never)
    .eq("id", record.id)
    .then(() => {});

  return (
    <DeliveryView
      title={record.title}
      description={record.description}
      clientName={record.client_name}
      clientCompany={record.client_company}
      projectName={record.project_name}
      deliveredBy={record.delivered_by}
      deliveryDate={record.delivery_date}
      deliverables={record.deliverables}
      heroSubtitle={record.hero_subtitle}
      accentColor={record.accent_color ?? "#ff6200"}
    />
  );
}
