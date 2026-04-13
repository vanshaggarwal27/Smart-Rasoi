import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

import { useFoods, Food } from "@/hooks/useFoods";
import { useSettings } from "@/hooks/useSettings";
import { generateMealPlan, UserProfile, MenuItem as MealMenuItem, MenuItem, MealPlanResult } from "@/lib/mealPlanner";
import { useDailyLog } from "@/hooks/useDailyLog";
import { useMealEntries } from "@/hooks/useMealEntries";
import { Button } from "@/components/ui/button";
import { Nut3llaPrompt } from "@/components/Nut3llaPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronRight, Sunrise, Sun, Moon, Coffee, Search, Trash2, Wand2, ChefHat, ArrowLeft, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Category = "All" | "Breakfast" | "Lunch" | "Dinner" | "Snacks" | "Drinks" | "Fruits" | "Meals";
const categories: Category[] = ["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Drinks", "Fruits", "Meals"];

interface FoodForm {
  name: string;
  serving_size: number | "";
  serving_unit: string;
  calories: number | "";
  protein: number | "";
  carbs: number | "";
  fats: number | "";
  category: string;
  is_veg: boolean;
}

const defaultForm: FoodForm = {
  name: "",
  serving_size: 100,
  serving_unit: "g",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
  category: "Meals",
  is_veg: true,
};

export const MOCK_FOODS: Food[] = [
  { id: "mock-1", name: "Masala Dosa", calories: 350, protein: 8, carbs: 55, fats: 12, serving_size: 1, serving_unit: "pc", category: "Meals", is_veg: true, source: "preset", price: 120 },
  { id: "mock-2", name: "Paneer Butter Masala", calories: 380, protein: 14, carbs: 12, fats: 28, serving_size: 1, serving_unit: "bowl", category: "Meals", is_veg: true, source: "preset", price: 160 },
  { id: "mock-3", name: "Veg Biryani", calories: 420, protein: 10, carbs: 65, fats: 14, serving_size: 1, serving_unit: "plate", category: "Meals", is_veg: true, source: "preset", price: 180 },
  { id: "mock-4", name: "Chole Bhature", calories: 520, protein: 12, carbs: 60, fats: 25, serving_size: 1, serving_unit: "set", category: "Meals", is_veg: true, source: "preset", price: 110 },
  { id: "mock-5", name: "Rajma Chawal", calories: 450, protein: 16, carbs: 70, fats: 10, serving_size: 1, serving_unit: "plate", category: "Meals", is_veg: true, source: "preset", price: 90 },
  { id: "mock-6", name: "Samosa", calories: 190, protein: 3, carbs: 22, fats: 10, serving_size: 1, serving_unit: "pc", category: "Snacks", is_veg: true, source: "preset", price: 20 },
  { id: "mock-7", name: "Aloo Paratha", calories: 280, protein: 6, carbs: 40, fats: 12, serving_size: 1, serving_unit: "pc", category: "Meals", is_veg: true, source: "preset", price: 60 },
  { id: "mock-8", name: "Pav Bhaji", calories: 400, protein: 8, carbs: 55, fats: 18, serving_size: 1, serving_unit: "plate", category: "Meals", is_veg: true, source: "preset", price: 100 },
  { id: "mock-9", name: "Veg Pulao", calories: 320, protein: 6, carbs: 55, fats: 8, serving_size: 1, serving_unit: "plate", category: "Meals", is_veg: true, source: "preset", price: 130 },
  { id: "mock-10", name: "Masala Chai", calories: 75, protein: 2, carbs: 10, fats: 3, serving_size: 150, serving_unit: "ml", category: "Drinks", is_veg: true, source: "preset", price: 40 },
  { id: "mock-11", name: "Filter Coffee", calories: 60, protein: 2, carbs: 8, fats: 2, serving_size: 150, serving_unit: "ml", category: "Drinks", is_veg: true, source: "preset", price: 50 },
  { id: "mock-12", name: "Lassi", calories: 180, protein: 6, carbs: 25, fats: 6, serving_size: 250, serving_unit: "ml", category: "Drinks", is_veg: true, source: "preset", price: 60 },
  { id: "mock-13", name: "Buttermilk", calories: 45, protein: 3, carbs: 5, fats: 2, serving_size: 250, serving_unit: "ml", category: "Drinks", is_veg: true, source: "preset", price: 30 },
];

const CafeMenu = () => {
  const { foods, isLoading: foodsLoading, addFood, updateFood, deleteFood } = useFoods();
  const { settings } = useSettings();
  const { log, isLoading: logLoading, ensureLog } = useDailyLog();
  const { addEntry, isLoading: entriesLoading } = useMealEntries(log?.id);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isLoading = foodsLoading || logLoading || (log?.id ? entriesLoading : false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FoodForm>(defaultForm);
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState<"user" | "preset" | "barcode">("preset");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isVegOnly, setIsVegOnly] = useState(() => localStorage.getItem("diet_preference") !== "non-veg");

  // Planner States
  const [showPlanner, setShowPlanner] = useState(false);
  const [budget, setBudget] = useState("400");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planMealType, setPlanMealType] = useState("lunch");

  const { isGuest, user } = useAuth();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [loggingFood, setLoggingFood] = useState<Food | null>(null);
  const [logForm, setLogForm] = useState({ quantity: "1", mealType: "breakfast" });

  // Cart State
  const [cart, setCart] = useState<Record<string, { food: Food, quantity: number }>>({});

  const addToCart = (food: Food) => {
    setCart(prev => ({
      ...prev,
      [food.id]: {
        food,
        quantity: (prev[food.id]?.quantity || 0) + 1
      }
    }));
    toast({ title: "Added to cart", description: `${food.name} added.` });
  };

  const removeItemFromCart = (foodId: string) => {
    const newCart = { ...cart };
    delete newCart[foodId];
    setCart(newCart);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id]) {
        if (next[id].quantity > 1) {
          next[id].quantity -= 1;
        } else {
          delete next[id];
        }
      }
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    toast({ title: "Cart cleared" });
  };

  const cartTotal = useMemo(() => 
    Object.values(cart).reduce((sum, item) => sum + (item.food.price || 50) * item.quantity, 0),
  [cart]);

  const cartItemsCount = useMemo(() => 
    Object.values(cart).reduce((sum, item) => sum + item.quantity, 0),
  [cart]);

  const [mealPlan, setMealPlan] = useState<MealPlanResult | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    localStorage.setItem("diet_preference", isVegOnly ? "veg" : "non-veg");
  }, [isVegOnly]);

  const openAdd = () => {
    setForm({ ...defaultForm, is_veg: isVegOnly });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (f: Food) => {
    setForm({
      name: f.name,
      serving_size: f.serving_size,
      serving_unit: f.serving_unit,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fats: f.fats,
      category: f.category || "Meals",
      is_veg: f.is_veg,
    });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleGeneratePlan = () => {
    if (!settings && !isGuest) {
      toast({ title: "Profile Missing", description: "Cannot load profile."});
      return;
    }
    setIsPlanning(true);
    setTimeout(() => {
      try {
        const goalMap: Record<string, string> = { "weight-loss": "fatloss", "maintenance": "maintain", "muscle-gain": "muscle" };
        const s = settings as any;
        const profile: UserProfile = {
          age: s?.age || 20,
          weight: s?.weight_kg || 70,
          height: s?.height_cm || 170,
          gender: s?.gender || "male",
          goal: (goalMap[(s?.goal || "")] || s?.goal || "maintain") as any,
          activity_level: "moderate", 
          budget: parseFloat(budget) || 400
        };
        
        const cafeteria_menu: MealMenuItem[] = foods.filter(f => f.source === 'preset').map(f => ({
            id: f.id,
            name: f.name,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fats: f.fats,
            price: f.price || Math.round(f.calories * 0.15) || 50
          }));
          
          if(cafeteria_menu.length === 0) throw new Error("No foods available");

          const plan = generateMealPlan(profile, cafeteria_menu, 5);
          setGeneratedPlan(plan);
      } catch (err: any) {
        console.error(err);
        toast({ title: "Error", description: err.message || "Failed to generate plan.", variant: "destructive" });
      } finally {
        setIsPlanning(false);
      }
    }, 150);
  };

  const handleLogPlan = async () => {
    if (!generatedPlan || !generatedPlan.selected_food_items) return;
    const items = generatedPlan.selected_food_items;
    const logData = await ensureLog();
    
    for (const f of items) {
      addEntry.mutate({
        daily_log_id: logData.id,
        meal_type: planMealType,
        food_id: f.id || null,
        quantity: 1,
        food_name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fats: f.fats,
        serving_size: 100, 
        serving_unit: "g"
      });
    }
    toast({ title: "Meal plan logged!" });
    setShowPlanner(false);
    setGeneratedPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      serving_size: Number(form.serving_size) || 0,
      serving_unit: form.serving_unit,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fats: Number(form.fats) || 0,
      category: form.category,
      is_veg: form.is_veg,
    };
    
    try {
      if (editId) {
        await updateFood.mutateAsync({ id: editId, ...payload });
      } else {
        const newFood = await addFood.mutateAsync({ ...payload, source: "user" });
        if (newFood?.id) setEditId(newFood.id);
      }
      toast({ title: editId ? "Item updated!" : "Added to menu!" });
    } catch (err) {
      toast({ title: "Failed to save item", variant: "destructive" });
    }
  };

  const handleDelete = () => {
    if (!editId) return;
    if (confirm("Are you sure you want to remove this item?")) {
      deleteFood.mutate(editId);
      toast({ title: "Item removed" });
      setShowForm(false);
    }
  };

  const handleLogDirectly = async (mealType: string) => {
    const logData = await ensureLog();
    
    addEntry.mutate({
      daily_log_id: logData.id,
      meal_type: mealType,
      food_id: editId || null,
      quantity: 1,
      food_name: form.name,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fats: Number(form.fats) || 0,
      serving_size: Number(form.serving_size) || 100,
      serving_unit: form.serving_unit,
    });

    toast({ title: `Logged to ${mealType}!` });
    setShowForm(false);
  };

  const executeLog = async () => {
    if (!loggingFood) return;
    const logData = await ensureLog();
    addEntry.mutate({
      daily_log_id: logData.id,
      meal_type: logForm.mealType,
      food_id: loggingFood.id,
      quantity: parseFloat(logForm.quantity) || 1,
      food_name: loggingFood.name,
      calories: loggingFood.calories,
      protein: loggingFood.protein,
      carbs: loggingFood.carbs,
      fats: loggingFood.fats,
      serving_size: loggingFood.serving_size,
      serving_unit: loggingFood.serving_unit,
    });
    toast({ title: `${loggingFood.name} logged!` });
    setLoggingFood(null);
  };



  const filtered = useMemo(() => {
    const displayFoods = foods;
    
    return displayFoods.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesSource = f.source === selectedSource;
      let matchesCategory = true;
      if (activeCategory !== "All") matchesCategory = f.category === activeCategory;
      const matchesDiet = f.is_veg === isVegOnly;
      return matchesSearch && matchesSource && matchesCategory && matchesDiet;
    });
  }, [foods, search, selectedSource, activeCategory, isVegOnly]);

  const currentFood = useMemo(() => {
    if (!editId) return null;
    return foods.find(f => f.id === editId) || null;
  }, [editId, selectedSource, foods]);

  const handleGenerateAICombo = async () => {
    setIsGeneratingPlan(true);
    try {
      if (!settings || !user) {
        toast({ title: "Profile Required", description: "Please complete your profile to use AI recommendations." });
        return;
      }
      
      const userProfile: UserProfile = {
        age: Number(settings.age) || 20,
        weight: Number(settings.weight_kg) || 70,
        height: Number(settings.height_cm) || 170,
        gender: (settings as any).gender === "female" ? "female" : "male",
        goal: ((settings as any).goal as any) || "bulk",
        activity_level: Number((settings as any).activity_level) as any || 1.375,
        budget: (Number((settings as any).monthly_budget) || 5000) / 30, // daily budget
      };
      
      const menuItems: MenuItem[] = filtered.map((f) => ({
        id: f.id,
        name: f.name,
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        carbs: Number(f.carbs) || 0,
        fats: Number(f.fats) || 0,
        price: Math.max(10, Math.round((Number(f.calories) / 15) + (Number(f.protein) * 1.5))),
        category: f.category,
      }));

      const res = await fetch("http://localhost:5001/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_profile: userProfile, menu_items: menuItems })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const plan = await res.json();
      setMealPlan(plan);
    } catch (err) {
      console.error("Plan Generation Error", err);
      toast({ title: "ML Service Error", description: "Could not generate meal plan.", variant: "destructive" });
    } finally {
      setIsGeneratingPlan(false);
    }
  };
  const canDelete = editId && currentFood && currentFood.source !== "preset";

  return (
    <BoneyardSkeleton name="cafe-menu-screen" loading={isLoading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <h1 className="text-2xl font-bold tracking-tight">Cafeteria Menu</h1>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => { setGeneratedPlan(null); setShowPlanner(true); }}
              className="h-9 w-9 rounded-xl border-primary bg-primary/10 transition-all active:scale-95 shadow-lg shadow-black/5 text-primary"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateAICombo}
              disabled={isGeneratingPlan || filtered.length === 0}
              className="h-9 px-3 rounded-xl border-primary/30 bg-primary/10 text-primary shadow-sm hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingPlan ? "ANALYZING..." : "AI COMBO"}
            </Button>
            {selectedSource !== "preset" && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => isGuest ? setShowGuestPrompt(true) : openAdd()}
                className="h-9 w-9 rounded-xl border-primary/20 bg-background/50 backdrop-blur-sm transition-all active:scale-95 shadow-lg shadow-black/5 text-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Meal Plan Result UI */}
        {mealPlan && (
          <div className="px-1 relative">
            <div className="bg-gradient-to-br from-primary/20 to-background rounded-2xl p-4 border border-primary/30 relative overflow-hidden shadow-xl shadow-primary/5">
              <button 
                onClick={() => setMealPlan(null)} 
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Suggested Combination</h3>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-bold leading-tight">
                   {mealPlan.selected_food_items.map(i => i.name).join(" + ")}
                </h4>
                <p className="text-muted-foreground text-[10px] italic leading-relaxed">
                   {mealPlan.explanation}
                </p>
              </div>

              <div className="flex gap-2 pt-3">
                <div className="bg-background/60 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-border/50 flex-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Protein</p>
                  <p className={`text-xs font-black ${mealPlan.constraints_met.protein_target_met ? "text-green-500" : "text-amber-500"}`}>{mealPlan.total_protein}g</p>
                </div>
                <div className="bg-background/60 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-border/50 flex-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Calories</p>
                  <p className={`text-xs font-black ${mealPlan.constraints_met.calories_within_10_percent ? "text-green-500" : "text-amber-500"}`}>{mealPlan.total_calories}</p>
                </div>
                <div className="bg-background/60 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-border/50 flex-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Price</p>
                  <p className={`text-xs font-black ${mealPlan.constraints_met.within_budget ? "text-green-500" : "text-red-500"}`}>₹{mealPlan.total_price}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Filter */}
        <div className="flex gap-2 w-full px-1">
          {[
            { id: "user", label: "My Favorites" },
            { id: "preset", label: "Cafeteria" },
            { id: "barcode", label: "Scan Item" }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSource(s.id as any)}
              className={`flex-1 py-3 px-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedSource === s.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-y-[-2px]"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 flex-wrap px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-muted hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Toggle */}
        <div className="flex items-center gap-3 px-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-card/50 rounded-xl border-none ring-1 ring-muted"
            />
          </div>
          <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl ring-1 ring-muted">
             <span className={`text-[9px] font-black uppercase tracking-widest ${isVegOnly ? "text-green-500" : "text-red-500"}`}>
               {isVegOnly ? "Veg" : "Non-Veg"}
             </span>
             <Switch 
               checked={isVegOnly} 
               onCheckedChange={setIsVegOnly}
               className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
             />
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2.5 px-1 pb-20">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-2xl border-muted">
              <p className="text-muted-foreground text-sm font-medium">No dishes found in this category.</p>
            </div>
          ) : (
            filtered.map((f) => (
              <div
                key={f.id}
                className="bg-card rounded-2xl p-4 border border-muted hover:border-primary/20 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2 min-w-0" onClick={() => openEdit(f)}>
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${f.is_veg ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="font-bold text-foreground truncate text-sm">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedSource === "preset" ? (
                      <div className="flex items-center bg-muted/30 rounded-xl p-0.5 border border-muted ring-1 ring-white/5 shadow-inner">
                        {cart[f.id] ? (
                          <div className="flex items-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFromCart(f.id); }}
                              className="h-8 w-8 flex items-center justify-center text-primary font-black text-lg hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-[11px] font-black text-foreground">
                              {cart[f.id].quantity}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); addToCart(f); }}
                              className="h-8 w-8 flex items-center justify-center text-primary font-black text-lg hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              +
                            </button>
                            <div className="w-[1px] h-4 bg-muted mx-1" />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeItemFromCart(f.id); }}
                              className="h-8 w-8 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Remove from cart"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { 
                              if (isGuest) {
                                setShowGuestPrompt(true);
                              } else {
                                e.stopPropagation();
                                addToCart(f);
                              }
                            }}
                            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                          >
                            Add +
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { 
                          if (isGuest) {
                            setShowGuestPrompt(true);
                          } else {
                            e.stopPropagation();
                            toast({
                              title: "Redirecting to Cashier...",
                              description: `Proceeding to order ${f.name}.`,
                            });
                            navigate(`/payment?amount=${f.price || 50}&item=${encodeURIComponent(f.name)}`);
                          }
                        }}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 mr-1"
                      >
                        Place Order
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); setLoggingFood(f); setLogForm({ quantity: "1", mealType: "breakfast" }); }}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Log to health portal"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { 
                        if (isGuest && f.source !== 'preset') {
                          setShowGuestPrompt(true);
                        } else {
                          e.stopPropagation(); 
                          openEdit(f); 
                        }
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80" onClick={() => openEdit(f)}>
                  <span className="text-primary/70">{f.calories} KCAL</span>
                  <span>{f.protein}G P</span>
                  <span>{f.carbs}G C</span>
                  <span>{f.fats}G F</span>
                  <span className="ml-auto opacity-50">{f.serving_size}{f.serving_unit}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Cart Bar */}
        {cartItemsCount > 0 && selectedSource === "preset" && (
          <div className="fixed bottom-24 left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-primary shadow-2xl shadow-primary/40 rounded-3xl p-4 flex items-center justify-between ring-1 ring-white/20 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                   <span className="text-white font-black">{cartItemsCount}</span>
                </div>
                <div className="text-white flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-tight">Total Amount</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-black leading-none">₹{cartTotal.toFixed(2)}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearCart(); }}
                      className="text-[8px] font-bold uppercase tracking-tighter opacity-50 hover:opacity-100 transition-opacity bg-white/10 px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => {
                  const itemsSummary = Object.values(cart).map(i => `${i.quantity}x ${i.food.name}`).join(", ");
                  // Store cart for payment page
                  localStorage.setItem("stitch_pending_cart", JSON.stringify(cart));
                  navigate(`/payment?amount=${cartTotal}&item=${encodeURIComponent(itemsSummary)}`);
                }}
                className="bg-white text-primary hover:bg-white/90 rounded-2xl h-11 px-6 font-black uppercase tracking-widest text-[10px]"
              >
                Checkout Now
              </Button>
            </div>
          </div>
        )}

        {/* Add/Edit/View Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="w-[calc(100%-2.5rem)] max-w-[360px] rounded-3xl p-6 border-none shadow-2xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {currentFood?.source === "preset" ? "Dish Information" : (editId ? "Edit Dish" : "New Dish")}
              </DialogTitle>
            </DialogHeader>

            {currentFood?.source === "preset" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main Item</p>
                      <h2 className="text-2xl font-black text-foreground">{form.name}</h2>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${form.is_veg ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                      {form.is_veg ? "Pure Veg" : "Includes Non-Veg"}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-muted/10 p-4 rounded-2xl border border-muted">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Serving Size</p>
                      <p className="text-lg font-black">{form.serving_size} {form.serving_unit}</p>
                   </div>
                   <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-1">Calories</p>
                      <p className="text-lg font-black text-primary">{form.calories} KCAL</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nutritional Breakdown</p>
                   <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Protein", val: form.protein, unit: "g" },
                        { label: "Carbs", val: form.carbs, unit: "g" },
                        { label: "Fats", val: form.fats, unit: "g" },
                      ].map(m => (
                        <div key={m.label} className="bg-card p-3 rounded-xl border border-muted text-center">
                           <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">{m.label}</p>
                           <p className="text-sm font-bold">{m.val}{m.unit}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex gap-2 pt-2">
                   <Button 
                     onClick={() => {
                        toast({
                          title: "Redirecting to Cashier...",
                          description: `Proceeding to order ${form.name}.`,
                        });
                        navigate(`/payment?amount=${currentFood.price || 50}&item=${encodeURIComponent(form.name)}`);
                     }}
                     className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                   >
                     Order Now
                   </Button>
                   <div className="relative group">
                      <Button variant="outline" className="h-12 w-12 rounded-2xl p-0">
                        <Plus className="h-5 w-5" />
                      </Button>
                      <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block bg-card rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50 min-w-[140px]">
                         {["breakfast", "lunch", "dinner", "snack"].map(m => (
                           <button
                             key={m}
                             onClick={() => handleLogDirectly(m)}
                             className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground border-b border-muted last:border-none"
                           >
                             Log to {m}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dish Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="h-10 rounded-xl bg-muted/30 border-none shadow-inner font-medium"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 pt-4">
                    <span className={`text-[8px] font-black uppercase ${form.is_veg ? "text-green-500" : "text-red-500"}`}>
                      {form.is_veg ? "Veg" : "Non-Veg"}
                    </span>
                    <Switch
                      checked={form.is_veg}
                      onCheckedChange={(v) => setForm({ ...form, is_veg: v })}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 scale-90"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Portion</Label>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        value={form.serving_size}
                        onChange={(e) => setForm({ ...form, serving_size: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })}
                        className="h-10 rounded-xl bg-muted/30 border-none flex-1 text-center"
                      />
                      <Input
                        value={form.serving_unit}
                        onChange={(e) => setForm({ ...form, serving_unit: e.target.value })}
                        className="h-10 w-12 rounded-xl bg-muted/30 border-none text-center"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Energy (Kcal)</Label>
                    <Input
                      type="number"
                      value={form.calories}
                      onChange={(e) => setForm({ ...form, calories: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })}
                      className="h-10 rounded-xl bg-muted/30 border-none text-center font-bold text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {categories.filter(c => c !== "All").map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, category: c })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                          form.category === c
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-muted/30 text-muted-foreground border-transparent hover:border-primary/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-muted/20 p-4 rounded-2xl">
                  {(
                    [
                      { label: "Protein", k: "protein" },
                      { label: "Carbs", k: "carbs" },
                      { label: "Fats", k: "fats" },
                    ] as const
                  ).map((m) => (
                    <div key={m.k} className="space-y-1 text-center">
                      <span className="text-[8px] font-black uppercase text-muted-foreground">
                        {m.label}
                      </span>
                      <Input
                        type="number"
                        value={form[m.k]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [m.k]: e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-9 rounded-lg bg-background border-none text-center font-bold p-0"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    {editId ? "Update" : "Save"}
                  </Button>
                  {canDelete && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleDelete}
                      className="h-12 w-12 rounded-2xl p-0 border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                  <div className="relative group">
                     <Button type="button" variant="outline" className="h-12 w-12 rounded-2xl p-0">
                       <Plus className="h-5 w-5" />
                     </Button>
                     <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block bg-card rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50 min-w-[140px]">
                        {["breakfast", "lunch", "dinner", "snack"].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleLogDirectly(m)}
                            className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground border-b border-muted last:border-none"
                          >
                            Log to {m}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Log Confirmation */}
        <Dialog open={!!loggingFood} onOpenChange={() => setLoggingFood(null)}>
          <DialogContent className="w-[calc(100%-2.5rem)] max-w-[360px] rounded-3xl p-6">
            <DialogHeader className="mb-4">
               <DialogTitle className="text-xl font-bold">Log {loggingFood?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adjust Portion</p>
                <div className="flex items-center justify-center gap-6 py-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setLogForm(prev => ({ ...prev, quantity: Math.max(1, Number(prev.quantity) - 1).toString() }))}
                  >
                    <span className="text-2xl font-black">-</span>
                  </Button>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-foreground">{logForm.quantity}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{loggingFood?.serving_unit}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setLogForm(prev => ({ ...prev, quantity: (Number(prev.quantity) + 1).toString() }))}
                  >
                    <span className="text-2xl font-black">+</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Select Meal Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: "breakfast", l: "Breakfast", i: Sunrise },
                    { k: "lunch", l: "Lunch", i: Sun },
                    { k: "dinner", l: "Dinner", i: Moon },
                    { k: "snack", l: "Snacks", i: Coffee },
                  ].map(m => (
                    <button
                      key={m.k}
                      onClick={() => setLogForm({ ...logForm, mealType: m.k })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                        logForm.mealType === m.k
                          ? "bg-primary/10 border-primary text-primary shadow-inner"
                          : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/20"
                      }`}
                    >
                      <m.i className="h-5 w-5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{m.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => executeLog()} 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30"
              >
                Register Meal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Planner Modal */}
        <Dialog open={showPlanner} onOpenChange={setShowPlanner}>
          <DialogContent className="w-[calc(100%-2.5rem)] max-w-[400px] rounded-[2rem] p-6 border-none shadow-2xl overflow-y-auto max-h-[85vh]">
            <DialogHeader className="mb-4">
               <DialogTitle className="text-xl font-bold flex items-center gap-2">
                 <ChefHat className="h-5 w-5 text-primary" /> AI Meal Planner
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {!generatedPlan ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Budget (₹)</Label>
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="h-14 text-xl font-bold rounded-2xl bg-muted/30 border-none px-4 shadow-inner"
                      placeholder="e.g. 400"
                    />
                    <p className="text-[10px] text-muted-foreground px-1 leading-relaxed hidden sm:block">
                      The AI calculates your optimal daily caloric and macro needs, then searches our menu combinations to find a high-protein spread that fits right inside your budget.
                    </p>
                  </div>
                  <Button 
                    onClick={handleGeneratePlan}
                    disabled={isPlanning || !budget}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/30 transition-all active:scale-[0.98] bg-gradient-to-r from-primary to-orange-500"
                  >
                    {isPlanning ? "Generating..." : "Generate Optimal Plan"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-muted/30 rounded-2xl p-4 border border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Wand2 className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">Generated Plan</span>
                         <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">₹{generatedPlan.total_price}</span>
                      </div>
                      <div className="flex gap-4 mb-4">
                        <div className="space-y-0.5">
                           <span className="text-sm font-black">{generatedPlan.total_calories}</span>
                           <span className="block text-[8px] font-bold text-muted-foreground uppercase">Kcal</span>
                        </div>
                        <div className="space-y-0.5">
                           <span className="text-sm font-black">{generatedPlan.total_protein}g</span>
                           <span className="block text-[8px] font-bold text-muted-foreground uppercase">Protein</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {generatedPlan.selected_food_items.map((item: any, i: number) => (
                           <div key={i} className="flex justify-between items-center bg-background rounded-lg p-2 shadow-sm text-xs font-semibold">
                             <span className="truncate pr-2">{item.name}</span>
                             <span className="opacity-60 shrink-0">{item.calories}kcal</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Controls to Log */}
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      {["breakfast", "lunch", "dinner", "snack"].map(m => (
                        <button
                          key={m}
                          onClick={() => setPlanMealType(m)}
                          className={`flex-1 p-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-wider ${
                            planMealType === m ? "bg-primary border-primary text-primary-foreground" : "bg-card border-muted text-muted-foreground"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                       <Button variant="outline" onClick={() => setGeneratedPlan(null)} className="h-12 w-12 shrink-0 rounded-2xl border-none bg-muted hover:bg-muted/80">
                          <ArrowLeft className="h-5 w-5" />
                       </Button>
                       <Button onClick={handleLogPlan} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                         Log Everything
                       </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {showGuestPrompt && (
          <Nut3llaPrompt 
            description="Explore the cafeteria selection freely! To build your own 'Institutional Kitchen' with custom favorites, please join the Student Portal."
            onClose={() => setShowGuestPrompt(false)}
          />
        )}
      </div>
    </BoneyardSkeleton>
  );
};

export default CafeMenu;
