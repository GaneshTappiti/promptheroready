import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      id: "dashboard",
      icon: "🏠",
      title: "Dashboard",
      description: "Launchpad to all tools with quick access, daily brief, and startup health meter",
      gradient: "feature-gradient-1",
      path: "/workspace",
    },
    {
      id: "idea-vault",
      icon: "💡",
      title: "Idea Vault",
      description: "Store + grow ideas with AI enhancer, tags, voting, and privacy controls",
      gradient: "feature-gradient-2",
      path: "/workspace/idea-vault",
    },
    {
      id: "ai-roadmap",
      icon: "🧠",
      title: "AI Roadmap",
      description: "Auto-generate business plans with GPT-based phase planning and editable milestones",
      gradient: "feature-gradient-3",
      path: "/workspace/blueprint-zone",
    },

    {
      id: "mvp-studio",
      icon: "🧱",
      title: "MVP Studio",
      description: "Build using AI + no-code with builder templates, GPT codex, and MVP checklists",
      gradient: "feature-gradient-1",
      path: "/workspace/mvp-studio",
    },
    {
      id: "docs-decks",
      icon: "🧾",
      title: "Docs & Decks",
      description: "Auto-generate investor decks, one-pagers and more with AI assistance",
      gradient: "feature-gradient-2",
      path: "/workspace/docs-decks",
    },
    {
      id: "teamspace",
      icon: "👥",
      title: "TeamSpace",
      description: "Collaborate with founders and team members with roles, chat, and co-founder tasks",
      gradient: "feature-gradient-3",
      path: "/workspace/teamspace",
    },
    {
      id: "investor-radar",
      icon: "🔍",
      title: "Investor Radar",
      description: "Get matched to VCs with filters by region, sector, ticket size, and stage",
      gradient: "feature-gradient-4",
      path: "/workspace/investor-radar",
    },
    {
      id: "idea-wiki",
      icon: "📓",
      title: "Idea Wiki",
      description: "Build a knowledge base with Markdown editor, tag system, and linked docs",
      gradient: "feature-gradient-2",
      path: "/workspace/idea-wiki",
    },
  ];

  const killerFeatures = [
    {
      title: "Founder's GPT",
      icon: "🪄",
      description: "Built-in custom GPT trained on YC blogs, IndieHackers posts, Naval quotes, Alex Hormozi books, and failed startup post-mortems",
      bullets: [
        "Get answers on how to validate a 2-sided marketplace",
        "Generate SaaS landing page copy",
        "Create tagline ideas for your product",
      ]
    },
    {
      title: "Vision-to-MVP Wizard",
      icon: "🧠",
      description: "Write 3 lines of your idea and generate everything you need to start building",
      bullets: [
        "Landing page copy + design suggestions",
        "Tech stack recommendations",
        "Feature roadmap and launch strategy",
        "Monetization models tailored to your idea",
      ]
    },
    {
      title: "Time Auto-Balancer",
      icon: "📅",
      description: "Tell it your availability and it re-arranges your roadmap + tasks to match your lifestyle",
      bullets: [
        "AI-driven schedule optimization",
        "Adapts to life events and time constraints",
        "Suggests optimal work patterns based on your preferences",
      ]
    },
    {
      title: "Investor-Ready Docs in Clicks",
      icon: "🧾",
      description: "AI auto-generates all the documents you need to pitch investors",
      bullets: [
        "One-pagers and pitch decks",
        "Business model canvas",
        "Go-to-market strategy",
        "Export as PDF/Notion/GDocs formats",
      ]
    },
    {
      title: "Traction + Feedback Dashboard",
      icon: "🎯",
      description: "Integrates with analytics tools to provide insights on your startup's performance",
      bullets: [
        "User growth over time visualization",
        "Retention heatmaps",
        "Feedback sentiment analysis",
        "Integration with Google Analytics & Firebase",
      ]
    },
    {
      title: "No-Code AI Builder Companion",
      icon: "🧱",
      description: "Like GPT + Webflow + Bubble + Stripe helper in one spot",
      bullets: [
        "Generate code blocks for common features",
        "Recommendations for no-code tools",
        "Auto-deploy via Vercel / Netlify / Bubble",
      ]
    },
  ];
  
  return (
    <section className="w-full py-16 md:py-24 relative" id="features">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            StartWise – Your Smart Startup Sidekick
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            From Idea to IPO, One Tab at a Time
          </h2>
          <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
            The ultimate AI-powered platform designed to take your startup from concept to launch and beyond
          </p>
        </div>
        
        {/* Core Modules Grid */}
        <h3 className="text-2xl font-semibold text-center mb-8">The StartWise OS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.id} className={`workspace-card overflow-hidden ${feature.gradient}`}>
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
                <Button asChild className="mt-4">
                  <Link to={feature.path}>
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Killer Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-12">
            <span className="bg-clip-text bg-gradient-to-r from-primary to-purple-400 text-transparent">
              Killer Features That Make Us Unique
            </span>
          </h3>
          
          <div className="grid gap-12">
            {killerFeatures.map((feature, index) => (
              <div key={index} className={`flex flex-col lg:flex-row gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="lg:w-1/2 flex items-center justify-center">
                  <div className={`w-full h-64 rounded-2xl glass-effect flex items-center justify-center ${index % 2 === 0 ? 'feature-gradient-1' : 'feature-gradient-2'}`}>
                    <span className="text-7xl">{feature.icon}</span>
                  </div>
                </div>
                <div className="lg:w-1/2 flex flex-col justify-center">
                  <h4 className="text-2xl font-bold mb-4">{feature.title}</h4>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-6">Ready to supercharge your startup journey?</h3>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/workspace">
              Enter Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
