import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parentApi } from '../../api/parent.api';

const ChildrenList = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await parentApi.getLinkedChildren();
        if (res.success) {
          setChildren(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-8">My Children</h1>
      
      {children.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-800">No Children Linked</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">You have not linked any student accounts yet. Go to the Dashboard to enter a Student Code.</p>
          <Link to="/parent/dashboard" className="mt-6 inline-block px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map(child => (
            <div key={child.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-100 to-blue-50 text-sky-600 flex items-center justify-center font-black text-3xl mb-4 shadow-inner">
                {child.name[0]}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{child.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{child.email}</p>
              <div className="mt-3 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
                Code: {child.student_code}
              </div>
              
              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <Link to={`/parent/children/${child.id}/progress`} className="py-2.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold rounded-xl text-sm transition-colors">
                  View Progress
                </Link>
                <Link to={`/parent/children/${child.id}/fees`} className="py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm transition-colors">
                  View Fees
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildrenList;
