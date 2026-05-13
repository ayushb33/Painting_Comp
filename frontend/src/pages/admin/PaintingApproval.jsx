import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { LayoutDashboard, School, Image, CheckSquare, Trophy, CheckCircle, XCircle, Eye } from 'lucide-react';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/schools', label: 'Schools', icon: School },
  { to: '/admin/paintings', label: 'Painting Approval', icon: Image },
  { to: '/admin/verification', label: 'Verification', icon: CheckSquare },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
];

function PaintingCard({ painting, onApprove, onUndo }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="relative">
        <img
          src={painting.image_url}
          alt="Painting"
          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
          onClick={() => setPreviewOpen(true)}
        />
        <div className="absolute top-2 right-2">
          <Badge
            label={painting.is_approved ? 'Approved' : 'Pending'}
            variant={painting.is_approved ? 'success' : 'warning'}
          />
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900 text-sm">{painting.student.full_name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Class {painting.student.class}-{painting.student.section} &bull; {painting.student.unique_student_id}
        </p>
        <div className="flex gap-2 mt-3">
          {!painting.is_approved ? (
            <button onClick={() => onApprove(painting.id)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition">
              <CheckCircle size={12} /> Approve
            </button>
          ) : (
            <button onClick={() => onUndo(painting.id)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition">
              <XCircle size={12} /> Undo
            </button>
          )}
          <button onClick={() => setPreviewOpen(true)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition">
            <Eye size={12} />
          </button>
        </div>
      </div>

      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Painting Preview" size="lg">
        <img src={painting.image_url} alt="Painting Full" className="w-full rounded-lg" />
        <p className="text-center text-sm text-gray-500 mt-3">{painting.student.full_name}</p>
      </Modal>
    </div>
  );
}

export default function PaintingApproval() {
  const qc = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-list'],
    queryFn: () => api.get('/admin/schools').then(r => r.data.data.schools),
  });

  const { data: paintingsData, isLoading: paintingsLoading } = useQuery({
    queryKey: ['paintings', selectedSchool],
    queryFn: () => api.get(`/admin/paintings/school/${selectedSchool}`).then(r => r.data.data),
    enabled: !!selectedSchool,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['paintings', selectedSchool] });

  const { mutate: approve } = useMutation({
    mutationFn: (id) => api.patch(`/admin/paintings/${id}/approve`),
    onSuccess: () => { toast.success('Painting approved'); invalidate(); },
    onError: () => toast.error('Failed to approve'),
  });

  const { mutate: undo } = useMutation({
    mutationFn: (id) => api.patch(`/admin/paintings/${id}/undo-approve`),
    onSuccess: () => { toast.success('Approval revoked'); invalidate(); },
    onError: () => toast.error('Failed'),
  });

  const { mutate: bulkApprove, isPending: bulkPending } = useMutation({
    mutationFn: () => api.patch(`/admin/paintings/school/${selectedSchool}/bulk-approve`),
    onSuccess: ({ data }) => { toast.success(data.message); invalidate(); },
    onError: () => toast.error('Bulk approve failed'),
  });

  return (
    <div className="flex">
      <Sidebar links={ADMIN_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Painting Approval</h1>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select School</label>
          {schoolsLoading ? (
            <p className="text-sm text-gray-400">Loading schools...</p>
          ) : (
            <select
              value={selectedSchool || ''}
              onChange={e => setSelectedSchool(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a school --</option>
              {schools?.map(s => (
                <option key={s.id} value={s.id}>{s.school_name} ({s._count?.students} students)</option>
              ))}
            </select>
          )}
        </div>

        {selectedSchool && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {paintingsData?.pagination?.total || 0} paintings found
              </p>
              <button
                onClick={() => setBulkConfirm(true)}
                disabled={bulkPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition"
              >
                {bulkPending ? 'Approving...' : 'Approve All'}
              </button>
            </div>

            {paintingsLoading ? <Loader /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paintingsData?.paintings?.map(p => (
                  <PaintingCard key={p.id} painting={p} onApprove={approve} onUndo={undo} />
                ))}
                {paintingsData?.paintings?.length === 0 && (
                  <div className="col-span-full text-center py-16 text-gray-400">
                    No paintings uploaded for this school yet.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedSchool && (
          <div className="text-center py-20 text-gray-400">
            <Image size={48} className="mx-auto mb-3 opacity-40" />
            <p>Select a school to view paintings</p>
          </div>
        )}

        <ConfirmDialog
          isOpen={bulkConfirm}
          onClose={() => setBulkConfirm(false)}
          onConfirm={bulkApprove}
          title="Bulk Approve Paintings"
          message="Are you sure you want to approve ALL pending paintings for this school? This action sends them to judges."
          confirmLabel="Approve All"
        />
      </main>
    </div>
  );
}