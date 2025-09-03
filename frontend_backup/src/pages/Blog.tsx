import React from 'react';

const blogPosts = [
  {
    title: 'Our Mission: A Deep Dive into Creating Awareness',
    author: 'Jane Doe, Founder',
    date: 'October 26, 2025',
    excerpt: 'From our humble beginnings to our vision for the future, discover the core principles that drive our platform and our commitment to making a difference...'
  },
  {
    title: 'Community Spotlight: How One Volunteer is Changing Their Town',
    author: 'John Smith, Community Manager',
    date: 'October 22, 2025',
    excerpt: 'We had the pleasure of sitting down with Sarah Chen, a dedicated volunteer who has been instrumental in organizing local clean-up events. Here is her story...'
  },
  {
    title: '5 Simple Ways You Can Contribute to a Greener Planet Today',
    author: 'Eco Warriors Team',
    date: 'October 18, 2025',
    excerpt: 'Making a positive impact on the environment doesn’t have to be overwhelming. Here are five easy and effective habits you can adopt right now...'
  },
];

const Blog: React.FC = () => {
  const handleReadMore = (e: React.MouseEvent<HTMLAnchorElement>, title: string) => {
    e.preventDefault();
    alert(`Continue reading: ${title}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 text-primary tracking-tight">From the Blog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Read the latest articles, stories, and updates from our team and community contributors.
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-12">
        {blogPosts.map((post, index) => (
          <article key={index} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 hover:text-primary transition-colors">
              <a href="#" onClick={(e) => handleReadMore(e, post.title)}>{post.title}</a>
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>By {post.author}</span> &bull; <span>{post.date}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{post.excerpt}</p>
            <a href="#" onClick={(e) => handleReadMore(e, post.title)} className="font-bold text-primary hover:underline">Continue Reading &rarr;</a>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;