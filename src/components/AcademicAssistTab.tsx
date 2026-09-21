import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  PlusCircle, 
  Phone,
  BarChart,
  Layers,
  AlertCircle
} from 'lucide-react';
import { AcademicAssistRequest, UniNestUser } from '../types';

interface AcademicAssistTabProps {
  user: UniNestUser;
  requests: AcademicAssistRequest[];
  onSubmitRequest: (req: Omit<AcademicAssistRequest, 'id' | 'createdAt'>) => void;
}

export const AcademicAssistTab: React.FC<AcademicAssistTabProps> = ({
  user,
  requests,
  onSubmitRequest,
}) => {
  const safeUser = user || {
    name: 'Student',
    email: 'student@uninest.ng',
    university: 'Niger Delta University (NDU)',
    department: 'Computer Science',
    phone: '08000000000'
  };

  const [showModal, setShowModal] = useState(false);
  const [serviceType, setServiceType] = useState<AcademicAssistRequest['serviceType']>('Assignment Assistance');
  const [topic, setTopic] = useState('');
  const [department, setDepartment] = useState(safeUser.department || 'Computer Science');
  const [institution, setInstitution] = useState(safeUser.university || 'Niger Delta University (NDU)');
  const [deadline, setDeadline] = useState('2026-09-15');
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState(safeUser.phone || '08000000000');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onSubmitRequest({
      userEmail: safeUser.email || 'student@campus.edu',
      studentName: safeUser.name || 'Student',
      phone: phone || safeUser.phone,
      serviceType: serviceType,
      topicOrCourse: topic.trim(),
      department: department || safeUser.department,
      institution: institution || safeUser.university,
      deadline: deadline,
      additionalDetails: details.trim(),
      status: 'Received',
      estimatedPrice: serviceType.includes('Project') ? '₦25,000 - ₦40,000' : '₦3,000 - ₦8,000'
    });

    // Automated WhatsApp message to +234 903 984 7154 for Project Work / Academic Assist
    const projectMsg = `📚 *UNINEST ACADEMIC & PROJECT WORK REQUEST*\n` +
      `-----------------------------------------\n` +
      `• Student Name: ${safeUser.name || 'Student'}\n` +
      `• Phone: ${phone || safeUser.phone || '08000000000'}\n` +
      `• Email: ${safeUser.email}\n` +
      `• University: ${institution}\n` +
      `• Department: ${department}\n` +
      `• Service Type: ${serviceType}\n` +
      `• Topic / Course Code: ${topic.trim()}\n` +
      `• Target Deadline: ${deadline}\n` +
      `• Project Details / Brief: ${details.trim() || 'Standard Chapter 1-5 Assistance'}\n` +
      `• Date Submitted: ${new Date().toLocaleString()}\n` +
      `-----------------------------------------\n` +
      `Please assign an official researcher from the project work desk to handle this request.`;

    window.open(`https://wa.me/2349039847154?text=${encodeURIComponent(projectMsg)}`, '_blank');

    setSuccessMsg('Academic & Project Work assistance submitted! Form details automated to the official project desk on WhatsApp (+234 903 984 7154).');
    setShowModal(false);
    setTopic('');
    setDetails('');
    setTimeout(() => setSuccessMsg(null), 8000);
  };

  const userRequests = requests.filter(r => r.userEmail.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>UniNest Academic Assist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assignments &amp; Final Year Project Assistance
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Get vetted, quality academic assistance from certified graduates and researchers. We cover <strong>Coursework, Final Year Projects (Chapters 1–5), SPSS Data Analysis, Turnitin Plagiarism Reduction, and Seminar Papers</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Academic Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Academic Assist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm">Assignment &amp; Coursework</h4>
          <p className="text-xs text-gray-500">
            Step-by-step solutions, lab reports, tutorial questions, and essay writing across all faculties.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm">Final Year Projects (Ch 1–5)</h4>
          <p className="text-xs text-gray-500">
            Approved topics, literature review, methodology, system implementation, and project defense prep.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BarChart className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm">Data Analysis &amp; SPSS</h4>
          <p className="text-xs text-gray-500">
            Statistical questionnaires, Chi-Square, ANOVA, Regression analysis in SPSS, Python, and Excel.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm">Turnitin Plagiarism Check</h4>
          <p className="text-xs text-gray-500">
            100% Turnitin similarity reduction, AI-flag bypass rewrites, and academic proofreading.
          </p>
        </div>
      </div>

      {/* Active Requests List */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span>My Submitted Academic Tasks ({userRequests.length})</span>
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            + New Request
          </button>
        </div>

        {userRequests.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You haven't submitted any assignment or project tasks yet. Click "Submit Academic Task" to get quick expert help.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0f172a] text-white font-bold text-xs"
            >
              Submit Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-extrabold">
                      {req.serviceType}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">ID: {req.id}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{req.topicOrCourse}</h4>
                  <p className="text-xs text-gray-500">
                    {req.department} • {req.institution} | Deadline: <strong className="text-slate-800">{req.deadline}</strong>
                  </p>
                  {req.additionalDetails && (
                    <p className="text-xs text-gray-600 italic line-clamp-1">"{req.additionalDetails}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Completed / Ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : req.status === 'Assigned to Expert'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      ● {req.status}
                    </span>
                    <span className="block text-[11px] text-gray-400 mt-0.5">Submitted: {req.createdAt}</span>
                  </div>

                  <a
                    href={`https://wa.me/2348000000000?text=Hello%20UniNest%20Academic%20Desk,%20inquiry%20on%20task%20${req.id}%20(${encodeURIComponent(req.topicOrCourse)})`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1"
                    title="Chat with Subject Specialist"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp Help</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: SUBMIT ACADEMIC REQUEST */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-900">Request Academic Assistance</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assistance Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
                >
                  <option value="Assignment Assistance">Assignment &amp; Coursework Help</option>
                  <option value="Final Year Project (Ch 1-5)">Final Year Project (Chapters 1 to 5)</option>
                  <option value="Data Analysis (SPSS/Python)">Data Analysis (SPSS, Charts &amp; Hypotheses)</option>
                  <option value="Plagiarism & Turnitin Reduction">Plagiarism &amp; Turnitin Reduction</option>
                  <option value="Seminar & Term Paper">Seminar / Term Paper &amp; Defense Slides</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code or Project Topic</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                  placeholder="e.g. CVE 402 Soil Analysis or IoT Smart Campus System"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Specific Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                  placeholder="Provide supervisor guidelines, required word count, software/methodology specifics, or attachment details..."
                />
              </div>

              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                <span>100% confidential. Your assigned academic researcher will contact you with transparent student pricing.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
