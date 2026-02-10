import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, BookOpen, Database, Ship, Award, ArrowLeft } from 'lucide-react';
import { DashboardLayout, UnifiedCard } from '../../shared/components/DesignSystem';

function HomePage() {
  const navigate = useNavigate();

  const cardContent = [
    {
      icon: Briefcase,
      title: "OPERATIONS",
      subtitle: "MANAGEMENT",
      description: "Document processing, candidate management, and certificate generation",
      gradient: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
      onClick: () => navigate('/upload-docx')
    },
    {
      icon: BookOpen,
      title: "BOOKKEEPING",
      subtitle: "MANAGEMENT",
      description: "Financial tracking, invoicing, and comprehensive reporting",
      gradient: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-600",
      onClick: () => navigate('/bookkeeping')
    },
    {
      icon: Database,
      title: "DATABASE",
      subtitle: "MANAGEMENT",
      description: "Data analytics, search capabilities, and system administration",
      gradient: "from-purple-500 to-pink-500",
      textColor: "text-purple-600",
      onClick: () => navigate('/database')
    }
  ];

  return (
    <DashboardLayout
      title="MARITIME"
      subtitle="TRAINING INSTITUTE"
      icon={Ship}
      footerText="Professional Maritime Training • Certificate Management • Quality Assurance"
    >
      {/* Custom Header Content */}
      <div className="text-center mb-16">
        <p className="text-xl text-blue-100 opacity-80 max-w-3xl mx-auto mb-2">
          Comprehensive Certificate Management System
        </p>
        <div className="flex items-center justify-center gap-2 text-blue-200 opacity-60">
          <Award className="w-5 h-5" />
          <span className="text-lg font-medium">VALUE ADDED SERVICES</span>
          <Award className="w-5 h-5" />
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {cardContent.map((card, index) => (
          <UnifiedCard key={index} gradient={card.gradient} onClick={card.onClick}>
            <div className="flex flex-col items-center justify-center gap-6 h-full">
              <div className={`w-20 h-20 bg-gradient-to-r ${card.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                <card.icon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className={`${card.textColor} font-semibold text-lg mb-3`}>
                  {card.subtitle}
                </p>
                <p className="text-sm text-gray-600 opacity-80 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </UnifiedCard>
        ))}
      </div>

    </DashboardLayout>
  );
}

export default HomePage;
