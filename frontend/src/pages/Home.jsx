import { Link } from 'react-router-dom';
import {
  Palette, Leaf, Globe, Flame, Wind, Trash2, TreePine,
  Bird, Home, Award, Trophy, Star, School, Users,
  ChevronRight, ArrowRight, Shield, Phone, Mail, Calendar
} from 'lucide-react';

const TOPICS = [
  { icon: Flame,    label: 'Global Warming',              color: 'bg-orange-50 text-orange-500 border-orange-200' },
  { icon: Wind,     label: 'Renewable Energy',            color: 'bg-sky-50 text-sky-500 border-sky-200' },
  { icon: Trash2,   label: 'Pollution & Waste Management',color: 'bg-stone-50 text-stone-500 border-stone-200' },
  { icon: TreePine, label: 'Tree Plantation',             color: 'bg-green-50 text-green-600 border-green-200' },
  { icon: Bird,     label: 'Wildlife Conservation',       color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { icon: Home,     label: 'Sustainable Living',          color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

const REWARDS = [
  {
    icon: Award,
    title: 'E-Certificates',
    desc: 'Digital participation certificates for every registered student.',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    icon: Star,
    title: 'Merit Certificates',
    desc: 'Merit certificates for top 3 students from each school.',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  {
    icon: Trophy,
    title: 'National Recognition',
    desc: 'Trophies & national-level recognition for competition winners.',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    icon: School,
    title: 'Best School Award',
    desc: 'Special awards for the best-performing schools nationally.',
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
];

const TIMELINE = [
  {
    step: '01',
    icon: School,
    title: 'School Level Round',
    desc: 'Schools conduct competitions internally and select their best entries for submission.',
    date: '1 May 2026 – 28 Feb 2027',
    color: 'bg-orange-500',
    border: 'border-orange-200 bg-orange-50',
  },
  {
    step: '02',
    icon: Users,
    title: 'National Level Round',
    desc: 'Selected winners represent their school at the All India National Level Competition.',
    date: 'April 2027',
    color: 'bg-green-600',
    border: 'border-green-200 bg-green-50',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'Awards Ceremony',
    desc: 'Winners receive trophies, certificates, and national recognition.',
    date: 'April 2027',
    color: 'bg-blue-600',
    border: 'border-blue-200 bg-blue-50',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#fdf8f3' }}>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl shadow">
              <Palette size={18} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-sm leading-tight">National Painting Competition</p>
              <p className="text-xs text-orange-500 leading-tight font-medium">Swadhyay Seva Foundation</p>
            </div>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition shadow-md"
          >
            School Login <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative pt-20 min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a4731 0%, #2d6a4f 40%, #1e3a5f 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f4a261, transparent)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #52b788, transparent)', transform: 'translate(30%, 30%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">

          {/* Left — Text */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-green-400/30"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Leaf size={13} className="text-green-300" />
              <span className="text-green-200">Art for a Greener Planet · 2026–27</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-3 tracking-tight">
              <span className="text-white">National</span>
              <br />
              <span style={{ color: '#f4a261' }}>Painting</span>
              <br />
              <span style={{ color: '#74c69d' }}>Competition</span>
            </h1>

            <p className="text-lg text-green-100 mb-2 font-semibold italic">
              "Express Your Ideas on Nature &amp; Sustainability!"
            </p>

            <p className="text-green-200 leading-relaxed mb-8 max-w-lg">
              Empowering students of Classes 3–5 to creatively express their ideas on
              nature, environmental protection, and sustainable living through vibrant artwork.
            </p>

            {/* Key stats */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { label: 'Classes', value: '3rd – 5th' },
                { label: 'Max per School', value: '200 Students' },
                { label: 'National Event', value: 'April 2027' },
              ].map(({ label, value }) => (
                <div key={label}
                  className="px-5 py-3 rounded-xl border border-white/10 text-center"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-lg font-extrabold text-white">{value}</p>
                  <p className="text-xs text-green-300 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold rounded-xl transition shadow-xl text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #f4a261, #e76f51)' }}>
                <School size={16} /> School Portal Login
              </Link>
              <a href="#about"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition">
                Learn More <ChevronRight size={16} />
              </a>
            </div>
          </div>

          {/* Right — Poster */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow behind poster */}
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30 scale-105"
                style={{ background: 'linear-gradient(135deg, #f4a261, #52b788)' }} />
              <img
                src="/poster.png"
                alt="National Painting Competition Poster"
                className="relative rounded-3xl shadow-2xl max-h-[600px] w-auto object-contain"
                style={{ border: '4px solid rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── About Section ─────────────────────────────────────────────────── */}
      <section id="about" className="py-20" style={{ background: '#fdf8f3' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              About the Competition
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-4 mb-3">
              Inspiring Young Artists Across India
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              The National Painting Competition invites students from Classes 3 to 5 to
              creatively express their ideas on environmental themes — fostering both
              artistic talent and eco-consciousness in young minds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Palette,
                title: 'Creative Expression',
                desc: 'Students bring environmental ideas to life through painting, developing both artistic skills and eco-consciousness.',
                from: '#f4a261', to: '#e76f51',
              },
              {
                icon: Globe,
                title: 'Environmental Awareness',
                desc: 'Themes focus on pressing global issues — inspiring the next generation to think about our planet\'s future.',
                from: '#52b788', to: '#2d6a4f',
              },
              {
                icon: Users,
                title: 'National Platform',
                desc: 'Top performers from school-level rounds compete nationally, gaining recognition and exposure across India.',
                from: '#4895ef', to: '#1e3a5f',
              },
            ].map(({ icon: Icon, title, desc, from, to }) => (
              <div key={title}
                className="rounded-2xl p-7 shadow-sm hover:shadow-md transition border border-white"
                style={{ background: 'white' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics Section ────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#f0f7f4' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              Suggested Topics
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-4 mb-3">
              What Will Students Paint?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose any of the following environmental themes to express creativity
              and environmental awareness through art.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TOPICS.map(({ icon: Icon, label, color }) => (
              <div key={label}
                className={`flex items-center gap-4 p-5 rounded-2xl border ${color} hover:scale-[1.02] transition-transform cursor-default bg-white`}>
                <Icon size={28} className="flex-shrink-0" />
                <span className="font-semibold text-gray-800 text-sm leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline Section ──────────────────────────────────────────────── */}
      <section className="py-20"
        style={{ background: 'linear-gradient(135deg, #1a4731 0%, #2d6a4f 50%, #1e3a5f 100%)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-900/30 border border-amber-600/30 px-3 py-1 rounded-full">
              Competition Structure
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-4 mb-3">How It Works</h2>
            <p className="text-green-300 max-w-xl mx-auto">
              A two-round national competition to discover and celebrate India's
              most talented young environmental artists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIMELINE.map(({ step, icon: Icon, title, desc, date, color, border }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-5`}>
                  <Icon size={28} />
                </div>
                <div className={`border rounded-2xl p-6 w-full ${border}`}>
                  <p className="text-xs font-bold text-gray-400 mb-1">STEP {step}</p>
                  <h3 className="font-extrabold text-gray-900 text-base mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{desc}</p>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 bg-white rounded-lg py-1.5 px-3">
                    <Calendar size={11} /> {date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline dates callout */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 text-center border border-orange-400/30"
              style={{ background: 'rgba(244,162,97,0.12)' }}>
              <p className="text-orange-300 text-xs font-bold uppercase tracking-wider mb-1">Participation Period</p>
              <p className="text-white text-xl font-extrabold">1 May 2026 – 28 Feb 2027</p>
              <p className="text-orange-200 text-xs mt-1">School Level Round</p>
            </div>
            <div className="rounded-2xl p-5 text-center border border-green-400/30"
              style={{ background: 'rgba(82,183,136,0.12)' }}>
              <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-1">National Level Event</p>
              <p className="text-white text-xl font-extrabold">April 2027</p>
              <p className="text-green-200 text-xs mt-1">All India Competition</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rewards Section ───────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#fdf8f3' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Recognition & Rewards
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-4 mb-3">
              Awards & Recognition 🏆
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every participant is recognized for their effort. Outstanding performers
              receive special awards and national recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {REWARDS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={26} className={color} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eligibility ───────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: '#f0f7f4' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-green-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2.5 rounded-xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #52b788, #2d6a4f)' }}>
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Eligibility & Guidelines</h3>
                <p className="text-gray-400 text-sm mt-0.5">Important information for participating schools</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Open to students of Classes 3rd, 4th, and 5th only',
                'Maximum 200 students per school may participate',
                'Schools must conduct internal rounds before submission',
                'Only selected best entries should be submitted online',
                'Painting must relate to an environmental theme',
                'Each student may submit only one painting',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <p className="text-gray-600 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-20 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #f4a261 0%, #e76f51 50%, #c25e3a 100%)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-6xl mb-5">🎨</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to Participate?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Register your school today and give your students a national platform
            to showcase their artistic talent and environmental awareness.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white font-extrabold rounded-2xl hover:bg-orange-50 transition shadow-2xl text-lg"
            style={{ color: '#e76f51' }}>
            <School size={20} /> Login to School Portal
          </Link>
          <p className="text-orange-200 text-sm mt-5">
            Don't have credentials? Contact your competition coordinator.
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#1a4731' }} className="text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #f4a261, #e76f51)' }}>
                  <Palette size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">National Painting Competition</p>
                  <p className="text-xs" style={{ color: '#74c69d' }}>Swadhyay Seva Foundation</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fostering creativity and environmental awareness among young minds across India.
              </p>
            </div>

            {/* Important Dates */}
            <div>
              <p className="text-white font-bold text-sm mb-3">Important Dates</p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={13} style={{ color: '#f4a261' }} />
                  <span>School Round: May 2026 – Feb 2027</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} style={{ color: '#74c69d' }} />
                  <span>National Event: April 2027</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white font-bold text-sm mb-3">Contact Us</p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail size={13} style={{ color: '#f4a261' }} />
                  <span>swadhyaysevafoundation@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} style={{ color: '#f4a261' }} />
                  <span>9599224323 | 9837042298</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={13} style={{ color: '#f4a261' }} />
                  <a href="https://swadhyayseva.org" target="_blank" rel="noreferrer"
                    className="hover:text-orange-400 transition">
                    swadhyayseva.org
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Swadhyay Seva Foundation. All rights reserved.
            </p>
            <Link to="/login" className="text-sm font-medium hover:text-orange-400 transition"
              style={{ color: '#f4a261' }}>
              School Portal Login →
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}