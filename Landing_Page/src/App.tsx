import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence
} from "framer-motion";
import SmoothScrollHero from "@/components/ui/smooth-scroll-hero";
import { GlowCard } from "@/components/ui/spotlight-card";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { NavBar } from "@/components/ui/tube-light-navbar";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import {
  Home, Sparkles, BrainCircuit, TrendingUp, MessageSquare,
  Activity, QrCode, Leaf, Droplet, UserCircle2,
  Pointer, CreditCard, GraduationCap, Building2,
  CheckCircle2, LogIn, Bell
} from "lucide-react";

const smartrasoiTestimonials = [
  {
    text: "SmartRasoi completely changed how I eat on campus. The AI suggestions are surprisingly accurate and I've lost 4kg without trying hard!",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Priya Sharma",
    role: "CS Student, Year 2",
  },
  {
    text: "The QR checkout is so fast. No more queues. I just scan, pay, and go. The cafeteria feels like the future now.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Rohan Mehta",
    role: "Engineering Student",
  },
  {
    text: "As someone with PCOS, the cycle-aware meal suggestions are genuinely helpful. I didn't expect a cafeteria app to go this deep.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Ananya Joshi",
    role: "Medical Student",
  },
  {
    text: "Managing the cafeteria used to be chaotic. With SmartRasoi analytics, we cut food waste by nearly 30% in the first month.",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    name: "Suresh Kumar",
    role: "Cafeteria Manager",
  },
  {
    text: "My energy levels throughout the day noticeably improved once I started following the AI's meal schedule. It just works.",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
    name: "Aarav Patel",
    role: "MBA Student",
  },
  {
    text: "The calorie and macro tracking is seamless. I don't have to manually log anything — SmartRasoi does it automatically at checkout.",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Divya Nair",
    role: "Nutrition & Dietetics Student",
  },
  {
    text: "I was skeptical at first, but the personalized recommendations are spot-on. Feels tailored rather than generic.",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
    name: "Karan Singh",
    role: "Architecture Student",
  },
  {
    text: "The waste reduction stats we see weekly are incredible. The inventory predictions alone save us significant budget every month.",
    image: "https://randomuser.me/api/portraits/women/81.jpg",
    name: "Lakshmi Rao",
    role: "Cafeteria Admin",
  },
  {
    text: "I love that it accounts for my gym days. On heavy training days it suggests higher protein meals automatically.",
    image: "https://randomuser.me/api/portraits/men/63.jpg",
    name: "Nikhil Verma",
    role: "Sports Science Student",
  },
];

const firstColumnTestimonials = smartrasoiTestimonials.slice(0, 3);
const secondColumnTestimonials = smartrasoiTestimonials.slice(3, 6);
const thirdColumnTestimonials = smartrasoiTestimonials.slice(6, 9);

const navItems = [
  { name: 'Home', url: '#', icon: Home },
  { name: 'Features', url: '#features', icon: Sparkles },
  { name: 'Experience', url: '#how-it-works', icon: BrainCircuit },
  { name: 'Impact', url: '#impact', icon: TrendingUp },
  { name: 'Testimonials', url: '#testimonials', icon: MessageSquare }
]

function App() {
  return (
    <div className="bg-white min-h-screen text-[#1C4D35] font-sans">
      <header className="fixed top-0 inset-x-0 z-[150] flex items-center px-6 pt-5 pointer-events-none">
        <NavBar items={navItems} className="pointer-events-auto" />
        <div className="ml-auto flex items-center gap-3">
          <a
            href="http://localhost:3001/"
            className="px-6 py-2.5 text-sm font-bold text-white rounded-full bg-[#1C4D35] hover:bg-[#1C4D35]/90 shadow-lg shadow-[#1C4D35]/20 transition-all duration-200 pointer-events-auto flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> Dashboard
          </a>
        </div>
      </header>

      <SmoothScrollHero
        scrollHeight={1500}
        desktopImage="/hero-bg.png"
        mobileImage="/hero-bg.png"
        initialClipPercentage={25}
        finalClipPercentage={75}
      />

      <section className="py-24 px-6 bg-white" id="about">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1C4D35]">Welcome to SmartRasoi</h2>
          <p className="text-lg text-[#1C4D35]/80 leading-relaxed font-medium">
            We use data-driven AI to suggest meals that align with your body metrics and daily schedule. This isn't just a food menu—it's a personalized health system directly integrated into your campus cafeteria.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#839958]" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white uppercase tracking-widest">What You Get Inside</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              glowColor="green"
              icon={<Sparkles className="w-8 h-8 text-[#93AB63] mb-4" />}
              title="AI Food Recommendations"
              desc="Tailored meals depending on your biometrics and goals."
            />
            <FeatureCard
              glowColor="red"
              icon={<Activity className="w-8 h-8 text-[#D3968C] mb-4" />}
              title="Health & Calorie Tracking"
              desc="Automated logging every time you grab a meal."
            />
            <FeatureCard
              glowColor="purple"
              icon={<QrCode className="w-8 h-8 text-white/50 mb-4" />}
              title="Smart Payments"
              desc="Frictionless checkout using integrated QR codes."
            />
            <FeatureCard
              glowColor="green"
              icon={<Leaf className="w-8 h-8 text-[#93AB63] mb-4" />}
              title="Food Waste Reduction"
              desc="Optimized portion suggestions to help the environment."
            />
            <FeatureCard
              glowColor="blue"
              icon={<Droplet className="w-8 h-8 text-[#196A7C] mb-4" />}
              title="Cycle-Aware Suggestions"
              desc="Contextual macro adjustments based on hormonal phases."
            />
            <FeatureCard
              glowColor="orange"
              icon={<Bell className="w-8 h-8 text-[#93AB63] mb-4" />}
              title="Allergy Alerts"
              desc="Instant warnings for foods containing your known allergens."
            />
          </div>
        </div>
      </section>

      <section className="relative px-6 bg-white" id="how-it-works">
        {/* Sticky Container */}
        <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden">

          {/* Left Side: Device Visual */}
          <div className="relative w-full md:w-1/2 flex justify-center items-center h-full">
            <div className="relative w-[280px] h-[580px] bg-forest rounded-[3rem] border-[8px] border-forest/10 shadow-[0_0_60px_rgba(28,77,53,0.3)] flex flex-col overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-6 bg-forest flex justify-center items-end pb-1">
                <div className="w-16 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Dynamic Screen Content */}
              <div className="flex-1 mt-6 px-4 py-6 bg-white rounded-t-[2.5rem] relative overflow-hidden">
                <ExperienceScreenSwitcher />
              </div>
            </div>

            {/* Floating elements for depth */}
            <div className="absolute top-1/4 -left-10 w-24 h-24 bg-moss/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-10 w-32 h-32 bg-midnight/20 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          {/* Right Side: Text Narrative */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-12 z-10 pointer-events-none">
            <div className="max-w-md">
              <div className="inline-block px-4 py-1.5 rounded-full bg-moss/10 text-moss font-bold text-xs uppercase tracking-widest mb-6">
                Live Interaction
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-forest leading-tight mb-8">
                Your Day, <br />
                <span className="text-moss italic">Redefined.</span>
              </h2>
              <p className="text-lg text-forest/60 font-medium leading-relaxed">
                Experience the seamless fusion of AI and nutrition. Scroll to walk through the journey.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll triggers (Invisible spacers that trigger the state changes) */}
        <div className="h-[300vh] w-full" />
      </section>

      <section className="py-24 px-6 bg-[#839958]" id="impact">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-white uppercase tracking-widest">The Impact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <GlowCard customSize={true} glowColor="green" cardBackground="#1C4D35" className="flex flex-col items-center border-[#93AB63]/40 shadow-xl">
              <GraduationCap className="w-12 h-12 text-[#93AB63] mb-6" />
              <h3 className="text-2xl font-semibold mb-6 text-white relative z-10">For Students</h3>
              <ul className="space-y-4 w-full relative z-10">
                <ImpactItem text="Healthier eating habits" />
                <ImpactItem text="Better mental focus through customized macros" />
                <ImpactItem text="Transparent calorie tracking" />
              </ul>
            </GlowCard>
            <GlowCard customSize={true} glowColor="blue" cardBackground="#1C4D35" className="flex flex-col items-center border-[#93AB63]/40 shadow-xl">
              <Building2 className="w-12 h-12 text-[#93AB63] mb-6" />
              <h3 className="text-2xl font-semibold mb-6 text-white relative z-10">For Cafeteria Admin</h3>
              <ul className="space-y-4 w-full relative z-10">
                <ImpactItem text="Radically reduced food waste" />
                <ImpactItem text="Predictive inventory planning" />
                <ImpactItem text="Real-time popularity analytics" />
              </ul>
            </GlowCard>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white" id="testimonials">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-12">
            <div className="border border-[#93AB63]/40 text-[#93AB63] py-1 px-4 rounded-lg text-sm bg-[#93AB63]/10 font-bold mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-center text-[#1C4D35]">
              Real Stories from Users
            </h2>
          </div>
          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[750px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumnTestimonials} duration={15} />
            <TestimonialsColumn testimonials={secondColumnTestimonials} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumnTestimonials} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-[#839958]">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-[#1C4D35] border border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold mb-4 text-white">Start Your Smart Eating Journey</h2>
          <p className="text-white/80 font-medium mb-8 max-w-2xl mx-auto">Access your personalized health dashboard and make every meal count.</p>
          <div className="flex gap-4 justify-center">
            <a href="http://localhost:3001/" className="px-8 py-4 bg-white hover:bg-beige text-[#1C4D35] rounded-full font-bold transition-all shadow-lg flex items-center gap-2">
              <LogIn className="w-5 h-5" /> Login to Dashboard
            </a>
            <a href="http://localhost:3001/" className="flex items-center px-8 py-4 bg-[#93AB63] hover:bg-[#93AB63]/90 text-[#1C4D35] rounded-full font-bold transition-all shadow-lg">
              Create Account
            </a>
          </div>
        </div>
      </section>

      <MinimalFooter />
    </div>
  );
}

function ExperienceScreenSwitcher() {
  const { scrollYProgress } = useScroll();
  const [index, setIndex] = React.useState(0);
  const [menuItems, setMenuItems] = React.useState<any[]>([]);

  // Map scroll progress (0 to 1) to screen index (0 to 3)
  const screenIndex = useTransform(scrollYProgress, [0.4, 0.55, 0.7, 0.85], [0, 1, 2, 3]);

  React.useEffect(() => {
    // Fetch real recommendations from backend
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMenuItems(data.slice(0, 3));
        }
      })
      .catch(err => console.error("Failed to fetch menu:", err));
  }, []);

  React.useEffect(() => {
    return screenIndex.on("change", (latest) => {
      setIndex(Math.min(Math.round(latest), 3));
    });
  }, [screenIndex]);

  const screens = [
    {
      id: "scan",
      title: "Tap to Begin",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="w-32 h-32 bg-moss/20 rounded-3xl flex items-center justify-center relative shadow-[0_0_30px_rgba(147,171,99,0.2)]">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-moss/10 rounded-3xl"
            />
            <QrCode className="w-16 h-16 text-moss" />
          </div>
          <p className="text-center text-[#1C4D35]/40 text-[10px] font-bold uppercase tracking-[0.25em] mt-4">Scanner Active</p>
        </div>
      )
    },
    {
      id: "analysis",
      title: "AI Analysis",
      content: (
        <div className="flex flex-col h-full gap-4 pt-4">
          <div className="flex items-center gap-3 p-4 bg-forest rounded-2xl border border-moss/30 shadow-lg">
            <div className="p-2 bg-moss/20 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-moss" />
            </div>
            <div className="text-sm font-bold text-white">Analyzing Biometrics...</div>
          </div>

          <div className="space-y-4 px-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase font-bold text-[#1C4D35]/60 tracking-wider">
                  <span>{i === 1 ? 'Protein Needs' : i === 2 ? 'Activity Level' : 'Metabolic Rate'}</span>
                  <span>{i === 1 ? '72g' : i === 2 ? 'High' : 'Normal'}</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: i * 0.2, duration: 1 }}
                  className="h-1.5 bg-[#1C4D35]/10 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ delay: i * 0.2 + 0.5, duration: 0.8 }}
                    className="h-full bg-moss w-3/4"
                  />
                </motion.div>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-auto p-4 bg-forest rounded-2xl border border-moss/20 shadow-xl"
          >
            <div className="text-[9px] uppercase font-bold text-moss mb-1 tracking-widest">Optimal Choice</div>
            <div className="text-sm font-bold text-white">Suggested: {menuItems[0]?.name || "High Protein Meal"}</div>
          </motion.div>
        </div>
      )
    },
    {
      id: "selection",
      title: "Your Options",
      content: (
        <div className="flex flex-col h-full gap-3">
          <div className="mb-2 text-[10px] font-bold text-[#1C4D35]/40 uppercase tracking-widest">Personalized for you</div>
          <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
            {(menuItems.length > 0 ? menuItems : [
              { name: "Healthy Bowl", price: 120, calories: 450 },
              { name: "Kadhai Paneer", price: 160, calories: 620 },
              { name: "Fruit Salad", price: 60, calories: 210 }
            ]).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-white border border-[#1C4D35]/5 rounded-2xl flex justify-between items-center hover:bg-forest hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-moss/10 flex items-center justify-center group-hover:bg-white/10">
                    {item.calories > 400 ? <Activity size={18} className="text-moss" /> : <Leaf size={18} className="text-moss" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-none mb-1">{item.name}</div>
                    <div className="text-[9px] opacity-50 uppercase font-black tracking-tight">{item.calories || 350} CAL • ₹{item.price}</div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#1C4D35]/10 group-hover:border-white/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-moss opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto pt-4">
            <button className="w-full py-3.5 bg-forest text-white font-bold rounded-2xl text-xs shadow-[0_10px_20px_rgba(28,77,53,0.2)] hover:bg-forest/90 transition-all flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Confirm Selection
            </button>
          </div>
        </div>
      )
    },
    {
      id: "stats",
      title: "Macro Impact",
      content: (
        <div className="flex flex-col h-full bg-forest rounded-[2rem] p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-moss/10 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="relative z-10 text-center mb-8">
            <div className="text-xs font-bold text-moss uppercase tracking-widest mb-2">Daily Progress</div>
            <div className="text-6xl font-black mb-1">92<span className="text-2xl text-moss">%</span></div>
            <div className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">Metabolic Fit</div>
          </div>

          <div className="relative z-10 space-y-6 w-full">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-60">
                <span>Calories</span>
                <span>520/2200</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "24%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-moss rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[8px] uppercase font-bold text-moss mb-1">Protein</div>
                <div className="text-sm font-black">45<span className="text-[10px] font-medium opacity-60 ml-0.5">g</span></div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[8px] uppercase font-bold text-moss mb-1">Wallet</div>
                <div className="text-sm font-black">₹{1240}<span className="text-[10px] font-medium opacity-60 ml-0.5">rem.</span></div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-auto p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-moss flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-forest" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight">Plate Optimized for Peak Focus</span>
            </div>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col pt-2">
      <div className="flex justify-between items-center mb-6 px-4">
        <h4 className="font-black text-forest uppercase tracking-tighter text-base">{screens[index].title}</h4>
        <div className="flex gap-1.5">
          {screens.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === index ? 'w-6 bg-moss' : 'w-1.5 bg-forest/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 relative px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="absolute inset-x-4 inset-y-0"
          >
            {screens[index].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, glowColor = 'blue' }: { icon: React.ReactNode, title: string, desc: string, glowColor?: any }) {
  return (
    <GlowCard customSize={true} glowColor={glowColor} cardBackground="#1C4D35" className="hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full border-[#93AB63]/40 shadow-xl">
      <div className="relative z-10">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white relative z-10">{title}</h3>
      <p className="text-sm text-white/80 font-medium relative z-10">{desc}</p>
    </GlowCard>
  );
}

function ImpactItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-white font-medium bg-white/5 p-3 rounded-lg border border-white/10 group hover:bg-white/10 transition-colors">
      <CheckCircle2 className="w-5 h-5 text-[#93AB63] shrink-0" />
      <span>{text}</span>
    </li>
  );
}

export default App;
