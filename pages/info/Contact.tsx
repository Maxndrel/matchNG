
import React from 'react';

const Contact: React.FC = () => {
  const faqs = [
    { q: 'How does the matching score work?', a: 'We use a weighted average: 50% Skills, 30% Location, and 20% Industry Trends.' },
    { q: 'Is matchNG free for job seekers?', a: 'Yes! Our primary goal is youth empowerment. The platform is free for all registered seekers.' },
    { q: 'How do I post a job as an employer?', a: 'Register as an Employer and navigate to your dashboard to post an opening.' },
    { q: 'Can I use matchNG without internet?', a: 'Yes, dial *347*88# to access our USSD interface for basic phone matching.' }
  ];

  return (
    <div className="fade-in max-w-5xl mx-auto space-y-24 py-12">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black text-gray-900">Get in Touch</h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">Have questions about the algorithm or technical issues? We're here to help.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-2xl font-black mb-8">Send a Message</h3>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will get back to you within 24 hours.'); }}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                <input type="text" required className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none" placeholder="Adewale Musa" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                <input type="email" required className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none" placeholder="wale@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Message</label>
                <textarea rows={4} required className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition">
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-8">
            <h3 className="text-3xl font-black">Frequently Asked Questions</h3>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-2 border-b border-gray-100 pb-6">
                  <h4 className="font-black text-gray-900 text-lg">Q: {faq.q}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-3xl text-white">
            <h4 className="font-black text-xl mb-4">Visit Our Hubs</h4>
            <div className="space-y-4 text-sm text-gray-400">
              <p>📍 <strong>Lagos:</strong> 12 Commercial Ave, Sabo Yaba</p>
              <p>📍 <strong>Abuja:</strong> 4th Floor, Nigerian Tech Park, Central Area</p>
              <p>📞 <strong>Support:</strong> 0800-MATCH-NG</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
