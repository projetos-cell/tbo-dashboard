// Database types — placeholder until generated with `supabase gen types`
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          status: string | null;
          construtora: string | null;
          bus: string | string[] | null;
          owner_name: string | null;
          due_date_start: string | null;
          due_date_end: string | null;
          notion_url: string | null;
          code: string | null;
          notion_page_id: string | null;
          tenant_id: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          status?: string | null;
          construtora?: string | null;
          bus?: string | string[] | null;
          owner_name?: string | null;
          due_date_start?: string | null;
          due_date_end?: string | null;
          notion_url?: string | null;
          code?: string | null;
          notion_page_id?: string | null;
          tenant_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string | null;
          construtora?: string | null;
          bus?: string | string[] | null;
          owner_name?: string | null;
          due_date_start?: string | null;
          due_date_end?: string | null;
          notion_url?: string | null;
          code?: string | null;
          notion_page_id?: string | null;
          tenant_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      demands: {
        Row: {
          id: string;
          title: string;
          status: string | null;
          due_date: string | null;
          responsible: string | null;
          bus: string | null;
          project_id: string | null;
          notion_url: string | null;
          tenant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          status?: string | null;
          due_date?: string | null;
          responsible?: string | null;
          bus?: string | null;
          project_id?: string | null;
          notion_url?: string | null;
          tenant_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          status?: string | null;
          due_date?: string | null;
          responsible?: string | null;
          bus?: string | null;
          project_id?: string | null;
          notion_url?: string | null;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "demands_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      os_tasks: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          section_id: string | null;
          parent_id: string | null;
          title: string;
          description: string | null;
          status: string;
          assignee_id: string | null;
          assignee_name: string | null;
          start_date: string | null;
          due_date: string | null;
          completed_at: string | null;
          priority: string;
          order_index: number;
          is_completed: boolean;
          legacy_demand_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          section_id?: string | null;
          parent_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          assignee_id?: string | null;
          assignee_name?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          priority?: string;
          order_index?: number;
          is_completed?: boolean;
          legacy_demand_id?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          section_id?: string | null;
          parent_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          assignee_id?: string | null;
          assignee_name?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          priority?: string;
          order_index?: number;
          is_completed?: boolean;
          legacy_demand_id?: string | null;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "os_tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      os_sections: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          title: string;
          order_index: number;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          title: string;
          order_index?: number;
          color?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          title?: string;
          order_index?: number;
          color?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "os_sections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          email: string | null;
          role: string | null;
          avatar_url: string | null;
          is_active: boolean;
          status: string | null;
          department: string | null;
          cargo: string | null;
          bu: string | null;
          is_coordinator: boolean;
          contract_type: string | null;
          start_date: string | null;
          phone: string | null;
          manager_id: string | null;
          team_id: string | null;
          birth_date: string | null;
          address_city: string | null;
          address_state: string | null;
          tenant_id: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          status?: string | null;
          department?: string | null;
          cargo?: string | null;
          bu?: string | null;
          is_coordinator?: boolean;
          contract_type?: string | null;
          start_date?: string | null;
          phone?: string | null;
          manager_id?: string | null;
          team_id?: string | null;
          birth_date?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          tenant_id: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          status?: string | null;
          department?: string | null;
          cargo?: string | null;
          bu?: string | null;
          is_coordinator?: boolean;
          contract_type?: string | null;
          start_date?: string | null;
          phone?: string | null;
          manager_id?: string | null;
          team_id?: string | null;
          birth_date?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          tenant_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          bu: string | null;
          description: string | null;
          is_active: boolean;
          tenant_id: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          bu?: string | null;
          description?: string | null;
          is_active?: boolean;
          tenant_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          bu?: string | null;
          description?: string | null;
          is_active?: boolean;
          tenant_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      fin_payables: {
        Row: {
          id: string;
          tenant_id: string;
          vendor_id: string | null;
          project_id: string | null;
          invoice_id: string | null;
          description: string;
          amount: number;
          amount_paid: number;
          due_date: string;
          paid_date: string | null;
          status: string;
          category_id: string | null;
          cost_center_id: string | null;
          payment_method: string | null;
          notes: string | null;
          attachment_url: string | null;
          attachment_name: string | null;
          omie_id: string | null;
          created_by: string | null;
          updated_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          vendor_id?: string | null;
          project_id?: string | null;
          invoice_id?: string | null;
          description: string;
          amount: number;
          amount_paid?: number;
          due_date: string;
          paid_date?: string | null;
          status?: string;
          category_id?: string | null;
          cost_center_id?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          attachment_url?: string | null;
          attachment_name?: string | null;
          omie_id?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          vendor_id?: string | null;
          project_id?: string | null;
          invoice_id?: string | null;
          description?: string;
          amount?: number;
          amount_paid?: number;
          due_date?: string;
          paid_date?: string | null;
          status?: string;
          category_id?: string | null;
          cost_center_id?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          attachment_url?: string | null;
          attachment_name?: string | null;
          omie_id?: string | null;
          updated_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      fin_receivables: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string | null;
          project_id: string | null;
          invoice_id: string | null;
          description: string;
          amount: number;
          amount_paid: number;
          due_date: string;
          paid_date: string | null;
          status: string;
          installment_number: number | null;
          installment_total: number | null;
          category_id: string | null;
          cost_center_id: string | null;
          payment_method: string | null;
          notes: string | null;
          omie_id: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id?: string | null;
          project_id?: string | null;
          invoice_id?: string | null;
          description: string;
          amount: number;
          amount_paid?: number;
          due_date: string;
          paid_date?: string | null;
          status?: string;
          installment_number?: number | null;
          installment_total?: number | null;
          category_id?: string | null;
          cost_center_id?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          omie_id?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string | null;
          project_id?: string | null;
          invoice_id?: string | null;
          description?: string;
          amount?: number;
          amount_paid?: number;
          due_date?: string;
          paid_date?: string | null;
          status?: string;
          installment_number?: number | null;
          installment_total?: number | null;
          category_id?: string | null;
          cost_center_id?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          omie_id?: string | null;
          updated_by?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      fin_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          type: string;
          parent_id: string | null;
          color: string | null;
          icon: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          type: string;
          parent_id?: string | null;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          type?: string;
          parent_id?: string | null;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      fin_cost_centers: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string | null;
          requires_project: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          category?: string | null;
          requires_project?: boolean;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category?: string | null;
          requires_project?: boolean;
          is_active?: boolean;
        };
        Relationships: [];
      };
      fin_vendors: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          cnpj: string | null;
          email: string | null;
          phone: string | null;
          category: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          cnpj?: string | null;
          email?: string | null;
          phone?: string | null;
          category?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string | null;
          email?: string | null;
          phone?: string | null;
          category?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      fin_clients: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          cnpj: string | null;
          email: string | null;
          phone: string | null;
          contact_name: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          cnpj?: string | null;
          email?: string | null;
          phone?: string | null;
          contact_name?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string | null;
          email?: string | null;
          phone?: string | null;
          contact_name?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          trading_name: string | null;
          cnpj: string | null;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          status: string;
          segment: string | null;
          logo_url: string | null;
          notes: string | null;
          sales_owner: string | null;
          relationship_status: string | null;
          last_interaction_date: string | null;
          next_action: string | null;
          next_action_date: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          trading_name?: string | null;
          cnpj?: string | null;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          status?: string;
          segment?: string | null;
          logo_url?: string | null;
          notes?: string | null;
          sales_owner?: string | null;
          relationship_status?: string | null;
          last_interaction_date?: string | null;
          next_action?: string | null;
          next_action_date?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          trading_name?: string | null;
          cnpj?: string | null;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          status?: string;
          segment?: string | null;
          logo_url?: string | null;
          notes?: string | null;
          sales_owner?: string | null;
          relationship_status?: string | null;
          last_interaction_date?: string | null;
          next_action?: string | null;
          next_action_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      client_interactions: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string;
          type: string;
          date: string;
          notes: string | null;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id: string;
          type: string;
          date: string;
          notes?: string | null;
          author_id?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string;
          type?: string;
          date?: string;
          notes?: string | null;
          author_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      contracts: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string | null;
          client_name: string | null;
          project_name: string | null;
          title: string;
          description: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          value: number | null;
          services: string[] | null;
          payment_terms: string | null;
          auto_renew: boolean;
          alert_days: number | null;
          pdf_url: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id?: string | null;
          client_name?: string | null;
          project_name?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          value?: number | null;
          services?: string[] | null;
          payment_terms?: string | null;
          auto_renew?: boolean;
          alert_days?: number | null;
          pdf_url?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string | null;
          client_name?: string | null;
          project_name?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          value?: number | null;
          services?: string[] | null;
          payment_terms?: string | null;
          auto_renew?: boolean;
          alert_days?: number | null;
          pdf_url?: string | null;
          notes?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      crm_deals: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          company: string | null;
          contact: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          client_id: string | null;
          stage: string;
          value: number | null;
          probability: number | null;
          expected_close_date: string | null;
          owner_id: string | null;
          owner_name: string | null;
          source: string | null;
          services: string[] | null;
          priority: string | null;
          lost_reason: string | null;
          description: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          company?: string | null;
          contact?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          client_id?: string | null;
          stage?: string;
          value?: number | null;
          probability?: number | null;
          expected_close_date?: string | null;
          owner_id?: string | null;
          owner_name?: string | null;
          source?: string | null;
          services?: string[] | null;
          priority?: string | null;
          lost_reason?: string | null;
          description?: string | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          company?: string | null;
          contact?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          client_id?: string | null;
          stage?: string;
          value?: number | null;
          probability?: number | null;
          expected_close_date?: string | null;
          owner_id?: string | null;
          owner_name?: string | null;
          source?: string | null;
          services?: string[] | null;
          priority?: string | null;
          lost_reason?: string | null;
          description?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "crm_deals_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      okr_cycles: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      okr_objectives: {
        Row: {
          id: string;
          tenant_id: string;
          cycle_id: string | null;
          title: string;
          description: string | null;
          owner_id: string | null;
          period: string | null;
          level: string;
          bu: string | null;
          parent_id: string | null;
          status: string;
          progress: number;
          sort_order: number | null;
          status_override: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          cycle_id?: string | null;
          title: string;
          description?: string | null;
          owner_id?: string | null;
          period?: string | null;
          level?: string;
          bu?: string | null;
          parent_id?: string | null;
          status?: string;
          progress?: number;
          sort_order?: number | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          owner_id?: string | null;
          level?: string;
          bu?: string | null;
          parent_id?: string | null;
          status?: string;
          progress?: number;
          sort_order?: number | null;
          status_override?: string | null;
          archived_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "okr_objectives_cycle_id_fkey";
            columns: ["cycle_id"];
            referencedRelation: "okr_cycles";
            referencedColumns: ["id"];
          },
        ];
      };
      okr_key_results: {
        Row: {
          id: string;
          tenant_id: string;
          objective_id: string;
          title: string;
          metric_type: string;
          start_value: number;
          target_value: number;
          current_value: number;
          unit: string | null;
          owner_id: string | null;
          confidence: number | null;
          status: string;
          weight: number | null;
          cadence: string | null;
          status_override: string | null;
          sort_order: number | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          objective_id: string;
          title: string;
          metric_type?: string;
          start_value?: number;
          target_value: number;
          current_value?: number;
          unit?: string | null;
          owner_id?: string | null;
          weight?: number | null;
        };
        Update: {
          title?: string;
          metric_type?: string;
          start_value?: number;
          target_value?: number;
          current_value?: number;
          unit?: string | null;
          owner_id?: string | null;
          confidence?: number | null;
          status?: string;
          weight?: number | null;
          status_override?: string | null;
          sort_order?: number | null;
          archived_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "okr_key_results_objective_id_fkey";
            columns: ["objective_id"];
            referencedRelation: "okr_objectives";
            referencedColumns: ["id"];
          },
        ];
      };
      okr_checkins: {
        Row: {
          id: string;
          tenant_id: string;
          key_result_id: string;
          previous_value: number;
          new_value: number;
          confidence: number | null;
          notes: string | null;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          key_result_id: string;
          previous_value: number;
          new_value: number;
          confidence?: number | null;
          notes?: string | null;
          author_id?: string | null;
        };
        Update: {
          new_value?: number;
          confidence?: number | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "okr_checkins_key_result_id_fkey";
            columns: ["key_result_id"];
            referencedRelation: "okr_key_results";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_channels: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: string;
          description: string | null;
          created_by: string | null;
          is_archived: boolean;
          section_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          type?: string;
          description?: string | null;
          created_by?: string | null;
          is_archived?: boolean;
          section_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          description?: string | null;
          is_archived?: boolean;
          section_id?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          channel_id: string;
          sender_id: string;
          tenant_id: string;
          content: string;
          message_type: string;
          metadata: Record<string, unknown> | null;
          reply_to: string | null;
          edited_at: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          sender_id: string;
          tenant_id: string;
          content: string;
          message_type?: string;
          metadata?: Record<string, unknown> | null;
          reply_to?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          message_type?: string;
          metadata?: Record<string, unknown> | null;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey";
            columns: ["channel_id"];
            referencedRelation: "chat_channels";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_channel_members: {
        Row: {
          channel_id: string;
          user_id: string;
          role: string;
          last_read_at: string;
          joined_at: string;
        };
        Insert: {
          channel_id: string;
          user_id: string;
          role?: string;
          last_read_at?: string;
          joined_at?: string;
        };
        Update: {
          role?: string;
          last_read_at?: string;
        };
      };
      chat_reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          tenant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          emoji: string;
          tenant_id: string;
          created_at?: string;
        };
        Update: {
          emoji?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_reactions_message_id_fkey";
            columns: ["message_id"];
            referencedRelation: "chat_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_events: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string;
          is_all_day: boolean;
          location: string | null;
          attendees: Json | null;
          organizer: string | null;
          google_event_id: string | null;
          source: string;
          user_id: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          title: string;
          description?: string | null;
          start_at: string;
          end_at: string;
          is_all_day?: boolean;
          location?: string | null;
          attendees?: Json | null;
          organizer?: string | null;
          google_event_id?: string | null;
          source?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          start_at?: string;
          end_at?: string;
          is_all_day?: boolean;
          location?: string | null;
          attendees?: Json | null;
          organizer?: string | null;
          google_event_id?: string | null;
          source?: string;
          user_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          action?: string;
          entity_type?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
