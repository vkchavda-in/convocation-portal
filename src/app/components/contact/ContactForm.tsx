import { Send } from 'lucide-react';

export default function ContactForm() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)'
            }}>
              Send a Message
            </h2>
            <p className="text-[var(--midnight-navy)]/70" style={{ fontSize: '1.125rem' }}>
              Fill out the form below and we'll get back to you within 48 hours
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[var(--midnight-navy)] mb-2 font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-[var(--warm-white)] border border-[var(--midnight-navy)]/10 rounded-xl focus:outline-none focus:border-[#f9c53c] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--midnight-navy)] mb-2 font-medium">Email Address *</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-[var(--warm-white)] border border-[var(--midnight-navy)]/10 rounded-xl focus:outline-none focus:border-[#f9c53c] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--midnight-navy)] mb-2 font-medium">Organization</label>
              <input
                type="text"
                placeholder="Company or institution name"
                className="w-full px-4 py-3 bg-[var(--warm-white)] border border-[var(--midnight-navy)]/10 rounded-xl focus:outline-none focus:border-[#f9c53c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[var(--midnight-navy)] mb-2 font-medium">Inquiry Type *</label>
              <select className="w-full px-4 py-3 bg-[var(--warm-white)] border border-[var(--midnight-navy)]/10 rounded-xl focus:outline-none focus:border-[#f9c53c] transition-colors" required>
                <option value="">Select an option</option>
                <option value="speaking">Speaking Engagement</option>
                <option value="partnership">Academic Partnership</option>
                <option value="media">Media Inquiry</option>
                <option value="collaboration">Research Collaboration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--midnight-navy)] mb-2 font-medium">Message *</label>
              <textarea
                rows={6}
                placeholder="Tell us about your inquiry..."
                className="w-full px-4 py-3 bg-[var(--warm-white)] border border-[var(--midnight-navy)]/10 rounded-xl focus:outline-none focus:border-[#f9c53c] transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Send Message</span>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
