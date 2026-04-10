import React from "react";
import { useSettings } from "@/hooks/useSettings";
import { calculateLevel } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { Coffee, Star, Zap, Utensils, Shield, Award, Crown, ArrowLeft, BookOpen, GraduationCap, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Nut3llaPrompt } from "@/components/Nut3llaPrompt";
import { useState, useEffect } from "react";

const REWARD_TIERS = [
  { lv: 1, title: "CAFE EXPLORER", icon: Star, color: "text-muted-foreground", bonus: "Standard orientation" },
  { lv: 5, title: "REGULAR DINER", icon: Coffee, color: "text-blue-400", bonus: "Early access to weekly menus" },
  { lv: 10, title: "SAVVY STUDENT", icon: Zap, color: "text-orange-400", bonus: "5% discount on healthy snacks" },
  { lv: 15, title: "GOURMET SCHOLAR", icon: BookOpen, color: "text-purple-400", bonus: "Exclusive monthly tastings" },
  { lv: 20, title: "DEAN'S LIST DINER", icon: GraduationCap, color: "text-yellow-400", bonus: "Priority pickup at cafeteria" },
  { lv: 30, title: "CAFE CONNOISSEUR", icon: Utensils, color: "text-red-400", bonus: "Chef's special customized meals" },
  { lv: 40, title: "CAMPUS LEGEND", icon: Crown, color: "text-indigo-400", bonus: "VIP seating & zero queue perk" },
  { lv: 50, title: "CAFE SOVEREIGN", icon: Trophy, color: "text-primary", bonus: "Lifetime honorary member status" },
];

const CampusRewards = () => {
  const { settings, isLoading } = useSettings();
  const { isGuest } = useAuth();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  useEffect(() => {
    if (isGuest) {
      const timer = setTimeout(() => setShowGuestPrompt(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isGuest]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading your campus standing...</div>;

  const xp = (settings as any)?.total_xp || 0;
  const { level, xpInLevel, xpTarget, progress, rankTitle } = calculateLevel(xp);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/" className="h-10 w-10 rounded-xl bg-card border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 
          className="text-2xl font-black text-foreground uppercase tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Campus Rewards
        </h1>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground italic px-1">
          Stay consistent with your health portal tracking to unlock exclusive cafeteria privileges.
        </p>
      </div>

      {/* Hero Level Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-card to-card border-2 border-primary/20 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12">
          <GraduationCap size={180} />
        </div>
        
        <div className="relative space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-black text-primary tracking-[0.3em] uppercase opacity-70">Privilege Status</span>
            <h2 className="text-4xl font-black text-foreground tracking-tight leading-none uppercase">{rankTitle}</h2>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-6xl font-black text-primary leading-none">LVL {level}</span>
            <div className="pb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Campus Credit</p>
              <p className="text-xs font-bold text-foreground">{xp} POINTS EARNED</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-muted-foreground tracking-[0.2em]">Next Rank Progress</span>
              <span className="text-primary">{xpInLevel} / {xpTarget} Credits</span>
            </div>
            <Progress value={progress} className="h-4 rounded-full bg-primary/10 shadow-inner border border-primary/5" />
            <p className="text-[10px] text-center font-bold text-muted-foreground/60 italic">"Sharp minds start with a balanced meal."</p>
          </div>
        </div>
      </div>

      {/* Point Guide */}
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: "Log Healthy Meals", val: "+20 CP", desc: "Track your nutritional intake." },
          { label: "Daily Wellness Check", val: "+10 CP", desc: "Keep your streak alive." },
          { label: "Under Budget", val: "+100 CP", desc: "Successfully managed food cost." },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border/40 rounded-2xl p-4 flex items-center justify-between hover:border-primary/20 transition-colors">
            <div>
              <p className="text-xs font-black uppercase text-foreground tracking-widest">{item.label}</p>
              <p className="text-[10px] text-muted-foreground italic">{item.desc}</p>
            </div>
            <span className="text-lg font-black text-primary">{item.val}</span>
          </div>
        ))}
      </div>

      {/* The Privilege Ladder */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground px-2">The Privilege Ladder</h3>
        <div className="bg-card/50 backdrop-blur-xl border border-border/40 rounded-[2rem] overflow-hidden">
          {REWARD_TIERS.map((rank, i) => {
            const isCurrent = level >= rank.lv && (i === REWARD_TIERS.length - 1 || level < REWARD_TIERS[i+1].lv);
            const isPassed = level >= rank.lv;

            return (
              <div key={i} className={`flex items-center gap-4 p-5 border-b border-border/10 last:border-0 ${isCurrent ? "bg-primary/5" : ""}`}>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${isPassed ? "bg-primary/20 " + rank.color : "bg-muted/10 text-muted-foreground/30"}`}>
                  <rank.icon size={24} strokeWidth={isCurrent ? 3 : 2} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-widest ${isPassed ? rank.color : "text-muted-foreground/30"}`}>{rank.title}</span>
                    {isCurrent && <span className="px-2 py-0.5 rounded-full bg-primary text-[8px] font-black text-primary-foreground uppercase">Active</span>}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground italic mb-1">Unlocks at Level {rank.lv}</p>
                  <p className="text-[10px] text-primary/80 font-medium">{rank.bonus}</p>
                </div>
                {isPassed && !isCurrent && <Star size={14} className="text-primary/30" />}
              </div>
            );
          })}
        </div>
      </div>
      
      {showGuestPrompt && (
        <div id="rank-guest-popup">
          <Nut3llaPrompt 
            title="Unlock Your Perks"
            description="Log in with your Institutional ID to start earning Campus Rewards and unlock exclusive student privileges at the cafeteria."
            actionText="Access Portal"
            onClose={() => setShowGuestPrompt(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CampusRewards;
