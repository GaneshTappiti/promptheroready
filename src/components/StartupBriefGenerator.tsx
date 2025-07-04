import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lightbulb,
  Target,
  DollarSign,
  Code,
  Users,

  CheckCircle2,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';
import { createAIEngine, StartupBrief } from '@/services/aiEngine';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AIGenerationLoader } from '@/components/common/LoadingSpinner';

interface StartupBriefGeneratorProps {
  prompt: string;
  onBriefGenerated?: (brief: StartupBrief) => void;
}

const StartupBriefGenerator: React.FC<StartupBriefGeneratorProps> = ({ 
  prompt, 
  onBriefGenerated 
}) => {
  const [brief, setBrief] = useState<StartupBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const { toast } = useToast();
  const { user } = useAuth();

  const generateBrief = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Create AI engine instance with user context
      const engine = createAIEngine(user?.id);
      const generatedBrief = await engine.analyzeStartupIdea(prompt);
      setBrief(generatedBrief);
      onBriefGenerated?.(generatedBrief);
      
      toast({
        title: "🚀 Startup Brief Generated!",
        description: "Your comprehensive startup analysis is ready",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error generating brief:', error);
      toast({
        title: "Error",
        description: "Failed to generate startup brief. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          <AIGenerationLoader
            text="Analyzing your startup idea..."
            size="lg"
          />
          <div className="mt-6 space-y-2">
            <Progress value={33} className="h-2" />
            <p className="text-sm text-gray-500 text-center">Analyzing market potential...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!brief) {
    return (
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Lightbulb className="h-12 w-12 mx-auto text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Ready to Analyze Your Idea</h3>
            <p className="text-gray-400">Click below to generate a comprehensive startup brief</p>
            <Button onClick={generateBrief} className="bg-green-600 hover:bg-green-500">
              Generate Startup Brief
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brief Header */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-xl mb-2">Startup Brief Generated</CardTitle>
              <CardDescription className="text-gray-400">
                Comprehensive analysis of your startup idea
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-green-600/20 text-green-400">
              Confidence: {brief.confidenceScore}%
            </Badge>
            <Badge variant="outline" className="border-white/20 text-gray-300">
              {brief.estimatedTimeline}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-gray-300">
              {brief.totalCost}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Brief Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="launch">Launch Path</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem Statement */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-400" />
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{brief.analysis.problemStatement}</p>
              </CardContent>
            </Card>

            {/* Target Market */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Target Market
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Primary Market</p>
                  <p className="text-white">{brief.analysis.targetMarket.primary}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Market Size</p>
                  <p className="text-white">{brief.analysis.targetMarket.size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Demographics</p>
                  <p className="text-white">{brief.analysis.targetMarket.demographics}</p>
                </div>
              </CardContent>
            </Card>

            {/* Monetization */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  Monetization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Business Model</p>
                  <p className="text-white">{brief.analysis.monetization.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pricing</p>
                  <p className="text-white">{brief.analysis.monetization.pricing}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Revenue Streams</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {brief.analysis.monetization.revenue_streams.map((stream, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {stream}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-400" />
                  Recommended Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Frontend</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {brief.analysis.mvpStack.frontend.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Backend</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {brief.analysis.mvpStack.backend.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brief.tools.map((tool, index) => (
              <Card key={index} className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">{tool.tool}</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    {tool.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-300">{tool.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant={tool.pricing === 'free' ? 'default' : 'outline'}
                      className={tool.pricing === 'free' ? 'bg-green-600/20 text-green-400' : ''}
                    >
                      {tool.pricing}
                    </Badge>
                    <span className="text-xs text-gray-400">{tool.cost}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <div className="space-y-4">
            {brief.roadmap.map((milestone, index) => (
              <Card key={index} className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-sm">
                        Week {milestone.week}: {milestone.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-xs">
                        {milestone.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {milestone.estimatedHours}h
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Tasks</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {milestone.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="launch" className="space-y-6">
          <div className="space-y-4">
            {brief.launchPath.map((step, index) => (
              <Card key={index} className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    {step.phase} • {step.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-3">{step.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Prerequisites</p>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {step.prerequisites.map((prereq, prereqIndex) => (
                          <li key={prereqIndex}>• {prereq}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Expected Outcomes</p>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {step.outcomes.map((outcome, outcomeIndex) => (
                          <li key={outcomeIndex}>• {outcome}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupBriefGenerator;
