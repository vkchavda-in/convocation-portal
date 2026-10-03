import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Dr. Sharma's visionary leadership transformed our institution into a hub of innovation. His ability to bridge academia and industry is unparalleled.",
      author: "Prof. Rajesh Kumar",
      position: "Dean, Faculty of Engineering",
      rating: 5
    },
    {
      quote: "Under his guidance, we've seen a 300% increase in student entrepreneurship initiatives. He doesn't just talk about change—he makes it happen.",
      author: "Priya Mehta",
      position: "Alumni Entrepreneur, Batch 2022",
      rating: 5
    },
    {
      quote: "A true thought leader who understands the pulse of modern education. His strategic partnerships have opened countless opportunities for our students.",
      author: "Dr. Anita Singh",
      position: "Director, Research & Innovation",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            What People Say
          </h2>
          <p className="text-[var(--midnight-navy)]/70" style={{ fontSize: '1.125rem' }}>
            Perspectives from colleagues, faculty, and students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all relative"
            >
              <div className="absolute -top-4 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f9c53c] to-[var(--royal-blue)] rounded-full flex items-center justify-center shadow-md">
                  <Quote className="text-white" size={20} />
                </div>
              </div>

              <div className="flex mb-4 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-[#f9c53c]" fill="#f9c53c" />
                ))}
              </div>

              <p className="text-[var(--midnight-navy)]/80 mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </p>

              <div className="pt-4 border-t border-[var(--midnight-navy)]/10">
                <div className="text-[var(--midnight-navy)]">
                  {testimonial.author}
                </div>
                <div className="text-[var(--midnight-navy)]/60">
                  {testimonial.position}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
