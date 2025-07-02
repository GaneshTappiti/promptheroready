import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    toast.success("Thanks for joining our waitlist!");
    setEmail("");
  };

  return (
    <section className="w-full pt-28 pb-20 md:pt-32 md:pb-28 relative overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm backdrop-blur-sm border border-white/10">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Transforming ideas into reality</span>
          </div>
          
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
              The Ultimate <span className="text-gradient">AI Platform</span> For <br />
              Startup Founders
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Transform your ideas into successful startups with our all-in-one validation, 
              planning, and development platform powered by AI.
            </p>
          </div>
          
          <div className="w-full max-w-md space-y-3">
            <form className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2" onSubmit={handleSubmit}>
              <Input
                className="flex-1 bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-white/50"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500">
              No credit card required. 14-day free trial.
            </p>
          </div>
          
          <div className="flex mt-8 gap-4">
            <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
              <Link to="/features">
                Explore Features
              </Link>
            </Button>
            <Button asChild>
              <Link to="/auth">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-20 left-0 w-full">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl"></div>
      </div>
    </section>
  );
};

export default Hero;
