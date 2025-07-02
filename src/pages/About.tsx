
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full pt-28 pb-20 md:pt-32 md:pb-28 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm backdrop-blur-sm border border-white/10">
                <span>Our Story</span>
              </div>
              
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
                  About <span className="text-gradient">Startify OS</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  We're building the ultimate platform for founders to turn ideas into successful startups faster than ever before.
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 left-0 w-full">
            <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"></div>
            <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl"></div>
          </div>
        </section>
        
        {/* Mission Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-black/80">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                  Our Mission
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">Empowering the Next Generation of Founders</h2>
                <p className="text-muted-foreground md:text-lg">
                  We believe that innovation shouldn't be held back by technical limitations or lack of resources. 
                  Our mission is to democratize startup creation by giving founders the AI-powered tools they 
                  need to validate, plan, and build their ideas quickly and efficiently.
                </p>
              </div>
              <div className="relative rounded-lg overflow-hidden aspect-video glass-effect">
                <img 
                  src="https://i.imgur.com/XQK6xDp.png" 
                  alt="Startify OS Dashboard" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Our Team
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Meet the Builders</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                A diverse group of entrepreneurs, developers, and AI specialists with a passion for startups.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full mb-4 overflow-hidden border-2 border-primary/30">
                    <img 
                      src={`https://i.pravatar.cc/300?img=${i+1}`} 
                      alt="Team Member" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{["Alex Chen", "Sarah Johnson", "Michael Rodriguez", "Emily Kim"][i]}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{["Founder & CEO", "CTO", "Head of Product", "AI Lead"][i]}</p>
                  <p className="text-sm text-muted-foreground">
                    {["Serial entrepreneur with 3 exits", "Former Google engineer", "Product leader from Airbnb", "AI researcher with MIT background"][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-black/90">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Our Values
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What Drives Us</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                The core principles that guide our product development and company culture.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  title: "Innovation First", 
                  description: "We constantly push the boundaries of what's possible with AI and product development." 
                },
                { 
                  title: "Founder Empathy", 
                  description: "We build with a deep understanding of the challenges founders face, because we've been there." 
                },
                { 
                  title: "Accessibility", 
                  description: "We believe great tools should be available to everyone, regardless of technical background." 
                },
                { 
                  title: "Data-Driven", 
                  description: "We rely on data and feedback to continuously improve our platform and provide value." 
                },
                { 
                  title: "Community", 
                  description: "We foster a supportive environment where founders can learn from each other." 
                },
                { 
                  title: "Long-Term Vision", 
                  description: "We're building for the future, creating tools that evolve as startup needs change." 
                }
              ].map((value, i) => (
                <div key={i} className="p-6 feature-gradient-1 rounded-lg border border-white/10">
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-black relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to Build Your Startup?
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl mt-4">
                  Join us on this journey and turn your ideas into reality with Startify OS.
                </p>
                <div className="pt-6">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/workspace">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-violet-600/10 filter blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-pink-600/10 filter blur-3xl"></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
