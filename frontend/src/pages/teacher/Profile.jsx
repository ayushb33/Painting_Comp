import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/ui/Loader';
import { Users, ClipboardList, BarChart2, UserCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const TEACHER_LINKS = [
  { to: '/teacher', label: 'Dashboard', icon: BarChart2 },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/attendance', label: 'Attendance & Upload', icon: ClipboardList },
  { to: '/teacher/results', label: 'Results', icon: BarChart2 },
  { to: '/teacher/profile', label: 'Profile', icon: UserCircle },
];

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir',
  'Ladakh','Chandigarh','Puducherry',
];

export default function TeacherProfile() {
  const qc = useQueryClient();
  const { user, setAuth, refreshToken, accessToken } = useAuthStore();
  const [form, setForm] = useState({ contact_number: '', city: '', state: '' });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/teacher/profile').then(r => r.data.data),
  });

  useEffect(() => {
    if (profile) {
      setForm({
        contact_number: profile.contact_number || '',
        city: profile.city || '',
        state: profile.state || '',
      });
    }
  }, [profile]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (d) => api.patch('/teacher/profile', d),
    onSuccess: ({ data }) => {
      toast.success('Profile updated!');
      setAuth({ ...user, profile_completed: data.data.profile_completed }, accessToken, refreshToken);
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <div className="flex"><Sidebar links={TEACHER_LINKS} /><main className="ml-64 flex-1 p-8"><Loader /></main></div>;

  return (
    <div className="flex">
      <Sidebar links={TEACHER_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">School Profile</h1>

        <div className="max-w-2xl space-y-6">
          {/* Status Banner */}
          <div className={`flex items-center gap-3 rounded-xl px-5 py-4 border ${profile?.profile_completed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            {profile?.profile_completed
              ? <CheckCircle size={20} className="text-green-500" />
              : <AlertTriangle size={20} className="text-yellow-500" />}
            <p className={`text-sm font-medium ${profile?.profile_completed ? 'text-green-800' : 'text-yellow-800'}`}>
              {profile?.profile_completed ? 'Profile is complete ✓' : 'Please complete your profile to proceed'}
            </p>
          </div>

          {/* Read-only fields */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 mb-2">School Information</h2>
            {[
              { label: 'School Name', value: profile?.school_name },
              { label: 'Teacher Name', value: profile?.teacher_name },
              { label: 'Email', value: profile?.email },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">{label}</label>
                <p className="text-gray-900 font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Editable fields */}
          <form onSubmit={e => { e.preventDefault(); updateProfile(form); }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 mb-2">Editable Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel" value={form.contact_number}
                onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="e.g. Mumbai"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              >
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="submit" disabled={isPending}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition">
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}