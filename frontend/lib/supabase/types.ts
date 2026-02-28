export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          from_state: string | null
          id: string
          metadata: Json | null
          reason: string | null
          tenant_id: string | null
          to_state: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          from_state?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          tenant_id?: string | null
          to_state?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          from_state?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          tenant_id?: string | null
          to_state?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_imports: {
        Row: {
          account_number: string | null
          bank_name: string | null
          created_at: string | null
          filename: string
          format: string
          id: string
          imported_by: string | null
          matched_count: number | null
          period_end: string | null
          period_start: string | null
          status: string | null
          tenant_id: string
          transaction_count: number | null
        }
        Insert: {
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          filename: string
          format: string
          id?: string
          imported_by?: string | null
          matched_count?: number | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          tenant_id: string
          transaction_count?: number | null
        }
        Update: {
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          filename?: string
          format?: string
          id?: string
          imported_by?: string | null
          matched_count?: number | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          tenant_id?: string
          transaction_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_imports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          balance: number | null
          created_at: string | null
          date: string
          description: string | null
          fitid: string | null
          id: string
          import_id: string
          match_status: string | null
          matched_transaction_id: string | null
          memo: string | null
          tenant_id: string
          type: string | null
        }
        Insert: {
          amount: number
          balance?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          fitid?: string | null
          id?: string
          import_id: string
          match_status?: string | null
          matched_transaction_id?: string | null
          memo?: string | null
          tenant_id: string
          type?: string | null
        }
        Update: {
          amount?: number
          balance?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          fitid?: string | null
          id?: string
          import_id?: string
          match_status?: string | null
          matched_transaction_id?: string | null
          memo?: string | null
          tenant_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "bank_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_matched_transaction_id_fkey"
            columns: ["matched_transaction_id"]
            isOneToOne: false
            referencedRelation: "fin_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      block_links: {
        Row: {
          block_id: string
          created_at: string | null
          id: string
          slug: string
          tenant_id: string
        }
        Insert: {
          block_id: string
          created_at?: string | null
          id?: string
          slug: string
          tenant_id: string
        }
        Update: {
          block_id?: string
          created_at?: string | null
          id?: string
          slug?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_links_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "page_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      business_config: {
        Row: {
          id: string
          key: string
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "business_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_at: string | null
          google_event_id: string | null
          id: string
          is_all_day: boolean
          location: string | null
          organizer: string | null
          source: string | null
          start_at: string
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          google_event_id?: string | null
          id?: string
          is_all_day?: boolean
          location?: string | null
          organizer?: string | null
          source?: string | null
          start_at?: string
          tenant_id: string
          title?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          google_event_id?: string | null
          id?: string
          is_all_day?: boolean
          location?: string | null
          organizer?: string | null
          source?: string | null
          start_at?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      changelog_entries: {
        Row: {
          author: string | null
          created_at: string | null
          description: string
          id: string
          module: string | null
          published_at: string
          tag: string | null
          title: string
          version: string
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description: string
          id?: string
          module?: string | null
          published_at: string
          tag?: string | null
          title: string
          version: string
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string
          id?: string
          module?: string | null
          published_at?: string
          tag?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      chat_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channel_members: {
        Row: {
          channel_id: string
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channel_sections: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_collapsed: boolean | null
          name: string
          sort_order: number | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_collapsed?: boolean | null
          name: string
          sort_order?: number | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_collapsed?: boolean | null
          name?: string
          sort_order?: number | null
          tenant_id?: string
        }
        Relationships: []
      }
      chat_channels: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          name: string
          section_id: string | null
          tenant_id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          section_id?: string | null
          tenant_id: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          section_id?: string | null
          tenant_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_channels_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "chat_channel_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          reply_to: string | null
          sender_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          reply_to?: string | null
          sender_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          reply_to?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_poll_options: {
        Row: {
          id: string
          poll_id: string
          sort_order: number | null
          text: string
        }
        Insert: {
          id?: string
          poll_id: string
          sort_order?: number | null
          text: string
        }
        Update: {
          id?: string
          poll_id?: string
          sort_order?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "chat_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "chat_poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "chat_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_polls: {
        Row: {
          allows_multiple: boolean | null
          closes_at: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          message_id: string
          question: string
        }
        Insert: {
          allows_multiple?: boolean | null
          closes_at?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          message_id: string
          question: string
        }
        Update: {
          allows_multiple?: boolean | null
          closes_at?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          message_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_polls_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      client_activity_log: {
        Row: {
          action: string
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          tenant_id: string
        }
        Insert: {
          action: string
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          tenant_id: string
        }
        Update: {
          action?: string
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_portal_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activity_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_deliveries: {
        Row: {
          client_id: string
          created_at: string | null
          delivered_at: string | null
          description: string | null
          files: Json | null
          id: string
          project_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          status: string
          tenant_id: string
          title: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          delivered_at?: string | null
          description?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          status?: string
          tenant_id: string
          title: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          delivered_at?: string | null
          description?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          status?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_deliveries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_portal_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_deliveries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_interactions: {
        Row: {
          client_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          tenant_id: string
          type?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_interactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          client_id: string
          content: string
          created_at: string | null
          id: string
          sender_name: string
          sender_type: string
          tenant_id: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string | null
          id?: string
          sender_name: string
          sender_type: string
          tenant_id: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string | null
          id?: string
          sender_name?: string
          sender_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_portal_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_access: {
        Row: {
          access_token: string | null
          client_email: string
          client_id: string | null
          client_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          tenant_id: string
        }
        Insert: {
          access_token?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          tenant_id: string
        }
        Update: {
          access_token?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          phone: string | null
          relationship_status: string | null
          sales_owner: string | null
          segment: string | null
          state: string | null
          status: string
          tenant_id: string
          trading_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          phone?: string | null
          relationship_status?: string | null
          sales_owner?: string | null
          segment?: string | null
          state?: string | null
          status?: string
          tenant_id: string
          trading_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          phone?: string | null
          relationship_status?: string | null
          sales_owner?: string | null
          segment?: string | null
          state?: string | null
          status?: string
          tenant_id?: string
          trading_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          auth_user_id: string | null
          buddy_id: string | null
          cadastrado_por: string | null
          cargo: string
          created_at: string | null
          data_inicio: string
          email: string
          exit_date: string | null
          exit_interview: Json | null
          exit_reason: string | null
          foto_url: string | null
          id: string
          nome: string
          onboarding_concluido_em: string | null
          perfil_acesso: string | null
          quiz_score_final: number | null
          status: string | null
          telefone: string | null
          tenant_id: string | null
          tipo_contrato: string | null
          tipo_onboarding: string | null
        }
        Insert: {
          auth_user_id?: string | null
          buddy_id?: string | null
          cadastrado_por?: string | null
          cargo: string
          created_at?: string | null
          data_inicio: string
          email: string
          exit_date?: string | null
          exit_interview?: Json | null
          exit_reason?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          onboarding_concluido_em?: string | null
          perfil_acesso?: string | null
          quiz_score_final?: number | null
          status?: string | null
          telefone?: string | null
          tenant_id?: string | null
          tipo_contrato?: string | null
          tipo_onboarding?: string | null
        }
        Update: {
          auth_user_id?: string | null
          buddy_id?: string | null
          cadastrado_por?: string | null
          cargo?: string
          created_at?: string | null
          data_inicio?: string
          email?: string
          exit_date?: string | null
          exit_interview?: Json | null
          exit_reason?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          onboarding_concluido_em?: string | null
          perfil_acesso?: string | null
          quiz_score_final?: number | null
          status?: string | null
          telefone?: string | null
          tenant_id?: string | null
          tipo_contrato?: string | null
          tipo_onboarding?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "colaboradores_cadastrado_por_fkey"
            columns: ["cadastrado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_cadastrado_por_fkey"
            columns: ["cadastrado_por"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "colaboradores_cadastrado_por_fkey"
            columns: ["cadastrado_por"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "colaboradores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores_status_log: {
        Row: {
          alterado_em: string | null
          colaborador_id: string | null
          id: string
          status_anterior: string | null
          status_novo: string | null
        }
        Insert: {
          alterado_em?: string | null
          colaborador_id?: string | null
          id?: string
          status_anterior?: string | null
          status_novo?: string | null
        }
        Update: {
          alterado_em?: string | null
          colaborador_id?: string | null
          id?: string
          status_anterior?: string | null
          status_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_status_log_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_status_log_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "colaboradores_status_log_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      collaborator_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      company_context: {
        Row: {
          key: string
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "company_context_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_context_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_context_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_attachments: {
        Row: {
          contract_id: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          tenant_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          tenant_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          tenant_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          monthly_value: number | null
          person_id: string | null
          person_name: string | null
          start_date: string | null
          status: string | null
          tenant_id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          monthly_value?: number | null
          person_id?: string | null
          person_name?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          monthly_value?: number | null
          person_id?: string | null
          person_name?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          colaborador_id: string | null
          created_at: string | null
          expira_em: string
          id: string
          token: string
          usado_em: string | null
        }
        Insert: {
          colaborador_id?: string | null
          created_at?: string | null
          expira_em: string
          id?: string
          token: string
          usado_em?: string | null
        }
        Update: {
          colaborador_id?: string | null
          created_at?: string | null
          expira_em?: string
          id?: string
          token?: string
          usado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "convites_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          activities: Json | null
          company: string | null
          contact: string | null
          contact_email: string | null
          cost: number | null
          created_at: string | null
          expected_close: string | null
          id: string
          legacy_id: string | null
          margin: number | null
          name: string
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          priority: string | null
          probability: number | null
          rd_deal_id: string | null
          risk_flag: boolean | null
          services: string[] | null
          source: string | null
          stage: string
          tenant_id: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          activities?: Json | null
          company?: string | null
          contact?: string | null
          contact_email?: string | null
          cost?: number | null
          created_at?: string | null
          expected_close?: string | null
          id?: string
          legacy_id?: string | null
          margin?: number | null
          name: string
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          priority?: string | null
          probability?: number | null
          rd_deal_id?: string | null
          risk_flag?: boolean | null
          services?: string[] | null
          source?: string | null
          stage?: string
          tenant_id?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          activities?: Json | null
          company?: string | null
          contact?: string | null
          contact_email?: string | null
          cost?: number | null
          created_at?: string | null
          expected_close?: string | null
          id?: string
          legacy_id?: string | null
          margin?: number | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          priority?: string | null
          probability?: number | null
          rd_deal_id?: string | null
          risk_flag?: boolean | null
          services?: string[] | null
          source?: string | null
          stage?: string
          tenant_id?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_stage_fkey"
            columns: ["stage"]
            isOneToOne: false
            referencedRelation: "crm_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_stages: {
        Row: {
          color: string | null
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          id: string
          label: string
          sort_order: number
        }
        Update: {
          color?: string | null
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      cultura_item_versions: {
        Row: {
          content: string | null
          created_at: string
          edited_by: string | null
          id: string
          item_id: string
          title: string
          version: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          edited_by?: string | null
          id?: string
          item_id: string
          title?: string
          version?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          edited_by?: string | null
          id?: string
          item_id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cultura_item_versions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cultura_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cultura_items: {
        Row: {
          author_id: string
          category: string
          content: string
          content_html: string | null
          created_at: string
          icon: string | null
          id: string
          metadata: Json | null
          order_index: number
          status: string
          tenant_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          author_id: string
          category?: string
          content?: string
          content_html?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          order_index?: number
          status?: string
          tenant_id: string
          title?: string
          updated_at?: string
          version?: number
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          content_html?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          order_index?: number
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cultura_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_pages: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          slug: string
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          slug: string
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          slug?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_pages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_database_rows: {
        Row: {
          created_at: string | null
          created_by: string | null
          database_id: string
          id: string
          order_index: number | null
          properties: Json
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          database_id: string
          id?: string
          order_index?: number | null
          properties?: Json
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          database_id?: string
          id?: string
          order_index?: number | null
          properties?: Json
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_database_rows_database_id_fkey"
            columns: ["database_id"]
            isOneToOne: false
            referencedRelation: "custom_databases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_database_rows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_databases: {
        Row: {
          color: string | null
          columns: Json
          created_at: string | null
          created_by: string | null
          default_view: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
          views: Json
        }
        Insert: {
          color?: string | null
          columns?: Json
          created_at?: string | null
          created_by?: string | null
          default_view?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
          views?: Json
        }
        Update: {
          color?: string | null
          columns?: Json
          created_at?: string | null
          created_by?: string | null
          default_view?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
          views?: Json
        }
        Relationships: [
          {
            foreignKeyName: "custom_databases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string
          field_type: string
          id: string
          is_required: boolean
          name: string
          options: Json | null
          order_index: number
          project_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          field_type?: string
          id?: string
          is_required?: boolean
          name: string
          options?: Json | null
          order_index?: number
          project_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          field_type?: string
          id?: string
          is_required?: boolean
          name?: string
          options?: Json | null
          order_index?: number
          project_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          definition_id: string
          id: string
          task_id: string
          tenant_id: string
          value_date: string | null
          value_json: Json | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          definition_id: string
          id?: string
          task_id: string
          tenant_id: string
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          definition_id?: string
          id?: string
          task_id?: string
          tenant_id?: string
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          created_at: string | null
          created_by: string | null
          decided_by: string | null
          description: string | null
          id: string
          legacy_id: string | null
          meeting_id: string | null
          project_id: string | null
          tasks_created: string[] | null
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          decided_by?: string | null
          description?: string | null
          id?: string
          legacy_id?: string | null
          meeting_id?: string | null
          project_id?: string | null
          tasks_created?: string[] | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          decided_by?: string | null
          description?: string | null
          id?: string
          legacy_id?: string | null
          meeting_id?: string | null
          project_id?: string | null
          tasks_created?: string[] | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_version: string | null
          id: string
          legacy_id: string | null
          name: string
          owner_id: string | null
          owner_name: string | null
          project_id: string | null
          project_name: string | null
          reviewer_id: string | null
          source: string | null
          status: string
          tenant_id: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          versions: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_version?: string | null
          id?: string
          legacy_id?: string | null
          name: string
          owner_id?: string | null
          owner_name?: string | null
          project_id?: string | null
          project_name?: string | null
          reviewer_id?: string | null
          source?: string | null
          status?: string
          tenant_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          versions?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_version?: string | null
          id?: string
          legacy_id?: string | null
          name?: string
          owner_id?: string | null
          owner_name?: string | null
          project_id?: string | null
          project_name?: string | null
          reviewer_id?: string | null
          source?: string | null
          status?: string
          tenant_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          versions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          demand_id: string
          id: string
          mentions: Json
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content?: string
          created_at?: string | null
          demand_id: string
          id?: string
          mentions?: Json
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          demand_id?: string
          id?: string
          mentions?: Json
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demand_comments_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_field_values: {
        Row: {
          created_at: string | null
          demand_id: string
          field_id: string
          id: string
          tenant_id: string
          updated_at: string | null
          value_json: Json
        }
        Insert: {
          created_at?: string | null
          demand_id: string
          field_id: string
          id?: string
          tenant_id: string
          updated_at?: string | null
          value_json?: Json
        }
        Update: {
          created_at?: string | null
          demand_id?: string
          field_id?: string
          id?: string
          tenant_id?: string
          updated_at?: string | null
          value_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "demand_field_values_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "os_custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_field_values_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demands: {
        Row: {
          bus: string[] | null
          created_at: string | null
          due_date: string | null
          due_date_end: string | null
          feito: boolean | null
          formalizacao: string | null
          id: string
          info: string | null
          item_principal: string | null
          milestones: string | null
          notion_page_id: string | null
          notion_project_name: string | null
          notion_url: string | null
          prioridade: string | null
          project_id: string | null
          responsible: string | null
          start_date: string | null
          status: string
          subitem: string | null
          tags: string[] | null
          tenant_id: string
          tipo_midia: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bus?: string[] | null
          created_at?: string | null
          due_date?: string | null
          due_date_end?: string | null
          feito?: boolean | null
          formalizacao?: string | null
          id?: string
          info?: string | null
          item_principal?: string | null
          milestones?: string | null
          notion_page_id?: string | null
          notion_project_name?: string | null
          notion_url?: string | null
          prioridade?: string | null
          project_id?: string | null
          responsible?: string | null
          start_date?: string | null
          status?: string
          subitem?: string | null
          tags?: string[] | null
          tenant_id: string
          tipo_midia?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bus?: string[] | null
          created_at?: string | null
          due_date?: string | null
          due_date_end?: string | null
          feito?: boolean | null
          formalizacao?: string | null
          id?: string
          info?: string | null
          item_principal?: string | null
          milestones?: string | null
          notion_page_id?: string | null
          notion_project_name?: string | null
          notion_url?: string | null
          prioridade?: string | null
          project_id?: string | null
          responsible?: string | null
          start_date?: string | null
          status?: string
          subitem?: string | null
          tags?: string[] | null
          tenant_id?: string
          tipo_midia?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demands_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      digest_logs: {
        Row: {
          content_html: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          snapshot: Json | null
          status: string | null
          subject: string
          type: string
        }
        Insert: {
          content_html?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          snapshot?: Json | null
          status?: string | null
          subject: string
          type?: string
        }
        Update: {
          content_html?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          snapshot?: Json | null
          status?: string | null
          subject?: string
          type?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          changelog: string | null
          created_at: string | null
          document_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_current: boolean | null
          mime_type: string | null
          tenant_id: string | null
          thumbnail_path: string | null
          uploaded_by: string | null
          uploaded_by_name: string | null
          version: number
        }
        Insert: {
          changelog?: string | null
          created_at?: string | null
          document_id: string
          document_type?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          mime_type?: string | null
          tenant_id?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version?: number
        }
        Update: {
          changelog?: string | null
          created_at?: string | null
          document_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          mime_type?: string | null
          tenant_id?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          description: string | null
          id: string
          is_default: boolean | null
          last_used_at: string | null
          name: string
          type: string
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          name: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          name?: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          created_at: string | null
          from_user: string
          id: string
          message: string
          tenant_id: string
          to_user: string
          type: string
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          from_user: string
          id?: string
          message: string
          tenant_id: string
          to_user: string
          type: string
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          from_user?: string
          id?: string
          message?: string
          tenant_id?: string
          to_user?: string
          type?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_balance_snapshots: {
        Row: {
          balance: number
          id: string
          note: string | null
          recorded_at: string | null
          recorded_by: string | null
          tenant_id: string
        }
        Insert: {
          balance: number
          id?: string
          note?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          tenant_id: string
        }
        Update: {
          balance?: number
          id?: string
          note?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_balance_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_clients: {
        Row: {
          cnpj: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          omie_id: string | null
          omie_synced_at: string | null
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_cost_centers: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_project: boolean | null
          slug: string
          tenant_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_project?: boolean | null
          slug: string
          tenant_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_project?: boolean | null
          slug?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_cost_centers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          id: string
          issue_date: string
          notes: string | null
          number: string
          omie_id: string | null
          pdf_url: string | null
          series: string | null
          status: string | null
          tax_amount: number | null
          tenant_id: string
          type: string | null
          updated_at: string | null
          vendor_id: string | null
          xml_url: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          issue_date: string
          notes?: string | null
          number: string
          omie_id?: string | null
          pdf_url?: string | null
          series?: string | null
          status?: string | null
          tax_amount?: number | null
          tenant_id: string
          type?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          xml_url?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          number?: string
          omie_id?: string | null
          pdf_url?: string | null
          series?: string | null
          status?: string | null
          tax_amount?: number | null
          tenant_id?: string
          type?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fin_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "fin_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_payables: {
        Row: {
          amount: number
          amount_paid: number | null
          approved_at: string | null
          approved_by: string | null
          attachment_name: string | null
          attachment_url: string | null
          category_id: string | null
          cost_center_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string
          id: string
          invoice_id: string | null
          notes: string | null
          omie_id: string | null
          omie_synced_at: string | null
          paid_date: string | null
          payment_method: string | null
          project_id: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          due_date: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          due_date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_payables_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_payables_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_payables_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fin_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_payables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_payables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_payables_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "fin_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_receivables: {
        Row: {
          amount: number
          amount_paid: number | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string
          id: string
          installment_number: number | null
          installment_total: number | null
          invoice_id: string | null
          notes: string | null
          omie_id: string | null
          omie_synced_at: string | null
          paid_date: string | null
          payment_method: string | null
          project_id: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          due_date: string
          id?: string
          installment_number?: number | null
          installment_total?: number | null
          invoice_id?: string | null
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          due_date?: string
          id?: string
          installment_number?: number | null
          installment_total?: number | null
          invoice_id?: string | null
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fin_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_receivables_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fin_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_receivables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_receivables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_transactions: {
        Row: {
          amount: number
          bank_account: string | null
          category_id: string | null
          client_id: string | null
          cost_center_id: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          document_number: string | null
          due_date: string | null
          id: string
          invoice_id: string | null
          is_realized: boolean | null
          notes: string | null
          omie_id: string | null
          paid_date: string | null
          payment_method: string | null
          project_id: string | null
          recurrence: string | null
          recurrence_end: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          type: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          bank_account?: string | null
          category_id?: string | null
          client_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description: string
          document_number?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          is_realized?: boolean | null
          notes?: string | null
          omie_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          recurrence?: string | null
          recurrence_end?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          type: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          bank_account?: string | null
          category_id?: string | null
          client_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          document_number?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          is_realized?: boolean | null
          notes?: string | null
          omie_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          recurrence?: string | null
          recurrence_end?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          type?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fin_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fin_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "fin_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_vendors: {
        Row: {
          category: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          omie_id: string | null
          omie_synced_at: string | null
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          omie_id?: string | null
          omie_synced_at?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_vendors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_data: {
        Row: {
          category: string
          id: string
          is_realized: boolean | null
          month: string
          notes: string | null
          subcategory: string | null
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          value: number
          year: number
        }
        Insert: {
          category: string
          id?: string
          is_realized?: boolean | null
          month: string
          notes?: string | null
          subcategory?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: number
          year: number
        }
        Update: {
          category?: string
          id?: string
          is_realized?: boolean | null
          month?: string
          notes?: string | null
          subcategory?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_targets: {
        Row: {
          id: string
          target_type: string
          updated_at: string | null
          updated_by: string | null
          value: number
          year: number
        }
        Insert: {
          id?: string
          target_type: string
          updated_at?: string | null
          updated_by?: string | null
          value?: number
          year: number
        }
        Update: {
          id?: string
          target_type?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: number
          year?: number
        }
        Relationships: []
      }
      fireflies_sync_log: {
        Row: {
          errors: Json | null
          finished_at: string | null
          id: string
          meetings_created: number | null
          meetings_fetched: number | null
          meetings_updated: number | null
          started_at: string | null
          status: string | null
          tenant_id: string
          transcriptions_synced: number | null
          trigger_source: string | null
          triggered_by: string | null
        }
        Insert: {
          errors?: Json | null
          finished_at?: string | null
          id?: string
          meetings_created?: number | null
          meetings_fetched?: number | null
          meetings_updated?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id: string
          transcriptions_synced?: number | null
          trigger_source?: string | null
          triggered_by?: string | null
        }
        Update: {
          errors?: Json | null
          finished_at?: string | null
          id?: string
          meetings_created?: number | null
          meetings_fetched?: number | null
          meetings_updated?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id?: string
          transcriptions_synced?: number | null
          trigger_source?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fireflies_sync_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          read_at: string | null
          tenant_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          tenant_id: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          tenant_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          access_token_encrypted: string | null
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_status: string | null
          provider: string
          refresh_token_encrypted: string | null
          settings: Json | null
          tenant_id: string
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          provider: string
          refresh_token_encrypted?: string | null
          settings?: Json | null
          tenant_id: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          settings?: Json | null
          tenant_id?: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          tags: string[] | null
          tenant_id: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      market_research: {
        Row: {
          author_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          published_at: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_research_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      market_sources: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          research_id: string | null
          source_type: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          research_id?: string | null
          source_type?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          research_id?: string | null
          source_type?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_sources_research_id_fkey"
            columns: ["research_id"]
            isOneToOne: false
            referencedRelation: "market_research"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_tbo: boolean | null
          meeting_id: string
          profile_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_tbo?: boolean | null
          meeting_id: string
          profile_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_tbo?: boolean | null
          meeting_id?: string
          profile_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_transcriptions: {
        Row: {
          created_at: string | null
          end_time: number | null
          id: string
          meeting_id: string
          raw_index: number | null
          speaker_email: string | null
          speaker_name: string | null
          start_time: number | null
          tenant_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          end_time?: number | null
          id?: string
          meeting_id: string
          raw_index?: number | null
          speaker_email?: string | null
          speaker_name?: string | null
          start_time?: number | null
          tenant_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          end_time?: number | null
          id?: string
          meeting_id?: string
          raw_index?: number | null
          speaker_email?: string | null
          speaker_name?: string | null
          start_time?: number | null
          tenant_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_transcriptions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_transcriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          action_items: Json | null
          agenda: string | null
          audio_url: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          duration_minutes: number | null
          fireflies_id: string | null
          fireflies_url: string | null
          host_email: string | null
          id: string
          keywords: string[] | null
          legacy_id: string | null
          meeting_link: string | null
          name: string | null
          notes: string | null
          organizer_email: string | null
          overview: string | null
          participants: string[] | null
          project_id: string | null
          project_name: string | null
          short_summary: string | null
          status: string
          summary: string | null
          sync_source: string | null
          synced_at: string | null
          tenant_id: string | null
          time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          agenda?: string | null
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          duration_minutes?: number | null
          fireflies_id?: string | null
          fireflies_url?: string | null
          host_email?: string | null
          id?: string
          keywords?: string[] | null
          legacy_id?: string | null
          meeting_link?: string | null
          name?: string | null
          notes?: string | null
          organizer_email?: string | null
          overview?: string | null
          participants?: string[] | null
          project_id?: string | null
          project_name?: string | null
          short_summary?: string | null
          status?: string
          summary?: string | null
          sync_source?: string | null
          synced_at?: string | null
          tenant_id?: string | null
          time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          agenda?: string | null
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          duration_minutes?: number | null
          fireflies_id?: string | null
          fireflies_url?: string | null
          host_email?: string | null
          id?: string
          keywords?: string[] | null
          legacy_id?: string | null
          meeting_link?: string | null
          name?: string | null
          notes?: string | null
          organizer_email?: string | null
          overview?: string | null
          participants?: string[] | null
          project_id?: string | null
          project_name?: string | null
          short_summary?: string | null
          status?: string
          summary?: string | null
          sync_source?: string | null
          synced_at?: string | null
          tenant_id?: string | null
          time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_closings: {
        Row: {
          created_at: string | null
          id: string
          locked: boolean | null
          locked_at: string | null
          locked_by: string | null
          month: number
          notes: string | null
          snapshot: Json | null
          tenant_id: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          month: number
          notes?: string | null
          snapshot?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          month?: number
          notes?: string | null
          snapshot?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_closings_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_closings_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_closings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          read: boolean | null
          tenant_id: string | null
          title: string
          trigger_type: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read?: boolean | null
          tenant_id?: string | null
          title: string
          trigger_type?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read?: boolean | null
          tenant_id?: string | null
          title?: string
          trigger_type?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notion_integrations: {
        Row: {
          access_token: string
          connected_at: string | null
          connected_by: string | null
          id: string
          owner_name: string | null
          tenant_id: string
          workspace_id: string | null
          workspace_name: string | null
        }
        Insert: {
          access_token: string
          connected_at?: string | null
          connected_by?: string | null
          id?: string
          owner_name?: string | null
          tenant_id: string
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Update: {
          access_token?: string
          connected_at?: string | null
          connected_by?: string | null
          id?: string
          owner_name?: string | null
          tenant_id?: string
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Relationships: []
      }
      okr_checkins: {
        Row: {
          author_id: string
          confidence: string | null
          created_at: string | null
          id: string
          key_result_id: string
          new_value: number
          notes: string | null
          previous_value: number | null
          tenant_id: string
        }
        Insert: {
          author_id: string
          confidence?: string | null
          created_at?: string | null
          id?: string
          key_result_id: string
          new_value: number
          notes?: string | null
          previous_value?: number | null
          tenant_id: string
        }
        Update: {
          author_id?: string
          confidence?: string | null
          created_at?: string | null
          id?: string
          key_result_id?: string
          new_value?: number
          notes?: string | null
          previous_value?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "okr_checkins_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "okr_key_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_checkins_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_cycles: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "okr_cycles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_key_results: {
        Row: {
          confidence: string | null
          created_at: string | null
          current_value: number | null
          id: string
          metric_type: string | null
          objective_id: string
          owner_id: string | null
          start_value: number | null
          status: string | null
          target_value: number
          tenant_id: string
          title: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          metric_type?: string | null
          objective_id: string
          owner_id?: string | null
          start_value?: number | null
          status?: string | null
          target_value: number
          tenant_id: string
          title: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          metric_type?: string | null
          objective_id?: string
          owner_id?: string | null
          start_value?: number | null
          status?: string | null
          target_value?: number
          tenant_id?: string
          title?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "okr_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_key_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_objectives: {
        Row: {
          bu: string | null
          created_at: string | null
          description: string | null
          id: string
          level: string
          owner_id: string
          parent_id: string | null
          period: string
          progress: number | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          bu?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          level?: string
          owner_id: string
          parent_id?: string | null
          period: string
          progress?: number | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          bu?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          level?: string
          owner_id?: string
          parent_id?: string | null
          period?: string
          progress?: number | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_objectives_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "okr_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_objectives_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      omie_sync_log: {
        Row: {
          clients_synced: number | null
          errors: Json | null
          finished_at: string | null
          id: string
          payables_synced: number | null
          receivables_synced: number | null
          started_at: string | null
          status: string | null
          tenant_id: string
          triggered_by: string | null
          vendors_synced: number | null
        }
        Insert: {
          clients_synced?: number | null
          errors?: Json | null
          finished_at?: string | null
          id?: string
          payables_synced?: number | null
          receivables_synced?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id: string
          triggered_by?: string | null
          vendors_synced?: number | null
        }
        Update: {
          clients_synced?: number | null
          errors?: Json | null
          finished_at?: string | null
          id?: string
          payables_synced?: number | null
          receivables_synced?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id?: string
          triggered_by?: string | null
          vendors_synced?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "omie_sync_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_atividades: {
        Row: {
          acao_conclusao: string | null
          descricao: string | null
          dia_id: string | null
          id: string
          obrigatorio: boolean | null
          ordem: number
          score_minimo: number | null
          tempo_estimado_min: number | null
          tipo: string
          titulo: string
          url_conteudo: string | null
        }
        Insert: {
          acao_conclusao?: string | null
          descricao?: string | null
          dia_id?: string | null
          id?: string
          obrigatorio?: boolean | null
          ordem: number
          score_minimo?: number | null
          tempo_estimado_min?: number | null
          tipo: string
          titulo: string
          url_conteudo?: string | null
        }
        Update: {
          acao_conclusao?: string | null
          descricao?: string | null
          dia_id?: string | null
          id?: string
          obrigatorio?: boolean | null
          ordem?: number
          score_minimo?: number | null
          tempo_estimado_min?: number | null
          tipo?: string
          titulo?: string
          url_conteudo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_atividades_dia_id_fkey"
            columns: ["dia_id"]
            isOneToOne: false
            referencedRelation: "onboarding_dias"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checkins: {
        Row: {
          agendado_para: string | null
          anotacoes: string | null
          colaborador_id: string | null
          dia_numero: number | null
          duracao_min: number | null
          id: string
          realizado: boolean | null
          realizado_em: string | null
          responsavel_id: string | null
        }
        Insert: {
          agendado_para?: string | null
          anotacoes?: string | null
          colaborador_id?: string | null
          dia_numero?: number | null
          duracao_min?: number | null
          id?: string
          realizado?: boolean | null
          realizado_em?: string | null
          responsavel_id?: string | null
        }
        Update: {
          agendado_para?: string | null
          anotacoes?: string | null
          colaborador_id?: string | null
          dia_numero?: number | null
          duracao_min?: number | null
          id?: string
          realizado?: boolean | null
          realizado_em?: string | null
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checkins_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checkins_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "onboarding_checkins_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "onboarding_checkins_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checkins_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "onboarding_checkins_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      onboarding_dias: {
        Row: {
          carga: string | null
          duracao_checkin_min: number | null
          id: string
          numero: number
          tem_checkin_humano: boolean | null
          tema: string | null
          tipo_onboarding: string
          titulo: string
        }
        Insert: {
          carga?: string | null
          duracao_checkin_min?: number | null
          id?: string
          numero: number
          tem_checkin_humano?: boolean | null
          tema?: string | null
          tipo_onboarding: string
          titulo: string
        }
        Update: {
          carga?: string | null
          duracao_checkin_min?: number | null
          id?: string
          numero?: number
          tem_checkin_humano?: boolean | null
          tema?: string | null
          tipo_onboarding?: string
          titulo?: string
        }
        Relationships: []
      }
      onboarding_dias_liberados: {
        Row: {
          colaborador_id: string | null
          concluido: boolean | null
          concluido_em: string | null
          dia_id: string | null
          id: string
          liberado_em: string | null
        }
        Insert: {
          colaborador_id?: string | null
          concluido?: boolean | null
          concluido_em?: string | null
          dia_id?: string | null
          id?: string
          liberado_em?: string | null
        }
        Update: {
          colaborador_id?: string | null
          concluido?: boolean | null
          concluido_em?: string | null
          dia_id?: string | null
          id?: string
          liberado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_dias_liberados_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_dias_liberados_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "onboarding_dias_liberados_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "onboarding_dias_liberados_dia_id_fkey"
            columns: ["dia_id"]
            isOneToOne: false
            referencedRelation: "onboarding_dias"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_notificacoes: {
        Row: {
          colaborador_id: string | null
          destinatario: string | null
          enviado_em: string | null
          gatilho: string | null
          id: string
          lida: boolean | null
          lida_em: string | null
          mensagem: string | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          colaborador_id?: string | null
          destinatario?: string | null
          enviado_em?: string | null
          gatilho?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          status?: string | null
          tipo?: string | null
        }
        Update: {
          colaborador_id?: string | null
          destinatario?: string | null
          enviado_em?: string | null
          gatilho?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          status?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_notificacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_notificacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "onboarding_notificacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      onboarding_progresso: {
        Row: {
          atividade_id: string | null
          colaborador_id: string | null
          concluido: boolean | null
          concluido_em: string | null
          feedback_rating: number | null
          id: string
          resposta_tarefa: string | null
          score: number | null
          tempo_gasto_seg: number | null
          tentativas: number | null
        }
        Insert: {
          atividade_id?: string | null
          colaborador_id?: string | null
          concluido?: boolean | null
          concluido_em?: string | null
          feedback_rating?: number | null
          id?: string
          resposta_tarefa?: string | null
          score?: number | null
          tempo_gasto_seg?: number | null
          tentativas?: number | null
        }
        Update: {
          atividade_id?: string | null
          colaborador_id?: string | null
          concluido?: boolean | null
          concluido_em?: string | null
          feedback_rating?: number | null
          id?: string
          resposta_tarefa?: string | null
          score?: number | null
          tempo_gasto_seg?: number | null
          tentativas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progresso_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "onboarding_atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progresso_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progresso_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "onboarding_progresso_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          steps: Json
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          steps?: Json
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          steps?: Json
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_one_actions: {
        Row: {
          ai_confidence: number | null
          assignee_id: string | null
          category: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          one_on_one_id: string
          pdi_link_id: string | null
          source: string | null
          tenant_id: string
          text: string
        }
        Insert: {
          ai_confidence?: number | null
          assignee_id?: string | null
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          one_on_one_id: string
          pdi_link_id?: string | null
          source?: string | null
          tenant_id: string
          text: string
        }
        Update: {
          ai_confidence?: number | null
          assignee_id?: string | null
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          one_on_one_id?: string
          pdi_link_id?: string | null
          source?: string | null
          tenant_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_actions_one_on_one_id_fkey"
            columns: ["one_on_one_id"]
            isOneToOne: false
            referencedRelation: "one_on_ones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_one_actions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_one_transcript_logs: {
        Row: {
          ai_actions: Json | null
          ai_model: string | null
          ai_summary: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          meeting_id: string | null
          one_on_one_id: string
          raw_transcript: string | null
          status: string | null
          tenant_id: string
          tokens_used: number | null
        }
        Insert: {
          ai_actions?: Json | null
          ai_model?: string | null
          ai_summary?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          meeting_id?: string | null
          one_on_one_id: string
          raw_transcript?: string | null
          status?: string | null
          tenant_id: string
          tokens_used?: number | null
        }
        Update: {
          ai_actions?: Json | null
          ai_model?: string | null
          ai_summary?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          meeting_id?: string | null
          one_on_one_id?: string
          raw_transcript?: string | null
          status?: string | null
          tenant_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_transcript_logs_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_one_transcript_logs_one_on_one_id_fkey"
            columns: ["one_on_one_id"]
            isOneToOne: false
            referencedRelation: "one_on_ones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_one_transcript_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_ones: {
        Row: {
          collaborator_id: string
          created_at: string | null
          created_by: string | null
          fireflies_meeting_id: string | null
          google_event_id: string | null
          id: string
          leader_id: string
          notes: string | null
          recurrence: string | null
          ritual_type_id: string | null
          scheduled_at: string
          status: string | null
          tenant_id: string
          transcript_processed_at: string | null
          transcript_summary: string | null
          updated_at: string | null
        }
        Insert: {
          collaborator_id: string
          created_at?: string | null
          created_by?: string | null
          fireflies_meeting_id?: string | null
          google_event_id?: string | null
          id?: string
          leader_id: string
          notes?: string | null
          recurrence?: string | null
          ritual_type_id?: string | null
          scheduled_at: string
          status?: string | null
          tenant_id: string
          transcript_processed_at?: string | null
          transcript_summary?: string | null
          updated_at?: string | null
        }
        Update: {
          collaborator_id?: string
          created_at?: string | null
          created_by?: string | null
          fireflies_meeting_id?: string | null
          google_event_id?: string | null
          id?: string
          leader_id?: string
          notes?: string | null
          recurrence?: string | null
          ritual_type_id?: string | null
          scheduled_at?: string
          status?: string | null
          tenant_id?: string
          transcript_processed_at?: string | null
          transcript_summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "one_on_ones_fireflies_meeting_id_fkey"
            columns: ["fireflies_meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_ones_ritual_type_id_fkey"
            columns: ["ritual_type_id"]
            isOneToOne: false
            referencedRelation: "ritual_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_ones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_criteria: {
        Row: {
          id: string
          key: string
          label: string | null
          updated_at: string | null
          updated_by: string | null
          value: number
        }
        Insert: {
          id?: string
          key: string
          label?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: number
        }
        Update: {
          id?: string
          key?: string
          label?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: number
        }
        Relationships: []
      }
      os_custom_fields: {
        Row: {
          config_json: Json | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          name: string
          order_index: number
          project_id: string | null
          scope: string
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config_json?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          name: string
          order_index?: number
          project_id?: string | null
          scope?: string
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config_json?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
          order_index?: number
          project_id?: string | null
          scope?: string
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_custom_fields_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_custom_fields_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      os_sections: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          order_index: number
          project_id: string
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
          project_id: string
          tenant_id: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
          project_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      os_task_field_values: {
        Row: {
          created_at: string | null
          field_id: string
          id: string
          task_id: string
          tenant_id: string
          updated_at: string | null
          value_json: Json
        }
        Insert: {
          created_at?: string | null
          field_id: string
          id?: string
          task_id: string
          tenant_id: string
          updated_at?: string | null
          value_json?: Json
        }
        Update: {
          created_at?: string | null
          field_id?: string
          id?: string
          task_id?: string
          tenant_id?: string
          updated_at?: string | null
          value_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "os_task_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "os_custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_task_field_values_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "os_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_task_field_values_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      os_tasks: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          legacy_demand_id: string | null
          order_index: number
          parent_id: string | null
          priority: string | null
          project_id: string
          section_id: string | null
          start_date: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          legacy_demand_id?: string | null
          order_index?: number
          parent_id?: string | null
          priority?: string | null
          project_id: string
          section_id?: string | null
          start_date?: string | null
          status?: string
          tenant_id: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          legacy_demand_id?: string | null
          order_index?: number
          parent_id?: string | null
          priority?: string | null
          project_id?: string
          section_id?: string | null
          start_date?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "os_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_tasks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "os_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      page_blocks: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string
          id: string
          page_id: string
          parent_block_id: string | null
          position: number
          props: Json | null
          tenant_id: string
          type: string
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by: string
          id?: string
          page_id: string
          parent_block_id?: string | null
          position?: number
          props?: Json | null
          tenant_id: string
          type?: string
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string
          id?: string
          page_id?: string
          parent_block_id?: string | null
          position?: number
          props?: Json | null
          tenant_id?: string
          type?: string
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_blocks_parent_block_id_fkey"
            columns: ["parent_block_id"]
            isOneToOne: false
            referencedRelation: "page_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: Json | null
          cover_url: string | null
          created_at: string | null
          created_by: string
          has_blocks: boolean | null
          icon: string | null
          id: string
          is_deleted: boolean | null
          space_id: string
          tenant_id: string
          title: string
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          content?: Json | null
          cover_url?: string | null
          created_at?: string | null
          created_by: string
          has_blocks?: boolean | null
          icon?: string | null
          id?: string
          is_deleted?: boolean | null
          space_id: string
          tenant_id: string
          title?: string
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          content?: Json | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string
          has_blocks?: boolean | null
          icon?: string | null
          id?: string
          is_deleted?: boolean | null
          space_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: []
      }
      performance_cycles: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          name: string
          period: string | null
          start_date: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          name: string
          period?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          name?: string
          period?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_cycles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          average: number | null
          comment: string | null
          created_at: string | null
          cycle_id: string
          gaps: string[] | null
          highlights: string[] | null
          id: string
          review_type: string
          reviewer: string
          scores: Json
          status: string | null
          submitted_at: string | null
          target_user: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          average?: number | null
          comment?: string | null
          created_at?: string | null
          cycle_id: string
          gaps?: string[] | null
          highlights?: string[] | null
          id?: string
          review_type: string
          reviewer: string
          scores?: Json
          status?: string | null
          submitted_at?: string | null
          target_user: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          average?: number | null
          comment?: string | null
          created_at?: string | null
          cycle_id?: string
          gaps?: string[] | null
          highlights?: string[] | null
          id?: string
          review_type?: string
          reviewer?: string
          scores?: Json
          status?: string | null
          submitted_at?: string | null
          target_user?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "performance_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          label: string
          module: string
          sort_order: number | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          module: string
          sort_order?: number | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          module?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      person_skills: {
        Row: {
          category: string | null
          certification_expiry: string | null
          certification_name: string | null
          created_at: string | null
          id: string
          person_id: string
          proficiency_level: number | null
          skill_name: string
          tenant_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category?: string | null
          certification_expiry?: string | null
          certification_name?: string | null
          created_at?: string | null
          id?: string
          person_id: string
          proficiency_level?: number | null
          skill_name: string
          tenant_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category?: string | null
          certification_expiry?: string | null
          certification_name?: string | null
          created_at?: string | null
          id?: string
          person_id?: string
          proficiency_level?: number | null
          skill_name?: string
          tenant_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_skills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      person_tasks: {
        Row: {
          assigned_by: string | null
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          person_id: string
          priority: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          person_id: string
          priority?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          person_id?: string
          priority?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_cep: string | null
          address_city: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          avatar_url: string | null
          birth_date: string | null
          bu: string | null
          cargo: string | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          document_cnpj: string | null
          email: string | null
          exit_date: string | null
          exit_interview: Json | null
          exit_reason: string | null
          first_login_completed: boolean | null
          full_name: string
          id: string
          is_active: boolean | null
          is_coordinator: boolean | null
          manager_id: string | null
          media_avaliacao: number | null
          module_tours_completed: Json | null
          nivel_atual: string | null
          onboarding_wizard_completed: boolean | null
          phone: string | null
          proximo_nivel: string | null
          role: string
          salary_pj: number | null
          start_date: string | null
          status: string | null
          team_id: string | null
          tenant_id: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          address_cep?: string | null
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          bu?: string | null
          cargo?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          document_cnpj?: string | null
          email?: string | null
          exit_date?: string | null
          exit_interview?: Json | null
          exit_reason?: string | null
          first_login_completed?: boolean | null
          full_name: string
          id: string
          is_active?: boolean | null
          is_coordinator?: boolean | null
          manager_id?: string | null
          media_avaliacao?: number | null
          module_tours_completed?: Json | null
          nivel_atual?: string | null
          onboarding_wizard_completed?: boolean | null
          phone?: string | null
          proximo_nivel?: string | null
          role?: string
          salary_pj?: number | null
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          address_cep?: string | null
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          bu?: string | null
          cargo?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          document_cnpj?: string | null
          email?: string | null
          exit_date?: string | null
          exit_interview?: Json | null
          exit_reason?: string | null
          first_login_completed?: boolean | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_coordinator?: boolean | null
          manager_id?: string | null
          media_avaliacao?: number | null
          module_tours_completed?: Json | null
          nivel_atual?: string | null
          onboarding_wizard_completed?: boolean | null
          phone?: string | null
          proximo_nivel?: string | null
          role?: string
          salary_pj?: number | null
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_team_id"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_activity: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_type: string
          field_name: string | null
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          project_id: string
          task_id: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_type: string
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          project_id: string
          task_id?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_type?: string
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          project_id?: string
          task_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          project_id: string | null
          task_id: string | null
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          mime_type?: string
          project_id?: string | null
          task_id?: string | null
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          project_id?: string | null
          task_id?: string | null
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          task_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          task_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          task_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string | null
          google_file_id: string | null
          google_folder_id: string | null
          icon_link: string | null
          id: string
          last_modified_at: string | null
          last_modified_by: string | null
          mime_type: string | null
          name: string
          profile_id: string | null
          project_id: string | null
          size_bytes: number | null
          synced_at: string | null
          tenant_id: string
          thumbnail_link: string | null
          updated_at: string | null
          web_content_link: string | null
          web_view_link: string | null
        }
        Insert: {
          created_at?: string | null
          google_file_id?: string | null
          google_folder_id?: string | null
          icon_link?: string | null
          id?: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          mime_type?: string | null
          name: string
          profile_id?: string | null
          project_id?: string | null
          size_bytes?: number | null
          synced_at?: string | null
          tenant_id: string
          thumbnail_link?: string | null
          updated_at?: string | null
          web_content_link?: string | null
          web_view_link?: string | null
        }
        Update: {
          created_at?: string | null
          google_file_id?: string | null
          google_folder_id?: string | null
          icon_link?: string | null
          id?: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          mime_type?: string | null
          name?: string
          profile_id?: string | null
          project_id?: string | null
          size_bytes?: number | null
          synced_at?: string | null
          tenant_id?: string
          thumbnail_link?: string | null
          updated_at?: string | null
          web_content_link?: string | null
          web_view_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_memberships: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          project_id: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          project_id: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          project_id?: string
          role_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_memberships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bus: string[] | null
          client: string | null
          client_company: string | null
          code: string | null
          construtora: string | null
          created_at: string | null
          due_date_end: string | null
          due_date_start: string | null
          google_folder_id: string | null
          id: string
          name: string
          notes: string | null
          notion_page_id: string | null
          notion_url: string | null
          owner_id: string | null
          owner_name: string | null
          priority: string | null
          proposal_id: string | null
          services: string[] | null
          source: string | null
          status: string
          tenant_id: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          bus?: string[] | null
          client?: string | null
          client_company?: string | null
          code?: string | null
          construtora?: string | null
          created_at?: string | null
          due_date_end?: string | null
          due_date_start?: string | null
          google_folder_id?: string | null
          id?: string
          name: string
          notes?: string | null
          notion_page_id?: string | null
          notion_url?: string | null
          owner_id?: string | null
          owner_name?: string | null
          priority?: string | null
          proposal_id?: string | null
          services?: string[] | null
          source?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          bus?: string[] | null
          client?: string | null
          client_company?: string | null
          code?: string | null
          construtora?: string | null
          created_at?: string | null
          due_date_end?: string | null
          due_date_start?: string | null
          google_folder_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          notion_page_id?: string | null
          notion_url?: string | null
          owner_id?: string | null
          owner_name?: string | null
          priority?: string | null
          proposal_id?: string | null
          services?: string[] | null
          source?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          client: string | null
          company: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          id: string
          legacy_id: string | null
          name: string
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          priority: string | null
          services: string[] | null
          status: string
          tenant_id: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          client?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          id?: string
          legacy_id?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          priority?: string | null
          services?: string[] | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          client?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          id?: string
          legacy_id?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          priority?: string | null
          services?: string[] | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recognition_redemptions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          points_spent: number
          redeemed_at: string | null
          reward_id: string
          status: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          points_spent: number
          redeemed_at?: string | null
          reward_id: string
          status?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          points_spent?: number
          redeemed_at?: string | null
          reward_id?: string
          status?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recognition_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "recognition_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recognition_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recognition_rewards: {
        Row: {
          active: boolean | null
          budget_quarter: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          points_required: number
          tenant_id: string
          type: string | null
          updated_at: string | null
          value_brl: number | null
        }
        Insert: {
          active?: boolean | null
          budget_quarter?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          points_required?: number
          tenant_id: string
          type?: string | null
          updated_at?: string | null
          value_brl?: number | null
        }
        Update: {
          active?: boolean | null
          budget_quarter?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points_required?: number
          tenant_id?: string
          type?: string | null
          updated_at?: string | null
          value_brl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recognition_rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recognitions: {
        Row: {
          created_at: string | null
          detection_context: string | null
          from_user: string
          id: string
          likes: number | null
          meeting_id: string | null
          message: string
          points: number | null
          reviewed: boolean | null
          source: string | null
          tenant_id: string
          to_user: string
          value_emoji: string | null
          value_id: string
          value_name: string | null
        }
        Insert: {
          created_at?: string | null
          detection_context?: string | null
          from_user: string
          id?: string
          likes?: number | null
          meeting_id?: string | null
          message: string
          points?: number | null
          reviewed?: boolean | null
          source?: string | null
          tenant_id: string
          to_user: string
          value_emoji?: string | null
          value_id: string
          value_name?: string | null
        }
        Update: {
          created_at?: string | null
          detection_context?: string | null
          from_user?: string
          id?: string
          likes?: number | null
          meeting_id?: string | null
          message?: string
          points?: number | null
          reviewed?: boolean | null
          source?: string | null
          tenant_id?: string
          to_user?: string
          value_emoji?: string | null
          value_id?: string
          value_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recognitions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recognitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliation_audit: {
        Row: {
          action: string
          bank_transaction_id: string | null
          confidence: number | null
          created_at: string | null
          fin_transaction_id: string | null
          id: string
          matched_by: string | null
          notes: string | null
          rule_id: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          bank_transaction_id?: string | null
          confidence?: number | null
          created_at?: string | null
          fin_transaction_id?: string | null
          id?: string
          matched_by?: string | null
          notes?: string | null
          rule_id?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          bank_transaction_id?: string | null
          confidence?: number | null
          created_at?: string | null
          fin_transaction_id?: string | null
          id?: string
          matched_by?: string | null
          notes?: string | null
          rule_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_audit_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_audit_fin_transaction_id_fkey"
            columns: ["fin_transaction_id"]
            isOneToOne: false
            referencedRelation: "fin_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_audit_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "reconciliation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_audit_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliation_rules: {
        Row: {
          auto_match: boolean | null
          category_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          match_field: string
          name: string
          pattern: string
          priority: number | null
          tenant_id: string
          vendor_id: string | null
        }
        Insert: {
          auto_match?: boolean | null
          category_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          match_field: string
          name: string
          pattern: string
          priority?: number | null
          tenant_id: string
          vendor_id?: string | null
        }
        Update: {
          auto_match?: boolean | null
          category_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          match_field?: string
          name?: string
          pattern?: string
          priority?: number | null
          tenant_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_rules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fin_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_rules_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "fin_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      report_runs: {
        Row: {
          completed_at: string | null
          content: Json | null
          created_at: string | null
          error: string | null
          generated_at: string | null
          html_content: string | null
          id: string
          metadata: Json | null
          schedule_id: string | null
          status: string
          tenant_id: string
          type: string
        }
        Insert: {
          completed_at?: string | null
          content?: Json | null
          created_at?: string | null
          error?: string | null
          generated_at?: string | null
          html_content?: string | null
          id?: string
          metadata?: Json | null
          schedule_id?: string | null
          status?: string
          tenant_id: string
          type: string
        }
        Update: {
          completed_at?: string | null
          content?: Json | null
          created_at?: string | null
          error?: string | null
          generated_at?: string | null
          html_content?: string | null
          id?: string
          metadata?: Json | null
          schedule_id?: string | null
          status?: string
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_runs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "report_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          cron: string
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          recipients: Json | null
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          cron?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          recipients?: Json | null
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          cron?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          recipients?: Json | null
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reportei_sync_runs: {
        Row: {
          accounts_synced: number | null
          details: Json | null
          error_message: string | null
          finished_at: string | null
          id: string
          metrics_upserted: number | null
          posts_upserted: number | null
          started_at: string
          status: string
          tenant_id: string
        }
        Insert: {
          accounts_synced?: number | null
          details?: Json | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          metrics_upserted?: number | null
          posts_upserted?: number | null
          started_at?: string
          status?: string
          tenant_id: string
        }
        Update: {
          accounts_synced?: number | null
          details?: Json | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          metrics_upserted?: number | null
          posts_upserted?: number | null
          started_at?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reportei_sync_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ritual_types: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          default_agenda: string | null
          default_participants: string[] | null
          description: string | null
          duration_minutes: number | null
          frequency: string
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          slug: string
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_agenda?: string | null
          default_participants?: string[] | null
          description?: string | null
          duration_minutes?: number | null
          frequency: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_agenda?: string | null
          default_participants?: string[] | null
          description?: string | null
          duration_minutes?: number | null
          frequency?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ritual_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_export: boolean | null
          can_view: boolean | null
          created_at: string | null
          granted: boolean | null
          id: string
          module: string
          permission_id: string | null
          role_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          granted?: boolean | null
          id?: string
          module: string
          permission_id?: string | null
          role_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          granted?: boolean | null
          id?: string
          module?: string
          permission_id?: string | null
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          label: string | null
          name: string
          slug: string
          sort_order: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          label?: string | null
          name: string
          slug: string
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          label?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rsm_accounts: {
        Row: {
          client_id: string | null
          created_at: string | null
          followers_count: number | null
          handle: string
          id: string
          is_active: boolean | null
          platform: string
          platform_id: string | null
          profile_url: string | null
          reportei_account_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          followers_count?: number | null
          handle: string
          id?: string
          is_active?: boolean | null
          platform: string
          platform_id?: string | null
          profile_url?: string | null
          reportei_account_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          followers_count?: number | null
          handle?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          platform_id?: string | null
          profile_url?: string | null
          reportei_account_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsm_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rsm_ideas: {
        Row: {
          assigned_to: string | null
          category: string
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          status: string
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsm_ideas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rsm_metrics: {
        Row: {
          account_id: string
          clicks: number | null
          created_at: string | null
          date: string
          engagement_rate: number | null
          followers: number | null
          following: number | null
          id: string
          impressions: number | null
          metadata: Json | null
          posts_count: number | null
          profile_views: number | null
          reach: number | null
          saves: number | null
          source: string
          tenant_id: string
        }
        Insert: {
          account_id: string
          clicks?: number | null
          created_at?: string | null
          date: string
          engagement_rate?: number | null
          followers?: number | null
          following?: number | null
          id?: string
          impressions?: number | null
          metadata?: Json | null
          posts_count?: number | null
          profile_views?: number | null
          reach?: number | null
          saves?: number | null
          source?: string
          tenant_id: string
        }
        Update: {
          account_id?: string
          clicks?: number | null
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          followers?: number | null
          following?: number | null
          id?: string
          impressions?: number | null
          metadata?: Json | null
          posts_count?: number | null
          profile_views?: number | null
          reach?: number | null
          saves?: number | null
          source?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsm_metrics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "rsm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsm_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rsm_posts: {
        Row: {
          account_id: string
          content: string | null
          created_at: string | null
          created_by: string | null
          external_post_id: string | null
          id: string
          media_urls: Json | null
          metrics: Json | null
          published_date: string | null
          scheduled_date: string | null
          source: string
          status: string
          tags: Json | null
          tenant_id: string
          title: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          external_post_id?: string | null
          id?: string
          media_urls?: Json | null
          metrics?: Json | null
          published_date?: string | null
          scheduled_date?: string | null
          source?: string
          status?: string
          tags?: Json | null
          tenant_id: string
          title?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          external_post_id?: string | null
          id?: string
          media_urls?: Json | null
          metrics?: Json | null
          published_date?: string | null
          scheduled_date?: string | null
          source?: string
          status?: string
          tags?: Json | null
          tenant_id?: string
          title?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsm_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "rsm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsm_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sidebar_items: {
        Row: {
          allowed_roles: string[] | null
          archived_at: string | null
          archived_by: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          icon: string | null
          icon_type: string | null
          icon_url: string | null
          icon_value: string | null
          id: string
          is_expanded: boolean | null
          is_visible: boolean | null
          metadata: Json | null
          name: string
          order_index: number
          parent_id: string | null
          route: string | null
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          allowed_roles?: string[] | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon?: string | null
          icon_type?: string | null
          icon_url?: string | null
          icon_value?: string | null
          id?: string
          is_expanded?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          name: string
          order_index: number
          parent_id?: string | null
          route?: string | null
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          allowed_roles?: string[] | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          icon?: string | null
          icon_type?: string | null
          icon_url?: string | null
          icon_value?: string | null
          id?: string
          is_expanded?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          name?: string
          order_index?: number
          parent_id?: string | null
          route?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sidebar_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sidebar_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sidebar_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sidebar_user_state: {
        Row: {
          created_at: string | null
          id: string
          is_expanded: boolean | null
          is_pinned: boolean | null
          item_id: string
          last_accessed: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_expanded?: boolean | null
          is_pinned?: boolean | null
          item_id: string
          last_accessed?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_expanded?: boolean | null
          is_pinned?: boolean | null
          item_id?: string
          last_accessed?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sidebar_user_state_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "sidebar_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sidebar_user_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      space_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          role: string
          space_id: string
          status: string
          tenant_id: string
          token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          role?: string
          space_id: string
          status?: string
          tenant_id: string
          token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: string
          space_id?: string
          status?: string
          tenant_id?: string
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_invitations_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "sidebar_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      space_members: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string
          space_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          space_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          space_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "sidebar_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          direction: string | null
          entity_type: string | null
          error_details: Json | null
          id: string
          provider: string
          records_created: number | null
          records_errors: number | null
          records_fetched: number | null
          records_updated: number | null
          started_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          direction?: string | null
          entity_type?: string | null
          error_details?: Json | null
          id?: string
          provider: string
          records_created?: number | null
          records_errors?: number | null
          records_fetched?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          direction?: string | null
          entity_type?: string | null
          error_details?: Json | null
          id?: string
          provider?: string
          records_created?: number | null
          records_errors?: number | null
          records_fetched?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          city: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          portfolio_url: string | null
          seniority: string | null
          source: string | null
          specialty: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          seniority?: string | null
          source?: string | null
          specialty?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          seniority?: string | null
          source?: string | null
          specialty?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignees: {
        Row: {
          created_at: string
          id: string
          role: string | null
          task_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string | null
          task_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
          task_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          created_by: string | null
          decision_id: string | null
          description: string | null
          due_date: string | null
          estimate_minutes: number | null
          id: string
          legacy_id: string | null
          owner_id: string | null
          owner_name: string | null
          phase: string | null
          priority: string | null
          project_id: string | null
          project_name: string | null
          sort_order: number | null
          source: string | null
          status: string
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          decision_id?: string | null
          description?: string | null
          due_date?: string | null
          estimate_minutes?: number | null
          id?: string
          legacy_id?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phase?: string | null
          priority?: string | null
          project_id?: string | null
          project_name?: string | null
          sort_order?: number | null
          source?: string | null
          status?: string
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          decision_id?: string | null
          description?: string | null
          due_date?: string | null
          estimate_minutes?: number | null
          id?: string
          legacy_id?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phase?: string | null
          priority?: string | null
          project_id?: string | null
          project_name?: string | null
          sort_order?: number | null
          source?: string | null
          status?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          manager_user_id: string | null
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          manager_user_id?: string | null
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          manager_user_id?: string | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          role_id: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role_id?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role_id?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          billable: boolean | null
          created_at: string | null
          date: string
          description: string | null
          duration_minutes: number
          end_time: string | null
          id: string
          legacy_id: string | null
          project_id: string | null
          project_name: string | null
          source: string | null
          start_time: string | null
          task_id: string | null
          task_name: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          billable?: boolean | null
          created_at?: string | null
          date: string
          description?: string | null
          duration_minutes?: number
          end_time?: string | null
          id?: string
          legacy_id?: string | null
          project_id?: string | null
          project_name?: string | null
          source?: string | null
          start_time?: string | null
          task_id?: string | null
          task_name?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          billable?: boolean | null
          created_at?: string | null
          date?: string
          description?: string | null
          duration_minutes?: number
          end_time?: string | null
          id?: string
          legacy_id?: string | null
          project_id?: string | null
          project_name?: string | null
          source?: string | null
          start_time?: string | null
          task_id?: string | null
          task_name?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recent_icons: {
        Row: {
          icon_type: string
          icon_value: string
          id: string
          tenant_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          icon_type: string
          icon_value: string
          id?: string
          tenant_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          icon_type?: string
          icon_value?: string
          id?: string
          tenant_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recent_icons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancies: {
        Row: {
          area: string | null
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          notes: string | null
          opened_at: string | null
          priority: string | null
          requirements: string | null
          responsible_id: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          priority?: string | null
          requirements?: string | null
          responsible_id?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          priority?: string | null
          requirements?: string | null
          responsible_id?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancy_candidates: {
        Row: {
          id: string
          linked_at: string | null
          linked_by: string | null
          notes: string | null
          stage: string | null
          talent_id: string
          tenant_id: string
          vacancy_id: string
        }
        Insert: {
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          notes?: string | null
          stage?: string | null
          talent_id: string
          tenant_id: string
          vacancy_id: string
        }
        Update: {
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          notes?: string | null
          stage?: string | null
          talent_id?: string
          tenant_id?: string
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacancy_candidates_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacancy_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacancy_candidates_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_team: {
        Row: {
          avatar_url: string | null
          bu: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_coordinator: boolean | null
          role: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bu?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_coordinator?: boolean | null
          role?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bu?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_coordinator?: boolean | null
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
      v_weekly_financial_summary: {
        Row: {
          deals_em_pipeline: number | null
          deals_ganhos_semana: number | null
          deals_perdidos_semana: number | null
          valor_ganho_semana: number | null
          valor_pipeline: number | null
          valor_ponderado_pipeline: number | null
        }
        Relationships: []
      }
      vw_colaboradores_inativos: {
        Row: {
          buddy_email: string | null
          buddy_id: string | null
          buddy_nome: string | null
          cargo: string | null
          colaborador_id: string | null
          dias_sem_atividade: number | null
          email: string | null
          nome: string | null
          tipo_onboarding: string | null
          ultima_atividade_em: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      vw_progresso_onboarding: {
        Row: {
          atividades_concluidas: number | null
          buddy_id: string | null
          buddy_nome: string | null
          cargo: string | null
          colaborador_id: string | null
          data_inicio: string | null
          dias_concluidos: number | null
          email: string | null
          nome: string | null
          percentual_conclusao: number | null
          status: string | null
          tipo_onboarding: string | null
          total_atividades: number | null
          total_dias: number | null
          ultima_atividade: string | null
          ultima_atividade_em: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_inativos"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "colaboradores_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "vw_progresso_onboarding"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
    }
    Functions: {
      check_module_access: {
        Args: { p_module: string; p_user_id: string }
        Returns: boolean
      }
      check_permission: {
        Args: { p_action: string; p_module: string; p_user_id: string }
        Returns: boolean
      }
      get_all_roles_with_permissions: {
        Args: { p_tenant_id: string }
        Returns: {
          is_system: boolean
          permissions: Json
          role_color: string
          role_id: string
          role_label: string
          role_name: string
          role_slug: string
          role_sort_order: number
        }[]
      }
      get_colaborador_id: { Args: never; Returns: string }
      get_perfil_acesso: { Args: never; Returns: string }
      get_session_context: { Args: { p_tenant_id?: string }; Returns: Json }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          action: string
          granted: boolean
          module: string
        }[]
      }
      get_user_role_in_tenant:
        | { Args: { p_tenant_id: string }; Returns: string }
        | {
            Args: { p_tenant_id: string; p_user_id: string }
            Returns: {
              permissions: Json
              role_label: string
              role_name: string
            }[]
          }
      get_user_tenant_ids: { Args: never; Returns: string[] }
      is_founder_or_admin: { Args: never; Returns: boolean }
      is_month_locked: { Args: { check_date: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
