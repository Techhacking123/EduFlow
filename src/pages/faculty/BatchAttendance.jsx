import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../../api/attendance.api';
import { getMyBatches } from '../../api/batches.api';

const BatchAttendance = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [batchName, setBatchName] = useState('');

  useEffect(() => {
    // Find batch name
    getMyBatches().then(res => {
      if (res.success) {
        const b = res.data.find(x => x.id === batchId);
        if (b) setBatchName(b.name);
      }
    });
  }, [batchId]);

  useEffect(() => {
    setLoading(true);
    attendanceApi.getBatchAttendance(batchId, dateStr)
      .then(res => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [batchId, dateStr]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/faculty/batches')}
        className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-2"
      >
        <span>&larr;</span> Back to Batch Management
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Batch Attendance</h1>
          <p className="text-slate-500 mt-2 font-medium">Batch: <span className="text-slate-800">{batchName}</span></p>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
          <input 
            type="date" 
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
        {loading ? (
          <div className="text-center py-10 text-slate-500 animate-pulse">Loading attendance...</div>
        ) : !data ? (
          <div className="text-center py-10 text-slate-500">Failed to load data.</div>
        ) : (
          <div className="space-y-4">
            {data.is_sunday && (
              <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-100 text-center">
                This day is a Sunday (Rest Day).
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.attendance.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-slate-500">No active students in this batch.</td>
                    </tr>
                  ) : (
                    data.attendance.map(record => (
                      <tr key={record.student_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{record.name}</td>
                        <td className="p-4 text-sm text-slate-500">{record.email}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                            record.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {record.status === 'rest_day' ? 'Rest Day' : record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchAttendance;
