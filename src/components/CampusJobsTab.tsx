import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  Filter, 
  Send, 
  Users, 
  ExternalLink, 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  Phone, 
  Mail, 
  AlertCircle,
  Edit3,
  Trash2,
  Camera,
  Upload,
  Image as ImageIcon,
  Calendar
} from 'lucide-react';
import { CampusJob, WorkerApplicationRequest, UniNestUser } from '../types';

interface CampusJobsTabProps {
  currentUser: UniNestUser;
}

const isRealUserJob = (j: any) => {
  if (!j || !j.id) return false;
  const id = String(j.id).toLowerCase();
  if (id.startsWith('job-0') || id.startsWith('job-init') || id.startsWith('demo-') || id.startsWith('mock-')) {
    return false;
  }
  const title = String(j.title || '').toLowerCase();
  if (
    title.includes('pos operator & student cashier') || 
    title.includes('hostel delivery runner') || 
    title.includes('junior graphics designer') || 
    title.includes('academic peer tutor') || 
    title.includes('hostel laundry assistant')
  ) {
    return false;
  }
  return true;
};

export const CampusJobsTab: React.FC<CampusJobsTabProps> = ({ currentUser }) => {
  const [jobs, setJobs] = useState<CampusJob[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_campus_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only real user created jobs (exclude all demo / mock items)
          const realUserJobs = parsed.filter(isRealUserJob);
          if (realUserJobs.length > 0) {
            // Ensure every real user job stays for three months (90 days)
            const updatedLifespan = realUserJobs.map((j: any) => {
              const expires = j.expiresAt ? new Date(j.expiresAt) : null;
              if (!expires || (expires.getTime() - Date.now() < 0)) {
                return {
                  ...j,
                  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                };
              }
              return j;
            });
            localStorage.setItem('uninest_campus_jobs', JSON.stringify(updatedLifespan));
            return updatedLifespan;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('uninest_campus_jobs', JSON.stringify([]));
    return [];
  });

  // Save to localStorage and notify all listeners so listings are visible to every user
  useEffect(() => {
    localStorage.setItem('uninest_campus_jobs', JSON.stringify(jobs));
    window.dispatchEvent(new CustomEvent('uninest_campus_jobs_updated'));
  }, [jobs]);

  // Synchronize across browser tabs/events
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('uninest_campus_jobs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(isRealUserJob);
            setJobs(realOnly);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('uninest_campus_jobs_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('uninest_campus_jobs_updated', handleSync);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'part_time' | 'full_time' | 'flexible'>('all');
  const [campusFilter, setCampusFilter] = useState('all');

  // Student Business Owner - Apply for Workers Modal State
  const [showApplyWorkersModal, setShowApplyWorkersModal] = useState(false);
  const [bizName, setBizName] = useState('');
  const [bizOwnerName, setBizOwnerName] = useState(currentUser.name || '');
  const [bizOwnerPhone, setBizOwnerPhone] = useState(currentUser.phone || '');
  const [bizOwnerEmail, setBizOwnerEmail] = useState(currentUser.email || '');
  const [bizCampus, setBizCampus] = useState(currentUser.university || 'Niger Delta University (NDU)');
  const [roleNeeded, setRoleNeeded] = useState('Campus Delivery / POS Operator');
  const [workerType, setWorkerType] = useState<'part_time' | 'full_time'>('part_time');
  const [workersCount, setWorkersCount] = useState('1');
  const [payOffer, setPayOffer] = useState('₦35,000 / month');
  const [workHours, setWorkHours] = useState('Afternoon shifts (4 PM - 8 PM)');
  const [skillsRequired, setSkillsRequired] = useState('Honest, reliable, good customer relationship');
  const [bizImage, setBizImage] = useState('');
  const [bizUploadedFileName, setBizUploadedFileName] = useState<string | null>(null);
  const bizFileInputRef = useRef<HTMLInputElement>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Edit Job Modal State (Price & Picture can be edited and deleted even after posting)
  const [editingJob, setEditingJob] = useState<CampusJob | null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobBizName, setEditJobBizName] = useState('');
  const [editJobStipend, setEditJobStipend] = useState('');
  const [editJobLocation, setEditJobLocation] = useState('');
  const [editJobCampus, setEditJobCampus] = useState('');
  const [editJobWorkHours, setEditJobWorkHours] = useState('');
  const [editJobSkills, setEditJobSkills] = useState('');
  const [editJobSlots, setEditJobSlots] = useState('1');
  const [editJobType, setEditJobType] = useState<'part_time' | 'full_time'>('part_time');
  const [editJobImage, setEditJobImage] = useState('');
  const [editJobUploadedFileName, setEditJobUploadedFileName] = useState<string | null>(null);
  const editJobFileInputRef = useRef<HTMLInputElement>(null);

  // Job Application Modal (Student applying for an existing job)
  const [applyingJob, setApplyingJob] = useState<CampusJob | null>(null);
  const [applicantNote, setApplicantNote] = useState('I am an active student with available evening hours and relevant experience.');
  const [jobAppliedSuccess, setJobAppliedSuccess] = useState<string | null>(null);

  // Helper: check expiry status & remaining days (Every job listing stays for three months / 90 days)
  const getJobRemainingDays = (job: CampusJob): { days: number; isExpired: boolean; label: string } => {
    const today = new Date();
    let expiryDate: Date;
    if (job.expiresAt) {
      expiryDate = new Date(job.expiresAt);
    } else {
      expiryDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    }

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0 || job.status === 'expired') {
      return { days: 0, isExpired: true, label: 'Expired' };
    }
    if (diffDays === 1) {
      return { days: 1, isExpired: false, label: 'Expires tomorrow' };
    }
    return { days: diffDays, isExpired: false, label: `${diffDays} days left (3 months)` };
  };

  const handleOpenEditJob = (job: CampusJob) => {
    setEditingJob(job);
    setEditJobTitle(job.title || '');
    setEditJobBizName(job.businessName || '');
    setEditJobStipend(job.stipend || '');
    setEditJobLocation(job.location || '');
    setEditJobCampus(job.campus || currentUser.university || 'Niger Delta University (NDU)');
    setEditJobSlots(String(job.slotsAvailable || 1));
    setEditJobType((job.jobType === 'full_time' ? 'full_time' : 'part_time'));
    setEditJobImage(job.image || '');
    setEditJobUploadedFileName(null);
    setEditJobSkills(job.requirements?.join(', ') || '');
    
    // Parse schedule from description if formatted as Schedule: ... Skills required: ...
    if (job.description?.includes('Schedule:') && job.description?.includes('Skills required:')) {
      const matchSchedule = job.description.replace(/^Schedule:\s*/, '').split('. Skills required:')[0];
      setEditJobWorkHours(matchSchedule || '');
    } else {
      setEditJobWorkHours(job.description || '');
    }
  };

  const handleSaveEditJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    if (!editJobBizName.trim() || !editJobTitle.trim()) {
      alert('Please fill in role and business name.');
      return;
    }

    const updatedJob: CampusJob = {
      ...editingJob,
      title: editJobTitle.trim(),
      businessName: editJobBizName.trim(),
      stipend: editJobStipend.trim(),
      location: editJobLocation.trim() || `${editJobCampus} Campus`,
      campus: editJobCampus,
      jobType: editJobType,
      slotsAvailable: editJobSlots,
      image: editJobImage, // picture can be edited or deleted
      description: `Schedule: ${editJobWorkHours.trim()}. Skills required: ${editJobSkills.trim()}`,
      requirements: editJobSkills.split(',').map(s => s.trim()).filter(Boolean)
    };

    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    setSubmitSuccess(`Job opening "${updatedJob.title}" updated successfully! Pay offer set to ${updatedJob.stipend}.`);
    setEditingJob(null);
    setTimeout(() => setSubmitSuccess(null), 6000);
  };

  const handleDeleteJob = (jobId: string, title?: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this job listing'}"? This action cannot be undone.`)) {
      return;
    }
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setSubmitSuccess(`Job listing "${title || 'Job'}" deleted successfully.`);
    setTimeout(() => setSubmitSuccess(null), 6000);
  };

  const processJobImageFile = (file: File, isEdit: boolean = false) => {
    if (file.size > 8 * 1024 * 1024) {
      alert('Photo is too large. Please upload an image under 8MB.');
      return;
    }
    if (isEdit) {
      setEditJobUploadedFileName(file.name);
    } else {
      setBizUploadedFileName(file.name);
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        if (isEdit) {
          setEditJobImage(uploadEvent.target.result as string);
        } else {
          setBizImage(uploadEvent.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered jobs - stays active for 3 months and visible to all users
  const filteredJobs = jobs.filter(j => {
    const matchType = typeFilter === 'all' || j.jobType === typeFilter;
    const matchCampus = campusFilter === 'all' || j.campus.toLowerCase().includes(campusFilter.toLowerCase());
    const matchSearch = searchQuery === '' || 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchCampus && matchSearch;
  });

  const handleApplyForWorkersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !bizOwnerPhone.trim()) {
      alert('Please fill in your business name and contact phone number.');
      return;
    }

    // Direct routing to the Head of Jobs on WhatsApp
    const headOfJobsNumber = '2349034648644';
    const message = `👔 *UNINEST STUDENT WORKER REQUISITION (HEAD OF JOBS)*\n` +
      `--------------------------------------------------\n` +
      `• Business / Enterprise: ${bizName.trim()}\n` +
      `• Student Owner: ${bizOwnerName.trim()}\n` +
      `• Campus / Institution: ${bizCampus}\n` +
      `• Contact Phone: ${bizOwnerPhone.trim()}\n` +
      `• Email: ${bizOwnerEmail.trim()}\n` +
      `• Role Needed: ${roleNeeded}\n` +
      `• Job Type: ${workerType === 'part_time' ? 'Part-Time' : 'Full-Time'}\n` +
      `• Number of Workers Needed: ${workersCount}\n` +
      `• Proposed Pay/Salary: ${payOffer}\n` +
      `• Working Schedule: ${workHours}\n` +
      `• Key Skills Required: ${skillsRequired}\n` +
      `• Date: ${new Date().toLocaleDateString()}\n` +
      `--------------------------------------------------\n` +
      `Hello Head of Jobs! I am a student business owner on UniNest. Please help me screen and recruit trustworthy student workers for this opening.`;

    const now = Date.now();
    const expires = new Date(now + 90 * 24 * 60 * 60 * 1000); // 3 months lifespan

    const newJob: CampusJob = {
      id: `job-${now}`,
      title: roleNeeded,
      businessName: bizName.trim(),
      businessOwnerName: bizOwnerName.trim(),
      businessOwnerPhone: bizOwnerPhone.trim(),
      businessOwnerEmail: currentUser.email || bizOwnerEmail.trim(),
      category: 'retail_pos',
      jobType: workerType,
      location: `${bizCampus} Campus`,
      campus: bizCampus,
      stipend: payOffer,
      payFrequency: 'monthly',
      description: `Schedule: ${workHours}. Skills required: ${skillsRequired}`,
      requirements: skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      slotsAvailable: workersCount,
      postedDate: 'Just now',
      status: 'open',
      image: bizImage || '',
      expiresAt: expires.toISOString().split('T')[0]
    };
    setJobs(prev => [newJob, ...prev]);

    window.open(`https://wa.me/${headOfJobsNumber}?text=${encodeURIComponent(message)}`, '_blank');

    setSubmitSuccess(`Worker requisition for "${bizName}" submitted! Connected with the Head of Jobs on WhatsApp (+234 903 464 8644). Listing active for 3 months.`);
    setShowApplyWorkersModal(false);
    setBizImage('');
    setBizUploadedFileName(null);
    setTimeout(() => setSubmitSuccess(null), 8000);
  };

  const handleStudentJobApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    // Send application to Head of Jobs / Business owner
    const headOfJobsNumber = '2349034648644';
    const message = `🎓 *UNINEST STUDENT JOB APPLICATION*\n` +
      `------------------------------------\n` +
      `• Job Applied For: ${applyingJob.title}\n` +
      `• Business: ${applyingJob.businessName}\n` +
      `• Campus: ${applyingJob.campus}\n` +
      `• Applicant Name: ${currentUser.name || 'Student'}\n` +
      `• Applicant Phone: ${currentUser.phone || '08000000000'}\n` +
      `• Applicant Email: ${currentUser.email}\n` +
      `• University / Department: ${currentUser.university || 'Campus'} (${currentUser.department || 'Undergraduate'})\n` +
      `• Candidate Note: ${applicantNote}\n` +
      `------------------------------------\n` +
      `Hello Head of Jobs! I would like to be considered for this campus student opening.`;

    window.open(`https://wa.me/${headOfJobsNumber}?text=${encodeURIComponent(message)}`, '_blank');

    setJobAppliedSuccess(`Application for "${applyingJob.title}" submitted to the Head of Jobs desk! We will contact you shortly.`);
    setApplyingJob(null);
    setTimeout(() => setJobAppliedSuccess(null), 7000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Notifications */}
      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{submitSuccess}</span>
        </div>
      )}

      {jobAppliedSuccess && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <span className="font-semibold">{jobAppliedSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Campus Jobs &amp; Student Employment Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Earn While Studying: Full-Time &amp; Part-Time Campus Jobs
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Find verified part-time shifts, remote freelance gigs, and student business vacancies that respect your lecture timetable. Are you running a campus business? Hire vetted student workers through our <strong>Head of Jobs</strong>!
            </p>
          </div>

          {/* Quick Action: Apply for Workers */}
          <div className="shrink-0 flex flex-col gap-2.5">
            <button
              onClick={() => setShowApplyWorkersModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>Student Business Owner? Apply for Workers</span>
            </button>
            <span className="text-[11px] text-center text-slate-400 font-medium">
              Direct connection to <strong>Head of Jobs</strong> desk
            </span>
          </div>
        </div>
      </div>

      {/* Student Business Owner Callout Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-950">
              Need Reliable Staff for Your Campus Venture?
            </h3>
            <p className="text-xs text-amber-800">
              Student POS operators, laundry attendants, food servers, tutors, and delivery runners. We vet their student identity for 100% trust.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowApplyWorkersModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <span>Hire Student Workers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, skill, or business..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Job Type Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('part_time')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'part_time' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Part-Time
            </button>
            <button
              onClick={() => setTypeFilter('full_time')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'full_time' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Full-Time
            </button>
            <button
              onClick={() => setTypeFilter('flexible')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'flexible' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              Flexible / Remote
            </button>
          </div>

          {/* Campus Filter */}
          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-indigo-500"
          >
            <option value="all">All Campus Locations</option>
            <option value="NDU">NDU Amassoma</option>
            <option value="BMU">BMU Yenagoa</option>
            <option value="FUOTUOKE">FUOTUOKE</option>
            <option value="ABSU">ABSU Uturu</option>
            <option value="UNIPORT">UNIPORT</option>
            <option value="DELSU">DELSU</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No active campus jobs listed</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              There are currently no listed student jobs. Campus business owners and student employers can click "Apply for Workers" above to recruit student talents!
            </p>
            <button
              onClick={() => setShowApplyWorkersModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-xs font-bold hover:bg-slate-800 transition"
            >
              Post a Student Job Opening
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const expiry = getJobRemainingDays(job);
            const isMyJob = (
              (job.businessOwnerEmail && currentUser.email && job.businessOwnerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
              (job.businessOwnerPhone && currentUser.phone && job.businessOwnerPhone.trim() === currentUser.phone.trim()) ||
              (job.businessOwnerName && currentUser.name && job.businessOwnerName.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
            );

            return (
              <div 
                key={job.id} 
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 overflow-hidden"
              >
                {/* Optional Job Photo / Flyer */}
                {job.image && (
                  <div className="relative h-44 -mx-5 -mt-5 mb-1 overflow-hidden bg-slate-100 border-b border-slate-200">
                    <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FF6A00]" />
                      <span>{expiry.label}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      job.jobType === 'part_time' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : job.jobType === 'full_time' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {job.jobType.replace('_', ' ')}
                    </span>

                    {!job.image && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{expiry.label}</span>
                      </span>
                    )}

                    <span className="text-[10px] text-gray-400 font-medium">
                      {job.postedDate}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-xs font-bold text-indigo-600 pt-0.5">
                      {job.businessName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      By {job.businessOwnerName}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{job.stipend}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Key Requirements */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Requirements:
                      </span>
                      <ul className="space-y-1">
                        {job.requirements.slice(0, 2).map((req, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Edit & Delete if My Job, or Apply Now */}
                {isMyJob ? (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Your Job Posting</span>
                      <span className="text-[#FF6A00] font-black">{expiry.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditJob(job)}
                        id={`btn-edit-job-${job.id}`}
                        className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>Edit Job</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        id={`btn-delete-job-${job.id}`}
                        className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {job.slotsAvailable} slot{Number(job.slotsAvailable) > 1 ? 's' : ''} left
                    </span>

                    <button
                      onClick={() => setApplyingJob(job)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL 1: STUDENT BUSINESS OWNER - APPLY FOR WORKERS ================= */}
      {showApplyWorkersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Hire Student Workers
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Application routes directly to UniNest Head of Jobs
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowApplyWorkersModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-xs text-orange-950 space-y-1">
              <div className="flex items-center gap-1 font-bold text-orange-900">
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>Head of Jobs Verification &amp; Placement</span>
              </div>
              <p className="text-[11px] text-orange-900/90 leading-relaxed">
                When you submit, your request opens directly on WhatsApp with our <strong>Head of Jobs (+234 903 464 8644)</strong>. We will screen verified students across your campus and connect you with top candidates.
              </p>
            </div>

            <form onSubmit={handleApplyForWorkersSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Your Business / Enterprise Name *
                  </label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="e.g. Apex POS & Logistics"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Owner / Student Founder *
                  </label>
                  <input
                    type="text"
                    value={bizOwnerName}
                    onChange={(e) => setBizOwnerName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="text"
                    value={bizOwnerPhone}
                    onChange={(e) => setBizOwnerPhone(e.target.value)}
                    placeholder="080XXXXXXXX"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Campus / Location *
                  </label>
                  <select
                    value={bizCampus}
                    onChange={(e) => setBizCampus(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="Niger Delta University (NDU)">NDU Amassoma</option>
                    <option value="Bayelsa Medical University (BMU)">BMU Yenagoa</option>
                    <option value="Federal University Otuoke (FUOTUOKE)">FUOTUOKE</option>
                    <option value="Abia State University (ABSU)">ABSU Uturu</option>
                    <option value="University of Port Harcourt (UNIPORT)">UNIPORT</option>
                    <option value="Delta State University (DELSU)">DELSU Abraka</option>
                    <option value="Other Campus">Other Campus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Role / Position Needed *
                  </label>
                  <select
                    value={roleNeeded}
                    onChange={(e) => setRoleNeeded(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="Campus Delivery / POS Operator">POS Operator / Cashier</option>
                    <option value="Laundry & Dry Cleaning Assistant">Laundry Attendant</option>
                    <option value="Junior Graphics & Content Creator">Graphics Designer</option>
                    <option value="Hostel Delivery Rider / Runner">Delivery Runner</option>
                    <option value="Campus Food / Bar Attendant">Food & Snack Server</option>
                    <option value="Private Home Tutor">Academic Tutor</option>
                    <option value="Other Student Role">Other Custom Role</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Job Type &amp; Slots Needed *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={workerType}
                      onChange={(e) => setWorkerType(e.target.value as 'part_time' | 'full_time')}
                      className="w-1/2 px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                    >
                      <option value="part_time">Part-Time</option>
                      <option value="full_time">Full-Time</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={workersCount}
                      onChange={(e) => setWorkersCount(e.target.value)}
                      className="w-1/2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Salary / Monthly Stipend Offer *
                  </label>
                  <input
                    type="text"
                    value={payOffer}
                    onChange={(e) => setPayOffer(e.target.value)}
                    placeholder="e.g. ₦35,000 / month"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Work Hours / Schedule *
                  </label>
                  <input
                    type="text"
                    value={workHours}
                    onChange={(e) => setWorkHours(e.target.value)}
                    placeholder="e.g. 4 PM - 8 PM daily"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Key Skills &amp; Qualifications
                </label>
                <textarea
                  rows={2}
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="e.g. Trustworthy, good with figures, punctual, resident in hostel..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Optional Job Flyer / Business Image (Can be edited or deleted anytime) */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-orange-50/50 border border-orange-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-orange-600" />
                    <span>Business Flyer / Photo (Optional)</span>
                  </label>
                  {bizImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setBizImage('');
                        setBizUploadedFileName(null);
                        if (bizFileInputRef.current) bizFileInputRef.current.value = '';
                      }}
                      className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Photo</span>
                    </button>
                  )}
                </div>

                {bizImage ? (
                  <div className="relative h-28 rounded-xl overflow-hidden border border-orange-200 bg-white">
                    <img src={bizImage} alt="Flyer Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    onClick={() => bizFileInputRef.current?.click()}
                    className="p-3 rounded-xl border border-dashed border-orange-300 text-center cursor-pointer hover:bg-white transition"
                  >
                    <Upload className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                    <p className="text-[11px] font-bold text-slate-700">Attach Business Logo or Job Flyer</p>
                    <p className="text-[10px] text-slate-400">Price &amp; picture can be edited or deleted anytime after posting</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={bizFileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processJobImageFile(file, false);
                  }}
                  className="hidden"
                />

                {bizUploadedFileName && (
                  <p className="text-[10px] text-emerald-600 font-medium">✓ Uploaded: {bizUploadedFileName}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyWorkersModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit &amp; Connect with Head of Jobs</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: APPLY FOR A LISTED JOB ================= */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Apply for {applyingJob.title}
                </h3>
                <p className="text-[11px] text-indigo-600 font-bold">
                  {applyingJob.businessName} • {applyingJob.campus}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Stipend / Pay:</span>
                <span className="text-emerald-600 font-black">{applyingJob.stipend}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Location:</span>
                <span>{applyingJob.location}</span>
              </div>
            </div>

            <form onSubmit={handleStudentJobApply} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Why are you a good fit for this role?
                </label>
                <textarea
                  rows={3}
                  value={applicantNote}
                  onChange={(e) => setApplicantNote(e.target.value)}
                  placeholder="Explain your relevant skills and availability..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-slate-500">
                Submitting will connect you via WhatsApp with the Head of Jobs desk (+234 903 464 8644) who will introduce you to the student employer.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Application to Head of Jobs</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: EDIT JOB (PRICE, PICTURE & DETAILS) ================= */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-[#FF6A00] flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Edit Campus Job Listing</h3>
                  <p className="text-[11px] text-slate-500">Edit pay offer, replace or delete picture, and update details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span>Active 3-Month Listing:</span>
              </div>
              <span className="font-bold text-[11px] text-slate-900">
                {getJobRemainingDays(editingJob).label}
              </span>
            </div>

            <form onSubmit={handleSaveEditJobSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Role / Position *</label>
                  <input
                    type="text"
                    required
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Business / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    value={editJobBizName}
                    onChange={(e) => setEditJobBizName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Pay / Salary Offer (Price) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editJobStipend}
                    onChange={(e) => setEditJobStipend(e.target.value)}
                    placeholder="e.g. ₦35,000 / month"
                    className="w-full px-3 py-1.5 rounded-xl border-2 border-[#FF6A00] text-xs font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Editable anytime after posting</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Job Type &amp; Slots
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editJobType}
                      onChange={(e) => setEditJobType(e.target.value as 'part_time' | 'full_time')}
                      className="w-1/2 px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="part_time">Part-Time</option>
                      <option value="full_time">Full-Time</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editJobSlots}
                      onChange={(e) => setEditJobSlots(e.target.value)}
                      className="w-1/2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Location / Campus *</label>
                  <input
                    type="text"
                    required
                    value={editJobLocation}
                    onChange={(e) => setEditJobLocation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Work Schedule *</label>
                  <input
                    type="text"
                    required
                    value={editJobWorkHours}
                    onChange={(e) => setEditJobWorkHours(e.target.value)}
                    placeholder="e.g. 4 PM - 8 PM daily"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Requirements / Skills</label>
                <textarea
                  rows={2}
                  value={editJobSkills}
                  onChange={(e) => setEditJobSkills(e.target.value)}
                  placeholder="e.g. Punctual, honest, familiar with student hostels..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Picture Edit & Delete Section */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Job Flyer / Photo (Can be edited or deleted)</span>
                  </label>
                  {editJobImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditJobImage('');
                        setEditJobUploadedFileName(null);
                        if (editJobFileInputRef.current) editJobFileInputRef.current.value = '';
                      }}
                      className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Picture</span>
                    </button>
                  )}
                </div>

                {editJobImage ? (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <img src={editJobImage} alt="Job Flyer Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => editJobFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Change Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditJobImage('');
                          setEditJobUploadedFileName(null);
                          if (editJobFileInputRef.current) editJobFileInputRef.current.value = '';
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => editJobFileInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-slate-300 text-center cursor-pointer hover:bg-white transition"
                  >
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-slate-700">No flyer attached. Click to upload picture</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG up to 8MB</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={editJobFileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processJobImageFile(file, true);
                  }}
                  className="hidden"
                />

                {editJobUploadedFileName && (
                  <p className="text-[10px] text-emerald-600 font-medium">✓ Uploaded: {editJobUploadedFileName}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteJob(editingJob.id, editingJob.title)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Save Job Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
