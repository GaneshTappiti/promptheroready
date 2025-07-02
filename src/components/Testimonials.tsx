
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const testimonials = [
  {
    quote: "This platform saved me months of research and development. I validated my SaaS idea in hours, not weeks!",
    author: "Sarah Johnson",
    role: "Founder, TaskFlow",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    quote: "The roadmap generation feature alone is worth the price. It gave me a clear path from idea to launch that I'm still following.",
    author: "Michael Chen",
    role: "CEO, DataViz Pro",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    quote: "I used the pitch script creator before my Y Combinator interview and it helped me communicate my vision clearly. We got in!",
    author: "Alex Rodriguez",
    role: "CTO, HealthSync",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
];

const Testimonials = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-black/90">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">From Our Founders</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              See how entrepreneurs like you are using our platform to build successful startups.
            </p>
          </div>
        </div>
        
        <div className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch mt-12">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="border border-white/10 bg-black/50 backdrop-blur-sm flex flex-col">
              <CardContent className="flex-grow pt-6">
                <div className="mb-4 text-3xl">"</div>
                <p className="text-lg italic text-gray-300">{testimonial.quote}</p>
              </CardContent>
              <CardFooter className="flex items-center space-x-4 border-t border-white/10 pt-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-medium">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
