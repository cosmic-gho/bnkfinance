import { ArrowUpRight, CreditCard, DollarSign } from "lucide-react";

export interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Account {
  id: number;
  type: string;
  balance: string;
  lastFour: string;
}

export const accounts: Account[] = [
  {
    id: 1,
    type: "Checking Account",
    balance: "12,345.67",
    lastFour: "1234",
  },
  {
    id: 2,
    type: "Savings Account",
    balance: "45,678.90",
    lastFour: "5678",
  },
  {
    id: 3,
    type: "Investment Account",
    balance: "89,012.34",
    lastFour: "9012",
  },
];

export const transactions: Transaction[] = [
  {
    id: 1,
    name: "Salary Deposit",
    date: "Today, 10:30 AM",
    amount: "+$2,500.00",
    status: "Completed",
    icon: ArrowUpRight,
  },
  {
    id: 2,
    name: "Grocery Store",
    date: "Yesterday, 2:45 PM",
    amount: "-$85.23",
    status: "Completed",
    icon: CreditCard,
  },
  {
    id: 3,
    name: "Electric Bill",
    date: "Yesterday, 10:00 AM",
    amount: "-$120.00",
    status: "Completed",
    icon: CreditCard,
  },
  {
    id: 4,
    name: "Investment Return",
    date: "2 days ago, 3:30 PM",
    amount: "+$150.00",
    status: "Completed",
    icon: DollarSign,
  },
]; 