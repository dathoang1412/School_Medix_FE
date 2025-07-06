import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import EnterEmail from "./EnterEmail";
import EnterOTP from "./EnterOTP";
import ChangePassword from "./ChangePassword";
import SendRecoveryLink from "./SendRecoveryLink";

import { ChevronLeft, Mail, Shield, Lock, Check, Link2 } from "lucide-react";

const AuthFlow = () => {
  const [searchParams] = useSearchParams();
  const initialStep = parseInt(searchParams.get("step")) || 1;

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = (nextStep, emailValue, otpValue) => {
    if (emailValue) setEmail(emailValue);
    if (otpValue) setOtp(otpValue);
    setLoading(true);
    setTimeout(() => {
      setStep(nextStep);
      setLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  useEffect(() => {
    if (step === 5) {
      alert("Đổi mật khẩu thành công! Đang chuyển hướng...");
    }
  }, [step]);

  const steps = [
    { id: 1, title: "Nhập Email", icon: Mail },
    { id: 2, title: "Xác thực OTP", icon: Shield },
    { id: 3, title: "Link đổi mật khẩu", icon: Link2 },
    { id: 4, title: "Đổi mật khẩu", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Step Progress */}
        <div className="flex justify-center">
          <div className="relative flex justify-between items-center w-full max-w-3xl">
            {/* Background Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>

            {/* Active Progress Line */}
            <div
              className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {/* Step Circles */}
            {steps.map((stepItem) => {
              const StepIcon = stepItem.icon;
              const isActive = step === stepItem.id;
              const isCompleted = step > stepItem.id;

              return (
                <div
                  key={stepItem.id}
                  className="flex flex-col items-center relative z-10 w-1/4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 border-2 ${
                      isCompleted
                        ? "bg-green-500 text-white border-green-500"
                        : isActive
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-500 border-gray-200"
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
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {stepItem.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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

          <div className="p-6">
            {step === 1 && (
              <EnterEmail onNext={(email) => handleNext(2, email)} />
            )}
            {step === 2 && (
              <EnterOTP
                email={email}
                onNext={(email, otp) => handleNext(3, email, otp)}
                onResend={() => alert("OTP đã được gửi lại!")}
              />
            )}
            {step === 3 && (
              <SendRecoveryLink
                email={email}
                otp={otp}
                onNext={() => handleNext(4)}
                onResend={() => alert("Link đổi mật khẩu đã được gửi lại!")}
              />
            )}
            {step === 4 && (
              <ChangePassword email={email} onNext={() => handleNext(5)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
