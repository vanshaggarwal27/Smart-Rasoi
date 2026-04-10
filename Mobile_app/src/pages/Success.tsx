import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Receipt, Wallet } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { Skeleton as BoneyardSkeleton } from 'boneyard-js/react';

const Success = () => {
  const navigate = useNavigate();
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    // Clear pending cart upon successful payment
    localStorage.removeItem("stitch_pending_cart");
  }, []);

  return (
    <BoneyardSkeleton name="payment-success-screen" loading={isLoading}>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
          Payment Success!
        </h1>
        <p className="text-muted-foreground max-w-[280px] mx-auto text-sm leading-relaxed">
          Your transaction has been confirmed. Your college wallet has been updated.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-sm border-b border-border/50 pb-4">
            <span className="text-muted-foreground">Order Status</span>
            <span className="font-bold text-green-500 uppercase tracking-wider text-[10px] bg-green-500/10 px-2 py-1 rounded">Confirmed</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Added</span>
              <span className="font-bold text-card-foreground">₹800.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New Balance</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                ₹{(settings as any)?.wallet_balance || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3 pt-4">
        <Button 
          onClick={() => navigate("/")} 
          className="h-14 rounded-2xl text-md font-black uppercase tracking-widest shadow-lg shadow-primary/20 gap-2"
        >
          <Home className="h-5 w-5" />
          Back to Dashboard
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/profile")} 
          className="h-14 rounded-2xl text-md font-black uppercase tracking-widest gap-2"
        >
          <Receipt className="h-5 w-5" />
          View History
        </Button>
      </div>
    </div>
    </BoneyardSkeleton>
  );
};

export default Success;
