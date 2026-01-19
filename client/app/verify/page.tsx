'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { verifyCode, clearError } from '@/lib/redux/slices/auth.slice';
import { authAPI } from '@/lib/api';
import { Bot, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please register again.');
      router.push('/register');
    }
  }, [email, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Show error toast when Redux error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('');
    
    if (newCode.length === 6 && newCode.every(char => /\d/.test(char))) {
      setCode(newCode);
      inputRefs.current[5]?.focus();
      toast.success('Code pasted successfully!');
      handleSubmit(newCode.join(''));
    } else {
      toast.error('Invalid code format. Please enter 6 digits.');
    }
  };

  const handleSubmit = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    const toastId = toast.loading('Verifying your code...');

    try {
      const result = await dispatch(verifyCode({ 
        email, 
        code: codeToVerify 
      }));
      
      toast.dismiss(toastId);
      
      if (verifyCode.fulfilled.match(result)) {
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Verification failed. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (resendLoading) return;

    const toastId = toast.loading('Sending verification code...');
    
    try {
      setResendLoading(true);
      await authAPI.resendCode({ email });
      
      toast.dismiss(toastId);
      toast.success('Verification code sent! Check your email.');
      
      // Reset code inputs
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err?.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-900 dark:to-teal-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Back Button */}
        <Link 
          href="/register"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Register
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Bot className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            We sent a verification code to
          </p>
          <p className="text-gray-900 dark:text-white font-medium mt-1">{email}</p>
        </div>

        {/* Verification Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
            Enter 6-digit code
          </label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => {inputRefs.current[index] = el}}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Paste your code or enter it manually
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={loading || code.some(digit => !digit)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendCode}
            disabled={resendLoading}
            className="text-green-600 dark:text-green-400 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resendLoading ? 'Sending...' : 'Resend verification code'}
          </button>
        </div>
      </div>
    </div>
  );
}