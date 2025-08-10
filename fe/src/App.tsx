import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Trash2 } from 'lucide-react';
import { sendChatMessage, sendChatMessageStream } from './graphql/client';
import MarkdownRenderer from './components/MarkdownRenderer';
import './App.css';

// 消息类型定义
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// 消息气泡组件
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const time = message.timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`message-container ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
        {/* 头像 */}
        <div className={`message-avatar ${isUser ? 'user' : 'assistant'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* 消息气泡 */}
        <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
          {isUser ? (
            <p className="message-text">{message.content}</p>
          ) : (
            <div className="message-text">
              <MarkdownRenderer 
                content={message.content} 
                className={isUser ? 'user' : 'assistant'}
              />
            </div>
          )}
          <div className={`message-time ${isUser ? 'user' : 'assistant'}`}>
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};

// 输入加载动画组件
const TypingIndicator: React.FC = () => (
  <div className="typing-indicator">
    <div className="typing-content">
      <div className="typing-avatar">
        <Bot size={16} />
      </div>
      <div className="typing-bubble">
        <div className="typing-dots">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  </div>
);

// AI回复函数 - 调用后端GraphQL API
const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    return await sendChatMessage(userMessage);
  } catch (error) {
    console.error('Failed to get AI response:', error);
    throw error;
  }
};

// 流式AI回复函数
const getAIResponseStream = async (
  userMessage: string, 
  onUpdate: (content: string, isComplete: boolean) => void
): Promise<string> => {
  try {
    return await sendChatMessageStream(userMessage, 'deepseek-chat', onUpdate);
  } catch (error) {
    console.error('Failed to get AI stream response:', error);
    throw error;
  }
};

// 主应用组件
const HelloChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 创建初始的AI消息
    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      // 使用流式响应
      await getAIResponseStream(userMessage.content, (content, isComplete) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content }
              : msg
          )
        );
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: '抱歉，服务器连接失败。请检查网络连接或稍后重试。' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-app">
      <div className="chat-container">
        {/* 头部 */}
        <div className="app-header">
          <h1 className="app-title">
            Hello Chat
          </h1>
          <p className="app-subtitle">
            AI智能聊天助手 - 简单交互版本
          </p>
        </div>

        {/* 聊天容器 */}
        <div className="chat-window">
          {/* 聊天头部 */}
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-status">
                <div className="status-indicator"></div>
                <h2 className="status-text">
                  AI 助手在线
                </h2>
              </div>
              <button
                onClick={clearChat}
                className="clear-button"
              >
                <Trash2 size={14} />
                <span>清空对话</span>
              </button>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="messages-area">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-content">
                  <div className="empty-icon">
                    <Bot size={32} />
                  </div>
                  <p className="empty-title">开始对话吧！</p>
                  <p className="empty-subtitle">我是您的AI助手，随时为您提供帮助</p>
                  <div className="empty-examples">
                    <p>试试问我：</p>
                    <p>"你好" / "现在几点了" / "帮助"</p>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="input-area">
            <div className="input-wrapper">
              <div className="input-container">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "AI正在思考中..." : "输入您的消息... (Enter发送，Shift+Enter换行)"}
                  disabled={isLoading}
                  className="input-textarea"
                  rows={1}
                  style={{
                    minHeight: '40px',
                    maxHeight: '120px',
                  }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`send-button ${!inputValue.trim() || isLoading ? 'disabled' : 'enabled'}`}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <Send size={16} />
                )}
                <span>{isLoading ? '发送中' : '发送'}</span>
              </button>
            </div>
            
            <div className="input-footer">
              💡 已连接到DeepSeek AI服务
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelloChatApp;
