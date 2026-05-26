import React from 'react';

const LessonList = ({ lessons, activeLessonId, onLessonClick, completedLessons = [] }) => {
  return (
    <div className="space-y-1">
      {lessons.map((lesson, index) => {
        const isActive = activeLessonId === lesson.id;
        const isCompleted = completedLessons.includes(lesson.id) || lesson.is_completed;
        const prevLesson = index > 0 ? lessons[index - 1] : null;
        const prevIsCompleted = prevLesson ? (completedLessons.includes(prevLesson.id) || prevLesson.is_completed) : true;
        const isLocked = !prevIsCompleted;

        return (
          <button
            key={lesson.id}
            disabled={isLocked}
            onClick={() => onLessonClick && !isLocked && onLessonClick(lesson)}
            title={isLocked ? "Complete previous lesson to unlock" : ""}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              isLocked 
                ? 'opacity-60 cursor-not-allowed bg-slate-50 border border-transparent text-slate-400'
                : isActive
                  ? 'bg-violet-50 border border-violet-100 text-violet-900 font-medium'
                  : 'bg-white hover:bg-slate-50 border border-transparent text-slate-700'
            }`}
          >
            {/* Completion Indicator / Type icon */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                  <svg className="w-3 h-3 fill-current font-bold" viewBox="0 0 20 20">
                    <path d="M7.629 14.571a.987.987 0 0 1-.703-.31l-3.328-3.33a.986.986 0 1 1 1.4-1.39l2.585 2.593 6.945-7.391a.988.988 0 1 1 1.439 1.352l-7.595 8.08a.986.986 0 0 1-.724.397l-.023-.001z" />
                  </svg>
                </div>
              ) : (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isLocked ? 'border-slate-300 text-slate-300 bg-slate-100' :
                  isActive ? 'border-violet-400 text-violet-500' : 'border-slate-300 text-slate-400'
                }`}>
                  {isLocked ? (
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 0 0-4 4v2H5.5A1.5 1.5 0 0 0 4 9.5v8A1.5 1.5 0 0 0 5.5 19h9a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 8H14V6a4 4 0 0 0-4-4zm2 6V6a2 2 0 1 0-4 0v2h4z" clipRule="evenodd" />
                    </svg>
                  ) : lesson.type === 'video' ? (
                    <svg className="w-3 h-3 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  ) : lesson.type === 'document' ? (
                    <svg className="w-3 h-3 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  ) : lesson.type === 'live_class' ? (
                    <svg className="w-3 h-3 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                  )}
                </div>
              )}
            </div>

            {/* Title & Duration */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${isLocked ? 'text-slate-400' : isActive ? 'text-violet-950 font-semibold' : 'text-slate-800'}`}>
                {lesson.position}. {lesson.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {lesson.type === 'live_class' && lesson.live_start_time ? (
                  <span className="text-[11px] text-violet-500 font-medium flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {(() => {
                      const d = new Date(lesson.live_start_time.endsWith('Z') ? lesson.live_start_time : lesson.live_start_time + 'Z');
                      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    })()}
                  </span>
                ) : lesson.duration_mins ? (
                  <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {lesson.duration_mins} mins
                  </span>
                ) : null}
                {lesson.is_preview && (
                  <span className="text-[9px] font-bold text-violet-600 bg-violet-100/60 px-1.5 py-0.25 rounded-md border border-violet-100">
                    Preview
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LessonList;
