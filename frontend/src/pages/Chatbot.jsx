import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, HeartPulse, ShieldAlert, Zap, Loader } from 'lucide-react';
import './Chatbot.css';

const MOCK_MESSAGES = [
  { id: 1, text: "Hello! I'm your CardioCare AI Assistant. I can help interpret your assessment results, explain cardiovascular symptoms, or suggest lifestyle changes. How can I assist you today?", sender: 'bot', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
];

const PREDEFINED_QUESTIONS = [
  "What does my Cardiac Recovery Latency mean?",
  "How can I lower my cholesterol?",
  "Explain my risk score of 88%.",
  "Is a resting heart rate of 72 normal?"
];

// Simple bot brain
const botLogic = (input) => {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('latency') || lowerInput.includes('crl')) {
    return "Cardiac Recovery Latency (CRL) measures how quickly your heart rate returns to normal after exertion. A drop of less than 12 BPM within the first minute can indicate higher risk for cardiovascular issues. Monitoring this helps us detect unseen strain.";
  }
  if (lowerInput.includes('cholesterol')) {
    return "To lower cholesterol, focus on reducing saturated fats and eliminating trans fats. Eat more foods rich in omega-3 fatty acids (like salmon and walnuts) and increase soluble fiber (like oatmeal and beans). Would you like to add this to your Lifestyle Plan?";
  }
  if (lowerInput.includes('score')) {
    return "Your risk score of 88% means you are currently in optimal condition based on our Random Forest model analysis of your 14 key metrics. However, continuing to track your CRL and maintaining your exercise routine is highly recommended.";
  }
  if (lowerInput.includes('rate') || lowerInput.includes('72')) {
    return "A resting heart rate of 72 BPM is generally considered normal for adults (the typical range is 60-100 BPM). However, well-trained athletes might have a resting heart rate closer to 40 BPM.";
  }
  return "I'm currently a demonstration model. In the full version, I will connect to advanced medical LLMs to provide comprehensive insights based on your personal health metrics and our extensive Kaggle training dataset.";
};

const Chatbot = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate thinking and typing response
    setTimeout(() => {
      const responseText = botLogic(text);
      const newBotMsg = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-page">
      <div className="container chatbot-container">
        
        <div className="chat-layout">
          {/* Sidebar / Context */}
          <div className="chat-sidebar card">
            <div className="sidebar-header">
              <HeartPulse className="text-primary" size={24} />
              <h3 className="m-0 text-lg">AI Assistant</h3>
            </div>
            
            <p className="text-sm text-muted mb-6">
              Powered by advanced clinical data to help you understand your heart health metrics.
            </p>

            <div className="context-cards">
              <div className="context-card bg-primary-light text-primary">
                <Zap size={18} />
                <div>
                  <h5 className="font-semibold m-0 text-sm">Instant Answers</h5>
                  <p className="text-xs m-0 mt-1 opacity-80">Get clarity on your prediction results</p>
                </div>
              </div>
              
              <div className="context-card" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--secondary)' }}>
                <ShieldAlert size={18} />
                <div>
                  <h5 className="font-semibold m-0 text-sm">Actionable Plans</h5>
                  <p className="text-xs m-0 mt-1 opacity-80">Discuss lifestyle improvements</p>
                </div>
              </div>
            </div>

            <div className="suggested-topics mt-auto">
              <h4 className="text-xs font-semibold uppercase text-muted mb-3 tracking-wide">Suggested Topics</h4>
              <div className="flex flex-col gap-2">
                {PREDEFINED_QUESTIONS.map((question, idx) => (
                  <button 
                    key={idx}
                    className="topic-btn"
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="chat-window card p-0">
            <div className="chat-header">
              <div className="flex items-center gap-3">
                <div className="bot-avatar primary">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-base font-semibold">CardioCare AI</h3>
                  <span className="text-xs text-success flex items-center gap-1">
                    <span className="status-dot"></span> Online
                  </span>
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}>
                  {msg.sender === 'bot' && (
                    <div className="message-avatar bot-avatar">
                      <Bot size={16} />
                    </div>
                  )}
                  
                  <div className="message-content">
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  
                  {msg.sender === 'user' && (
                    <div className="message-avatar user-avatar">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="message-wrapper message-bot">
                  <div className="message-avatar bot-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble typing-bubble">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSubmit} className="chat-form">
                <textarea
                  className="chat-input"
                  placeholder="Ask about your heart health..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows="1"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary send-btn"
                  disabled={!inputValue.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-xs text-muted">AI responses are for informational purposes only. Consult your doctor for medical decisions.</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Chatbot;
