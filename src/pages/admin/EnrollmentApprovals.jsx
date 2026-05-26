import React, { useState, useEffect } from 'react';
import { getAllEnrollments, approveEnrollment, dropEnrollment } from '../../api/enrollments.api';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

const EnrollmentApprovals = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'active', 'dropped', 'all'
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await getAllEnrollments(statusFilter === 'all' ? '' : statusFilter);
      if (res.success) {
        setEnrollments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await approveEnrollment(id);
      await fetchEnrollments();
      addToast("Enrollment approved successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to approve enrollment", "error");
    }
  };

  const handleDrop = async (id) => {
    const isConfirmed = await confirm("Are you sure you want to drop this enrollment?");
    if (!isConfirmed) return;
    try {
      await dropEnrollment(id);
      await fetchEnrollments();
      addToast("Enrollment dropped successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to drop enrollment", "error");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Enrollment Approvals</h1>
          <p className="text-slate-500 mt-2">Manage student enrollments and verify payments.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1">
          {['pending', 'active', 'dropped', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${
                statusFilter === status 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No {statusFilter !== 'all' ? statusFilter : ''} enrollments</h3>
            <p className="text-slate-400 text-sm">Everything is caught up.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 pl-6 border-b border-slate-100">Student</th>
                <th className="p-4 border-b border-slate-100 hidden md:table-cell">Batch Details</th>
                <th className="p-4 border-b border-slate-100">Payment</th>
                <th className="p-4 border-b border-slate-100">Status</th>
                <th className="p-4 pr-6 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {enrollments.map(enr => (
                <tr key={enr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-800">{enr.student?.name}</div>
                    <div className="text-xs text-slate-500">{enr.student?.email}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Requested: {new Date(enr.enrolled_at).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="font-bold text-slate-700">{enr.batch?.course?.title}</div>
                    <div className="text-xs text-slate-500">Batch: {enr.batch?.name}</div>
                  </td>
                  <td className="p-4">
                    {enr.is_paid ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100 flex inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        Paid
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-rose-100">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      enr.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      enr.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {enr.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {enr.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(enr.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {enr.status !== 'dropped' && (
                        <button 
                          onClick={() => handleDrop(enr.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          Drop
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EnrollmentApprovals;
