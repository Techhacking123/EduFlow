import React, { useState, useEffect } from 'react';
import { getMyEnrollments } from '../../api/enrollments.api';
import { generateCertificateImage } from '../../utils/certificate';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';

const CertificateCard = ({ enrollment, user }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const generate = async () => {
      try {
        const courseInfo = {
          course_title: enrollment.batch?.course?.title,
          total_lessons: enrollment.total_lessons,
          progress_percent: enrollment.progress_percent,
          id: enrollment.batch?.course?.id
        };
        const url = await generateCertificateImage(courseInfo, user, courseInfo.id);
        setDataUrl(url);
      } catch (error) {
        console.error('Failed to generate certificate preview', error);
      }
    };
    generate();
  }, [enrollment, user]);

  const handleDownload = () => {
    if (!dataUrl) return;
    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `EduFlow_Certificate_${(enrollment.batch.course?.title || 'Course').replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      addToast('Certificate downloaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to download certificate.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {/* Preview Container */}
      <div className="relative aspect-[1.4] w-full bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/0 via-violet-600/0 to-fuchsia-600/0 group-hover:from-violet-600/10 group-hover:via-transparent group-hover:to-fuchsia-600/10 transition-colors duration-500"></div>
        
        {dataUrl ? (
          <img 
            src={dataUrl} 
            alt="Certificate of Completion" 
            className="w-full h-full object-contain filter drop-shadow-md rounded-sm transform group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 animate-pulse rounded-sm flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Floating badge */}
        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 z-10">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Certified
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2 leading-tight">
          {enrollment.batch.course?.title || 'Course Completed'}
        </h3>
        <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Completed {new Date(enrollment.updated_at || Date.now()).toLocaleDateString()}
        </p>
        
        <div className="mt-auto">
          <button
            onClick={handleDownload}
            disabled={!dataUrl || isDownloading}
            className="w-full py-2.5 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white rounded-xl text-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download High-Res
          </button>
        </div>
      </div>
    </div>
  );
};

const Achievements = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const data = await getMyEnrollments();
        if (data.success) {
          // Filter enrollments where progress is 100%
          const completedEnrollments = data.data.filter(e => e.progress_percent === 100);
          setEnrollments(completedEnrollments);
        } else {
          setError('Failed to fetch achievements');
        }
      } catch (err) {
        setError('Error connecting to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Your Achievements</h1>
          </div>
          <p className="text-slate-500 pl-14">View your completed courses and download your certificates.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No achievements yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Complete your enrolled courses to unlock your certificates and badges. Keep learning!
            </p>
            <Link 
              to="/student/courses" 
              className="inline-flex px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-md shadow-violet-200 transition-all duration-300"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(enrollment => (
              <CertificateCard key={enrollment.id} enrollment={enrollment} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
