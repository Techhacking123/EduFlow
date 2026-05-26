import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parentApi } from '../../api/parent.api';

const FeePayments = () => {
  const { studentId } = useParams(); // May or may not be present
  const [fees, setFees] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || '');

  useEffect(() => {
    // If we came from the global fees page, we need to fetch children first
    const init = async () => {
      try {
        setLoading(true);
        const childrenRes = await parentApi.getLinkedChildren();
        if (childrenRes.success) {
          setChildren(childrenRes.data);
          // Auto select first child if none selected
          const activeId = studentId || (childrenRes.data.length > 0 ? childrenRes.data[0].id : null);
          if (activeId) {
            setSelectedStudentId(activeId);
            const feesRes = await parentApi.getChildFees(activeId);
            if (feesRes.success) {
              setFees(feesRes.data);
            }
          }
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [studentId]);

  const handleStudentChange = async (e) => {
    const newId = e.target.value;
    setSelectedStudentId(newId);
    if (!newId) return;

    try {
      setLoading(true);
      const res = await parentApi.getChildFees(newId);
      if (res.success) {
        setFees(res.data);
      }
    } catch (err) {
      setError('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  if (loading && children.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {studentId && (
            <Link to="/parent/children" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors border border-slate-200">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          )}
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Fee Overview</h1>
        </div>

        {children.length > 0 && !studentId && (
          <select 
            value={selectedStudentId} 
            onChange={handleStudentChange}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl font-medium">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        ) : children.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No children linked yet.
          </div>
        ) : fees.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No fee records found for this student.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                  <th className="p-4">Batch/Course</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{fee.batch?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">Order: {fee.razorpay_order_id || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-700">
                      ₹{fee.amount}
                    </td>
                    <td className="p-4 text-slate-600">
                      {fee.created_at ? new Date(fee.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        fee.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        fee.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeePayments;
