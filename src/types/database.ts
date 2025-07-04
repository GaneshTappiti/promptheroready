// =====================================================
// DATABASE TYPES FOR PROMPTHEROREADY
// =====================================================
// This file contains TypeScript type definitions for your Supabase database
// Generate the actual types using: supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json
          is_system_role: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json
          is_system_role?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json
          is_system_role?: boolean
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          first_name: string | null
          last_name: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          company: string | null
          role: string
          is_active: boolean
          timezone: string
          preferences: Json
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          company?: string | null
          role?: string
          is_active?: boolean
          timezone?: string
          preferences?: Json
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          company?: string | null
          role?: string
          is_active?: boolean
          timezone?: string
          preferences?: Json
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          category: string | null
          tags: string[] | null
          user_id: string
          validation_score: number | null
          market_opportunity: string | null
          risk_assessment: string | null
          monetization_strategy: string | null
          key_features: string[] | null
          next_steps: string[] | null
          competitor_analysis: string | null
          target_market: string | null
          problem_statement: string | null
          progress: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          category?: string | null
          tags?: string[] | null
          user_id: string
          validation_score?: number | null
          market_opportunity?: string | null
          risk_assessment?: string | null
          monetization_strategy?: string | null
          key_features?: string[] | null
          next_steps?: string[] | null
          competitor_analysis?: string | null
          target_market?: string | null
          problem_statement?: string | null
          progress?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          category?: string | null
          tags?: string[] | null
          user_id?: string
          validation_score?: number | null
          market_opportunity?: string | null
          risk_assessment?: string | null
          monetization_strategy?: string | null
          key_features?: string[] | null
          next_steps?: string[] | null
          competitor_analysis?: string | null
          target_market?: string | null
          problem_statement?: string | null
          progress?: Json
          created_at?: string
          updated_at?: string
        }
      }
      mvps: {
        Row: {
          id: string
          idea_id: string | null
          name: string
          description: string | null
          status: string
          app_type: string | null
          tech_stack: string[] | null
          features: string[] | null
          pages: Json
          framework_prompt: string | null
          ui_prompts: Json
          linking_prompt: string | null
          recommended_tools: Json
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id?: string | null
          name: string
          description?: string | null
          status?: string
          app_type?: string | null
          tech_stack?: string[] | null
          features?: string[] | null
          pages?: Json
          framework_prompt?: string | null
          ui_prompts?: Json
          linking_prompt?: string | null
          recommended_tools?: Json
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string | null
          name?: string
          description?: string | null
          status?: string
          app_type?: string | null
          tech_stack?: string[] | null
          features?: string[] | null
          pages?: Json
          framework_prompt?: string | null
          ui_prompts?: Json
          linking_prompt?: string | null
          recommended_tools?: Json
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          content: string | null
          document_type: string
          format: string
          status: string
          template_id: string | null
          idea_id: string | null
          user_id: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          document_type: string
          format?: string
          status?: string
          template_id?: string | null
          idea_id?: string | null
          user_id: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          document_type?: string
          format?: string
          status?: string
          template_id?: string | null
          idea_id?: string | null
          user_id?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      team_messages: {
        Row: {
          id: number
          sender_id: string
          sender_name: string
          content: string
          avatar: string | null
          country: string | null
          is_authenticated: boolean
          team_id: string
          is_system_message: boolean
          created_at: string
        }
        Insert: {
          id?: number
          sender_id: string
          sender_name: string
          content: string
          avatar?: string | null
          country?: string | null
          is_authenticated?: boolean
          team_id?: string
          is_system_message?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          sender_id?: string
          sender_name?: string
          content?: string
          avatar?: string | null
          country?: string | null
          is_authenticated?: boolean
          team_id?: string
          is_system_message?: boolean
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string | null
          user_id: string
          title: string
          description: string | null
          status: string
          priority: string | null
          due_date: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string | null
          due_date?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string | null
          due_date?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wiki_pages: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_tools: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          subcategory: string | null
          website_url: string | null
          pricing_model: string | null
          price_inr: number | null
          price_usd: number | null
          platforms: string[] | null
          features: string[] | null
          best_for: string[] | null
          popularity_score: number
          is_recommended: boolean
          logo_url: string | null
          screenshots: string[] | null
          tags: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          subcategory?: string | null
          website_url?: string | null
          pricing_model?: string | null
          price_inr?: number | null
          price_usd?: number | null
          platforms?: string[] | null
          features?: string[] | null
          best_for?: string[] | null
          popularity_score?: number
          is_recommended?: boolean
          logo_url?: string | null
          screenshots?: string[] | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          website_url?: string | null
          pricing_model?: string | null
          price_inr?: number | null
          price_usd?: number | null
          platforms?: string[] | null
          features?: string[] | null
          best_for?: string[] | null
          popularity_score?: number
          is_recommended?: boolean
          logo_url?: string | null
          screenshots?: string[] | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      document_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          document_type: string
          template_content: string
          variables: Json
          is_public: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          document_type: string
          template_content: string
          variables?: Json
          is_public?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          document_type?: string
          template_content?: string
          variables?: Json
          is_public?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      feedback_items: {
        Row: {
          id: string
          idea_id: string
          source: string
          content: string
          sentiment: string | null
          priority: string
          status: string
          tags: string[] | null
          metadata: Json
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          source: string
          content: string
          sentiment?: string | null
          priority?: string
          status?: string
          tags?: string[] | null
          metadata?: Json
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          source?: string
          content?: string
          sentiment?: string | null
          priority?: string
          status?: string
          tags?: string[] | null
          metadata?: Json
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }

      journey_entries: {
        Row: {
          id: string
          idea_id: string
          title: string
          content: string | null
          entry_type: string
          mood: string | null
          tags: string[] | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          title: string
          content?: string | null
          entry_type?: string
          mood?: string | null
          tags?: string[] | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          title?: string
          content?: string | null
          entry_type?: string
          mood?: string | null
          tags?: string[] | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          username: string
          text: string
          country: string | null
          is_authenticated: boolean
          timestamp: string
        }
        Insert: {
          id?: number
          username: string
          text: string
          country?: string | null
          is_authenticated?: boolean
          timestamp?: string
        }
        Update: {
          id?: number
          username?: string
          text?: string
          country?: string | null
          is_authenticated?: boolean
          timestamp?: string
        }
      }

      prompt_history: {
        Row: {
          id: string
          user_id: string
          prompt: string
          response: string | null
          provider: string
          model: string | null
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          response?: string | null
          provider: string
          model?: string | null
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          response?: string | null
          provider?: string
          model?: string | null
          tokens_used?: number | null
          created_at?: string
        }
      }
      user_onboarding_profiles: {
        Row: {
          id: string
          user_id: string
          user_type: string
          building_goal: string | null
          experience_level: string | null
          ai_provider: string | null
          ai_configured: boolean
          ui_style: string
          theme: string
          output_format: string
          discovery_source: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_type: string
          building_goal?: string | null
          experience_level?: string | null
          ai_provider?: string | null
          ai_configured?: boolean
          ui_style?: string
          theme?: string
          output_format?: string
          discovery_source?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_type?: string
          building_goal?: string | null
          experience_level?: string | null
          ai_provider?: string | null
          ai_configured?: boolean
          ui_style?: string
          theme?: string
          output_format?: string
          discovery_source?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_ai_preferences: {
        Row: {
          id: string
          user_id: string
          provider: string
          api_key_encrypted: string | null
          model_name: string | null
          custom_endpoint: string | null
          temperature: number
          max_tokens: number
          provider_settings: Json
          connection_status: string
          last_error: string | null
          last_test_at: string | null
          total_requests: number
          total_tokens_used: number
          last_used_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          api_key_encrypted?: string | null
          model_name?: string | null
          custom_endpoint?: string | null
          temperature?: number
          max_tokens?: number
          provider_settings?: Json
          connection_status?: string
          last_error?: string | null
          last_test_at?: string | null
          total_requests?: number
          total_tokens_used?: number
          last_used_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          api_key_encrypted?: string | null
          model_name?: string | null
          custom_endpoint?: string | null
          temperature?: number
          max_tokens?: number
          provider_settings?: Json
          connection_status?: string
          last_error?: string | null
          last_test_at?: string | null
          total_requests?: number
          total_tokens_used?: number
          last_used_at?: string | null
          is_active?: boolean
          model_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      team_tasks: {
        Row: {
          id: string
          team_id: string
          title: string
          description: string | null
          status: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          title: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          title?: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string
          use_case: string
          output_type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          tags: string
          use_case: string
          output_type: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          tags?: string
          use_case?: string
          output_type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Missing tables that are referenced in database helpers
      investors: {
        Row: {
          id: string
          name: string
          email: string | null
          company: string | null
          focus: string | null
          stage: string | null
          check_size: string | null
          location: string | null
          website: string | null
          linkedin: string | null
          bio: string | null
          status: string
          contact_history: Json
          notes: string | null
          tags: string[] | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          company?: string | null
          focus?: string | null
          stage?: string | null
          check_size?: string | null
          location?: string | null
          website?: string | null
          linkedin?: string | null
          bio?: string | null
          status?: string
          contact_history?: Json
          notes?: string | null
          tags?: string[] | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          company?: string | null
          focus?: string | null
          stage?: string | null
          check_size?: string | null
          location?: string | null
          website?: string | null
          linkedin?: string | null
          bio?: string | null
          status?: string
          contact_history?: Json
          notes?: string | null
          tags?: string[] | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      funding_rounds: {
        Row: {
          id: string
          name: string
          round_type: string
          target_amount: number
          raised_amount: number
          valuation: number | null
          status: string
          start_date: string | null
          target_close_date: string | null
          actual_close_date: string | null
          description: string | null
          pitch_deck_url: string | null
          data_room_url: string | null
          terms: Json
          investors: string[] | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          round_type: string
          target_amount: number
          raised_amount?: number
          valuation?: number | null
          status?: string
          start_date?: string | null
          target_close_date?: string | null
          actual_close_date?: string | null
          description?: string | null
          pitch_deck_url?: string | null
          data_room_url?: string | null
          terms?: Json
          investors?: string[] | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          round_type?: string
          target_amount?: number
          raised_amount?: number
          valuation?: number | null
          status?: string
          start_date?: string | null
          target_close_date?: string | null
          actual_close_date?: string | null
          description?: string | null
          pitch_deck_url?: string | null
          data_room_url?: string | null
          terms?: Json
          investors?: string[] | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      pitch_scripts: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string
          script_type: string
          duration_minutes: number | null
          target_audience: string | null
          key_points: string[] | null
          call_to_action: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: string
          script_type?: string
          duration_minutes?: number | null
          target_audience?: string | null
          key_points?: string[] | null
          call_to_action?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string
          script_type?: string
          duration_minutes?: number | null
          target_audience?: string | null
          key_points?: string[] | null
          call_to_action?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      pitch_decks: {
        Row: {
          id: string
          title: string
          description: string | null
          slides: Json
          template_id: string | null
          presentation_type: string
          slide_count: number
          duration_minutes: number | null
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slides?: Json
          template_id?: string | null
          presentation_type?: string
          slide_count?: number
          duration_minutes?: number | null
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slides?: Json
          template_id?: string | null
          presentation_type?: string
          slide_count?: number
          duration_minutes?: number | null
          notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      pitch_videos: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          duration_seconds: number | null
          video_type: string
          quality: string
          file_size_mb: number | null
          transcript: string | null
          is_public: boolean
          view_count: number
          like_count: number
          idea_id: string | null
          user_id: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          video_type?: string
          quality?: string
          file_size_mb?: number | null
          transcript?: string | null
          is_public?: boolean
          view_count?: number
          like_count?: number
          idea_id?: string | null
          user_id: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          video_type?: string
          quality?: string
          file_size_mb?: number | null
          transcript?: string | null
          is_public?: boolean
          view_count?: number
          like_count?: number
          idea_id?: string | null
          user_id?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      project_phases: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          duration: string | null
          order_index: number
          progress: number
          status: string
          start_date: string | null
          end_date: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          duration?: string | null
          order_index?: number
          progress?: number
          status?: string
          start_date?: string | null
          end_date?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          duration?: string | null
          order_index?: number
          progress?: number
          status?: string
          start_date?: string | null
          end_date?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      system_announcements: {
        Row: {
          id: string
          title: string
          content: string
          announcement_type: string
          priority: string
          target_audience: string
          is_active: boolean
          show_until: string | null
          created_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          announcement_type?: string
          priority?: string
          target_audience?: string
          is_active?: boolean
          show_until?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          announcement_type?: string
          priority?: string
          target_audience?: string
          is_active?: boolean
          show_until?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      phase_tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          phase_id: string
          task_order: number | null
          status: string
          assigned_to: string | null
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          dependencies: string[]
          deliverables: string[]
          completed_at: string | null
          created_by: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          phase_id: string
          task_order?: number | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          dependencies?: string[]
          deliverables?: string[]
          completed_at?: string | null
          created_by: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          phase_id?: string
          task_order?: number | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          dependencies?: string[]
          deliverables?: string[]
          completed_at?: string | null
          created_by?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ai_provider_usage: {
        Row: {
          id: string
          user_id: string
          provider: string
          model: string | null
          tokens_input: number
          tokens_output: number
          cost_usd: number
          request_type: string | null
          success: boolean
          error_message: string | null
          response_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          model?: string | null
          tokens_input?: number
          tokens_output?: number
          cost_usd?: number
          request_type?: string | null
          success?: boolean
          error_message?: string | null
          response_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          model?: string | null
          tokens_input?: number
          tokens_output?: number
          cost_usd?: number
          request_type?: string | null
          success?: boolean
          error_message?: string | null
          response_time_ms?: number | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          notification_type: string
          category: string | null
          is_read: boolean
          action_url: string | null
          action_text: string | null
          expires_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          notification_type?: string
          category?: string | null
          is_read?: boolean
          action_url?: string | null
          action_text?: string | null
          expires_at?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: string
          category?: string | null
          is_read?: boolean
          action_url?: string | null
          action_text?: string | null
          expires_at?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
