import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, QrCode, CreditCard, Wallet, Clock, CheckCircle2, Check, ArrowRight, AlertCircle, Trash2, Minus, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("200");
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('card');
  const [itemName, setItemName] = useState<string | null>(null);
  const [cart, setCart] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amt = params.get("amount");
    const item = params.get("item");
    if (amt) setAmount(amt);
    if (item) setItemName(item);

    const savedCart = localStorage.getItem("stitch_pending_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }

    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const cartItems = useMemo(() => {
    if (!cart) return [];
    return Object.values(cart);
  }, [cart]);

  const totalAmount = useMemo<number>(() => {
    if (!cart) return parseFloat(amount) || 0;
    return (cartItems as any[]).reduce((acc: number, item: any) => acc + (Number(item.food.price) || 0) * item.quantity, 0);
  }, [cart, cartItems, amount]);

  const updateCart = (newCart: any) => {
    setCart(newCart);
    localStorage.setItem("stitch_pending_cart", JSON.stringify(newCart));
    if (Object.keys(newCart).length === 0) {
      localStorage.removeItem("stitch_pending_cart");
      navigate("/cafe");
    }
  };

  const removeItem = (foodId: string) => {
    const newCart = { ...cart };
    delete newCart[foodId];
    updateCart(newCart);
    toast({ title: "Item removed" });
  };

  const updateQuantity = (foodId: string, delta: number) => {
    const newCart = { ...cart };
    const item = newCart[foodId];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      delete newCart[foodId];
    } else {
      newCart[foodId] = { ...item, quantity: newQty };
    }
    updateCart(newCart);
  };

  const balance = (settings as any)?.wallet_balance || 0;

  const handlePayment = async () => {
    if (paymentMethod === 'wallet') {
      toast({
        title: "Transaction Initiated",
        description: `Your digital ID has been sent to the vendor for ${itemName || 'your order'}.`,
      });
      return;
    }

    try {
      setLoading(true);
      
      // If no cart, create a virtual one for top-up
      const checkoutCart = cart || { 
        "topup": { 
          food: { 
            name: itemName || "Wallet Top-up", 
            price: totalAmount,
            calories: 0,
            protein: 0
          }, 
          quantity: 1 
        } 
      };

      const { data, error } = await supabase.functions.invoke("checkout", {
        body: { 
          cart: checkoutCart,
          amount: totalAmount,
          userId: user?.id,
          studentName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Student"
        },
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment status",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BoneyardSkeleton name="payment-screen" loading={isLoading}>
      <div className="space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">College Wallet</h1>
          <p className="text-muted-foreground text-sm">
            {itemName ? `Paying for ${itemName}` : "Manage your campus meal balance and digital payments"}
          </p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 p-6 rounded-3xl relative overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="h-24 w-24 text-primary -rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Current Balance</span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-foreground">₹{balance?.toLocaleString('en-IN') || "0"}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Available for all campus outlets</p>
            </div>
          </div>
        </Card>

        {cart && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Order Summary</h3>
            <div className="bg-card/50 rounded-3xl p-5 border border-primary/10 divide-y divide-muted/30 shadow-sm">
              {cartItems.map((item: any) => (
                <div key={item.food.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/30 rounded-lg p-0.5 border border-muted/50">
                      <button 
                        onClick={() => updateQuantity(item.food.id, -1)}
                        className="h-6 w-6 flex items-center justify-center text-primary hover:bg-primary/10 rounded-md transition-all active:scale-90"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-[10px] font-black text-foreground">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.food.id, 1)}
                        className="h-6 w-6 flex items-center justify-center text-primary hover:bg-primary/10 rounded-md transition-all active:scale-90"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground leading-tight">{item.food.name}</span>
                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">
                        ₹{item.food.price} / unit
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-foreground">₹{(item.food.price || 50) * item.quantity}</span>
                    <button 
                      onClick={() => removeItem(item.food.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t-2 border-dashed border-muted flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Payable</span>
                <span className="text-xl font-black text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {!cart && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Top Up Amount</h3>
            <div className="grid grid-cols-3 gap-3">
              {[200, 500, 1000].map((amt) => (
                <Button
                  key={amt}
                  variant={amount === amt.toString() ? "default" : "outline"}
                  onClick={() => setAmount(amt.toString())}
                  className={`h-14 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg ${
                    amount === amt.toString() 
                    ? "shadow-primary/20" 
                    : "bg-background/50 border-primary/20"
                  }`}
                >
                  ₹{amt}
                </Button>
              ))}
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black pointer-events-none group-focus-within:text-primary transition-colors">₹</div>
              <Input
                type="number"
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 pl-8 rounded-2xl bg-muted/30 border-none font-black text-lg focus:ring-2 ring-primary/20 transition-all placeholder:font-medium placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Payment Method</h3>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                paymentMethod === "card" 
                ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                : "bg-background border-border/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                  paymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">Debit / Credit Card</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Powered by Stripe</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                paymentMethod === "card" ? "border-primary bg-primary" : "border-border"
              }`}>
                {paymentMethod === "card" && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("wallet")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                paymentMethod === "wallet" 
                ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                : "bg-background border-border/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                  paymentMethod === "wallet" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">Pay with Wallet</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Instant checkout</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                paymentMethod === "wallet" ? "border-primary bg-primary" : "border-border"
              }`}>
                {paymentMethod === "wallet" && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>
            </button>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={!totalAmount || totalAmount <= 0 || loading}
          className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Confirm Payment
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>

        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start gap-3">
          <div className="mt-1 h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <AlertCircle className="h-3 w-3 text-blue-500" />
          </div>
          <p className="text-[11px] text-blue-600/80 font-medium leading-relaxed uppercase tracking-wider">
            Your payments are secured by institution-grade encryption. Wallet balance can be used at all 
            <span className="text-blue-600 font-black"> campus-wide outlets</span>.
          </p>
        </div>
      </div>
    </BoneyardSkeleton>
  );
};

export default Payment;
