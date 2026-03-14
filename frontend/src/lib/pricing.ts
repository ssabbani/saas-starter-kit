export interface Plan {
  key: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  monthly_price_id: string;
  annual_price_id: string;
  features: string[];
  popular: boolean;
}

export const plans: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    description: "For individuals getting started",
    monthly_price: 19,
    annual_price: 190,
    monthly_price_id: "price_starter_monthly",
    annual_price_id: "price_starter_annual",
    features: [
      "5,000 API calls/mo",
      "1 GB storage",
      "Email support",
      "Basic analytics",
    ],
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    description: "For growing teams",
    monthly_price: 49,
    annual_price: 470,
    monthly_price_id: "price_pro_monthly",
    annual_price_id: "price_pro_annual",
    features: [
      "50,000 API calls/mo",
      "10 GB storage",
      "Priority support",
      "Advanced analytics",
      "Team features",
      "Custom integrations",
    ],
    popular: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    monthly_price: 149,
    annual_price: 1430,
    monthly_price_id: "price_enterprise_monthly",
    annual_price_id: "price_enterprise_annual",
    features: [
      "500,000 API calls/mo",
      "100 GB storage",
      "Dedicated support",
      "Custom SLAs",
      "SSO / SAML",
      "On-premise option",
    ],
    popular: false,
  },
];
