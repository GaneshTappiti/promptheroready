
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TeamRoles = () => {
  return (
    <Card className="workspace-card mt-8">
      <CardHeader>
        <CardTitle>Team Roles & Responsibilities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Alex Johnson - CEO</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Business strategy and vision</li>
              <li>Investor relations and fundraising</li>
              <li>Team leadership and culture</li>
              <li>Financial oversight</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Sarah Chen - CTO</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Technical architecture and roadmap</li>
              <li>Engineering team leadership</li>
              <li>Technology stack decisions</li>
              <li>Security and technical debt</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Michael Rodriguez - Product Manager</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Product roadmap and features</li>
              <li>User research and validation</li>
              <li>Market analysis</li>
              <li>Feature prioritization</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamRoles;
