import React from 'react';

const AttendanceCard = ({ attendanceData }) => {
  if (!attendanceData) return null;

  const { percentage, present_days, total_working_days, history } = attendanceData;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Attendance Overview</h3>
        <div className="px-4 py-2 rounded-xl bg-sky-50 border border-sky-100">
          <span className="text-sky-700 font-black text-xl">{percentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Present Days</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{present_days}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Days</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{total_working_days}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Recent History</h4>
        <div className="space-y-2">
          {history.slice(0, 5).map((record, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-sm font-medium text-slate-600">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                record.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                'bg-slate-200 text-slate-600'
              }`}>
                {record.status === 'rest_day' ? 'Rest Day' : record.status}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-4">No recent history available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
