import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail } from '../../api/courses.api';
import { enrollFreeBatch } from '../../api/enrollments.api';
import { createPaymentOrder, verifyPayment } from '../../api/payments.api';
import { attendanceApi } from '../../api/attendance.api';
import AttendanceCard from '../../components/AttendanceCard';
import { useToast } from '../../contexts/ToastContext';

const CourseDetail = () => {
  const { courseId: id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollingBatch, setEnrollingBatch] = useState(null);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getCourseDetail(id);
        if (res.success) {
          setCourse(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleEnrollFree = async (batchId) => {
    setEnrollingBatch(batchId);
    try {
      const res = await enrollFreeBatch(batchId);
      if (res.success) {
        addToast("Enrolled successfully! Redirecting to your enrollments...", "success");
        navigate('/student/dashboard');
      } else {
        addToast(res.message || "Failed to enroll", "error");
      }
    } catch (err) {
      addToast("Error enrolling in batch", "error");
    } finally {
      setEnrollingBatch(null);
    }
  };

  const handlePayAndEnroll = async (batchId) => {
    setEnrollingBatch(batchId);
    try {
      // 1. Create order
      const orderRes = await createPaymentOrder(batchId);
      if (!orderRes.success) {
        addToast(orderRes.message || "Failed to create order", "error");
        setEnrollingBatch(null);
        return;
      }

      const { key_id, order_id, amount, currency, payment_db_id } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "EduFlow LMS",
        description: `Enrollment for ${course.title}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_db_id: payment_db_id,
              batch_id: batchId
            });

            if (verifyRes.success) {
              addToast("Payment successful! You are now enrolled.", "success");
              navigate('/student/dashboard');
            } else {
              addToast("Payment verification failed.", "error");
            }
          } catch (err) {
            console.error("Verification error:", err);
            addToast("Payment verification failed. Please contact support.", "error");
          }
        },
        prefill: {
          name: "Student",
          email: "student@example.com",
        },
        theme: {
          color: "#7c3aed" // violet-600
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        addToast("Payment failed: " + response.error.description, "error");
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      addToast("Error initiating payment", "error");
    } finally {
      setEnrollingBatch(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-pulse space-y-8">
        <div className="h-64 bg-slate-100 rounded-3xl w-full"></div>
        <div className="h-8 bg-slate-100 rounded w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-slate-600">{error || "Course not found."}</p>
        <button onClick={() => navigate('/student/catalogue')} className="mt-4 text-violet-600 hover:underline">
          &larr; Back to Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Back button */}
      <button 
        onClick={() => navigate('/student/catalogue')}
        className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-2"
      >
        <span>&larr;</span> Back to courses
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 h-64 md:h-auto bg-slate-100">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-8 md:p-10 md:w-3/5 flex flex-col justify-center space-y-4">
          {course.category && (
            <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg uppercase tracking-wider w-max">
              {course.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">
            {course.title}
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            {course.description || "No description provided."}
          </p>
          <div className="pt-4 flex items-center gap-6 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{course.lessons?.length || 0} Lessons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Batches Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Available Batches</h2>
        
        {(!course.batches || course.batches.length === 0) ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
            No active batches available for this course right now. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.batches.map(batch => (
              <div key={batch.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 transform origin-left scale-y-0 group-hover:scale-y-100 transition-transform"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{batch.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{batch.description}</p>
                  </div>
                  <div className="text-right">
                    {batch.is_free ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold rounded-lg text-sm">
                        Free
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 font-bold rounded-lg text-sm">
                        ₹{batch.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Starts:</span>
                    <span className="text-slate-800">{new Date(batch.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ends:</span>
                    <span className="text-slate-800">{new Date(batch.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (batch.is_enrolled) {
                      navigate(batch.enrollment_status === 'active' ? `/student/player/${course.id}` : '/student/dashboard');
                    } else if (batch.is_free) {
                      handleEnrollFree(batch.id);
                    } else {
                      handlePayAndEnroll(batch.id);
                    }
                  }}
                  disabled={enrollingBatch === batch.id || (batch.is_enrolled && batch.enrollment_status !== 'active')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center ${
                    enrollingBatch === batch.id || (batch.is_enrolled && batch.enrollment_status !== 'active')
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : batch.is_enrolled
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200'
                  }`}
                >
                  {enrollingBatch === batch.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : batch.is_enrolled ? (
                    batch.enrollment_status === 'active' ? 'Continue Learning' : 'Pending Approval'
                  ) : batch.is_free ? (
                    'Enroll Now for Free'
                  ) : (
                    `Pay ₹${batch.price} & Enroll`
                  )}
                </button>
                
                {batch.is_enrolled && batch.enrollment_status === 'active' && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <BatchAttendanceLoader batchId={batch.id} studentId={JSON.parse(sessionStorage.getItem('user'))?.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

const BatchAttendanceLoader = ({ batchId, studentId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    attendanceApi.getStudentAttendance(batchId, studentId)
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(console.error);
  }, [batchId, studentId]);

  if (!data) return null;

  return (
    <div className="-mx-6 px-6 pb-2">
      <AttendanceCard attendanceData={data} />
    </div>
  );
};

export default CourseDetail;
