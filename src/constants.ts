import { Customer, Deal, Activity } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Alex Thompson', email: 'alex@techflow.com', company: 'TechFlow Inc', status: 'Active', lastContact: '2024-03-20', value: 12500 },
  { id: '2', name: 'Sarah Chen', email: 'sarah@brightside.io', company: 'Brightside', status: 'Prospect', lastContact: '2024-03-22', value: 8000 },
  { id: '3', name: 'Marcus Miller', email: 'm.miller@globalcorp.com', company: 'Global Corp', status: 'Lead', lastContact: '2024-03-15', value: 0 },
  { id: '4', name: 'Elena Rodriguez', email: 'elena@designhub.co', company: 'Design Hub', status: 'Active', lastContact: '2024-03-23', value: 4500 },
  { id: '5', name: 'David Wilson', email: 'david@nexus.com', company: 'Nexus Systems', status: 'Inactive', lastContact: '2024-02-10', value: 15000 },
];

export const MOCK_DEALS: Deal[] = [
  { id: '1', title: 'Meta Ads Campaign', customer: 'TechFlow Inc', value: 5000, stage: 'Proposal', probability: 60, service_type: 'Social Media' },
  { id: '2', title: 'SEO Optimization', customer: 'Brightside', value: 1200, stage: 'Discovery', probability: 20, service_type: 'SEO' },
  { id: '3', title: 'Google Ads Setup', customer: 'Nexus Systems', value: 8500, stage: 'Negotiation', probability: 85, service_type: 'PPC' },
  { id: '4', title: 'Content Strategy', customer: 'Design Hub', value: 3000, stage: 'Closed Won', probability: 100, service_type: 'Content' },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'Call', customer: 'Alex Thompson', description: 'Followed up on proposal details', timestamp: '2 hours ago', user: 'Me' },
  { id: '2', type: 'Email', customer: 'Sarah Chen', description: 'Sent introductory deck', timestamp: '5 hours ago', user: 'Me' },
  { id: '3', type: 'Meeting', customer: 'David Wilson', description: 'Quarterly review meeting', timestamp: 'Yesterday', user: 'Sarah J.' },
  { id: '4', type: 'Note', customer: 'Elena Rodriguez', description: 'Interested in new feature set', timestamp: '2 days ago', user: 'Me' },
];

export const REVENUE_DATA = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 67000 },
];
