
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  children 
}) => {
  return (
    <Tabs defaultValue={activeTab} className="mb-8">
      <TabsList className="mb-2 overflow-x-auto max-w-full">
        <TabsTrigger 
          value="investors" 
          onClick={() => onTabChange("investors")}
          className={`transition-all ${activeTab === "investors" ? "tab-active" : ""}`}
        >
          Investors
        </TabsTrigger>
        <TabsTrigger 
          value="funding" 
          onClick={() => onTabChange("funding")}
          className={`transition-all ${activeTab === "funding" ? "tab-active" : ""}`}
        >
          Funding Rounds
        </TabsTrigger>
        <TabsTrigger 
          value="pitchdeck" 
          onClick={() => onTabChange("pitchdeck")}
          className={`transition-all ${activeTab === "pitchdeck" ? "tab-active" : ""}`}
        >
          Pitch Deck
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};

export default TabNavigation;
