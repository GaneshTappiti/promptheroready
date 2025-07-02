
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Basic validation for early-stage ideas",
    price: "$0",
    duration: "forever",
    features: [
      "Idea uniqueness validation",
      "Basic roadmap generation",
      "Simple pitch outline",
      "1 UI mockup per month",
      "Community access"
    ],
    recommended: false
  },
  {
    name: "Startup",
    description: "Everything you need to launch your MVP",
    price: "$29",
    duration: "per month",
    features: [
      "Advanced market analysis",
      "Detailed product roadmap",
      "Complete pitch deck script",
      "10 UI mockups per month",
      "No-code MVP templates",
      "AI code assistant integration",
      "Priority support"
    ],
    recommended: true
  },
  {
    name: "Scale",
    description: "For growing startups ready to scale",
    price: "$99",
    duration: "per month",
    features: [
      "Everything in Startup",
      "Competitor tracking",
      "Investment readiness score",
      "Unlimited UI mockups",
      "Custom API integrations",
      "Team collaboration",
      "Dedicated success manager"
    ],
    recommended: false
  }
];

const PricingSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="pricing">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Choose the plan that's right for your startup journey.
            </p>
          </div>
        </div>
        
        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, i) => (
            <Card 
              key={i} 
              className={`relative flex flex-col border ${
                plan.recommended 
                  ? "border-primary shadow-lg shadow-primary/20" 
                  : "border-border"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-sm font-medium text-gray-500">{plan.duration}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.recommended 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  }`}
                >
                  {plan.price === "$0" ? "Get Started" : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
