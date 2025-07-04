import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import InvestorsList from "@/components/investor/InvestorsList";
import FundingRoundsList from "@/components/investor/FundingRoundsList";
import PitchDeckView from "@/components/investor/PitchDeckView";
import { useToast } from "@/hooks/use-toast";
import FilterDrawer from "@/components/investor/FilterDrawer";
import AddInvestorModal from "@/components/investor/AddInvestorModal";
import { Investor, InvestorInput, FundingRound, FundingRoundInput } from "@/types/investor";
import { TabsContent } from "@/components/ui/tabs";
import ActionBar from "@/components/investor/ActionBar";
import TabNavigation from "@/components/investor/TabNavigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Target } from "lucide-react";
import { investorRadarHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";

const InvestorRadar = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("investors");
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddInvestorOpen, setIsAddInvestorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load data from database
  const loadInvestors = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await investorRadarHelpers.getInvestors(user.id);

      if (error) throw error;

      setInvestors(data || []);
    } catch (error: unknown) {
      console.error('Error loading investors:', error);
      toast({
        title: "Error Loading Investors",
        description: "Failed to load your investors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFundingRounds = async () => {
    if (!user) return;

    try {
      const { data, error } = await investorRadarHelpers.getFundingRounds(user.id);

      if (error) throw error;

      setFundingRounds(data || []);
    } catch (error: unknown) {
      console.error('Error loading funding rounds:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadInvestors();
      loadFundingRounds();
    }
  }, [user]);

  useEffect(() => {
    // Filter investors based on search query
    const filtered = investors.filter((investor) =>
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.stage.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInvestors(filtered);
  }, [searchQuery, investors]);

  const handleAddInvestor = async (investorData: InvestorInput) => {
    if (!user) return;

    try {
      const { data, error } = await investorRadarHelpers.createInvestor({
        ...investorData,
        user_id: user.id
      });

      if (error) throw error;

      if (data) {
        setInvestors(prev => [...prev, data]);
        setIsAddInvestorOpen(false);
        toast({
          title: "Success",
          description: "Investor added successfully",
        });
      }
    } catch (error: unknown) {
      console.error('Error adding investor:', error);
      toast({
        title: "Error",
        description: "Failed to add investor. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateInvestorStatus = (id: number, status: string) => {
    const updatedInvestors = investors.map(investor => 
      investor.id === id ? { ...investor, status: status as any } : investor
    );
    setInvestors(updatedInvestors);
    toast({
      title: "Status Updated",
      description: `Investor status changed to ${status}`,
    });
  };

  const handleLogContact = (id: number, contactDetails: unknown) => {
    // In a real app, this would update the investor with new contact information
    toast({
      title: "Contact Logged",
      description: "Contact information saved successfully",
    });
  };

  const handleAddFundingRound = (roundData: FundingRoundInput) => {
    const updatedRounds = [...fundingRounds, { ...roundData, id: fundingRounds.length + 1 }];
    setFundingRounds(updatedRounds);
    toast({
      title: "Success",
      description: "Funding round created successfully",
    });
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <Link
                  to="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <Button
                onClick={() => setIsAddInvestorOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Add Investor
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Investor Radar</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Track investors, manage relationships, and plan fundraising activities
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="mb-6">
          <ActionBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
            onAddClick={() => setIsAddInvestorOpen(true)}
          />
          </div>
          <TabNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            <TabsContent value="investors" className="mt-4 md:mt-6 animate-fade-in">
              <InvestorsList 
                investors={filteredInvestors} 
                onLogContact={handleLogContact}
                onStatusChange={handleUpdateInvestorStatus}
                onAddInvestor={() => setIsAddInvestorOpen(true)}
              />
            </TabsContent>
            <TabsContent value="funding" className="mt-4 md:mt-6 animate-fade-in">
              <FundingRoundsList 
                fundingRounds={fundingRounds} 
                onAddFundingRound={handleAddFundingRound}
              />
            </TabsContent>
            <TabsContent value="pitchdeck" className="mt-4 md:mt-6 animate-fade-in">
              <PitchDeckView />
            </TabsContent>
          </TabNavigation>
          </div>
        </div>
      </main>
      {/* Modals and drawers */}
      <FilterDrawer 
        open={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
      <AddInvestorModal 
        open={isAddInvestorOpen} 
        onClose={() => setIsAddInvestorOpen(false)}
        onSubmit={handleAddInvestor}
      />
    </div>
  );
};

export default InvestorRadar;
