"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingParticipants,
  getMeetingTranscription,
} from "@/services/meetings";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useMeetings() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["meetings", tenantId],
    queryFn: () => getMeetings(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useMeeting(id: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => getMeetingById(supabase, id, tenantId!),
    enabled: !!tenantId && !!id,
  });
}

export function useCreateMeeting() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meeting: Database["public"]["Tables"]["meetings"]["Insert"]) =>
      createMeeting(supabase, meeting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useUpdateMeeting() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["meetings"]["Update"];
    }) => updateMeeting(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.id] });
    },
  });
}

export function useDeleteMeeting() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMeeting(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useMeetingParticipants(meetingId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["meeting-participants", meetingId],
    queryFn: () => getMeetingParticipants(supabase, meetingId),
    enabled: !!meetingId,
  });
}

export function useMeetingTranscription(meetingId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["meeting-transcription", meetingId],
    queryFn: () => getMeetingTranscription(supabase, meetingId),
    enabled: !!meetingId,
  });
}
