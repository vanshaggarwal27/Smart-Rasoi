import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const VALID_SUPABASE_KEYS = [
  "calorie_target", "carb_target", "fat_target", "protein_target", 
  "nut3lla_tips_enabled", "tutorial_completed", "supplements", "theme", "notification_time"
];

export interface Supplement {
  id: string;
  name: string;
  enabled: boolean;
}

const GUEST_SETTINGS_KEY = "fitnutt_portal_settings";

const INITIAL_GUEST_SETTINGS = {
  calorie_target: 2000,
  protein_target: 150,
  carb_target: 200,
  fat_target: 65,
  theme: "dark",
  nut3lla_tips_enabled: true,
  meal_reminders_enabled: false,
  supp_reminders_enabled: true,
  tutorial_completed: false,
  total_xp: 0,
  supplements: []
};

export const useSettings = () => {
  const { user, isGuest } = useAuth();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["user_settings", user?.id || "guest"],
    enabled: true,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes
    queryFn: async () => {
      if (isGuest) {
        const local = localStorage.getItem(GUEST_SETTINGS_KEY);
        return local ? JSON.parse(local) : INITIAL_GUEST_SETTINGS;
      }

      if (!user) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      
      const localProfileStr = localStorage.getItem(`profile_${user.id}`);
      const localProfile = localProfileStr ? JSON.parse(localProfileStr) : {};

      return { ...data, ...localProfile };
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: any) => {
      if (isGuest) {
        const current = settingsQuery.data || INITIAL_GUEST_SETTINGS;
        const newSettings = { ...current, ...updates };
        localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(newSettings));
        return newSettings;
      }

      const supabaseUpdates: any = {};
      const localUpdates: any = {};
      
      Object.keys(updates).forEach((key) => {
        if (VALID_SUPABASE_KEYS.includes(key)) {
          supabaseUpdates[key] = updates[key];
        } else {
          localUpdates[key] = updates[key];
        }
      });

      if (Object.keys(supabaseUpdates).length > 0) {
        const { error } = await supabase
          .from("user_settings")
          .update(supabaseUpdates)
          .eq("user_id", user!.id);
        if (error) throw error;
      }

      if (Object.keys(localUpdates).length > 0) {
        const currentLocalStr = localStorage.getItem(`profile_${user!.id}`);
        const currentLocal = currentLocalStr ? JSON.parse(currentLocalStr) : {};
        localStorage.setItem(`profile_${user!.id}`, JSON.stringify({ ...currentLocal, ...localUpdates }));
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user_settings"] }),
  });

  const addXP = useMutation({
    mutationFn: async (amount: number) => {
      const currentXp = (settingsQuery.data as any)?.total_xp || 0;
      const newTotal = Math.max(0, currentXp + amount);
      if (newTotal === currentXp && amount !== 0) return;

      if (isGuest) {
        const current = settingsQuery.data || INITIAL_GUEST_SETTINGS;
        const newSettings = { ...current, total_xp: newTotal };
        localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(newSettings));
        return;
      }

      const { error } = await supabase
        .from("user_settings")
        .update({ total_xp: newTotal } as any)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_settings"] });
      queryClient.invalidateQueries({ queryKey: ["recent_logs_streak"] });
    },
  });

  return { settings: settingsQuery.data, isLoading: settingsQuery.isLoading, updateSettings, addXP };
};
