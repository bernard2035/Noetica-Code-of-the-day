import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your security fee payment has been confirmed successfully. Your resident portal will be updated shortly.
        </p>
        
        <Link 
          href="/resident" 
          className="inline-block w-full bg-lime-600 hover:bg-blue-700 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
