import { Linkedin, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export default function SocialLinks() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h3 className="mb-8 text-[var(--midnight-navy)]" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
              Contact Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="text-[#f9c53c]" size={20} />
                </div>
                <div>
                  <div className="text-[var(--midnight-navy)] mb-1">Email</div>
                  <a href="mailto:office@example.edu" className="text-[var(--royal-blue)] hover:text-[#f9c53c] transition-colors">
                    office@example.edu
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="text-[#f9c53c]" size={20} />
                </div>
                <div>
                  <div className="text-[var(--midnight-navy)] mb-1">Phone</div>
                  <a href="tel:+911234567890" className="text-[var(--royal-blue)] hover:text-[#f9c53c] transition-colors">
                    +91 123 456 7890
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#f9c53c]" size={20} />
                </div>
                <div>
                  <div className="text-[var(--midnight-navy)] mb-1">Office</div>
                  <p className="text-[var(--midnight-navy)]/70">
                    Vice Chancellor's Office<br />
                    Leading University<br />
                    City, State - 123456
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-8 text-[var(--midnight-navy)]" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
              Connect on Social Media
            </h3>
            <p className="text-[var(--midnight-navy)]/70 mb-8 leading-relaxed">
              Follow for updates on educational leadership, thought leadership, and institutional developments.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <a
                href="#"
                className="flex items-center gap-3 bg-[var(--warm-white)] p-4 rounded-xl border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group"
              >
                <Linkedin className="text-[var(--royal-blue)] group-hover:text-[#f9c53c] transition-colors" size={24} />
                <span className="text-[var(--midnight-navy)]">LinkedIn</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 bg-[var(--warm-white)] p-4 rounded-xl border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group"
              >
                <Twitter className="text-[var(--royal-blue)] group-hover:text-[#f9c53c] transition-colors" size={24} />
                <span className="text-[var(--midnight-navy)]">Twitter</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 bg-[var(--warm-white)] p-4 rounded-xl border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group"
              >
                <Youtube className="text-[var(--royal-blue)] group-hover:text-[#f9c53c] transition-colors" size={24} />
                <span className="text-[var(--midnight-navy)]">YouTube</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 bg-[var(--warm-white)] p-4 rounded-xl border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group"
              >
                <Mail className="text-[var(--royal-blue)] group-hover:text-[#f9c53c] transition-colors" size={24} />
                <span className="text-[var(--midnight-navy)]">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
