import React from 'react';

const Report: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Report submitted! Thank you for your feedback.');
    // Here you would typically handle form submission, e.g., send data to a server
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-primary tracking-tight">Contact Us & Report</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Have an issue to report, a suggestion, or a question? Fill out the form below to get in touch with our team.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" id="name" name="name" required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input type="email" id="email" name="email" required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
            <input type="text" id="subject" name="subject" required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Regarding..." />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
            <textarea id="message" name="message" rows={6} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Your detailed message..."></textarea>
          </div>
          <div className="text-center">
            <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-3 px-12 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;