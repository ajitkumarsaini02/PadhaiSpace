import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="text-slate-500 text-xs">Last updated: September 2026</p>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">1. Information We Collect</h3>
        <p>
          We collect account information provided during registration such as name, email address, college, branch, and semester to personalize your study experience and save resource bookmarks.
        </p>

        <h3 className="font-bold text-slate-900 text-base">2. Use of Information</h3>
        <p>
          Your information is strictly used to maintain your account session, provide access to semester resources, and improve platform performance. We do not sell or trade your data to third parties.
        </p>

        <h3 className="font-bold text-slate-900 text-base">3. Security</h3>
        <p>
          We implement Industry-standard security practices, including password hashing with bcrypt and JSON Web Tokens (JWT) for secure authentication.
        </p>
      </div>
    </div>
  );
}
