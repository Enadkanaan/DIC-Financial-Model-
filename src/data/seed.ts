// Generated from DIC_Delivery_Billing_Dashboard_ExcelSafe_With_Remaining_Table 1.xlsx
// Payment Terms (pricing), Delivery Input (monthly quantities), Dashboard (approved budget).
import type { DeliveryPlan, ServiceItem } from '../lib/types';

export const SEED_ITEMS: ServiceItem[] = [
 {
  "id": "S01",
  "category": "Transition",
  "name": "Situational Analysis and Conclusions",
  "unit": "deliverable",
  "unitCost": 500000,
  "contractQty": 1,
  "paymentBasis": "On approval of final deliverable",
  "scope": "Core"
 },
 {
  "id": "S02",
  "category": "Transition",
  "name": "Gap Analysis and Benchmarking",
  "unit": "deliverable",
  "unitCost": 500000,
  "contractQty": 1,
  "paymentBasis": "On approval of final deliverable",
  "scope": "Core"
 },
 {
  "id": "S03",
  "category": "Transition",
  "name": "Strategy Development and Roadmap - Interim Release",
  "unit": "deliverable",
  "unitCost": 500000,
  "contractQty": 1,
  "paymentBasis": "On approval of final deliverable",
  "scope": "Core"
 },
 {
  "id": "S04",
  "category": "Transition",
  "name": "Strategy Development and Roadmap - Final Release",
  "unit": "deliverable",
  "unitCost": 500000,
  "contractQty": 1,
  "paymentBasis": "On approval of final deliverable",
  "scope": "Core"
 },
 {
  "id": "S05",
  "category": "Transition",
  "name": "Transition Mentorship",
  "unit": "hour",
  "unitCost": 315,
  "contractQty": 320,
  "paymentBasis": "Per hour delivered",
  "scope": "Core"
 },
 {
  "id": "S06",
  "category": "Transition",
  "name": "Transition Workshop",
  "unit": "workshop",
  "unitCost": 45109,
  "contractQty": 4,
  "paymentBasis": "On delivery",
  "scope": "Core"
 },
 {
  "id": "S07",
  "category": "Transition",
  "name": "Transition Speaker Session",
  "unit": "session",
  "unitCost": 42895,
  "contractQty": 4,
  "paymentBasis": "On delivery",
  "scope": "Core"
 },
 {
  "id": "S08",
  "category": "Transition",
  "name": "Transition Social Media Coverage",
  "unit": "month",
  "unitCost": 62748,
  "contractQty": 4,
  "paymentBasis": "Per month",
  "scope": "Core"
 },
 {
  "id": "S09",
  "category": "One-time",
  "name": "Branding Refresh",
  "unit": "deliverable",
  "unitCost": 51950,
  "contractQty": 1,
  "paymentBasis": "On approval",
  "scope": "Core"
 },
 {
  "id": "S10",
  "category": "Operations",
  "name": "Project Management Team",
  "unit": "month",
  "unitCost": 319400,
  "contractQty": 36,
  "paymentBasis": "Per month",
  "scope": "Core"
 },
 {
  "id": "S11",
  "category": "Operations",
  "name": "Coaching Team - Main",
  "unit": "startup per month",
  "unitCost": 9918,
  "contractQty": 540,
  "paymentBasis": "Per startup per month",
  "scope": "Core"
 },
 {
  "id": "S12",
  "category": "Programming",
  "name": "Workshop",
  "unit": "workshop",
  "unitCost": 101267,
  "contractQty": 36,
  "paymentBasis": "Per workshop",
  "scope": "Core"
 },
 {
  "id": "S13",
  "category": "Programming",
  "name": "Tech Talk",
  "unit": "session",
  "unitCost": 51976,
  "contractQty": 72,
  "paymentBasis": "Per session",
  "scope": "Core"
 },
 {
  "id": "S14",
  "category": "Technology",
  "name": "Technology Platform",
  "unit": "year",
  "unitCost": 139401,
  "contractQty": 3,
  "paymentBasis": "Annual activation",
  "scope": "Core"
 },
 {
  "id": "S15",
  "category": "Events",
  "name": "Demo Day",
  "unit": "event",
  "unitCost": 272580,
  "contractQty": 6,
  "paymentBasis": "Per event",
  "scope": "Core"
 },
 {
  "id": "S16",
  "category": "Internationalization",
  "name": "GTM - Silicon Valley",
  "unit": "event",
  "unitCost": 831310,
  "contractQty": 3,
  "paymentBasis": "Per event",
  "scope": "Core"
 },
 {
  "id": "S17",
  "category": "Mentorship",
  "name": "Mentorship Credits",
  "unit": "hour",
  "unitCost": 684,
  "contractQty": 3600,
  "paymentBasis": "Per hour",
  "scope": "Core"
 },
 {
  "id": "S18",
  "category": "Events",
  "name": "Alumni Event",
  "unit": "event",
  "unitCost": 185416,
  "contractQty": 1,
  "paymentBasis": "Per event",
  "scope": "Core"
 },
 {
  "id": "S19",
  "category": "Events",
  "name": "Relaunch Event",
  "unit": "event",
  "unitCost": 325248,
  "contractQty": 1,
  "paymentBasis": "Per event",
  "scope": "Core"
 },
 {
  "id": "S20",
  "category": "Marketing",
  "name": "Paid Ads Campaign",
  "unit": "campaign",
  "unitCost": 15000,
  "contractQty": 1,
  "paymentBasis": "Per campaign",
  "scope": "Core"
 },
 {
  "id": "S21",
  "category": "Marketing",
  "name": "MarComm Strategy",
  "unit": "deliverable",
  "unitCost": 315700,
  "contractQty": 1,
  "paymentBasis": "On approval",
  "scope": "Core"
 },
 {
  "id": "S22",
  "category": "Marketing",
  "name": "Promotional Collaterals Bundle",
  "unit": "bundle",
  "unitCost": 227458,
  "contractQty": 1,
  "paymentBasis": "Per approved bundle",
  "scope": "Core"
 },
 {
  "id": "S23",
  "category": "Marketing",
  "name": "Social Media Management - Full Package",
  "unit": "month",
  "unitCost": 62748,
  "contractQty": 36,
  "paymentBasis": "Per month",
  "scope": "Core"
 },
 {
  "id": "S24",
  "category": "Internationalization",
  "name": "International Event Coverage",
  "unit": "event",
  "unitCost": 27766,
  "contractQty": 6,
  "paymentBasis": "Per event",
  "scope": "Core"
 },
 {
  "id": "S25",
  "category": "Operations",
  "name": "Coaching Team - Additional Startups",
  "unit": "startup per month",
  "unitCost": 6337.5833333333,
  "contractQty": 360,
  "paymentBasis": "Per startup per month",
  "scope": "Selected Non-core"
 },
 {
  "id": "S26",
  "category": "Internationalization",
  "name": "GTM - SWITCH",
  "unit": "event",
  "unitCost": 729051,
  "contractQty": 3,
  "paymentBasis": "Per event",
  "scope": "Selected Non-core"
 },
 {
  "id": "C01",
  "category": "Call-off",
  "name": "Senior Staff",
  "unit": "month",
  "unitCost": 92400,
  "contractQty": 0,
  "paymentBasis": "Per month when called off",
  "scope": "Call-off"
 },
 {
  "id": "C02",
  "category": "Call-off",
  "name": "Mid-Level Staff - Tier 1",
  "unit": "month",
  "unitCost": 69300,
  "contractQty": 0,
  "paymentBasis": "Per month when called off",
  "scope": "Call-off"
 },
 {
  "id": "C03",
  "category": "Call-off",
  "name": "Mid-Level Staff - Tier 2",
  "unit": "month",
  "unitCost": 61600,
  "contractQty": 0,
  "paymentBasis": "Per month when called off",
  "scope": "Call-off"
 },
 {
  "id": "C04",
  "category": "Call-off",
  "name": "Junior-Level Staff",
  "unit": "month",
  "unitCost": 46200,
  "contractQty": 0,
  "paymentBasis": "Per month when called off",
  "scope": "Call-off"
 },
 {
  "id": "C05",
  "category": "Call-off",
  "name": "Small Event - 50 people",
  "unit": "event",
  "unitCost": 150000,
  "contractQty": 1,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C06",
  "category": "Call-off",
  "name": "Medium Event - 100 people",
  "unit": "event",
  "unitCost": 198000,
  "contractQty": 2,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C07",
  "category": "Call-off",
  "name": "Large Event - 200 people",
  "unit": "event",
  "unitCost": 242000,
  "contractQty": 0,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C08",
  "category": "Call-off",
  "name": "Mentor",
  "unit": "hour",
  "unitCost": 684,
  "contractQty": 1150,
  "paymentBasis": "Per hour when called off",
  "scope": "Call-off"
 },
 {
  "id": "C09",
  "category": "Call-off",
  "name": "Trainer - Local",
  "unit": "event",
  "unitCost": 48800,
  "contractQty": 18,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C10",
  "category": "Call-off",
  "name": "Trainer - Regional",
  "unit": "event",
  "unitCost": 61000,
  "contractQty": 0,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C11",
  "category": "Call-off",
  "name": "Trainer - International",
  "unit": "event",
  "unitCost": 67800,
  "contractQty": 12,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C12",
  "category": "Call-off",
  "name": "Speaker - Local",
  "unit": "event",
  "unitCost": 29500,
  "contractQty": 0,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C13",
  "category": "Call-off",
  "name": "Speaker - Regional",
  "unit": "event",
  "unitCost": 41700,
  "contractQty": 0,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 },
 {
  "id": "C14",
  "category": "Call-off",
  "name": "Speaker - International",
  "unit": "event",
  "unitCost": 48500,
  "contractQty": 0,
  "paymentBasis": "Per event when called off",
  "scope": "Call-off"
 }
];

export const SEED_DELIVERIES: DeliveryPlan = {"S01":{"2025":[0,0,0,0,0,0,0,0,0,0,0,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S02":{"2025":[0,0,0,0,0,0,0,0,0,0,0,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S03":{"2025":[0,0,0,0,0,0,0,0,0,0,0,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S04":{"2025":[0,0,0,0,0,0,0,0,0,0,0,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S05":{"2025":[0,0,0,0,0,0,0,0,0,0,0,199],"2026":[10,111,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S06":{"2025":[0,0,0,0,0,0,0,0,0,0,3,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S07":{"2025":[0,0,0,0,0,0,0,0,0,0,0,2],"2026":[0,2,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S08":{"2025":[0,0,0,0,0,0,0,0,0,1,1,1],"2026":[1,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S09":{"2025":[0,0,0,0,0,0,0,0,0,0,0,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S10":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,1,1,1,1,3,1,0,0,0,0],"2027":[5,1,1,1,1,1,1,1,1,1,1,1],"2028":[1,1,1,1,1,1,1,1,1,1,1,1],"2029":[1,1,1,1,1,1,1,1,0,0,0,0]},
"S11":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,15,15,15,0,0,0,0],"2027":[0,0,0,15,15,15,15,15,15,15,15,15],"2028":[15,15,15,15,15,15,15,15,15,15,15,15],"2029":[15,15,15,15,15,15,15,15,0,0,0,0]},
"S12":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,3,2,0,0,0,0,0,0],"2027":[0,0,2,2,2,0,0,0,0,2,2,2],"2028":[2,2,2,0,0,0,2,2,2,0,0,0],"2029":[2,2,3,0,0,0,0,0,0,0,0,0]},
"S13":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,1,3,0,0,0,0,0,0],"2027":[0,0,1,2,2,2,2,2,2,2,2,2],"2028":[2,2,2,2,2,2,2,2,2,2,2,2],"2029":[2,2,2,2,2,2,2,2,0,0,0,0]},
"S14":{"2025":[0,0,0,0,0,0,0,0,0,0,0,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[1,0,0,0,0,0,0,0,0,0,0,0],"2028":[1,0,0,0,0,0,0,0,0,0,0,0],"2029":[1,0,0,0,0,0,0,0,0,0,0,0]},
"S15":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[1,0,0,0,0,0,0,0,0,0,1,0],"2028":[0,0,1,0,0,0,0,0,1,0,0,0],"2029":[0,0,1,0,0,0,0,1,0,0,0,0]},
"S16":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,1,0,0,0,0,0,0],"2028":[0,0,0,0,0,1,0,0,0,0,0,0],"2029":[0,0,0,0,0,1,0,0,0,0,0,0]},
"S17":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,75,75,75,75,75,75,75,75,75],"2028":[75,75,75,75,75,75,75,75,75,75,75,75],"2029":[75,75,75,75,75,75,75,75,0,0,0,0]},
"S18":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,1,0,0,0,0,0,0,0]},
"S19":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,1,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S20":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,1,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S21":{"2025":[0,0,0,0,0,0,0,0,0,0,0,1],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"S22":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,1,0,0,0,0]},
"S23":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,1,1,1,1,1,0,0,0,0,0,0],"2027":[1,1,1,1,1,1,1,1,1,1,1,1],"2028":[1,1,1,1,1,1,1,1,1,1,1,1],"2029":[1,1,1,1,1,1,1,1,0,0,0,0]},
"S24":{"2025":[0,0,0,0,0,0,0,0,0,0,1,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,1,0,0,0,1,0,0],"2028":[0,0,0,0,0,1,0,0,0,1,0,0],"2029":[0,0,0,0,1,0,0,0,0,0,0,0]},
"S25":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,10,10,10,10,10,10,10,10,10],"2028":[10,10,10,10,10,10,10,10,10,10,10,10],"2029":[10,10,10,10,10,10,10,10,0,0,0,0]},
"S26":{"2025":[0,0,0,0,0,0,0,0,0,0,1,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,1,0,0],"2028":[0,0,0,0,0,0,0,0,0,1,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C01":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C02":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C03":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C04":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C05":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[1,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C06":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C07":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C08":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C09":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C10":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C11":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C12":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C13":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]},
"C14":{"2025":[0,0,0,0,0,0,0,0,0,0,0,0],"2026":[0,0,0,0,0,0,0,0,0,0,0,0],"2027":[0,0,0,0,0,0,0,0,0,0,0,0],"2028":[0,0,0,0,0,0,0,0,0,0,0,0],"2029":[0,0,0,0,0,0,0,0,0,0,0,0]}};

export const SEED_BUDGETS: Record<string, number> = {"2025": 5936030, "2026": 4216142, "2027": 13500000, "2028": 12600000, "2029": 8743352};
