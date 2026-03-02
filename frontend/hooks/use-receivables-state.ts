"use client";

import { useState, useCallback } from "react";
import {
  useReceivables,
  useUpdateReceivable,
  useDeleteReceivable,
} from "@/hooks/use-financial";
import type { Database } from "@/lib/supabase/types";

type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

export function useReceivablesState() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<ReceivableRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const {
    data: receivables = [],
    error,
    refetch,
  } = useReceivables({
    status: status !== "all" ? status : undefined,
    search: search || undefined,
  });

  const updateRec = useUpdateReceivable();
  const deleteRec = useDeleteReceivable();

  const handleSelect = useCallback((r: ReceivableRow) => {
    setSelected(r);
    setDetailOpen(true);
  }, []);

  const handleMarkPaid = useCallback(
    (id: string) => {
      updateRec.mutate(
        { id, updates: { status: "pago" } },
        { onSuccess: () => setDetailOpen(false) }
      );
    },
    [updateRec]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteRec.mutate(id, { onSuccess: () => setDetailOpen(false) });
    },
    [deleteRec]
  );

  return {
    receivables,
    error,
    refetch,
    search,
    setSearch,
    status,
    setStatus,
    selected,
    detailOpen,
    setDetailOpen,
    formOpen,
    setFormOpen,
    handleSelect,
    handleMarkPaid,
    handleDelete,
  };
}
