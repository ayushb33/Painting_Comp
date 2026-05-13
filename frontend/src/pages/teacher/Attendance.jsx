import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { Users, ClipboardList, BarChart2, UserCircle, Save, Upload } from 'lucide-react';

const TEACHER_LINKS = [
  { to: '/teacher', label: 'Dashboard', icon: BarChart2 },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/attendance', label: 'Attendance & Upload', icon: ClipboardList },
  { to: '/teacher/results', label: 'Results', icon: BarChart2 },
  { to: '/teacher/profile', label: 'Profile', icon: UserCircle },
];

export default function TeacherAttendance() {
  const qc = useQueryClient();
  const [attendance, setAttendance] = useState({});
  const [uploadTarget, setUploadTarget] = useState(null);
  const [paintingFile, setPaintingFile] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const { data: students, isLoading } = useQuery({
    queryKey: ['my-students-attendance'],
    queryFn: () =>
      api.get('/teacher/students', { params: { limit: 200 } })
        .then(r => r.data.data.students),
  });

  // ── Sync attendance state from DB data whenever students load ──────────────
  useEffect(() => {
    if (students && students.length > 0) {
      const init = {};
      students.forEach(s => {
        init[s.id] = s.attendance?.is_present ?? false;
      });
      setAttendance(init);
      setInitialized(true);
    }
  }, [students]);

  const { mutate: saveAttendance, isPending: savingAttendance } = useMutation({
    mutationFn: () =>
      api.post('/teacher/attendance', {
        attendanceData: Object.entries(attendance).map(([student_id, is_present]) => ({
          student_id: parseInt(student_id),
          is_present,
        })),
      }),
    onSuccess: () => {
      toast.success('Attendance saved!');
      qc.invalidateQueries({ queryKey: ['my-students-attendance'] });
      qc.invalidateQueries({ queryKey: ['my-students'] });
    },
    onError: () => toast.error('Failed to save attendance'),
  });

  const { mutate: uploadPainting, isPending: uploadingPainting } = useMutation({
    mutationFn: ({ studentId, file }) => {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('student_id', studentId);
      return api.post('/teacher/paintings', fd);
    },
    onSuccess: () => {
      toast.success('Painting uploaded successfully!');
      setUploadTarget(null);
      setPaintingFile(null);
      qc.invalidateQueries({ queryKey: ['my-students-attendance'] });
      qc.invalidateQueries({ queryKey: ['my-students'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const toggleAll = (val) => {
    const updated = {};
    students?.forEach(s => { updated[s.id] = val; });
    setAttendance(updated);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = students?.length ?? 0;

  if (isLoading || !initialized) {
    return (
      <div className="flex">
        <Sidebar links={TEACHER_LINKS} />
        <main className="ml-64 flex-1 p-8"><Loader /></main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar links={TEACHER_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance & Painting Upload</h1>
            <p className="text-gray-500 text-sm mt-1">
              Mark attendance, then upload paintings for present students.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleAll(true)}
              className="px-3 py-1.5 text-xs border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition"
            >
              Mark All Present
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="px-3 py-1.5 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
            >
              Mark All Absent
            </button>
            <button
              onClick={() => saveAttendance()}
              disabled={savingAttendance}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
            >
              <Save size={14} />
              {savingAttendance ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-5 text-sm">
          <span className="text-gray-500">
            Total: <span className="font-semibold text-gray-800">{totalCount}</span>
          </span>
          <span className="text-green-600">
            Present: <span className="font-semibold">{presentCount}</span>
          </span>
          <span className="text-red-500">
            Absent: <span className="font-semibold">{totalCount - presentCount}</span>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'Class', 'Student ID', 'Present', 'Painting Status', 'Upload'].map(h => (
                  <th key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students?.map(s => {
                const isPresent = attendance[s.id] ?? false;
                const hasPainting = !!s.painting;
                const isApproved = s.painting?.is_approved;
                const isUploading = uploadingPainting && uploadTarget === s.id;

                return (
                  <tr key={s.id} className={`border-b last:border-0 transition ${isPresent ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/60'}`}>

                    {/* Name */}
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {s.full_name}
                    </td>

                    {/* Class */}
                    <td className="px-4 py-3 text-gray-500">
                      {s.class}-{s.section}
                    </td>

                    {/* Student ID */}
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {s.unique_student_id}
                    </td>

                    {/* Attendance Checkbox */}
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          checked={isPresent}
                          onChange={e =>
                            setAttendance(a => ({ ...a, [s.id]: e.target.checked }))
                          }
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                        <span className={`text-xs font-semibold ${isPresent ? 'text-green-600' : 'text-red-500'}`}>
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </label>
                    </td>

                    {/* Painting Status */}
                    <td className="px-4 py-3">
                      {isApproved ? (
                        <Badge label="Approved" variant="success" />
                      ) : hasPainting ? (
                        <Badge label="Submitted" variant="info" />
                      ) : isPresent ? (
                        <Badge label="Not Submitted" variant="warning" />
                      ) : (
                        <Badge label="Not Submitted" variant="gray" />
                      )}
                    </td>

                    {/* Upload Column */}
                    <td className="px-4 py-3">

                      {/* Already has painting */}
                      {hasPainting && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Submitted
                        </span>
                      )}

                      {/* Present, no painting yet */}
                      {!hasPainting && isPresent && (
                        uploadTarget === s.id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={e => setPaintingFile(e.target.files[0])}
                              className="text-xs w-36 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                            />
                            <button
                              disabled={!paintingFile || isUploading}
                              onClick={() => uploadPainting({ studentId: s.id, file: paintingFile })}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-green-700 transition"
                            >
                              {isUploading ? (
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Uploading...
                                </span>
                              ) : 'Upload'}
                            </button>
                            <button
                              onClick={() => { setUploadTarget(null); setPaintingFile(null); }}
                              className="text-xs text-gray-400 hover:text-red-500 transition"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setUploadTarget(s.id); setPaintingFile(null); }}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                          >
                            <Upload size={12} /> Upload Painting
                          </button>
                        )
                      )}

                      {/* Absent, no painting */}
                      {!hasPainting && !isPresent && (
                        <span className="text-xs text-gray-300 italic">
                          Mark present first
                        </span>
                      )}

                    </td>
                  </tr>
                );
              })}

              {students?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Helper note */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          💡 Click <strong>Save Attendance</strong> after marking to persist changes. Upload button appears only for present students.
        </p>

      </main>
    </div>
  );
}