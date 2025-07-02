import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RefreshCw } from 'lucide-react';
import AIResponse from '@/components/ui/ai-response';

interface PromptComponents {
  persona: string;
  task: string;
  context: string;
  format: string;
}

const PromptBuilder: React.FC = () => {
  const [components, setComponents] = useState<PromptComponents>({
    persona: '',
    task: '',
    context: '',
    format: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const templates = {
    'market-research': {
      persona: 'I am a startup founder in the early validation stage',
      task: 'Conduct comprehensive market research',
      context: 'for a [product/service] targeting [specific customer segment] in the [industry] space',
      format: 'Present findings as a structured report with market size, trends, competitors, and opportunities'
    },
    'competitive-analysis': {
      persona: 'I am an entrepreneur launching a new product',
      task: 'Analyze the competitive landscape',
      context: 'for [product description] competing against [list 3-5 competitors] in [market segment]',
      format: 'Create a comparison table with features, pricing, strengths, weaknesses, and market positioning'
    },
    'business-plan': {
      persona: 'I am a first-time entrepreneur seeking investment',
      task: 'Write a comprehensive business plan',
      context: 'for a [business type] targeting [customer segment] with [unique value proposition]',
      format: 'Structure as executive summary, market analysis, business model, financial projections, and implementation timeline'
    },
    'mvp-planning': {
      persona: 'I am a technical founder building a software product',
      task: 'Define the minimum viable product scope',
      context: 'for [product description] serving [target users] with a development budget of [amount] and [timeframe] timeline',
      format: 'Prioritize features in a roadmap with development effort estimates and success criteria'
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    if (templateKey && templates[templateKey as keyof typeof templates]) {
      const template = templates[templateKey as keyof typeof templates];
      setComponents(template);
      setSelectedTemplate(templateKey);
      generatePrompt(template);
    }
  };

  const handleComponentChange = (field: keyof PromptComponents, value: string) => {
    const newComponents = { ...components, [field]: value };
    setComponents(newComponents);
    generatePrompt(newComponents);
  };

  const generatePrompt = (promptComponents: PromptComponents) => {
    const { persona, task, context, format } = promptComponents;
    
    if (!persona && !task && !context && !format) {
      setGeneratedPrompt('');
      return;
    }

    let prompt = '';
    
    if (persona) prompt += `${persona}. `;
    if (task) prompt += `${task} `;
    if (context) prompt += `${context}. `;
    if (format) prompt += `${format}.`;

    setGeneratedPrompt(prompt.trim());
  };

  const copyPrompt = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setComponents({
      persona: '',
      task: '',
      context: '',
      format: ''
    });
    setSelectedTemplate('');
    setGeneratedPrompt('');
  };

  const getPromptQuality = () => {
    const filledComponents = Object.values(components).filter(value => value.trim().length > 0).length;
    if (filledComponents === 4) return { score: 'Excellent', color: 'bg-green-500' };
    if (filledComponents === 3) return { score: 'Good', color: 'bg-blue-500' };
    if (filledComponents === 2) return { score: 'Fair', color: 'bg-yellow-500' };
    if (filledComponents === 1) return { score: 'Poor', color: 'bg-red-500' };
    return { score: 'Empty', color: 'bg-gray-500' };
  };

  const quality = getPromptQuality();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Prompt Builder</h1>
        <p className="text-muted-foreground">
          Build effective AI prompts using the four-component framework
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Prompt Components
                <Badge className={quality.color}>{quality.score}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Quick Start Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template or build from scratch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market-research">Market Research</SelectItem>
                    <SelectItem value="competitive-analysis">Competitive Analysis</SelectItem>
                    <SelectItem value="business-plan">Business Plan</SelectItem>
                    <SelectItem value="mvp-planning">MVP Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="persona">Persona</Label>
                <Input
                  id="persona"
                  placeholder="I am a [your role/position]..."
                  value={components.persona}
                  onChange={(e) => handleComponentChange('persona', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Define who you are and your role
                </p>
              </div>

              <div>
                <Label htmlFor="task">Task</Label>
                <Input
                  id="task"
                  placeholder="[Specific action you want performed]"
                  value={components.task}
                  onChange={(e) => handleComponentChange('task', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Clearly state what you want the AI to do
                </p>
              </div>

              <div>
                <Label htmlFor="context">Context</Label>
                <Textarea
                  id="context"
                  placeholder="[Relevant background, constraints, specifics]"
                  value={components.context}
                  onChange={(e) => handleComponentChange('context', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Provide relevant background and constraints
                </p>
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Input
                  id="format"
                  placeholder="[How you want the response structured]"
                  value={components.format}
                  onChange={(e) => handleComponentChange('format', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Specify how you want the response delivered
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated Prompt
                {generatedPrompt && (
                  <Button onClick={copyPrompt} variant="outline" size="sm">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedPrompt ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-mono">{generatedPrompt}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Character count:</strong> {generatedPrompt.length}</p>
                    <p><strong>Word count:</strong> {generatedPrompt.split(' ').length}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Fill in the components above to generate your prompt</p>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedPrompt && (
            <Card>
              <CardHeader>
                <CardTitle>Prompt Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Persona defined</span>
                    <Badge variant={components.persona ? "default" : "secondary"}>
                      {components.persona ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Task specified</span>
                    <Badge variant={components.task ? "default" : "secondary"}>
                      {components.task ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Context provided</span>
                    <Badge variant={components.context ? "default" : "secondary"}>
                      {components.context ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Format defined</span>
                    <Badge variant={components.format ? "default" : "secondary"}>
                      {components.format ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptBuilder;
