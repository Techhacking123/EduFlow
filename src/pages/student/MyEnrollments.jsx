import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyEnrollments, dropEnrollment } from '../../api/enrollments.api';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await getMyEnrollments();
        if (res.success) {
          setEnrollments(res.data);
        }
      } catch (err) {
        console.error("Failed to load enrollments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const handleCancelCourse = async (enrollmentId, courseTitle) => {
    const isConfirmed = await confirm(`Are you sure you want to cancel your enrollment in "${courseTitle}"? You will lose access and have to pay again to re-enroll.`);
    if (isConfirmed) {
      try {
        const res = await dropEnrollment(enrollmentId);
        if (res.success) {
          addToast("Course enrollment cancelled.", "success");
          const fetchEnrollments = async () => {
            const result = await getMyEnrollments();
            if (result.success) setEnrollments(result.data);
          };
          fetchEnrollments();
        }
      } catch (err) {
        console.error(err);
        addToast(err.response?.data?.message || "Failed to cancel course", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 h-48 animate-pulse">
              <div className="h-6 w-3/4 bg-slate-100 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-8"></div>
              <div className="h-2 w-full bg-slate-100 rounded mb-2"></div>
              <div className="h-4 w-16 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row gap-4 justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Dashboard</h1>
          <p className="text-slate-500 mt-2">Track your learning progress and pick up where you left off.</p>
        </div>
        <button
          onClick={() => navigate('/student/courses')}
          className="px-5 py-2.5 bg-violet-50 text-violet-600 hover:bg-violet-100 font-bold rounded-xl transition-colors text-sm"
        >
          Browse Courses
        </button>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center max-w-lg mx-auto shadow-sm">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center text-violet-300 mb-6 border border-violet-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No enrollments yet</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            You haven't enrolled in any courses. Explore our catalogue and start learning today.
          </p>
          <button
            onClick={() => navigate('/student/courses')}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-200"
          >
            Explore Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(enr => {
            const course = enr.batch?.course;
            if (!course) return null; // Defensive check

            return (
              <div key={enr.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                {enr.status === 'pending' && (
                  <div className="absolute top-4 right-4 z-10 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Pending Approval
                  </div>
                )}
                {enr.status === 'active' && enr.progress_percent === 100 && (
                  <div className="absolute top-4 right-4 z-10 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    Completed
                  </div>
                )}
                
                <div className="w-full h-40 bg-slate-100 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1">{enr.batch.name}</p>

                  <div className="mt-auto space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span>Progress</span>
                      <span className="text-slate-800">{enr.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${enr.progress_percent === 100 ? 'bg-green-500' : 'bg-violet-600'}`}
                        style={{ width: `${enr.progress_percent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 font-medium pt-1">
                      {enr.completed_lessons} / {enr.total_lessons} Lessons Completed
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      disabled={enr.status !== 'active'}
                      onClick={() => navigate(`/student/player/${course.id}`)}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        enr.status === 'active'
                          ? 'bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {enr.status === 'active' ? (enr.progress_percent > 0 ? 'Continue Learning' : 'Start Learning') : 'Pending Approval'}
                    </button>
                    {enr.status === 'active' && (
                      <button
                        onClick={() => handleCancelCourse(enr.id, course.title)}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Cancel Course
                      </button>
                    )}
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

export default MyEnrollments;
