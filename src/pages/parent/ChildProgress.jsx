import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parentApi } from '../../api/parent.api';
import { attendanceApi } from '../../api/attendance.api';
import AttendanceCard from '../../components/AttendanceCard';

const ChildProgress = () => {
  const { studentId } = useParams();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await parentApi.getChildProgress(studentId);
        if (res.success) {
          setProgress(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch progress');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/parent/children" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors border border-slate-200">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Academic Progress</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {progress.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            This student is not enrolled in any courses yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                  <th className="p-4">Course</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Enrolled Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progress.map((item) => (
                  <tr key={item.enrollment_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{item.course_title}</div>
                    </td>
                    <td className="p-4 text-slate-600">{item.batch_name}</td>
                    <td className="p-4 text-slate-600">
                      {item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        item.status === 'completed' ? 'bg-sky-100 text-sky-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {progress.map(item => item.batch_id ? (
        <BatchAttendanceLoader key={`attendance-${item.batch_id}`} batchId={item.batch_id} studentId={studentId} courseTitle={item.course_title} />
      ) : null)}
    </div>
  );
};

const BatchAttendanceLoader = ({ batchId, studentId, courseTitle }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    attendanceApi.getStudentAttendance(batchId, studentId)
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(console.error);
  }, [batchId, studentId]);

  if (!data) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Attendance: {courseTitle}</h2>
      <AttendanceCard attendanceData={data} />
    </div>
  );
};

export default ChildProgress;
