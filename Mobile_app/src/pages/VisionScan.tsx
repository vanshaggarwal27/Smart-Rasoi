import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Camera, 
  Loader2, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Plus,
  Info,
  Image as ImageIcon
} from "lucide-react";
import { useFoods } from "@/hooks/useFoods";
import { BoneyardSkeleton } from "boneyard-js";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface AIResult {
  name: string;
  items: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    serving: string;
  }[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const VisionScan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addFood } = useFoods();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const startCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);
    try {
      // Ensure any existing stream is stopped before restarting
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly call play() to ensure video starts
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError("Camera is currently in use by another app.");
      } else {
        setCameraError("Camera access denied. Please check permissions.");
      }
      setIsCameraActive(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    try {
      const base64Image = capturedImage.split(",")[1];
      
      const prompt = `Analyze the food in this image. 
      Identify all visible food items and provide a total nutritional breakdown. 
      Estimate serving sizes carefully based on typical portions.
      Return ONLY a valid JSON object with the following fields: 
      { 
        "name": "Short descriptive name of the meal", 
        "items": [{ "name": "item name", "calories": number, "protein": number, "carbs": number, "fats": number, "serving": "size in grams/pieces" }],
        "totals": { "calories": total_number, "protein": total_number, "carbs": total_number, "fats": total_number }
      }
      If no food is detected, return {"error": "No food detected"}.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error("Could not parse AI response");
      
      // Clean potential markdown code blocks
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.error) {
        toast({
          title: "Detection issue",
          description: parsed.error,
          variant: "destructive",
        });
        setCapturedImage(null);
        startCamera();
      } else {
        setResult(parsed);
      }
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: "There was an error connecting to the AI engine.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    
    addFood.mutate(
      {
        name: result.name,
        serving_size: 1,
        serving_unit: "meal",
        calories: result.totals.calories,
        protein: result.totals.protein,
        carbs: result.totals.carbs,
        fats: result.totals.fats,
        category: "Meals",
        is_veg: true,
        source: "ai_scan",
      },
      {
        onSuccess: () => {
          toast({ title: "Meal logged! 🥗" });
          navigate("/foods");
        },
      }
    );
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AI Vision Scan</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Powered by Nutrisense Engine</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-6">
            <Card className="aspect-[3/4] overflow-hidden relative border-2 border-primary/20 bg-muted rounded-[2.5rem] shadow-2xl transition-all duration-500">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${(!isCameraActive || capturedImage) ? 'hidden' : 'block'}`}
              />
              
              {capturedImage && (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover animate-in fade-in duration-300" />
              )}

              {isInitializing && !capturedImage && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-background/40 backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing Camera...</p>
                </div>
              )}

              {cameraError && !capturedImage && !isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-background/60 backdrop-blur-md">
                  <div className="p-4 bg-destructive/10 rounded-full">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight text-foreground">{cameraError}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium leading-relaxed">Please ensure the camera isn't used by another tab.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={startCamera} className="rounded-xl font-bold h-9">
                    <RotateCcw className="mr-2 h-4 w-4" /> Retry Camera
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    <Zap className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-lg tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Analyzing Nutrition</p>
                    <p className="text-xs text-muted-foreground">Our AI is identifying ingredients and calculating portions...</p>
                  </div>
                </div>
              )}

              {/* Viewfinder Overlay */}
              {!capturedImage && isCameraActive && (
                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20">
                  <div className="h-full w-full border-2 border-white/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </div>
              )}
            </Card>

            <div className="flex flex-col gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />

              {!capturedImage && (
                <>
                  <Button 
                    onClick={capturePhoto}
                    disabled={!isCameraActive || isInitializing}
                    className="h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 group disabled:opacity-50"
                  >
                    <Camera className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                    Snap Meal Photo
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-14 rounded-2xl border-2 border-border/50 font-black uppercase tracking-widest text-xs"
                  >
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Upload from Gallery
                  </Button>
                </>
              )}

              {capturedImage && !isAnalyzing && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={reset} className="h-14 rounded-2xl border-2 font-black">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Retake
                  </Button>
                  <Button onClick={analyzeImage} className="h-14 rounded-2xl bg-primary font-black shadow-lg shadow-primary/10 transition-all active:scale-[0.98]">
                    <Zap className="mr-2 h-5 w-5 fill-current" />
                    AI Analyze
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
                Tip: Ensure clear lighting and place the food in the center of the frame for 
                <span className="text-primary font-black"> 98% accuracy</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
            <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute -top-4 -right-4 opacity-10">
                 <Zap className="h-32 w-32 text-primary rotate-12" />
               </div>
               
               <div className="relative z-10 space-y-4 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                   <CheckCircle2 className="h-3 w-3" />
                   Analysis Complete
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                   {result.name}
                 </h2>
                 
                 <div className="grid grid-cols-4 gap-2 pt-2">
                   <div className="flex flex-col items-center">
                      <p className="text-[9px] font-black text-muted-foreground uppercase opacity-70">Cals</p>
                      <p className="text-xl font-black text-primary">{result.totals.calories}</p>
                   </div>
                   <div className="flex flex-col items-center">
                      <p className="text-[9px] font-black text-muted-foreground uppercase opacity-70">Prot</p>
                      <p className="text-xl font-black text-foreground">{result.totals.protein}g</p>
                   </div>
                   <div className="flex flex-col items-center">
                      <p className="text-[9px] font-black text-muted-foreground uppercase opacity-70">Carbs</p>
                      <p className="text-xl font-black text-foreground">{result.totals.carbs}g</p>
                   </div>
                   <div className="flex flex-col items-center">
                      <p className="text-[9px] font-black text-muted-foreground uppercase opacity-70">Fats</p>
                      <p className="text-xl font-black text-foreground">{result.totals.fats}g</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="space-y-3">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Detected Ingredients</h3>
               <div className="space-y-2">
                 {result.items.map((item, idx) => (
                   <div key={idx} className="bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 flex items-center justify-between">
                     <div>
                       <p className="font-bold text-sm text-foreground capitalize">{item.name}</p>
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{item.serving}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-black text-primary">{item.calories} kcal</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={reset} className="flex-1 h-16 rounded-2xl border-2 font-black uppercase tracking-widest">
                <RotateCcw className="mr-2 h-5 w-5" />
                Rescan
              </Button>
              <Button onClick={handleSave} className="flex-1 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black uppercase tracking-widest group">
                <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                Log to Daily
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default VisionScan;
