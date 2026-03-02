"use client";

import { useState, useCallback } from "react";
import {
  usePayables,
  useUpdatePayable,
  useDeletePayable,
} from "@/hooks/use-financial";
import type { Database } from "@/lib/supabase/types";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];

export function usePayablesState() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<PayableRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const {
    data: payables = [],
    error,
    refetch,
  } = usePayables({
    status: status !== "all" ? status : undefined,
    search: search || undefined,
  });

  const updatePay = useUpdatePayable();
  const deletePay = useDeletePayable();

  const handleSelect = useCallback((p: PayableRow) => {
    setSelected(p);
    setDetailOpen(true);
  }, []);

  const handleMarkPaid = useCallback(
    (id: string) => {
      updatePay.mutate(
        { id, updates: { status: "pago" } },
        { onSuccess: () => setDetailOpen(false) }
      );
    },
    [updatePay]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deletePay.mutate(id, { onSuccess: () => setDetailOpen(false) });
    },
    [deletePay]
  );

  return {
    payables,
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
