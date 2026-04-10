import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Droplet, User, Phone, ArrowLeft, Check } from "lucide-react";
import { calculateMacros } from "@/lib/calories";

const goalOptions = [
  { value: "muscle", label: "Muscle Gain" },
  { value: "fatloss", label: "Fat Loss" },
  { value: "maintain", label: "Maintenance" },
  { value: "gain", label: "Weight Gain" },
];

export default function Onboarding() {
  const { settings, updateSettings, isLoading } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: "",
    mobile_number: "",
    age: 20,
    weight_kg: 70,
    height_cm: 170,
    gender: "male",
    goal: "fatloss",
    cycle_tracking_enabled: false,
    period_cycle_length: 28,
    last_period_date: getTodayDate(),
    period_length: 5,
    allergies: "",
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        name: (settings as any).name || "",
        mobile_number: (settings as any).mobile_number || "",
        age: Number((settings as any).age) || 20,
        weight_kg: Number((settings as any).weight_kg) || 70,
        height_cm: Number((settings as any).height_cm) || 170,
        gender: (settings as any).gender || "male",
        goal: (settings as any).goal || "fatloss",
        cycle_tracking_enabled: (settings as any).cycle_tracking_enabled ?? false,
        period_cycle_length: Number((settings as any).period_cycle_length) || 28,
        last_period_date: (settings as any).last_period_date || getTodayDate(),
        period_length: Number((settings as any).period_length) || 5,
        allergies: (settings as any).allergies || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    // Generate new macro targets based on the onboarding data
    const targets = calculateMacros({
      gender: form.gender,
      weight_kg: form.weight_kg,
      height_cm: form.height_cm,
      age: form.age,
      activity_level: 1.55, // Moderate default
      goal: form.goal === "fatloss" ? "cut" : form.goal === "gain" || form.goal === "muscle" ? "bulk" : "maintain",
    });

    updateSettings.mutate(
      {
        ...form,
        profile_completed: true,
        calorie_target: targets.calories,
        protein_target: targets.protein,
        carb_target: targets.carbs,
        fat_target: targets.fats,
      },
      {
        onSuccess: () => {
          localStorage.setItem('hide_profile_banner', 'true');
          toast({ title: "Profile setup complete!", description: "Your macros have been updated." });
          setIsSaved(true);
          setTimeout(() => {
            navigate("/");
          }, 1500);
        },
      }
    );
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500 pb-12">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8 rounded-full bg-muted">
           <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Setup Profile
          </h1>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Personalize Your Journey</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-5 shadow-xl shadow-primary/5 space-y-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Contact Info</h2>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Full Name</Label>
            <Input 
              placeholder="E.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 rounded-xl bg-background border-primary/20 focus-visible:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="tel"
                placeholder="Your phone number"
                value={form.mobile_number}
                onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                className="h-12 pl-10 rounded-xl bg-background border-primary/20 focus-visible:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body Stats */}
      <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-5 shadow-xl shadow-primary/5 space-y-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
          <Droplet className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Body Stats & Goals</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger className="h-12 rounded-xl bg-background border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Primary Goal</Label>
            <Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v })}>
              <SelectTrigger className="h-12 rounded-xl bg-background border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Age</Label>
            <Input 
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="h-12 font-bold text-center rounded-xl bg-background border-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center flex justify-center">Weight (kg)</Label>
            <Input 
              type="number"
              value={form.weight_kg}
              onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
              className="h-12 font-bold text-center rounded-xl bg-background border-primary/20 text-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center flex justify-center">Height (cm)</Label>
            <Input 
              type="number"
              value={form.height_cm}
              onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
              className="h-12 font-bold text-center rounded-xl bg-background border-primary/20 text-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-4 mt-2 border-t border-border/50">
          <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Allergies & Dietary Restrictions</Label>
          <Input 
            placeholder="E.g. Peanuts, Dairy (Leave blank if none)"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            className="h-12 rounded-xl bg-background border-primary/20 focus-visible:ring-primary/50"
          />
        </div>
      </div>

      {/* Female specific section */}
      {form.gender === "female" && (
        <div className="bg-pink-500/5 backdrop-blur-md border border-pink-500/20 rounded-3xl p-5 shadow-xl shadow-pink-500/5 space-y-4 animate-in zoom-in-95 duration-300">
           <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-pink-500">Cycle Intelligence</h2>
                 <p className="text-[10px] text-muted-foreground">Tailor your nutrition around your period cycle.</p>
              </div>
              <Switch 
                checked={form.cycle_tracking_enabled}
                onCheckedChange={(c) => setForm({ ...form, cycle_tracking_enabled: c })}
                className="data-[state=checked]:bg-pink-500"
              />
           </div>

           {form.cycle_tracking_enabled && (
             <div className="pt-3 border-t border-pink-500/20 mt-3 space-y-4 animate-in fade-in slide-in-from-top-2">
                 
                 <div className="space-y-1.5">
                   <Label className="text-[10px] text-pink-500/80 font-bold uppercase tracking-wider block">Period Start Date</Label>
                   <Input 
                     type="date"
                     value={form.last_period_date}
                     onChange={(e) => setForm({ ...form, last_period_date: e.target.value })}
                     className="h-12 w-full rounded-xl bg-background/80 border-pink-500/30 text-foreground uppercase text-xs font-bold"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                     <Label className="text-[10px] text-pink-500/80 font-bold uppercase tracking-wider block">Period Duration</Label>
                     <div className="flex items-center gap-2">
                       <Input 
                         type="number"
                         value={form.period_length}
                         onChange={(e) => setForm({ ...form, period_length: Number(e.target.value) })}
                         className="h-12 text-center font-black text-xl rounded-xl bg-background/80 border-pink-500/30"
                       />
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">Days<br/>long</span>
                     </div>
                   </div>
                   
                   <div className="space-y-1.5">
                     <Label className="text-[10px] text-pink-500/80 font-bold uppercase tracking-wider block">Avg Cycle Length</Label>
                     <div className="flex items-center gap-2">
                       <Input 
                         type="number"
                         value={form.period_cycle_length}
                         onChange={(e) => setForm({ ...form, period_cycle_length: Number(e.target.value) })}
                         className="h-12 text-center font-black text-xl rounded-xl bg-background/80 border-pink-500/30"
                       />
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">Days<br/>Total</span>
                     </div>
                   </div>
                 </div>

             </div>
           )}
        </div>
      )}

      <Button 
        onClick={handleSave}
        disabled={updateSettings.isPending || isSaved}
        className={`w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/25 transition-all ${
          isSaved 
            ? "bg-green-500 hover:bg-green-600 text-white" 
            : "bg-gradient-to-r from-primary to-orange-500 hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {isSaved ? (
          <>
            <Check className="h-5 w-5 mr-2 animate-in zoom-in" /> Details Saved
          </>
        ) : updateSettings.isPending ? (
          "Saving..."
        ) : (
          <>
            Complete Profile <ChevronRight className="h-5 w-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
