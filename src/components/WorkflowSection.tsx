
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Input Your Idea",
    description: "Simply describe your startup idea in plain language. Our AI understands context and nuance.",
  },
  {
    number: "02",
    title: "Get Validation & Analysis",
    description: "We'll scan the market for similar products and analyze your idea's uniqueness and potential.",
  },
  {
    number: "03",
    title: "Generate Roadmap & Assets",
    description: "Receive a complete startup package with roadmap, pitch script, UI mockups, and development plan.",
  },
  {
    number: "04",
    title: "Build Your MVP",
    description: "Use our no-code integrations and AI assistance to quickly build a working version of your product.",
  },
];

const WorkflowSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Workflow
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our streamlined process takes you from raw idea to launch-ready product in four simple steps.
            </p>
          </div>
        </div>
        
        <div className="mt-16 relative">
          {/* Vertical line connecting steps */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 to-pink-500 transform -translate-x-1/2"></div>
          
          <div className="space-y-20 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`md:flex items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-1/2 p-6 md:p-8">
                    <span className="text-5xl font-bold text-primary/20">{step.number}</span>
                    <h3 className="text-2xl font-bold mt-2">{step.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{step.description}</p>
                  </div>
                  
                  <div className="hidden md:block md:w-1/2 relative">
                    {/* Circle on timeline */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                      <div className="w-8 h-8 rounded-full bg-gradient-custom flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <Button className="bg-primary hover:bg-primary/90 text-lg py-6 px-8">Start Building Now</Button>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
