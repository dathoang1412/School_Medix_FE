import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Syringe, Pill } from 'lucide-react';
import DiseaseDeclarationHistory from './DiseaseDeclarationHistory';
import VaccineDeclarationHistory from './VaccineDeclarationHistory';

const HealthDeclarationHistory = () => {
  const { student_id } = useParams();
  const [viewMode, setViewMode] = useState('disease'); // Default to 'disease'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-8 h-8 text-blue-600 p-2 bg-blue-50 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {viewMode === 'disease' ? 'Lịch sử khai báo bệnh' : 'Lịch sử khai báo tiêm chủng'}
              </h1>
              <p className="text-gray-600">
                Xem trạng thái và chi tiết các đơn khai báo {viewMode === 'disease' ? 'bệnh' : 'tiêm chủng  '}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('disease')}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                    viewMode === 'disease'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Pill className="w-4 h-4" /> Lịch sử khai báo bệnh
                </button>
                <button
                  onClick={() => setViewMode('vaccine')}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                    viewMode === 'vaccine'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Syringe className="w-4 h-4" /> Lịch sử khai báo tiêm chủng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'disease' ? (
          <DiseaseDeclarationHistory student_id={student_id} />
        ) : (
          <VaccineDeclarationHistory student_id={student_id} />
        )}
      </div>
    </div>
  );
};

export default HealthDeclarationHistory;