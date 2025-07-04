import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceContainer, WorkspaceHeader } from "@/components/ui/workspace-layout";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
// import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Download,
  Check,
  Zap,
  Crown,
  Menu,
  RefreshCw,
  ChevronLeft
} from "lucide-react";

const Account = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPlan] = useState("Pro");
  const [billingCycle] = useState("monthly");
  // Removed unused user variable
  const { toast } = useToast();

  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "month",
      description: "Perfect for individual entrepreneurs",
      features: [
        "5 AI-generated ideas per month",
        "Basic document templates",
        "Email support",
        "1 team member"
      ],
      current: false,
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      description: "Best for growing startups",
      features: [
        "Unlimited AI-generated ideas",
        "Advanced document templates",
        "Priority support",
        "5 team members",
        "MVP Studio access",
        "Investor database"
      ],
      current: true,
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For established companies",
      features: [
        "Everything in Pro",
        "Custom AI training",
        "Dedicated support",
        "Unlimited team members",
        "Advanced analytics",
        "Custom integrations"
      ],
      current: false,
      popular: false
    }
  ];

  const invoices = [
    {
      id: "INV-001",
      date: "2024-01-15",
      amount: "$29.00",
      status: "Paid",
      plan: "Pro Plan"
    },
    {
      id: "INV-002",
      date: "2023-12-15",
      amount: "$29.00",
      status: "Paid",
      plan: "Pro Plan"
    },
    {
      id: "INV-003",
      date: "2023-11-15",
      amount: "$29.00",
      status: "Paid",
      plan: "Pro Plan"
    }
  ];

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Upgrade initiated",
      description: `Upgrading to ${planName} plan. You'll be redirected to payment.`,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download started",
      description: `Downloading invoice ${invoiceId}`,
    });
  };

  return (
    <div className="layout-container">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        <div className="flex flex-col w-full">
          {/* Top Navigation */}
          <div className="workspace-nav-enhanced">
            <div className="flex items-center justify-between w-full px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center gap-2 md:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>

                {/* Back to Workspace */}
                <Link
                  to="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
            </div>
          </div>

          <WorkspaceContainer>
            <WorkspaceHeader
              title="Account & Billing"
              subtitle="Manage your subscription, billing, and account settings."
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                  {currentPlan} Plan
                </Badge>
              </div>
            </WorkspaceHeader>

            <Tabs defaultValue="subscription" className="space-y-6">
              <TabsList className="bg-black/20 border-white/10">
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="billing">Billing History</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>

              <TabsContent value="subscription" className="space-y-6">
                {/* Current Plan */}
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-400" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>Your active subscription details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-green-600/10 rounded-lg border border-green-500/20">
                      <div>
                        <h3 className="text-xl font-bold text-white">{currentPlan} Plan</h3>
                        <p className="text-gray-400">Billed {billingCycle}</p>
                        <p className="text-sm text-gray-400 mt-1">Next billing date: February 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">$29</p>
                        <p className="text-sm text-gray-400">per month</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="bg-red-600/20 border-red-500/30 text-red-400">
                        Cancel Subscription
                      </Button>
                      <Button variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-400">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Change Billing Cycle
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Plans */}
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Available Plans</CardTitle>
                    <CardDescription>Upgrade or downgrade your subscription</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plans.map((plan) => (
                        <div
                          key={plan.name}
                          className={`relative p-6 rounded-xl border transition-all duration-300 ${
                            plan.current
                              ? "bg-green-600/10 border-green-500/30"
                              : "bg-black/20 border-white/10 hover:border-green-500/30"
                          }`}
                        >
                          {plan.popular && (
                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white">
                              Most Popular
                            </Badge>
                          )}
                          {plan.current && (
                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                              Current Plan
                            </Badge>
                          )}
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <div className="mb-2">
                              <span className="text-3xl font-bold text-white">{plan.price}</span>
                              <span className="text-gray-400">/{plan.period}</span>
                            </div>
                            <p className="text-sm text-gray-400">{plan.description}</p>
                          </div>
                          <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                <Check className="h-4 w-4 text-green-400" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className={`w-full ${
                              plan.current
                                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-500 text-white"
                            }`}
                            disabled={plan.current}
                            onClick={() => handleUpgrade(plan.name)}
                          >
                            {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Billing History
                    </CardTitle>
                    <CardDescription>View and download your past invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-600/20 rounded-lg">
                              <CreditCard className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{invoice.plan}</h4>
                              <p className="text-sm text-gray-400">
                                {invoice.id} • {new Date(invoice.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium text-white">{invoice.amount}</p>
                              <Badge
                                variant="secondary"
                                className="bg-green-600/20 text-green-400"
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              className="bg-blue-600/20 border-blue-500/30 text-blue-400"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage" className="space-y-6">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Usage Statistics
                    </CardTitle>
                    <CardDescription>Track your monthly usage and limits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">AI Ideas Generated</h4>
                          <span className="text-sm text-gray-400">47 / Unlimited</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "47%" }}></div>
                        </div>
                      </div>
                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">Documents Created</h4>
                          <span className="text-sm text-gray-400">23 / Unlimited</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "23%" }}></div>
                        </div>
                      </div>
                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">Team Members</h4>
                          <span className="text-sm text-gray-400">2 / 5</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                      </div>
                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">API Calls</h4>
                          <span className="text-sm text-gray-400">1,247 / Unlimited</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "62%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </WorkspaceContainer>
        </div>
      </main>
    </div>
  );
};

export default Account;
