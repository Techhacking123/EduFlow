import React, { useState, useEffect } from 'react';
import { getMyPaymentHistory } from '../../api/payments.api';
import { useToast } from '../../contexts/ToastContext';

const FeePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getMyPaymentHistory();
        if (res.success) {
          setPayments(res.data);
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to fetch payment history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleDownloadReceipt = (payment) => {
    // Dummy receipt generator
    const receiptContent = `
=========================================
            EDUFLOW LMS RECEIPT          
=========================================
Receipt ID: ${payment.id}
Date: ${new Date(payment.paid_at || payment.created_at).toLocaleString()}
-----------------------------------------
Student Details:
-----------------------------------------
Course: ${payment.course_title}
Batch: ${payment.batch_name}
Faculty: ${payment.faculty_name || 'N/A'}

-----------------------------------------
Payment Details:
-----------------------------------------
Status: ${payment.status.toUpperCase()}
Amount: ₹${payment.amount}
Payment ID (Gateway): ${payment.razorpay_payment_id || 'N/A'}
Order ID: ${payment.razorpay_order_id || 'N/A'}

=========================================
    Thank you for learning with us!      
=========================================
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${payment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Receipt downloaded successfully', 'success');
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      (p.course_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.faculty_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalSpent = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
  const totalCourses = new Set(payments.filter(p => p.status === 'paid').map(p => p.batch_id)).size;

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="h-24 bg-slate-200 rounded-2xl animate-pulse mb-8"></div>
        <div className="h-96 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Fee Payments</h1>
        <p className="text-slate-500 mt-2">Manage your transaction history and download receipts.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl p-6 shadow-md shadow-violet-200 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <p className="text-violet-100 font-medium mb-1">Total Spent</p>
          <h2 className="text-4xl font-extrabold">₹{totalSpent.toFixed(2)}</h2>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Paid Courses</p>
            <h2 className="text-4xl font-extrabold text-slate-800">{totalCourses}</h2>
          </div>
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              placeholder="Search by course or faculty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Course & Faculty</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-slate-500">No payment records found.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 text-slate-500 font-medium">
                      {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{payment.course_title || 'Unknown Course'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Faculty: {payment.faculty_name || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      ₹{payment.amount}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                        payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        payment.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {payment.status === 'paid' && (
                        <button 
                          onClick={() => handleDownloadReceipt(payment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeePayments;
