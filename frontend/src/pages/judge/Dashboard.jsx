import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import { Lock, CheckCircle, ChevronRight, LayoutDashboard, ZoomIn, X } from 'lucide-react';

const JUDGE_LINKS = [
  { to: '/judge', label: 'Judge Dashboard', icon: LayoutDashboard },
];

const SCORE_GUIDE = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const CRITERIA = [
  { key: 'relevance_score',    label: 'Relevance',    weight: '30%', color: 'text-blue-600' },
  { key: 'creativity_score',   label: 'Creativity',   weight: '25%', color: 'text-purple-600' },
  { key: 'technique_score',    label: 'Technique',    weight: '25%', color: 'text-green-600' },
  { key: 'presentation_score', label: 'Presentation', weight: '20%', color: 'text-orange-600' },
];

const DEFAULT_SCORES = {
  relevance_score: 3,
  creativity_score: 3,
  technique_score: 3,
  presentation_score: 3,
};

function ScoreSlider({ label, weight, color, value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-semibold ${color}`}>
          {label}{' '}
          <span className="text-gray-400 font-normal text-xs">({weight})</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{SCORE_GUIDE[value] || '—'}</span>
          <span className={`text-lg font-bold ${color}`}>{value}</span>
        </div>
      </div>
      <input
        type="range"
        min="1" max="5" step="1"
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-blue-600 disabled:opacity-40 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-300">
        <span>1 Poor</span>
        <span>3 Average</span>
        <span>5 Excellent</span>
      </div>
    </div>
  );
}

function calculatePreview(scores) {
  const { relevance_score: r, creativity_score: c, technique_score: t, presentation_score: p } = scores;
  if (!r || !c || !t || !p) return null;
  return ((r / 5) * 30 + (c / 5) * 25 + (t / 5) * 25 + (p / 5) * 20).toFixed(1);
}

export default function JudgeDashboard() {
  const qc = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [activePainting, setActivePainting] = useState(null);
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // ── Fetch Schools ────────────────────────────────────────────────────────────
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['judge-schools'],
    queryFn: () => api.get('/judge/schools').then(r => r.data.data),
  });

  // ── Fetch Paintings for Selected School ──────────────────────────────────────
  const { data: paintingsData, isLoading: paintingsLoading } = useQuery({
    queryKey: ['judge-paintings', selectedSchool],
    queryFn: () =>
      api.get(`/judge/schools/${selectedSchool}/paintings`, { params: { limit: 100 } })
        .then(r => r.data.data),
    enabled: !!selectedSchool,
  });

  // ── Submit Score ─────────────────────────────────────────────────────────────
  const { mutate: submitScore, isPending: submitting } = useMutation({
    mutationFn: (data) => api.post('/judge/scores', data),
    onSuccess: () => {
      toast.success('Score submitted successfully!');
      setActivePainting(null);
      setScores(DEFAULT_SCORES);
      qc.invalidateQueries({ queryKey: ['judge-paintings', selectedSchool] });
      qc.invalidateQueries({ queryKey: ['judge-schools'] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Failed to submit score'),
  });

  const preview = calculatePreview(scores);

  const handleOpenScoring = (painting) => {
    setScores(DEFAULT_SCORES);
    setActivePainting(painting);
  };

  const handleCloseScoring = () => {
    setActivePainting(null);
    setScores(DEFAULT_SCORES);
  };

  return (
    <div className="flex">
      <Sidebar links={JUDGE_LINKS} />

      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Judge Portal</h1>
        <p className="text-gray-500 text-sm mb-6">
          Complete scoring for one school fully before moving to the next. Once you submit the score, you cannot change it again.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Schools List ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Schools</h2>
            {schoolsLoading ? (
              <Loader text="Loading schools..." />
            ) : schools?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No approved paintings available yet.
              </p>
            ) : (
              <div className="space-y-2">
                {schools?.map((school, idx) => (
                  <button
                    key={school.school_id}
                    disabled={!school.unlocked}
                    onClick={() => setSelectedSchool(school.school_id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition
                      ${selectedSchool === school.school_id
                        ? 'border-blue-500 bg-blue-50'
                        : school.unlocked
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {school.school_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{school.state || '—'}</p>
                      </div>
                      {school.is_complete ? (
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      ) : school.unlocked ? (
                        <ChevronRight size={16} className="text-gray-400" />
                      ) : (
                        <Lock size={14} className="text-gray-300" />
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${school.total_paintings > 0
                              ? (school.scored_by_me / school.total_paintings) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {school.scored_by_me}/{school.total_paintings} scored
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Paintings Grid ───────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {selectedSchool ? (
              paintingsLoading ? (
                <Loader />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-800">
                      Paintings
                    </h2>
                    <span className="text-sm text-gray-400">
                      {paintingsData?.pagination?.total ?? 0} total
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {paintingsData?.paintings?.map(p => (
                      <div
                        key={p.id}
                        className={`rounded-xl overflow-hidden border shadow-sm transition
                          ${p.scores?.length
                            ? 'opacity-75 cursor-default'
                            : 'hover:shadow-md hover:border-blue-300 cursor-pointer'
                          }`}
                      >
                        {/* Painting thumbnail */}
                        <div
                          className="relative"
                          onClick={() => !p.scores?.length && handleOpenScoring(p)}
                        >
                          <img
                            src={p.image_url}
                            alt="Painting"
                            className="w-full h-36 object-cover"
                          />
                          {p.scores?.length > 0 ? (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <div className="bg-white rounded-full px-3 py-1 text-xs font-bold text-green-600 shadow">
                                ✓ {p.scores[0].total_score.toFixed(1)}/100
                              </div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
                              <div className="opacity-0 hover:opacity-100 transition bg-white/90 rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow">
                                Click to Score
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-2 text-center">
                          {p.scores?.length ? (
                            <Badge label="Scored" variant="success" />
                          ) : (
                            <Badge label="Pending Score" variant="warning" />
                          )}
                        </div>
                      </div>
                    ))}

                    {paintingsData?.paintings?.length === 0 && (
                      <div className="col-span-3 text-center py-16 text-gray-400">
                        No approved paintings found for this school.
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-sm">← Select a school to start judging</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Scoring Modal ─────────────────────────────────────────────────── */}
        <Modal
          isOpen={!!activePainting}
          onClose={handleCloseScoring}
          title="Score This Painting"
          size="lg"
        >
          {activePainting && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left — Painting Image */}
              <div>
                <div className="relative group">
                  <img
                    src={activePainting.image_url}
                    alt="Painting"
                    className="w-full rounded-xl shadow-md cursor-zoom-in"
                    onClick={() => setFullscreenImage(activePainting.image_url)}
                  />
                  {/* Hover overlay */}
                  <div
                    onClick={() => setFullscreenImage(activePainting.image_url)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/25 rounded-xl transition-all duration-200 flex items-center justify-center cursor-zoom-in"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 shadow-lg">
                      <ZoomIn size={13} /> View Full Size
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 italic">
                  Identity hidden for fair judging &bull; Click image to enlarge
                </p>
              </div>

              {/* Right — Scoring Form */}
              <div className="space-y-5">

                {/* Scoring guide */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                  <p className="font-semibold mb-1.5">Scoring Guide:</p>
                  {Object.entries(SCORE_GUIDE).map(([k, v]) => (
                    <p key={k}>
                      <span className="font-bold">{k}</span> = {v}
                    </p>
                  ))}
                </div>

                {/* Sliders */}
                {CRITERIA.map(c => (
                  <ScoreSlider
                    key={c.key}
                    label={c.label}
                    weight={c.weight}
                    color={c.color}
                    value={scores[c.key]}
                    onChange={val => setScores(s => ({ ...s, [c.key]: val }))}
                    disabled={submitting}
                  />
                ))}

                {/* Live score preview */}
                {preview && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-center text-white">
                    <p className="text-xs opacity-80 mb-1">Calculated Final Score</p>
                    <p className="text-4xl font-bold">
                      {preview}
                      <span className="text-lg opacity-70">/100</span>
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={() => submitScore({ painting_id: activePainting.id, ...scores })}
                  disabled={submitting}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-60 transition"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Score'
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Fullscreen Image Lightbox ─────────────────────────────────────────── */}
        {fullscreenImage && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            {/* Blurred backdrop */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${fullscreenImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(24px) brightness(0.35) saturate(1.4)',
                transform: 'scale(1.1)',
              }}
            />

            {/* Dark tint layer on top of blur */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Close button */}
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-5 right-5 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition z-10 backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            {/* Hint */}
            <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-wide z-10">
              Click anywhere outside to close
            </p>

            {/* Focused image — sharp, glowing, centered */}
            <img
              src={fullscreenImage}
              alt="Painting Full View"
              className="relative z-10 max-w-full max-h-[90vh] rounded-2xl object-contain"
              style={{
                boxShadow: '0 0 80px 10px rgba(255,255,255,0.15), 0 25px 60px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

      </main>
    </div>
  );
}