import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBatches } from '../../api/batches.api';

const MyCourses = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await getMyBatches();
        if (res.success) {
          setBatches(res.data);
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Teaching Groups</h1>
          <p className="text-slate-500 mt-2">Manage your course content, student progress, and batch settings.</p>
        </div>
        <button
          onClick={() => navigate('/faculty/create-course')}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-violet-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Course
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center max-w-lg mx-auto shadow-sm">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center text-violet-300 mb-6 border border-violet-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No batches assigned</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            You haven't been assigned to any course batches yet. Please contact the administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => {
            const course = batch.course;
            if (!course) return null;

            return (
              <div key={batch.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="w-full h-40 bg-slate-100 overflow-hidden relative">
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <svg className="w-3 h-3 text-violet-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      {batch.enrollment_count} / {batch.max_students}
                    </div>
                    {batch.dropped_count > 0 && (
                      <div className="bg-rose-100/90 backdrop-blur-sm text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center justify-center gap-1">
                        Canceled: {batch.dropped_count}
                      </div>
                    )}
                  </div>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {course.category && (
                    <span className="text-violet-600 text-xs font-bold tracking-wider uppercase mb-2">
                      {course.category}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{batch.name}</p>

                  <div className="flex gap-4 mb-6 pt-4 border-t border-slate-50 text-xs font-medium text-slate-500">
                    <div>
                      <span className="block text-slate-400 mb-1">Status</span>
                      <span className="capitalize text-slate-800">{batch.status}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 mb-1">Pricing</span>
                      <span className="text-slate-800">{batch.is_free ? 'Free' : `₹${batch.price}`}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 mb-1">Revenue</span>
                      <span className="text-emerald-600 font-bold">₹{batch.total_revenue || 0}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/faculty/courses/${course.id}/builder`)}
                      className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-200 text-sm flex justify-center items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      Course Builder
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate('/faculty/batches')}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all text-sm flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Settings
                      </button>
                      <button
                        onClick={() => navigate(`/faculty/batches/${batch.id}/attendance`)}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all text-sm flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Attendance
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
