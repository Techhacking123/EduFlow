import React, { useState } from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MyCourses from '../pages/faculty/MyCourses';
import CourseBuilder from '../pages/faculty/CourseBuilder';
import BatchPricing from '../pages/faculty/BatchPricing';
import BatchAttendance from '../pages/faculty/BatchAttendance';
import AddCourse from '../pages/faculty/AddCourse';

const FacultyLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col h-full z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-violet-200">
              E
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight">EduFlow</h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Faculty Portal</p>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-slate-600 p-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <Link
            to="/faculty/courses"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive('/faculty/courses')
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            My Courses
          </Link>
          <Link
            to="/faculty/create-course"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive('/faculty/create-course')
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Course
          </Link>
          <Link
            to="/faculty/batches"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive('/faculty/batches')
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-1.971-.659-1.171-.879-1.171-2.303 0-3.182 1.172-.879 3.07-.879 4.242 0L15 8.818M12 3v3m0 12v3" />
            </svg>
            Batch Pricing
          </Link>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {user.name ? user.name[0] : 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 truncate">{user.name || 'Faculty'}</h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navigation Bar */}
        <header className="bg-white border-b border-slate-100 min-h-[4rem] py-3 px-4 md:px-8 flex flex-wrap gap-3 justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-slate-500 hover:text-slate-700 p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {isActive('/faculty/courses') && 'Course Management'}
              {isActive('/faculty/create-course') && 'Create New Course'}
              {isActive('/faculty/batches') && 'Batch Pricing Controls'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-violet-50 border border-violet-100 text-violet-700 font-bold text-xs uppercase tracking-wider rounded-full">
              {user.role || 'Faculty'}
            </span>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <Routes>
            <Route path="courses" element={<MyCourses />} />
            <Route path="create-course" element={<AddCourse />} />
            <Route path="courses/:courseId/builder" element={<CourseBuilder />} />
            <Route path="batches" element={<BatchPricing />} />
            <Route path="batches/:batchId/attendance" element={<BatchAttendance />} />
            <Route path="*" element={<Navigate to="/faculty/courses" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
