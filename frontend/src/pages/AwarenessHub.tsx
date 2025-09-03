import React from 'react';

const articles = [
  {
    category: 'Environment',
    title: 'The Impact of Plastic Pollution on Marine Life',
    excerpt: 'Discover the devastating effects of plastic waste on ocean ecosystems and what can be done to combat this growing crisis.',
    imageUrl: 'https://images.unsplash.com/photo-1509358271415-817d12f45136?q=80&w=800'
  },
  {
    category: 'Health',
    title: 'Understanding Mental Health in the Digital Age',
    excerpt: 'An exploration of how social media and constant connectivity are reshaping our mental well-being.',
    imageUrl: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?q=80&w=800'
  },
  {
    category: 'Technology',
    title: 'The Rise of AI: Opportunities and Ethical Dilemmas',
    excerpt: 'Artificial intelligence is transforming industries, but what are the ethical considerations we must address?',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-285f7267a808?q=80&w=800'
  },
];

const AwarenessHub: React.FC = () => {
  return (
    <div className="container mx-auto">
      <div className="text-center p-8">
        <h1 className="text-4xl font-extrabold mb-4 text-primary tracking-tight">Awareness Hub</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Explore articles, infographics, and videos to learn more about various global and social issues.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {articles.map((article, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <img src={`${article.imageUrl}&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=${index}`} alt={article.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <span className="text-sm font-semibold text-primary uppercase">{article.category}</span>
              <h2 className="text-2xl font-bold mt-2 mb-3 text-gray-900 dark:text-white">{article.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{article.excerpt}</p>
              <button 
                onClick={() => alert(`Read more about: ${article.title}`)}
                className="font-semibold text-primary hover:text-primary-focus transition-colors"
              >
                Read More &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AwarenessHub;