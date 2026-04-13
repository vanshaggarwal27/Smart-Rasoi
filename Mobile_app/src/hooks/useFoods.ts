import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Food {
  id: string;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  is_veg: boolean;
  price?: number;
  source: "user" | "preset" | "barcode";
  barcode?: string | null;
  user_id?: string | null;
}

export const useFoods = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const foodsQuery = useQuery({
    queryKey: ["foods", user?.id],
    enabled: true,
    queryFn: async () => {
      // Fetch user-defined foods
      let userFoodsQuery = (supabase.from("foods" as any) as any).select("*");
      if (user) {
        userFoodsQuery = userFoodsQuery.eq("user_id", user.id);
      } else {
        // Just empty if no user for private foods
        userFoodsQuery = userFoodsQuery.eq("id", "none");
      }

      // Fetch official cafeteria items
      const { data: cafData, error: cafError } = await supabase
        .from("food_items")
        .select("*");

      const { data: userData, error: userError } = await userFoodsQuery.order("name");

      if (cafError) console.error("Error fetching cafeteria items:", cafError);
      if (userError) throw userError;

      // Transform cafeteria items to match Food interface
      const translatedCaf: Food[] = (cafData || []).map(item => ({
        id: item.food_id.toString(),
        name: item.name,
        serving_size: 1,
        serving_unit: "pc",
        calories: Number(item.calories),
        protein: Number(item.protein),
        carbs: Number(item.carbs),
        fats: Number(item.fats),
        category: item.category,
        is_veg: true, // Assuming mostly veg for NMIMS or adding a check
        price: item.price,
        source: "preset",
        image_url: item.image_url
      }));

      // Transform user items
      const translatedUser: Food[] = (userData || []).map(item => ({
        ...item,
        calories: Number(item.calories),
        protein: Number(item.protein),
        carbs: Number(item.carbs),
        fats: Number(item.fats),
        source: item.source || "user"
      }));

      return [...translatedCaf, ...translatedUser];
    },
  });

  const addFood = useMutation({
    mutationFn: async (food: {
      name: string; serving_size: number; serving_unit: string;
      calories: number; protein: number; carbs: number; fats: number;
      category: string; is_veg: boolean; source?: string; barcode?: string;
    }) => {
      const { data, error } = await supabase.from("foods").insert({
        ...food,
        source: food.source || "user",
        user_id: user!.id,
      }).select().single();
      if (error) throw error;
      return data as unknown as Food;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["foods"] }),
  });

  const updateFood = useMutation({
    mutationFn: async ({ id, ...food }: {
      id: string; name: string; serving_size: number; serving_unit: string;
      calories: number; protein: number; carbs: number; fats: number;
      category: string; is_veg: boolean;
    }) => {
      const { data, error } = await supabase
        .from("foods")
        .update(food)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Food;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["foods"] }),
  });

  const deleteFood = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("foods" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["foods"] }),
  });

  return { foods: foodsQuery.data || [], isLoading: foodsQuery.isLoading, addFood, updateFood, deleteFood };
};
