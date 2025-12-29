import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const initialMessage: ChatMessage = {
  role: 'model',
  text: "Hello! I'm the AI assistant for Awareness.io. Ask me about AI awareness, digital safety, online privacy, or responsible technology use. How can I help you today?"
};

// Markdown component styling
const MarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc list-inside ml-2 mb-2 space-y-1" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside ml-2 mb-2 space-y-1" {...props} />,
  li: ({ node, ...props }: any) => <li className="text-sm" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-2" {...props} />,
  code: ({ node, inline, ...props }: any) =>
    inline ?
      <code className="bg-gray-300 dark:bg-gray-600 px-1 rounded text-xs font-mono" {...props} /> :
      <code className="bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded block font-mono text-xs overflow-x-auto" {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-primary pl-2 italic mb-2" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-bold" {...props} />,
};

const AskAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Reset chat to its initial state when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setHistory([initialMessage]);
      setPrompt('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: prompt };
    setHistory(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

      const response = await fetch('http://localhost:8000/api/ask-ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.reply || 'Failed to get response from AI');
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        role: 'model',
        text: data.reply || 'Sorry, I could not process your message.'
      };
      setHistory(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      let errorText = 'Sorry, I encountered an error. ';

      if (error.name === 'AbortError') {
        errorText += 'The request timed out. LM Studio may be busy. Please try again.';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorText += 'Cannot connect to the backend server at http://localhost:8000. Make sure Django is running.';
      } else {
        errorText += error.message || 'Please try again or check if the backend is running.';
      }

      const errorMessage: ChatMessage = {
        role: 'model',
        text: errorText
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-110 duration-300 z-50"
        aria-label="Ask AI"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-primary">Ask AI</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" aria-label="Close chat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
              {history.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs md:max-w-md p-4 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                    {msg.role === 'user' ? (
                      <p>{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about global issues..."
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !prompt.trim()}
                  className="bg-primary text-white p-2.5 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-primary-focus transition-colors"
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                  </svg>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AskAI;