import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, isEnrolled, progressPercent, role = 'student' }) => {
  const { id, title, description, category, thumbnail_url, is_published } = course;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 text-indigo-500">
            <svg
              className="w-12 h-12 stroke-current"
              fill="none"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        {category && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-sm text-xs font-semibold text-violet-600 rounded-full shadow-sm border border-slate-100">
            {category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-600 transition-colors line-clamp-1 mb-2">
          {title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
          {description || 'No description available for this course.'}
        </p>

        {/* Progress Bar (if enrolled) */}
        {isEnrolled && progressPercent !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1">
              <span>Course Progress</span>
              <span className="text-violet-600 font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
          {role === 'admin' ? (
            <div className="flex items-center justify-between w-full">
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  is_published
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}
              >
                {is_published ? 'Published' : 'Draft'}
              </span>
              <Link
                to={`/admin/courses/${id}`}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                Manage
              </Link>
            </div>
          ) : role === 'faculty' ? (
            <div className="flex items-center justify-between w-full">
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                }`}
              >
                {is_published ? 'Active' : 'Draft'}
              </span>
              <Link
                to={`/faculty/courses/${id}/builder`}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                Build Course
              </Link>
            </div>
          ) : (
            <Link
              to={isEnrolled ? `/student/player/${id}` : `/student/courses/${id}`}
              className="w-full text-center py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:shadow-md"
            >
              {isEnrolled ? 'Resume Learning' : 'View Course'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
