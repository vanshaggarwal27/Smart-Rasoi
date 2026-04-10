import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, QrCode, CreditCard, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
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
  const [method, setMethod] = useState<'wallet' | 'card'>('wallet');

  const handlePay = async () => {
    if (method === 'wallet') {
      toast({
        title: "Transaction Initiated",
        description: "Your digital ID has been sent to the vendor.",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("checkout", {
        body: { 
          priceId: "price_1TKeTX3vPIpgvTQUeeezals5", 
          userId: user?.id 
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Payment System</h1>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="text-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Current Balance</p>
            <p className="text-4xl font-black text-primary">₹{(settings as any)?.wallet_balance || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-primary/10">
            <QrCode className="h-44 w-44 text-black" />
          </div>
          <div className="text-center mt-2">
            <p className="text-sm font-black uppercase tracking-widest text-primary">Scan to Pay</p>
            <p className="text-xs text-muted-foreground mt-1">Institutional ID: NMIMS-2024-8842</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Quick Options</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setMethod('wallet')}
              className={`h-20 flex flex-col gap-1 items-center justify-center rounded-xl transition-all ${method === 'wallet' ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border'}`}
            >
              <Wallet className={`h-5 w-5 ${method === 'wallet' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] uppercase font-bold ${method === 'wallet' ? 'text-primary' : 'text-muted-foreground'}`}>College Wallet</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setMethod('card')}
              className={`h-20 flex flex-col gap-1 items-center justify-center rounded-xl transition-all ${method === 'card' ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border'}`}
            >
              <CreditCard className={`h-5 w-5 ${method === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] uppercase font-bold ${method === 'card' ? 'text-primary' : 'text-muted-foreground'}`}>Debit Card</span>
            </Button>
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-primary/30 flex items-center gap-3">
           <Clock className="h-5 w-5 text-primary" />
           <p className="text-[11px] font-medium leading-tight">
             Seamless and fast digital payments reduce queue time in the cafeteria.
           </p>
        </div>

        <Button 
          onClick={handlePay} 
          disabled={loading}
          className="w-full h-12 text-md font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            method === 'card' ? "Top up ₹800" : "Complete Transaction"
          )}
        </Button>

      </div>
    </div>
  );
};

export default Payment;
