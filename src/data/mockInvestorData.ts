
import { Investor, FundingRound } from "@/types/investor";

export const mockInvestors: Investor[] = [
  {
    id: 1,
    name: "Sequoia Capital",
    focus: "B2B SaaS, Consumer Tech",
    portfolio: 420,
    stage: "Series A-C",
    lastMeeting: "2 weeks ago",
    status: "interested",
    notes: "Very interested in our ML capabilities. Follow up with technical demo."
  },
  {
    id: 2,
    name: "Andreessen Horowitz",
    focus: "Fintech, AI/ML",
    portfolio: 510,
    stage: "Seed-Series B",
    lastMeeting: "1 month ago",
    status: "follow-up",
    notes: "Need to provide updated financial projections and growth metrics."
  },
  {
    id: 3,
    name: "Y Combinator",
    focus: "Early Stage Startups",
    portfolio: 3000,
    stage: "Pre-seed, Seed",
    lastMeeting: "Never",
    status: "to-contact",
    notes: "Application deadline for next batch is in 3 weeks."
  },
  {
    id: 4,
    name: "Accel Partners",
    focus: "Enterprise Software, Cybersecurity",
    portfolio: 380,
    stage: "Series A-B",
    lastMeeting: "3 months ago",
    status: "follow-up",
    notes: "Interested but want to see more traction. Send monthly updates."
  },
  {
    id: 5,
    name: "Lightspeed Venture Partners",
    focus: "Consumer Tech, Marketplaces",
    portfolio: 420,
    stage: "Series A-D",
    lastMeeting: "2 months ago",
    status: "interested",
    notes: "Great initial meeting. Send pitch deck with product roadmap."
  }
];

export const mockFundingRounds: FundingRound[] = [
  {
    id: 1,
    name: "Seed Round",
    target: "$500K",
    raised: "$350K",
    progress: 70,
    investors: 4,
    status: "active",
    timeline: "3 months"
  },
  {
    id: 2,
    name: "Series A",
    target: "$2M",
    raised: "$0",
    progress: 0,
    investors: 0,
    status: "planned",
    timeline: "6 months"
  }
];
