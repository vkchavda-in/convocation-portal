'use client';

import { useState } from 'react';
import { Send, Mail, MapPin, Phone, User, MessageSquare, Building2, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import FadeIn from '@/components/shared/FadeIn';
import { ContactBlockData } from '@/types/cms';

interface ContactModuleProps {
  id?: string;
  data: ContactBlockData & { mapEmbedUrl?: string };
  settings?: {
    theme?: 'light' | 'dark';
  };
}

type ContactTab = 'address' | 'map';

export default function ContactModule({ id, data, settings }: ContactModuleProps) {
  const { title, subtitle } = data;
  const isDark = settings?.theme === 'dark';

  const [activeTab, setActiveTab] = useState<ContactTab>('address');
  const [form, setForm] = useState({ name: '', email: '', phone: '', enrollmentNo: '', subject: 'degree', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
      setForm({ name: '', email: '', phone: '', enrollmentNo: '', subject: 'degree', message: '' });
    }, 1200);
  };

  const mapUrl = data.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.487853119154!2d72.45904837589886!3d23.550914978806202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c45bb29e00001%3A0xaec12cb401b4467!2sGanpat%20University!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

  return (
    <section
      id={id}
      className={`py-16 md:py-24 relative overflow-hidden transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[#08182f] to-[#040d1a] text-white'
          : 'bg-[#fafbfc] text-[#0B2545]'
      }`}
    >
      <div className="section-container relative z-10">
        
        {/* Content & Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Contact info & Location Cards */}
          <div className="lg:col-span-5 space-y-6">
            <FadeIn variant="left" delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f9c53c]/15 border border-[#e9a800]/30 text-xs font-black uppercase tracking-wider text-[#b37700] dark:text-[#f9c53c] mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Helpdesk & Coordination
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-[#0B2545] dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {title || 'Contact Us'}
              </h2>
              {subtitle ? (
                <p className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                  {subtitle}
                </p>
              ) : (
                <p className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                  Have queries regarding the convocation schedule, seating protocol, robes, or degree dispatch? Reach out to the convocation cell directly.
                </p>
              )}

              {/* Secretariat details card */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #0B2545 0%, #133E68 100%)' }}
                  >
                    <User size={20} className="text-[#f9c53c]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#0B2545] dark:text-white">Convocation Secretariat</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ganpat University Central Office</div>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-[#e9a800]" />
                    <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Ganpat University, Ganpat Vidyanagar, Mehsana-Gandhinagar Highway,<br />
                      PO – 384012, Gujarat, INDIA.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="shrink-0 text-[#e9a800]" />
                    <a href="mailto:convocation@ganpatuniversity.ac.in" className="text-slate-700 dark:text-slate-200 font-semibold hover:text-[#0B2545] dark:hover:text-[#f9c53c] transition-colors">
                      convocation@ganpatuniversity.ac.in
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="shrink-0 text-[#e9a800]" />
                    <a href="tel:+912762226021" className="text-slate-700 dark:text-slate-200 font-semibold hover:text-[#0B2545] dark:hover:text-[#f9c53c] transition-colors">
                      +91 2762 226021
                    </a>
                    <span className="text-slate-400">/</span>
                    <a href="tel:+919265018153" className="text-slate-700 dark:text-slate-200 font-semibold hover:text-[#0B2545] dark:hover:text-[#f9c53c] transition-colors">
                      +91 92650 18153
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="shrink-0 text-[#e9a800]" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Monday – Saturday: 9:00 AM – 4:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Interactive Tabs: Reach Us / Google Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/60">
                <div className="flex bg-slate-50 dark:bg-slate-900 p-1 border-b border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('address')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'address'
                        ? 'bg-white dark:bg-slate-800 text-[#0B2545] dark:text-[#f9c53c] shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Campus Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('map')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'map'
                        ? 'bg-white dark:bg-slate-800 text-[#0B2545] dark:text-[#f9c53c] shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Google Map
                  </button>
                </div>

                <div className="min-h-[220px] bg-white dark:bg-slate-950">
                  {activeTab === 'address' ? (
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Building2 size={18} className="shrink-0 mt-0.5 text-[#0B2545] dark:text-[#f9c53c]" />
                        <div>
                          <div className="text-sm font-bold text-[#0B2545] dark:text-white mb-1">
                            Main Convocation Dome & Helpdesk
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Ganpat University Campus<br />
                            Mehsana-Gozaria Highway, Kherva<br />
                            PO - 384012, Mehsana District, Gujarat, INDIA
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
                        {[
                          'Degree Certificates',
                          'Gold Medalists Seating',
                          'Gown Robe Counter',
                          'Guest Passes'
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-[#0B2545]/5 dark:bg-white/5 text-[#0B2545] dark:text-[#f9c53c] border border-[#0B2545]/10 dark:border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-[220px]">
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ganpat University Map"
                      />
                    </div>
                  )}
                </div>
              </div>

            </FadeIn>
          </div>

          {/* Right Column: Inquiry Form Card */}
          <div className="lg:col-span-7">
            <FadeIn
              variant="right"
              delay={100}
              className="bg-white dark:bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="text-xs font-black tracking-widest uppercase mb-1.5 text-[#b37700] dark:text-[#f9c53c]">
                Quick Query Submission
              </div>
              <h3 className="text-2xl font-black mb-6 text-[#0B2545] dark:text-white font-heading">
                Send a Message to Convocation Helpdesk
              </h3>

              {sent ? (
                <div className="rounded-2xl p-8 flex flex-col items-center text-center bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-lg font-black mb-1.5 text-emerald-900 dark:text-emerald-200">Query Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/80 max-w-sm leading-relaxed">
                    Thank you for reaching out. The convocation coordination team will review your query and reply to your email shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your full name"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0B2545] dark:focus:border-[#f9c53c] focus:ring-1 focus:ring-[#0B2545] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Enrollment No. / ID
                      </label>
                      <div className="relative">
                        <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={form.enrollmentNo}
                          onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })}
                          placeholder="e.g. 21012011001 (Optional)"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0B2545] dark:focus:border-[#f9c53c] focus:ring-1 focus:ring-[#0B2545] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="student@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0B2545] dark:focus:border-[#f9c53c] focus:ring-1 focus:ring-[#0B2545] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0B2545] dark:focus:border-[#f9c53c] focus:ring-1 focus:ring-[#0B2545] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Query Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0B2545] dark:focus:border-[#f9c53c] focus:ring-1 focus:ring-[#0B2545] transition-all"
                    >
                      <option value="degree">Degree Certificate & In Absentia Dispatch</option>
                      <option value="registration">Convocation Registration & Attendance Confirmation</option>
                      <option value="gold_medal">Gold Medalist & PhD Scholar Protocol</option>
                      <option value="robes">Gown / Robe Collection & Caution Deposit</option>
                      <option value="passes">Parent & Guest Passes / Seating Protocol</option>
                      <option value="general">General Helpdesk Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Message / Question <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <textarea
                        required
                        rows={4}
                        placeholder="Please provide complete details regarding your convocation inquiry..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0B2545] dark:focus:border-[#f9c53c] focus:ring-1 focus:ring-[#0B2545] resize-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#060f24] shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #f9c53c 0%, #e9a800 50%, #f59e0b 100%)',
                    }}
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-[#060f24]/30 border-t-[#060f24] animate-spin" />
                        <span>Submitting Query...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} /> <span>Submit Query</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </FadeIn>
          </div>

        </div>

        {/* Quick Contact Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          {[
            { icon: Phone, title: 'Call Convocation Helpline', info: '+91 2762 226021', sub: 'Mon–Sat, 9:00 AM – 4:00 PM', href: 'tel:+912762226021' },
            { icon: Mail, title: 'Email Convocation Cell', info: 'convocation@ganpatuniversity.ac.in', sub: 'Official Email Channel', href: 'mailto:convocation@ganpatuniversity.ac.in' },
            { icon: MapPin, title: 'Campus Location', info: 'Ganpat Vidyanagar, Gujarat', sub: 'View on Google Maps', href: 'https://maps.google.com/?q=Ganpat+University' },
          ].map((item, idx) => (
            <FadeIn
              key={item.title}
              variant="up"
              delay={idx * 80}
              className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-[#e9a800]/50 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-[#0B2545]/5 dark:bg-white/5 border border-[#0B2545]/10 dark:border-white/10"
              >
                <item.icon size={22} className="text-[#0B2545] dark:text-[#f9c53c]" />
              </div>
              <h4 className="text-sm font-bold mb-1 text-[#0B2545] dark:text-white">{item.title}</h4>
              <a href={item.href} className="text-xs font-black text-[#e9a800] hover:underline block mb-1">
                {item.info}
              </a>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{item.sub}</p>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
