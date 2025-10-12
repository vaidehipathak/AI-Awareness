import React, { useState, useRef, useEffect } from 'react';

<<<<<<< HEAD
=======
// Enhanced markdown to HTML converter with better spacing
const markdownToHtml = (text: string): string => {
  if (!text) return '';
  
  // First, handle bold and italic formatting
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
  
  // Split into lines and process
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let lastWasEmpty = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle empty lines - only add one break for consecutive empty lines
    if (line === '') {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (!lastWasEmpty) {
        processedLines.push('<br>');
        lastWasEmpty = true;
      }
      continue;
    }
    
    lastWasEmpty = false;
    
    // Handle bullet points
    if (line.startsWith('* ') && !line.startsWith('**')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('');
};

>>>>>>> d53c058a (chatbot-commit)
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const initialMessage: ChatMessage = {
  role: 'model',
<<<<<<< HEAD
  text: "Hello! I'm the AI assistant for Awareness.io. Our custom-trained AI is being integrated. Soon, I'll be able to answer your questions about global issues. Thanks for your patience!"
=======
  text: "Hello! Welcome to the AI Awareness Platform! 👋\n\nI'm here to help you with **any questions** about AI, technology, digital safety, or just have a friendly chat. Whether you're curious about how AI works, worried about job security, or want to learn about staying safe online - I'm here to help!\n\nWhat would you like to know?"
>>>>>>> d53c058a (chatbot-commit)
};

const AskAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
=======
  const [loadingMessage, setLoadingMessage] = useState('');
>>>>>>> d53c058a (chatbot-commit)

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
<<<<<<< HEAD

    // Simulate AI response for UI demonstration purposes
    setTimeout(() => {
      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: 'Thank you for your message! Our AI is currently being upgraded with a custom-trained model and will be back online soon.' 
      };
      setHistory(prev => [...prev, modelMessage]);
      setIsLoading(false);
    }, 1500);
=======
    setLoadingMessage('Getting fast response...');

    try {
      // Simple approach: Just use LM Studio (your existing setup)
      setLoadingMessage('Getting response...');
      
      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'You are a helpful AI assistant for the "AI Awareness Platform" - a friendly guide who can answer both general questions and provide specialized knowledge about AI awareness, digital safety, and responsible technology use. You are knowledgeable, approachable, and always prioritize user safety and education. Your capabilities include: GENERAL CONVERSATION: You can answer everyday questions, provide general information, have friendly conversations, and help with common queries about technology, AI, jobs, privacy, and digital life. You can discuss topics like "Will AI take my job?", "How does AI work?", "What is machine learning?", "How to stay safe online?", etc. SPECIALIZED EXPERTISE: You have deep knowledge about the AI Awareness Platform content including: - Awareness Hub: AI basics, privacy & PII protection, AI threats, digital self-defense, and interactive scenarios - Quiz: Core AI concepts, responsible use, privacy, safety with explanations - Blog: Platform updates, community stories, practical guidance - Games: Educational AI games for experiential learning - Report/Feedback: User feedback and support RESPONSE GUIDELINES: 1. Be friendly, helpful, and conversational. Use a warm, approachable tone. 2. For general questions: Provide clear, accurate answers with practical examples. 3. For AI/digital safety questions: Draw from your specialized knowledge and suggest relevant platform sections. 4. Always promote responsible AI use, privacy protection, and digital safety. 5. When appropriate, gently guide users to explore the platform\'s learning resources. 6. Keep responses concise but comprehensive (2-4 paragraphs max). 7. Use markdown formatting for better readability (bold, italics, bullet points). LIMITATIONS: You cannot provide coding assistance, technical implementation help, or perform complex tasks. You cannot help with illegal activities, hacking, or bypassing security measures. You will politely decline such requests and suggest appropriate alternatives. Remember: You\'re here to educate, inform, and help users navigate the digital world safely while being a friendly conversational partner.'
            },
            ...history.filter(msg => msg.role !== 'model').map(msg => ({ role: msg.role, content: msg.text })),
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500, // Balanced: not too short, not too long
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: aiResponse
      };
      setHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorMessage: ChatMessage = { 
        role: 'model', 
        text: `Sorry, I encountered an error: ${error.message}. Please check if LM Studio is running on port 1234.`
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
>>>>>>> d53c058a (chatbot-commit)
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-110 duration-300 z-50"
        aria-label="Ask AI"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<<<<<<< HEAD
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
=======
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
>>>>>>> d53c058a (chatbot-commit)
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
                  <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
<<<<<<< HEAD
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
=======
                    <div 
                      className="text-sm ai-chat-content" 
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }}
                    />
>>>>>>> d53c058a (chatbot-commit)
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
<<<<<<< HEAD
=======
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">{loadingMessage}</span>
>>>>>>> d53c058a (chatbot-commit)
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
<<<<<<< HEAD
                  placeholder="Ask about global issues..."
=======
                  placeholder="Ask me anything about AI, technology, or digital safety..."
>>>>>>> d53c058a (chatbot-commit)
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
                    <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"/>
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