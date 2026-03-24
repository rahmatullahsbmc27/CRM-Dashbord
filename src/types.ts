export type CustomerStatus = 'Active' | 'Inactive' | 'Lead' | 'Prospect';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: CustomerStatus;
  lastContact: string;
  value: number;
}

export interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: 'Discovery' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  probability: number;
  service_type?: string;
}

export interface Activity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note';
  customer: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Completed';
  due_date?: string;
  assigned_to_email?: string;
  created_at: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  activeDeals: number;
  conversionRate: number;
}
