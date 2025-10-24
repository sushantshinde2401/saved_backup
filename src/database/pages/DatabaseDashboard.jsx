import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Search,
  BarChart3,
  Download,
  Upload,
  CheckCircle,
  ArrowLeft,
  Users,
  Settings,
  Shield
} from 'lucide-react';
import { DashboardLayout, UnifiedCard, BackButton, StatusBadge } from '../../shared/components/DesignSystem';

function DatabaseDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Candidate Records",
      description: "Comprehensive candidate data management and tracking",
      gradient: "from-blue-500 to-cyan-500",
      status: "coming-soon"
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Powerful search capabilities with filters and sorting",
      gradient: "from-emerald-500 to-teal-500",
      status: "coming-soon"
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Detailed insights and performance analytics",
      gradient: "from-purple-500 to-pink-500",
      status: "coming-soon"
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export data in multiple formats (CSV, PDF, Excel)",
      gradient: "from-orange-500 to-red-500",
      status: "coming-soon"
    },
    {
      icon: Upload,
      title: "Data Import",
      description: "Bulk import capabilities with validation",
      gradient: "from-rose-500 to-pink-500",
      status: "coming-soon"
    },
    {
      icon: CheckCircle,
      title: "Data Validation",
      description: "Automated quality checks and integrity verification",
      gradient: "from-indigo-500 to-blue-500",
      status: "coming-soon"
    }
  ];

  return (
    <DashboardLayout
      title="DATABASE"
      subtitle="MANAGEMENT SYSTEM"
      icon={Database}
      footerText="Maritime Training Institute • Database Management • Advanced Analytics"
    >
      {/* Custom Header Content */}
      <div className="text-center mb-16">
        <p className="text-lg text-purple-100 opacity-80 max-w-2xl mx-auto mb-6">
          Advanced data management, analytics, and reporting capabilities for maritime training institutes
        </p>
        <StatusBadge status="warning">
          <Settings className="w-4 h-4 mr-1" />
          Currently Under Development
        </StatusBadge>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full mb-16">
        {features.map((feature, index) => (
          <UnifiedCard key={index} gradient={feature.gradient}>
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 opacity-80 leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-2">
                <StatusBadge status="info">
                  <Shield className="w-4 h-4 mr-1" />
                  Coming Soon
                </StatusBadge>
              </div>
            </div>
          </UnifiedCard>
        ))}
      </div>

      {/* Back to Home Button */}
      <div className="mt-8">
        <BackButton onClick={() => navigate('/')} />
      </div>
    </DashboardLayout>
  );
}

export default DatabaseDashboard;
