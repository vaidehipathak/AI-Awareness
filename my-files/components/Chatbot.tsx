import React, { useEffect, useRef, useState } from 'react';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

const BACKEND_URL = 'http://localhost:5000';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hi! Ask me something or teach me in the admin panel.' }
  ]);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });
      const data = await res.json();
      const reply = data?.reply || 'Sorry, something went wrong.';
      setMessages(prev => [...prev, { role: 'bot', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Unable to reach the assistant. Is the backend running?' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-primary text-white w-14 h-14 shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
          aria-label="Open Chatbot"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-primary text-white">
            <span className="font-semibold">Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-white"
              aria-label="Close"
            >✕</button>
          </div>
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span
                  className={
                    'inline-block px-3 py-2 rounded-lg max-w-[80%] ' +
                    (m.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100')
                  }
                >
                  {m.content}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isSending}
              className="px-4 py-2 rounded-md bg-primary text-white disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;


