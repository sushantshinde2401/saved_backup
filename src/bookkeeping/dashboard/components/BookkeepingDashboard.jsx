import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  Building2,
  Calendar,
  BarChart3,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { DashboardLayout, UnifiedCard, BackButton } from '../../../shared/components/DesignSystem';

function BookkeepingDashboard() {
  const navigate = useNavigate();

  const cardContent = [
    {
      icon: CreditCard,
      title: "PAYMENT/RECEIPT",
      subtitle: "ENTRIES",
      description: "Manage payments and receipts",
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => navigate('/bookkeeping/payment-receipt')
    },
    {
      icon: FileText,
      title: "INVOICE",
      subtitle: "GENERATION",
      description: "Create and manage invoices",
      gradient: "from-emerald-500 to-teal-500",
      onClick: () => navigate('/bookkeeping/invoice-generation')
    },
    {
      icon: Building2,
      title: "COMPANIES",
      subtitle: "LEDGER",
      description: "Track company accounts",
      gradient: "from-purple-500 to-pink-500",
      onClick: () => navigate('/bookkeeping/ledger-dashboard')
    },
    {
      icon: Calendar,
      title: "PERIODIC",
      subtitle: "LEDGER",
      description: "Daily, monthly & yearly reports",
      gradient: "from-orange-500 to-red-500",
      onClick: () => navigate('/bookkeeping/ledger')
    },
    {
      icon: BarChart3,
      title: "SUMMARY",
      subtitle: "REPORT",
      description: "Comprehensive analytics",
      gradient: "from-rose-500 to-pink-500",
      onClick: () => navigate('/bookkeeping/summary-report')
    },
    {
      icon: DollarSign,
      title: "RATELIST",
      subtitle: "ENTRIES",
      description: "Manage pricing & rates",
      gradient: "from-indigo-500 to-blue-500",
      onClick: () => navigate('/bookkeeping/ratelist-entries')
    }
  ];

  return (
    <DashboardLayout
      title="BOOKKEEPING"
      subtitle="MANAGEMENT SYSTEM"
      icon={BarChart3}
      footerText="Maritime Training Institute • Financial Management System"
    >
      {/* Custom Header Content */}
      <div className="text-center mb-16">
        <p className="text-lg text-blue-100 opacity-80 max-w-2xl mx-auto">
          Comprehensive financial management and reporting tools for maritime training institutes
        </p>
      </div>

      {/* 6 Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
        {cardContent.map((card, index) => (
          <UnifiedCard key={index} gradient={card.gradient} onClick={card.onClick}>
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                <card.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight">
                {card.title}
              </h3>
              <h4 className="text-lg font-semibold text-blue-600">
                {card.subtitle}
              </h4>
              <p className="text-sm text-gray-600 opacity-80">
                {card.description}
              </p>
            </div>
          </UnifiedCard>
        ))}
      </div>

      {/* Back to Home Button */}
      <div className="mt-16">
        <BackButton onClick={() => navigate('/')} />
      </div>
    </DashboardLayout>
  );
}

export default BookkeepingDashboard;
