import React, { useState } from 'react';
import { Mail, Send, Check } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-[#111729] rounded-3xl p-6 sm:p-8 border border-[#DCE2EC] dark:border-[#252D42] shadow-subtle space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF5FF] dark:bg-[#161D31] text-[#4F8FEF] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] dark:text-[#F8FAFC]">Contact PadhaiSpace</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA6BC]">
            Have questions, notes submissions, or feedback? Send us a message.
          </p>
        </div>

        {sent && (
          <div className="p-4 bg-[#36B37E]/10 border border-[#36B37E]/30 text-[#36B37E] text-xs font-semibold rounded-2xl flex items-center">
            <Check className="w-4 h-4 mr-2 text-[#36B37E]" />
            Thank you! Your message has been sent successfully. We will get back to you shortly.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Request for DBMS Unit 4 Notes"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-[#F8FAFC] mb-1">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message or inquiry here..."
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#161D31] text-[#172033] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#9AA6BC] border border-[#DCE2EC] dark:border-[#252D42] rounded-xl focus:outline-none focus:border-[#4F8FEF] font-semibold"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#4F8FEF] hover:bg-[#3b7cdb] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4 mr-2" /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
