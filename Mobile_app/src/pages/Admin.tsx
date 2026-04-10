import { useState } from "react";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Users, Utensils, Activity, Flame, ShieldAlert, Lock, 
  ArrowRight, Loader2, BarChart3, TrendingUp, ChevronRight, Award,
  LayoutDashboard, PieChart, Trash2, Settings, UserCircle, Search, Plus
} from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell, CartesianGrid 
} from "recharts";

const ADMIN_EMAIL = "yuvrajbhardwaj2005yb@gmail.com";
const ADMIN_PASSWORD = "yuvjig58";

const Admin = () => {
  const { data: foodItems, isLoading: isFoodLoading } = useQuery({
    queryKey: ["food_items"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("food_items")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const [timeframe, setTimeframe] = useState("7d");
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin_detailed_stats", timeframe],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await supabase.rpc("get_admin_detailed_stats", { p_timeframe: timeframe });
      if (error) throw error;
      return (data as unknown) as {
        summary: {
          total_users: number;
          total_logs_all_time: number;
          total_logs_today: number;
          total_calories_all_time: number;
          total_calories_today: number;
          active_residents_today: number;
          active_guests_today: number;
          total_guests_ever: number;
        };
        trends: { date: string; users: number; logs: number }[];
        ranks: { rank: string; count: number }[];
        top_items: { name: string; count: number }[];
      };
    },
    enabled: isAuthenticated,
  });

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect secondary password.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Admin Access
          </h1>
          <p className="text-muted-foreground">Secondary authentication required.</p>
        </div>

        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm shadow-2xl mt-8 w-full max-w-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter admin key..."
                className="pl-10 h-11 bg-background border-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-destructive font-medium pl-1">{error}</p>}
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 transition-opacity">
              Verify Credentials <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background border-l border-border/50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
            <Utensils className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Nutrisense.</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: "Dashboard", icon: LayoutDashboard, active: true },
            { label: "Menu", icon: Utensils },
            { label: "Analytics", icon: PieChart },
            { label: "Food Waste", icon: Trash2 },
            { label: "Customers & Staff", icon: Users },
            { label: "Setting", icon: Settings },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                item.active 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-3 px-3">
             <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-muted-foreground" />
             </div>
             <div className="min-w-0">
                <p className="text-sm font-bold truncate">Admin User</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Super Admin</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Dashboard
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
               <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
               <ChevronRight className="h-3 w-3" />
               <span className="text-xs font-bold uppercase tracking-widest text-primary/80">Menu Management</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 h-10 w-[200px] bg-card rounded-xl border-border" />
            </div>
            <Button className="h-10 rounded-xl gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Add Food Item
            </Button>
          </div>
        </header>

        <BoneyardSkeleton name="admin-stats-grid" loading={isFoodLoading || isStatsLoading}>
          <div className="grid grid-cols-1 gap-8">
            {/* Menu Table Card */}
            <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
              <div className="p-6 border-b border-border bg-muted/20">
                <h2 className="text-lg font-bold">Food Menu Management</h2>
                <p className="text-xs text-muted-foreground">Manage items available in the cafeteria.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/10">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Food Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nutrition</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(foodItems as any[])?.map((f: any, i: number) => (
                      <tr key={f.food_id || i} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-sm">{f.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {f.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-primary">₹{(f.price || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-[10px] space-y-0.5">
                          <p className="font-bold text-foreground/80">{f.calories} KCAL</p>
                          <p className="text-muted-foreground font-medium">P:{f.protein}g C:{f.carbs}g F:{f.fats}g</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            f.is_available ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${f.is_available ? "bg-emerald-500" : "bg-red-500"}`} /> 
                            {f.is_available ? "AVAILABLE" : "OUT OF STOCK"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                 <TrendingUp className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Keeping original charts below for functionality */}
                {/* Trend Chart */}
                <Card className="lg:col-span-2 p-6 border-border bg-card/40">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Usage Over Time
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      Period: {timeframe.toUpperCase()}
                    </p>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats?.trends}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} 
                          tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                          itemStyle={{ color: 'white' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="users" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorUsers)" 
                          strokeWidth={2}
                          name="Active Users"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="logs" 
                          stroke="rgba(255,255,255,0.2)" 
                          fill="transparent" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          name="Meal Entries"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Top Meals */}
                <Card className="p-6 border-border bg-card/40">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Utensils className="h-4 w-4 text-primary" /> Popular Selections
                  </h3>
                  <div className="space-y-4">
                    {stats?.top_items.length ? stats.top_items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold">#{i+1}</div>
                          <span className="text-sm font-medium text-foreground/80 truncate max-w-[150px]">
                            {item.name || "Unknown Item"}
                          </span>
                        </div>
                        <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform">{item.count} logs</span>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground italic text-center py-10">No data found</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Reward Tier Distribution */}
              <Card className="p-6 border-border bg-card/40">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" /> Reward Tier Distribution
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Campus Standing</p>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.ranks}>
                      <XAxis 
                        dataKey="rank" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fill: 'rgba(255,255,255,0.3)'}} 
                      />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stats?.ranks.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
        </BoneyardSkeleton>

        <footer className="pt-10 border-t border-border/40 flex justify-between items-center px-4">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">SmartCafe Unified Portal v3.2</p>
          <div className="flex items-center gap-2 text-[10px] text-primary font-bold animate-pulse">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" /> INSTITUTIONAL LINK ESTABLISHED
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Admin;
