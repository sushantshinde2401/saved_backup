import React from 'react';
import { Download, QrCode, User } from 'lucide-react';

function CertificateControls({
  onFetchName
}) {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onFetchName}
          className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-3 text-lg"
        >
          <User size={20} />
          Save Certificate to Database
        </button>
        <p className="text-white text-sm text-center">Final step: Store certificate images for invoicing</p>
      </div>
    </div>
  );
}

export default CertificateControls;