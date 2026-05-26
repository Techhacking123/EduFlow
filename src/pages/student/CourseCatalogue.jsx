import React, { useState, useEffect } from 'react';
import { getCourses } from '../../api/courses.api';
import CourseCard from '../../components/CourseCard';

const CourseCatalogue = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getCourses({ search, category });
      if (res.success) {
        setCourses(res.data);
        
        // Extract categories dynamically
        if (categories.length === 0 && res.data.length > 0) {
          const uniqueCats = Array.from(new Set(res.data.map(c => c.category).filter(Boolean)));
          setCategories(uniqueCats);
        }
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300); // debounce search inputs
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 p-6 md:p-12 text-white shadow-xl shadow-indigo-100 flex flex-col justify-center min-h-[220px]">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Level up your skills with EduFlow LMS
          </h1>
          <p className="text-indigo-100 text-sm md:text-base font-medium">
            Explore premium courses designed by industry specialists and taught by university faculty.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <svg className="w-80 h-80 fill-current" viewBox="0 0 100 100">
            <polygon points="50,15 90,85 10,85" />
          </svg>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-slate-800 font-medium placeholder-slate-400"
          />
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto justify-end">
          <button
            onClick={() => setCategory("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              category === ""
                ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            All Courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                category === cat
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="w-full aspect-video bg-slate-100 rounded-xl"></div>
              <div className="h-6 bg-slate-100 rounded-md w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded-md w-full"></div>
                <div className="h-4 bg-slate-100 rounded-md w-5/6"></div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl w-full pt-4"></div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No courses found</h3>
          <p className="text-slate-500 text-sm mb-4">
            Try adjusting your search queries or selecting another category.
          </p>
          {(search || category) && (
            <button
              onClick={() => { setSearch(""); setCategory(""); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} role="student" />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalogue;
