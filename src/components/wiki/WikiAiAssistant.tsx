
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AIResponse from "@/components/ui/ai-response";
import { X, Send, Sparkles } from "lucide-react";

interface WikiAiAssistantProps {
  onClose: () => void;
}

const WikiAiAssistant: React.FC<WikiAiAssistantProps> = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm your wiki assistant. How can I help you organize your startup knowledge today?" 
    }
  ]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message
    setConversation([...conversation, { role: "user", content: message }]);
    
    // Generate structured AI response using proper prompting framework
    setTimeout(() => {
      const structuredPrompt = `I am a startup knowledge management assistant helping entrepreneurs organize their business information. Analyze the user query "${message}" and provide specific, actionable recommendations for organizing startup knowledge in a wiki format.

Context: This is for a startup founder building a comprehensive knowledge base to track market research, product development, customer insights, and business strategy.

Task: Provide structured recommendations including:
1. Specific wiki sections relevant to the query
2. Organization strategies and best practices
3. Actionable next steps
4. Example content structure

Format: Use clear headings, bullet points, and include a practical example. Keep response focused and under 400 words.`;

      // Simulate AI processing the structured prompt
      const response = `# Knowledge Organization Recommendations

## Relevant Wiki Sections for "${message}"

### Market Intelligence
- Competitor analysis and positioning
- Industry trends and market size data
- Customer interview summaries and insights
- Pricing strategy research

### Product Development
- Feature prioritization matrix
- Technical architecture decisions
- User story mapping and requirements
- Development timeline and milestones

### Business Strategy
- Business model canvas and iterations
- Revenue projections and assumptions
- Partnership opportunities and contacts
- Risk assessment and mitigation plans

## Organization Best Practices

**Consistent Structure**: Use standardized templates for similar content types to maintain consistency across your wiki.

**Regular Updates**: Schedule weekly reviews to keep information current and add new insights from customer conversations or market research.

**Cross-Linking**: Connect related concepts between sections to build a comprehensive knowledge network.

**Version Control**: Track changes to important documents like business plans or product specifications.

## Recommended Next Steps

1. **Start with one focused section** based on your immediate needs
2. **Create a template** for recurring content types like customer interviews
3. **Set up a weekly review process** to maintain and update content
4. **Establish tagging conventions** for easy content discovery

## Example Structure

\`\`\`
# Customer Interview - [Company Name]
Date: [Date]
Interviewer: [Name]
Role: [Customer Role]

## Key Insights
- Pain points identified
- Feature requests
- Pricing feedback

## Action Items
- Follow-up tasks
- Product implications
\`\`\`

Would you like me to help you create a specific template or expand on any particular section?`;

      setConversation(prev => [
        ...prev,
        {
          role: "assistant",
          content: response
        }
      ]);
    }, 1000);
    
    setMessage("");
  };

  return (
    <div className="fixed bottom-24 right-8 w-80 sm:w-96 bg-card border rounded-lg shadow-lg overflow-hidden z-50 animate-scale-in">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium">Wiki Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="h-80 overflow-y-auto p-4 space-y-4" id="chat-messages">
        {conversation.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="bg-primary text-primary-foreground ml-auto rounded-lg p-3 max-w-[80%]">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[85%]">
                <AIResponse
                  content={msg.content}
                  variant="chat"
                  showCopyButton={true}
                  className="bg-muted/50 border-0 p-3"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          placeholder="Ask about your wiki..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};

export default WikiAiAssistant;
