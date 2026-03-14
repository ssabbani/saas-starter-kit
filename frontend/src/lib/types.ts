export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string;
  role: "user" | "admin" | "super_admin";
  plan: "free" | "starter" | "pro" | "enterprise";
  is_email_verified: boolean;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface Subscription {
  id: number;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete";
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: string;
}

export interface UsageRecord {
  metric_name: string;
  count: number;
  limit_value: number;
  percentage: number;
}

export interface Activity {
  id: number;
  action: string;
  detail: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  mrr: number;
  trial_users: number;
  new_users_this_month: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}
