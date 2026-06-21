import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Payment Failed
        </h1>
        
        <p className="text-gray-600 mb-8">
          We could not verify your security fee payment. Please ensure your transaction was completed or try again.
        </p>
        
        <Link 
          href="/resident/billing" 
          className="inline-block w-full bg-gray-900 hover:bg-gray-800 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
