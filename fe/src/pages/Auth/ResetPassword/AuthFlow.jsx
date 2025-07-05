import React, { useEffect, useState } from 'react';
import EnterEmail from './EnterEmail';
import EnterOTP from './EnterOTP';
import ChangePassword from './ChangePassword';
// import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Shield, Lock, Check } from 'lucide-react';

const AuthFlow = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = (nextStep, emailValue) => {
    if (emailValue) setEmail(emailValue);
    setLoading(true);
    // Simulate successful API call
    setTimeout(() => {
      setStep(nextStep);
      setLoading(false);
    }, 1000); // Simulate 1s delay for loading
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  useEffect(() => {
    if (step === 4) {
      // Navigate to login - in real app this would be useNavigate
      alert('Password changed successfully! Redirecting to login...');
    }
  }, [step]);

  const steps = [
    { id: 1, title: 'Nhập Email', icon: Mail },
    { id: 2, title: 'Xác thực OTP', icon: Shield },
    { id: 3, title: 'Đổi mật khẩu', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative flex justify-between items-center">
            {/* Progress Line Background */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
            
            {/* Progress Line Active */}
            <div
              className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = step === stepItem.id;
              const isCompleted = step > stepItem.id;
              
              return (
                <div key={stepItem.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 border-2 ${
                      isCompleted
                        ? 'bg-green-500 text-white border-green-500'
                        : isActive
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {stepItem.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>



        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {step > 1 && (
            <div className="p-4 border-b">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Quay lại
              </button>
            </div>
          )}
          
          {step === 1 && <EnterEmail onNext={(email) => handleNext(2, email)} />}
          {step === 2 && (
            <EnterOTP
              email={email}
              onNext={() => handleNext(3)}
              onResend={() => alert('OTP đã được gửi lại!')}
            />
          )}
          {step === 3 && <ChangePassword email={email} onNext={() => handleNext(4)} />}
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;