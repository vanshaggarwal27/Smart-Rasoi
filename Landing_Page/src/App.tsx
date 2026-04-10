import SmoothScrollHero from "@/components/ui/smooth-scroll-hero";
import { GlowCard } from "@/components/ui/spotlight-card";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { PillBase } from "@/components/ui/3d-adaptive-navigation-bar";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
// The user prompt specifically says: "3. Use lucide-react icons for svgs or logos if component requires them"
import { Sparkles, Activity, QrCode as LucideQrCode, Leaf as LucideLeaf, Droplet, UserCircle2, BrainCircuit, Pointer, CreditCard as LucideCreditCard, TrendingUp, GraduationCap, Building2, CheckCircle2, LogIn, Bell } from "lucide-react";


const nutrisenseTestimonials = [
  {
    text: "NutriSense completely changed how I eat on campus. The AI suggestions are surprisingly accurate and I've lost 4kg without trying hard!",
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
    text: "Managing the cafeteria used to be chaotic. With NutriSense analytics, we cut food waste by nearly 30% in the first month.",
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
    text: "The calorie and macro tracking is seamless. I don't have to manually log anything — NutriSense does it automatically at checkout.",
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

const firstColumnTestimonials = nutrisenseTestimonials.slice(0, 3);
const secondColumnTestimonials = nutrisenseTestimonials.slice(3, 6);
const thirdColumnTestimonials = nutrisenseTestimonials.slice(6, 9);

function App() {
  return (
    <div className="bg-forest min-h-screen text-beige font-sans">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-center px-6 pt-5">
        {/* Centered pill - truly centered via absolute */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <PillBase />
        </div>
        {/* Auth buttons on the right */}
        <div className="ml-auto flex items-center gap-3">
          <a
            href="/signin"
            className="px-5 py-2.5 text-sm font-medium text-beige/80 hover:text-beige rounded-full border border-beige/20 hover:border-beige/40 backdrop-blur-md bg-beige/5 hover:bg-beige/10 transition-all duration-200"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="px-5 py-2.5 text-sm font-semibold text-forest rounded-full bg-beige hover:bg-beige-dark shadow-lg shadow-beige/30 transition-all duration-200"
          >
            Sign Up
          </a>
        </div>
      </header>

      {/* 1. Hero Section using SmoothScrollHero */}
      <SmoothScrollHero
        scrollHeight={1500}
        desktopImage="/hero-bg.png"
        mobileImage="/hero-bg.png"
        initialClipPercentage={25}
        finalClipPercentage={75}
      />

      {/* 2. About / Overview Section */}
      <section className="py-24 px-6" id="about">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-beige">Welcome to NutriSense</h2>
          <p className="text-lg text-beige/80 leading-relaxed font-medium">
            We use data-driven AI to suggest meals that align with your body metrics and daily schedule. This isn't just a food menu—it's a personalized health system directly integrated into your campus cafeteria.
          </p>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-24 px-6 bg-midnight/30 border-y border-midnight/50" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What You Get Inside</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              glowColor="green"
              icon={<Sparkles className="w-8 h-8 text-moss mb-4" />}
              title="AI Food Recommendations"
              desc="Tailored meals depending on your biometrics and goals."
            />
            <FeatureCard
              glowColor="red"
              icon={<Activity className="w-8 h-8 text-rosy mb-4" />}
              title="Health & Calorie Tracking"
              desc="Automated logging every time you grab a meal."
            />
            <FeatureCard
              glowColor="purple"
              icon={<LucideQrCode className="w-8 h-8 text-beige mb-4" />}
              title="Smart Payments"
              desc="Frictionless checkout using integrated QR codes."
            />
            <FeatureCard
              glowColor="green"
              icon={<LucideLeaf className="w-8 h-8 text-moss mb-4" />}
              title="Food Waste Reduction"
              desc="Optimized portion suggestions to help the environment."
            />
            <FeatureCard
              glowColor="blue"
              icon={<Droplet className="w-8 h-8 text-rosy mb-4" />}
              title="Cycle-Aware Suggestions"
              desc="Contextual macro adjustments based on hormonal phases."
            />
            <FeatureCard
              glowColor="orange"
              icon={<Bell className="w-8 h-8 text-forest mb-4" />}
              title="Allergy Alerts"
              desc="Instant warnings for foods containing your known allergens."
            />
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-24 px-6" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">The Experience</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <FlowStep icon={<UserCircle2 />} title="Login" step={1} />
            <div className="w-1 h-8 md:w-8 md:h-1 bg-moss/30" />
            <FlowStep icon={<BrainCircuit />} title="AI Suggestions" step={2} />
            <div className="w-1 h-8 md:w-8 md:h-1 bg-moss/30" />
            <FlowStep icon={<Pointer />} title="Select Food" step={3} />
            <div className="w-1 h-8 md:w-8 md:h-1 bg-moss/30" />
            <FlowStep icon={<LucideCreditCard />} title="Pay" step={4} />
            <div className="w-1 h-8 md:w-8 md:h-1 bg-moss/30" />
            <FlowStep icon={<TrendingUp />} title="Track Health" step={5} />
          </div>
        </div>
      </section>

      {/* 5. Impact Section */}
      <section className="py-24 px-6 bg-midnight/30 border-y border-midnight/50" id="impact">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">The Impact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <GlowCard customSize={true} glowColor="green" className="flex flex-col items-center">
              <GraduationCap className="w-12 h-12 text-moss mb-6" />
              <h3 className="text-2xl font-semibold mb-6 text-forest relative z-10">For Students</h3>
              <ul className="space-y-4 w-full relative z-10">
                <ImpactItem text="Healthier eating habits" />
                <ImpactItem text="Better mental focus through customized macros" />
                <ImpactItem text="Transparent calorie tracking" />
              </ul>
            </GlowCard>
            <GlowCard customSize={true} glowColor="blue" className="flex flex-col items-center">
              <Building2 className="w-12 h-12 text-moss mb-6" />
              <h3 className="text-2xl font-semibold mb-6 text-forest relative z-10">For Cafeteria Admin</h3>
              <ul className="space-y-4 w-full relative z-10">
                <ImpactItem text="Radically reduced food waste" />
                <ImpactItem text="Predictive inventory planning" />
                <ImpactItem text="Real-time popularity analytics" />
              </ul>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-24 px-6 bg-midnight/30 border-y border-midnight/50" id="testimonials">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-12">
            <div className="border border-moss/40 text-moss py-1 px-4 rounded-lg text-sm bg-moss/10 font-bold mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-forest">
              What students & staff say
            </h2>
            <p className="text-forest/70 text-center mt-4 max-w-xl font-medium">
              Hear directly from the people using NutriSense every day across campus.
            </p>
          </div>
          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[700px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumnTestimonials} duration={15} />
            <TestimonialsColumn testimonials={secondColumnTestimonials} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumnTestimonials} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>

      {/*  Final CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-midnight/40 border border-moss/30 shadow-xl shadow-midnight/50 backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-4 text-beige">Start Your Smart Eating Journey</h2>
          <p className="text-beige/80 font-medium mb-8 max-w-2xl mx-auto">Access your personalized health dashboard and make every meal count.</p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-moss hover:bg-moss-hover text-forest rounded-full font-bold transition-all shadow-lg flex items-center gap-2">
              <LogIn className="w-5 h-5" /> Login Here
            </button>
            <button className="px-8 py-3 bg-beige/90 hover:bg-beige text-forest border-2 border-beige rounded-full font-bold transition-all shadow-lg">
              Sign Up Now
            </button>
          </div>
        </div>
      </section>

      <MinimalFooter />
    </div>
  )
}

function FeatureCard({ icon, title, desc, glowColor = 'blue' }: { icon: React.ReactNode, title: string, desc: string, glowColor?: 'blue'|'purple'|'green'|'red'|'orange' }) {
  return (
    <GlowCard customSize={true} glowColor={glowColor} className="hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full bg-forest/80 border-moss/30 shadow-lg shadow-midnight/20">
      <div className="relative z-10">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-beige relative z-10">{title}</h3>
      <p className="text-sm text-beige/80 font-medium relative z-10">{desc}</p>
    </GlowCard>
  )
}

function FlowStep({ icon, title, step }: { icon: React.ReactNode, title: string, step: number }) {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="w-16 h-16 rounded-full bg-midnight/60 border border-moss/50 flex items-center justify-center text-moss group-hover:scale-110 group-hover:bg-moss group-hover:border-moss group-hover:text-forest transition-all shadow-lg">
        <div className="[&>svg]:w-6 [&>svg]:h-6">
          {icon}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-moss flex font-bold tracking-wider mb-1 justify-center">STEP {step}</div>
        <h4 className="font-bold text-beige">{title}</h4>
      </div>
    </div>
  )
}

function ImpactItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-beige font-medium bg-midnight/40 p-3 rounded-lg border border-moss/30">
      <CheckCircle2 className="w-5 h-5 text-moss shrink-0" />
      <span>{text}</span>
    </li>
  )
}

export default App;
