import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parentApi } from '../../api/parent.api';

const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentCode, setStudentCode] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchChildren = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleLinkStudent = async (e) => {
    e.preventDefault();
    if (!studentCode.trim()) return;

    try {
      setLinkLoading(true);
      setError('');
      setSuccess('');
      
      const res = await parentApi.linkStudent(studentCode);
      if (res.success) {
        setSuccess('Student linked successfully!');
        setStudentCode('');
        fetchChildren(); // refresh list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link student');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome, Parent!</h1>
          <p className="text-slate-500 mt-1">Here is an overview of your linked children.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Children Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">My Children</h3>
            
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-sm font-medium text-slate-900">No children linked</h3>
                <p className="mt-1 text-sm text-slate-500">Link a student using their Student Code to see their progress.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map(child => (
                  <div key={child.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-sky-50 hover:border-sky-100 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-lg">
                        {child.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{child.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">Code: {child.student_code}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link to={`/parent/children/${child.id}/progress`} className="flex-1 text-center py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        Progress
                      </Link>
                      <Link to={`/parent/children/${child.id}/fees`} className="flex-1 text-center py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        Fees
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col - Link Form */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Link a Student</h3>
            <p className="text-sky-100 text-sm mb-6">Ask your child or the school for the unique Student Code.</p>
            
            <form onSubmit={handleLinkStudent} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="e.g. AB12XY89"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-sky-200 focus:outline-none focus:ring-2 focus:ring-white/50 uppercase font-mono"
                  required
                />
              </div>

              {error && <div className="text-sm bg-rose-500/20 text-rose-100 p-3 rounded-lg">{error}</div>}
              {success && <div className="text-sm bg-emerald-500/20 text-emerald-100 p-3 rounded-lg">{success}</div>}

              <button
                type="submit"
                disabled={linkLoading}
                className="w-full py-3 bg-white text-sky-700 hover:bg-sky-50 font-bold rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {linkLoading ? (
                  <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Link Student
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
