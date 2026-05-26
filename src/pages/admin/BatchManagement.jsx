import React, { useState, useEffect } from 'react';
import { getBatches, createBatch } from '../../api/batches.api';
import { getCourses } from '../../api/courses.api';
import { getFaculties } from '../../api/auth.api';
import { useToast } from '../../contexts/ToastContext';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxStudents, setMaxStudents] = useState(50);
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);

  const fetchData = async () => {
    try {
      const [batchesRes, coursesRes, facultiesRes] = await Promise.all([
        getBatches(),
        getCourses(),
        getFaculties()
      ]);
      if (batchesRes.success) setBatches(batchesRes.data);
      if (coursesRes.success) setCourses(coursesRes.data);
      if (facultiesRes.success) setFaculties(facultiesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setCourseId('');
    setFacultyId('');
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setMaxStudents(50);
    setPrice(0);
    setIsFree(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      course_id: courseId,
      faculty_id: facultyId,
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      max_students: parseInt(maxStudents) || 50,
      price: isFree ? 0 : parseFloat(price),
      is_free: isFree
    };

    try {
      await createBatch(payload);
      await fetchData();
      closeModal();
      addToast("Batch created successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create batch", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded"></div>
        <div className="h-96 bg-white border border-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Batch Management</h1>
          <p className="text-slate-500 mt-2">Create batches and assign faculty to courses.</p>
        </div>
        <button
          onClick={openModal}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          New Batch
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6 border-b border-slate-100">Batch Name</th>
              <th className="p-4 border-b border-slate-100 hidden md:table-cell">Duration</th>
              <th className="p-4 border-b border-slate-100">Status</th>
              <th className="p-4 border-b border-slate-100">Pricing</th>
              <th className="p-4 pr-6 border-b border-slate-100 text-right">Students</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {batches.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No batches found. Create one to get started.
                </td>
              </tr>
            ) : (
              batches.map(batch => {
                const courseName = courses.find(c => c.id === batch.course_id)?.title || "Unknown Course";
                const facultyName = faculties.find(f => f.id === batch.faculty_id)?.name || "Unknown Faculty";
                
                return (
                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{batch.name}</div>
                      <div className="text-xs text-slate-500">{courseName} &bull; {facultyName}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="text-slate-800 font-medium">{new Date(batch.start_date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">to {new Date(batch.end_date).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        batch.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                        batch.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {batch.is_free ? <span className="text-emerald-600">Free</span> : `₹${batch.price}`}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="font-bold text-slate-800">
                        {batch.max_students - (batch.seats_available ?? batch.max_students)} / {batch.max_students}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-slate-800">Create New Batch</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Course <span className="text-rose-500">*</span></label>
                  <select required value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors">
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Assign Faculty <span className="text-rose-500">*</span></label>
                  <select required value={facultyId} onChange={e => setFacultyId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors">
                    <option value="">-- Choose Faculty --</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Batch Name <span className="text-rose-500">*</span></label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors" placeholder="e.g. Fall 2026 Morning Batch" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors resize-none" placeholder="Details about timing, schedule..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Start Date <span className="text-rose-500">*</span></label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">End Date <span className="text-rose-500">*</span></label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors" />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="text-sm font-bold text-slate-700 mb-2">Max Students</label>
                    <input type="number" min="1" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center sm:border-l sm:border-slate-200 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id="isFree" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500" />
                      <label htmlFor="isFree" className="text-sm font-bold text-slate-700 cursor-pointer">Offer for Free</label>
                    </div>
                    {!isFree && (
                      <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !courseId || !facultyId || !name || !startDate || !endDate} className="px-6 py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition-all disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
