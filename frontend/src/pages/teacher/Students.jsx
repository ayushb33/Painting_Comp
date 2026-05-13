import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import CSVUpload from '../../components/CSVUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Users, ClipboardList, BarChart2, UserCircle, Plus, Trash2 } from 'lucide-react';

const TEACHER_LINKS = [
  { to: '/teacher', label: 'Dashboard', icon: BarChart2 },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/attendance', label: 'Attendance & Upload', icon: ClipboardList },
  { to: '/teacher/results', label: 'Results', icon: BarChart2 },
  { to: '/teacher/profile', label: 'Profile', icon: UserCircle },
];

const EMPTY_FORM = {
  full_name: '', class: '', section: '', father_name: '', admission_number: ''
};

export default function TeacherStudents() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [csvResult, setCSVResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  const { data, isLoading } = useQuery({
    queryKey: ['my-students', search],
    queryFn: () =>
      api.get('/teacher/students', { params: { search, limit: 100 } })
        .then(r => r.data.data),
  });

  const { mutate: addStudent, isPending: addPending } = useMutation({
    mutationFn: (d) => api.post('/teacher/students', d),
    onSuccess: () => {
      toast.success('Student added!');
      qc.invalidateQueries({ queryKey: ['my-students'] });
      setShowAdd(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add student'),
  });

  const { mutate: deleteStudent, isPending: deletePending } = useMutation({
    mutationFn: (studentId) => api.delete(`/teacher/students/${studentId}`),
    onSuccess: () => {
      toast.success('Student removed successfully');
      qc.invalidateQueries({ queryKey: ['my-students'] });
      qc.invalidateQueries({ queryKey: ['my-students-attendance'] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove student'),
  });

  const { mutate: uploadCSV, isPending: csvPending } = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.post('/teacher/students/bulk-upload', fd);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      setCSVResult(data.data);
      qc.invalidateQueries({ queryKey: ['my-students'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  return (
    <div className="flex">
      <Sidebar links={TEACHER_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-500 text-sm mt-1">
              {data?.pagination?.total ?? data?.students?.length ?? 0} students registered
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCSV(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Bulk CSV Upload
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Plus size={14} /> Add Student
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            placeholder="Search by name, student ID or admission number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-96 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {isLoading ? <Loader /> : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    'Student ID', 'Name', 'Class',
                    "Father's Name", 'Adm. No.',
                    'Attendance', 'Painting', 'Action'
                  ].map(h => (
                    <th key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.students?.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {s.unique_student_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {s.full_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.class}-{s.section}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.father_name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.admission_number}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={s.attendance?.is_present ? 'Present' : 'Absent'}
                        variant={s.attendance?.is_present ? 'success' : 'danger'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={
                          s.painting?.is_approved ? 'Approved'
                          : s.painting ? 'Submitted'
                          : 'Not Submitted'
                        }
                        variant={
                          s.painting?.is_approved ? 'success'
                          : s.painting ? 'info'
                          : 'gray'
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      {/* Block delete if painting is approved */}
                      {s.painting?.is_approved ? (
                        <span className="text-xs text-gray-300 italic">Locked</span>
                      ) : (
                        <button
                          onClick={() => setDeleteTarget({ id: s.id, name: s.full_name })}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium transition"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {data?.students?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No students found. Add students manually or via CSV.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Student Modal */}
        <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); }} title="Add New Student">
          <form onSubmit={e => { e.preventDefault(); addStudent(form); }} className="space-y-4">
            {[
              { label: 'Full Name', key: 'full_name', placeholder: 'e.g. Ravi Kumar' },
              { label: 'Class', key: 'class', placeholder: 'e.g. 10' },
              { label: 'Section', key: 'section', placeholder: 'e.g. A' },
              { label: "Father's Name", key: 'father_name', placeholder: 'e.g. Suresh Kumar' },
              { label: 'Admission Number', key: 'admission_number', placeholder: 'e.g. ADM001' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={addPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-blue-700 transition">
                {addPending ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </form>
        </Modal>

        {/* CSV Upload Modal */}
        <Modal
          isOpen={showCSV}
          onClose={() => { setShowCSV(false); setCSVResult(null); }}
          title="Bulk Upload Students"
          size="md"
        >
          <CSVUpload
            onUpload={uploadCSV}
            isUploading={csvPending}
            result={csvResult}
          />
        </Modal>

        {/* Delete Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteStudent(deleteTarget.id)}
          title="Remove Student"
          message={`Are you sure you want to remove "${deleteTarget?.name}"? This will also delete their attendance and painting record permanently.`}
          confirmLabel={deletePending ? 'Removing...' : 'Yes, Remove'}
          danger
        />

      </main>
    </div>
  );
}