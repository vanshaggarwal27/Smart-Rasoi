import { useEffect, useState, useRef } from "react";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import { useDate } from "@/contexts/DateContext";
import { TutorialFlow } from "@/components/TutorialFlow";
import { useDailyLog } from "@/hooks/useDailyLog";
import { useMealEntries } from "@/hooks/useMealEntries";
import { useSettings, Supplement } from "@/hooks/useSettings";
import { useFoods } from "@/hooks/useFoods";
import { generateMealPlan, UserProfile, MenuItem, MealPlanResult } from "@/lib/mealPlanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Sunrise, Sun, Moon, Coffee, ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { CampusRewardsCard } from "@/components/CampusRewardsCard";
import { Sparkles, IndianRupee, Thermometer, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const MacroRing = ({ label, current, target, color, isSelected, onClick }: { 
  label: string; current: number; target: number; color: string; isSelected: boolean; onClick: () => void 
}) => {
  const pct = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 36;
  const dashoffset = circumference - (pct / 100) * circumference;

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95 ${isSelected ? "scale-110" : "opacity-80 hover:opacity-100"}`}
    >
      <div className={`relative w-20 h-20 transition-all duration-300 ${isSelected ? "drop-shadow-[0_0_15px_rgba(234,92,31,0.3)]" : ""}`}>
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={current >= target ? "#22c55e" : color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-black transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>{Math.round(current)}</span>
        </div>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
};

const mealTypeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  breakfast: { label: "Breakfast", icon: Sunrise },
  lunch: { label: "Lunch", icon: Sun },
  dinner: { label: "Dinner", icon: Moon },
  snack: { label: "Snacks", icon: Coffee },
};

const todayStr = () => new Date().toISOString().split("T")[0];

const Index = () => {
  const { currentDate, setCurrentDate } = useDate();
  const { log, isLoading: logLoading, toggleCustomSupplement, ensureLog } = useDailyLog(currentDate);
  const { entries, isLoading: entriesLoading, removeEntry } = useMealEntries(log?.id);
  const { settings, isLoading: settingsLoading } = useSettings();
  const { foods } = useFoods();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const strictHide = localStorage.getItem('hide_profile_banner') === 'true';
  const needsOnboarding = !strictHide && settings && !(settings as any).profile_completed;

  const [expandedMacro, setExpandedMacro] = useState<string | null>(null);
  const [showCopy, setShowCopy] = useState(false);
  const [copyDate, setCopyDate] = useState("");
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  
  const [mealPlan, setMealPlan] = useState<MealPlanResult | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      try {
        if (!settings || !user) return;
        
        const userProfile: UserProfile = {
          age: Number(settings.age) || 20,
          weight: Number(settings.weight_kg) || 70,
          height: Number(settings.height_cm) || 170,
          gender: (settings as any).gender === "female" ? "female" : "male",
          goal: ((settings as any).goal as any) || "bulk",
          activity_level: Number((settings as any).activity_level) as any || 1.375,
          budget: (Number((settings as any).monthly_budget) || 5000) / 30, // daily budget
        };
        
        const menuItems: MenuItem[] = foods.map((f) => ({
          id: f.id,
          name: f.name,
          calories: Number(f.calories) || 0,
          protein: Number(f.protein) || 0,
          carbs: Number(f.carbs) || 0,
          fats: Number(f.fats) || 0,
          price: Math.max(10, Math.round((Number(f.calories) / 15) + (Number(f.protein) * 1.5))),
          category: f.category,
        }));

        const plan = generateMealPlan(userProfile, menuItems, 3);
        setMealPlan(plan);
      } catch (err) {
        console.error("Plan Generation Error", err);
      } finally {
        setIsGeneratingPlan(false);
      }
    }, 50); // slight delay to allow UI to breathe
  };

  const shiftDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split("T")[0]);
    setExpandedMacro(null);
  };

  const enabledSupplements = ((settings?.supplements as unknown as Supplement[]) || []).filter((s) => s.enabled);
  const supplementsTaken = ((log as any)?.supplements_taken as Record<string, boolean>) || {};

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0) * entry.quantity,
      protein: acc.protein + (entry.protein || 0) * entry.quantity,
      carbs: acc.carbs + (entry.carbs || 0) * entry.quantity,
      fats: acc.fats + (entry.fats || 0) * entry.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const targets = {
    calories: settings?.calorie_target || 2750,
    protein: settings?.protein_target || 100,
    carbs: settings?.carb_target || 400,
    fats: settings?.fat_target || 70,
  };

  const handleCopyFromDate = async () => {
    if (!copyDate || !user) return;
    const { data: srcLog } = await supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", copyDate)
      .maybeSingle();

    if (!srcLog) {
      toast({
        title: "No meals found",
        description: `No log exists for ${copyDate}`,
        variant: "destructive",
      });
      return;
    }

    const { data: srcEntries } = await supabase
      .from("meal_entries")
      .select("meal_type, food_id, quantity, food_name, calories, protein, carbs, fats, serving_size, serving_unit")
      .eq("daily_log_id", srcLog.id);

    if (!srcEntries || srcEntries.length === 0) {
      toast({
        title: "No meals found",
        description: `No entries for ${copyDate}`,
        variant: "destructive",
      });
      return;
    }

    const logData = await ensureLog();
    const inserts = srcEntries.map((e) => ({
      daily_log_id: logData.id,
      meal_type: e.meal_type,
      food_id: e.food_id,
      quantity: e.quantity,
      food_name: e.food_name,
      calories: e.calories,
      protein: e.protein,
      carbs: e.carbs,
      fats: e.fats,
      serving_size: e.serving_size,
      serving_unit: e.serving_unit,
    }));

    const { error } = await supabase.from("meal_entries").insert(inserts);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Meals copied!" });
      queryClient.invalidateQueries({ queryKey: ["meal_entries"] });
    }
    setShowCopy(false);
  };

  if (logLoading || settingsLoading) {
    return (
      <BoneyardSkeleton name="home-screen" loading={true}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex justify-around">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-20 rounded-full" />)}
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </BoneyardSkeleton>
    );
  }

  const macroDetails = entries
    .filter((e) => {
      if (!expandedMacro) return false;
      const key = expandedMacro.toLowerCase() as keyof typeof e;
      return (e[key] as number || 0) > 0;
    })
    .map((e) => {
      const key = expandedMacro!.toLowerCase() as keyof typeof e;
      const amount = (e[key] as number) * e.quantity;
      return { name: e.food_name, amount };
    })
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));

  return (
    <BoneyardSkeleton name="home-screen" loading={logLoading || settingsLoading}>
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDate(-1)}
              className="h-8 w-8 text-muted-foreground transition-all hover:bg-muted active:scale-90"
              disabled={currentDate <= (user?.created_at?.split("T")[0] || todayStr())}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground min-w-[110px] text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {currentDate === todayStr()
                ? "Today"
                : new Date(currentDate).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDate(1)}
              className="h-8 w-8 text-muted-foreground transition-all hover:bg-muted active:scale-90"
              disabled={currentDate >= todayStr()}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowCopy(true)}
            className="h-9 w-9 rounded-xl border-primary/20 bg-background/50 backdrop-blur-sm transition-all active:scale-95 shadow-lg shadow-black/5 text-primary"
            title="Copy"
          >
            <Copy className="h-4 w-4" /> 
          </Button>
        </div>

        <div className="flex justify-around py-2" data-tour="macro-rings">
          <MacroRing 
            label="Calories" current={totals.calories} target={targets.calories} color="hsl(var(--primary))" 
            isSelected={expandedMacro === "Calories"} onClick={() => setExpandedMacro(expandedMacro === "Calories" ? null : "Calories")}
          />
          <MacroRing 
            label="Protein" current={totals.protein} target={targets.protein} color="hsl(18, 82%, 41%)" 
            isSelected={expandedMacro === "Protein"} onClick={() => setExpandedMacro(expandedMacro === "Protein" ? null : "Protein")}
          />
          <MacroRing 
            label="Carbs" current={totals.carbs} target={targets.carbs} color="hsl(220, 13%, 38%)" 
            isSelected={expandedMacro === "Carbs"} onClick={() => setExpandedMacro(expandedMacro === "Carbs" ? null : "Carbs")}
          />
          <MacroRing 
            label="Fats" current={totals.fats} target={targets.fats} color="hsl(0, 0%, 60%)" 
            isSelected={expandedMacro === "Fats"} onClick={() => setExpandedMacro(expandedMacro === "Fats" ? null : "Fats")}
          />
        </div>

        {expandedMacro && (
          <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-primary/10 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{expandedMacro} Breakdown</h3>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {Math.round(totals[expandedMacro.toLowerCase() as keyof typeof totals])} / {targets[expandedMacro.toLowerCase() as keyof typeof targets]} {expandedMacro === "Calories" ? "KCAL" : "G"}
              </div>
            </div>
            <div className="space-y-3 pr-1">
              {macroDetails.length > 0 ? (
                macroDetails.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <span className="text-sm font-medium text-foreground/80">{m.name}</span>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                         <div 
                          className="h-full bg-primary/60 transition-all duration-1000"
                          style={{ width: `${Math.min((m.amount / totals[expandedMacro!.toLowerCase() as keyof typeof totals]) * 100, 100)}%` }}
                         />
                       </div>
                       <span className="text-[11px] font-black text-primary/80 min-w-[40px] text-right">
                         {Math.round(m.amount)}{expandedMacro === "Calories" ? "" : "g"}
                       </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs font-medium italic text-muted-foreground">
                  No {expandedMacro.toLowerCase()} sources logged yet.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-1">
          <CampusRewardsCard />
        </div>

        {needsOnboarding && (
          <div className="px-1 py-1">
            <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-3xl p-4 border border-primary/20 flex items-center justify-between shadow-sm">
               <div className="space-y-0.5">
                 <h2 className="text-sm font-black text-primary uppercase tracking-tight">Complete Profile</h2>
                 <p className="text-[10px] text-muted-foreground italic mr-2">Add mobile, goals & health stats to unlock personalized AI plans.</p>
               </div>
               <Button size="sm" onClick={() => navigate('/setup')} className="bg-primary text-primary-foreground text-xs font-bold shadow-lg rounded-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-24 shrink-0">
                 START
               </Button>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="px-1 space-y-4">
          <div className="bg-gradient-to-br from-primary/20 via-background to-secondary/10 rounded-3xl p-6 border border-primary/20 relative overflow-hidden group shadow-xl shadow-primary/5">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles className="h-16 w-16 text-primary rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between text-primary">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">AI Recommendation Engine</h2>
                </div>
                {!mealPlan && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-[9px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors relative z-20"
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan || foods.length === 0}
                  >
                    {isGeneratingPlan ? "ANALYZING..." : "GENERATE"}
                  </Button>
                )}
              </div>
              
              {!mealPlan ? (
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Awaiting Initialization</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed italic">
                     "Our AI engine dynamically adapts food recommendations to your goals."
                  </p>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                     Tap generate to find the optimal combination for your <span className="text-primary font-medium uppercase font-black">Goals</span> and <span className="text-foreground italic">Budget</span>.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground leading-tight">
                      {mealPlan.selected_food_items.map((i) => i.name).join(" + ")}
                    </h3>
                    <p className="text-muted-foreground text-[10px] leading-relaxed italic text-primary">
                       AI: {mealPlan.explanation}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <div className="bg-background/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-border/50 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Protein</p>
                      <p className={`text-sm font-black ${mealPlan.constraints_met.protein_target_met ? "text-green-500" : "text-amber-500"}`}>{mealPlan.total_protein}g</p>
                    </div>
                    <div className="bg-background/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-border/50 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Calories</p>
                      <p className={`text-sm font-black ${mealPlan.constraints_met.calories_within_10_percent ? "text-green-500" : "text-amber-500"}`}>{mealPlan.total_calories}</p>
                    </div>
                    <div className="bg-background/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-border/50 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Price</p>
                      <p className={`text-sm font-black ${mealPlan.constraints_met.within_budget ? "text-green-500" : "text-red-500"}`}>₹{mealPlan.total_price}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 group relative z-20">
                     <Button 
                       size="sm"
                       onClick={handleGeneratePlan}
                       disabled={isGeneratingPlan}
                       className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-[10px] uppercase font-black tracking-widest h-8"
                     >
                        {isGeneratingPlan ? "..." : "Re-Roll Plan"}
                     </Button>
                  </div>
                </>
              )}

              {settings?.cycle_tracking_enabled && (
                <div className="flex items-center gap-2 bg-pink-500/10 text-pink-500 px-3 py-1.5 rounded-lg border border-pink-500/20 mt-2">
                   <Thermometer className="h-3 w-3" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Follicular Phase: Increase complex carbs</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Insights Row */}
        <div className="grid grid-cols-2 gap-4 px-1">
          <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Budget</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-foreground">₹2,450 <span className="text-[10px] text-muted-foreground font-medium">left</span></p>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary/60" style={{ width: "45%" }} />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Day 12</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-foreground">Cycle <span className="text-[10px] text-pink-500 font-black uppercase">Tracking</span></p>
              <p className="text-[10px] text-muted-foreground font-medium italic">Peak Energy Window</p>
            </div>
          </div>
        </div>

        {enabledSupplements.length > 0 && (
          <div className="bg-card rounded-xl p-4 space-y-3 shadow-md border border-primary/5">
            <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Supplements</h2>
            {enabledSupplements.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-card-foreground font-medium">{s.name}</span>
                <button
                  onClick={() => toggleCustomSupplement.mutate(s.id)}
                  className={`h-7 w-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ease-out ${
                    supplementsTaken[s.id]
                      ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20"
                      : "bg-muted/30 border-muted-foreground/20 text-transparent scale-100"
                  }`}
                >
                  <Check strokeWidth={3.5} className={`h-4 w-4 transition-transform duration-300 ${supplementsTaken[s.id] ? "scale-100" : "scale-0"}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 pb-4">
          <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em] px-1">Campus Cafe Activity</h2>
          {entriesLoading ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : entries.length === 0 ? (
            <div className="bg-card/50 backdrop-blur-sm border border-dashed border-primary/20 rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm font-medium italic">No cafe visits logged yet. Grab a bite! 🍔</p>
            </div>
          ) : (
            Object.entries(
              entries.reduce<Record<string, typeof entries>>((acc, e) => {
                (acc[e.meal_type] = acc[e.meal_type] || []).push(e);
                return acc;
              }, {})
            ).map(([type, items]) => {
              const config = mealTypeConfig[type] || { label: type, icon: Coffee };
              const Icon = config.icon;
              
              return (
                <div key={type} className="bg-card rounded-2xl p-4 shadow-sm border border-primary/5 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Icon className="h-4 w-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">{config.label}</h3>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setDeletingEntryId(deletingEntryId === item.id ? null : item.id)}
                        className="flex justify-between items-center text-sm border-l-2 border-primary/20 pl-3 cursor-pointer group hover:border-primary/50 transition-colors"
                      >
                        <span className="text-foreground font-medium">{item.food_name}</span>
                        <div className="flex items-center gap-3 relative h-6 w-24 justify-end overflow-hidden">
                          <div className={`flex items-center gap-3 transition-opacity duration-300 ${deletingEntryId === item.id ? "opacity-0" : "opacity-100"}`}>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">×{item.quantity}</span>
                            <span className="text-[11px] font-black italic text-primary/70">{Math.round((item.calories || 0) * item.quantity)} KCAL</span>
                          </div>
                          <button
                            disabled={removeEntry.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEntry.mutate(item.id, {
                                onSuccess: () => {
                                  setDeletingEntryId(null);
                                  toast({
                                    title: "Meal Removed",
                                    description: "Your daily nutrition log has been updated.",
                                  });
                                }
                              });
                            }}
                            className={`absolute right-0 p-2 flex items-center justify-center text-red-500 hover:text-red-400 transition-all duration-500 transform ${
                              deletingEntryId === item.id ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                            } ${removeEntry.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                            title="Delete"
                          >
                            <Trash2 className={`h-5 w-5 ${removeEntry.isPending ? "animate-pulse" : ""}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Copy Dialog */}
        <Dialog open={showCopy} onOpenChange={setShowCopy}>
          <DialogContent className="w-[calc(100%-2.5rem)] max-w-[400px] rounded-3xl p-6 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Copy Meals</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Source Date</label>
                <Input
                  type="date"
                  value={copyDate}
                  onChange={(e) => setCopyDate(e.target.value)}
                  className="rounded-xl h-12 bg-muted/30 border-none font-bold text-foreground"
                />
              </div>
              <Button onClick={handleCopyFromDate} className="w-full h-12 text-md font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
                Copy to {currentDate === todayStr() ? "Today" : currentDate}
              </Button>
            </div>
            </DialogContent>
          </Dialog>
      </div>
    </BoneyardSkeleton>
  );
};

export default Index;
