import useChatbot from '@/hooks/useChatbot';
import { generateNameId } from '@/utils/helpers/fn';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, RefreshCw, Send, Sparkles, User, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';

const ChatBot = () => {
  const { messages, isLoading, isOpen, suggestions, status, sendMessage, sendSuggestion, clearChat, toggleChat } =
    useChatbot();
  const { user, isAuthenticated } = useSelector((state) => state.account);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Tự động scroll xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendSuggestion(suggestion);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ProductCard = ({ product }) => (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-[#333] hover:shadow-lg'>
      <div className='aspect-square overflow-hidden bg-gray-50'>
        <img
          src={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      <div className='p-3'>
        <h4 className='mb-1 line-clamp-2 text-sm font-semibold text-[#333]'>{product.name}</h4>
        <p className='mb-2 text-xs text-gray-600'>{product.brand}</p>
        <div className='mb-2'>
          {product.variants && product.variants.length > 0 && (
            <span className='text-sm font-bold text-[#333]'>
              {Math.min(...product.variants.map((v) => v.price)).toLocaleString('vi-VN')}đ
              {product.variants.length > 1 &&
                ' - ' + Math.max(...product.variants.map((v) => v.price)).toLocaleString('vi-VN') + 'đ'}
            </span>
          )}
        </div>
        <button
          className='flex w-full items-center justify-center gap-1 rounded-md bg-[#333] px-2 py-1 text-xs text-white transition-colors duration-200 hover:bg-gray-800'
          onClick={() => window.open(`/product/${generateNameId({ name: product.name, id: product._id })}`, '_blank')}
        >
          Xem
        </button>
      </div>
    </div>
  );

  ProductCard.propTypes = {
    product: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      brand: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string),
      variants: PropTypes.arrayOf(
        PropTypes.shape({
          price: PropTypes.number.isRequired
        })
      ),
      averageRating: PropTypes.number,
      totalReviews: PropTypes.number
    }).isRequired
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className='fixed bottom-6 left-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#333] to-gray-600 text-white shadow-lg hover:shadow-xl'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
      >
        <AnimatePresence mode='wait'>
          {isOpen ? (
            <motion.div
              key='close'
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key='chat'
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {!isOpen && (
          <motion.div
            className='absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500'
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='chatbot-window fixed bottom-24 left-6 z-40 flex h-[600px] max-h-[calc(100vh-8rem)] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:bottom-24 sm:left-6 sm:h-[600px] sm:w-96 sm:rounded-2xl'
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className='flex items-center justify-between bg-gradient-to-r from-[#333] to-gray-600 p-4 text-white'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20'>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>Trợ lý AI</h3>
                  <p className={`text-sm ${status?.available ? 'text-green-200' : 'text-red-200'}`}>
                    {status?.available ? 'Trực tuyến' : 'Ngoại tuyến'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  className='flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-20 transition-colors hover:bg-opacity-30'
                  onClick={clearChat}
                  title='Làm mới cuộc trò chuyện'
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  className='flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-20 transition-colors hover:bg-opacity-30'
                  onClick={toggleChat}
                  title='Đóng chat'
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className='chatbot-messages flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className='mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#333] text-white'>
                      <Bot size={16} />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-2xl p-3 shadow-sm ${
                        message.type === 'bot'
                          ? 'rounded-bl-sm border border-gray-100 bg-white text-gray-800'
                          : 'rounded-br-sm bg-[#333] text-white'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <div className='prose prose-sm max-w-none text-sm'>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className='text-sm leading-relaxed'>{message.content}</p>
                      )}
                    </div>

                    {/* Hiển thị sản phẩm nếu có */}
                    {message.products && message.products.length > 0 && (
                      <div className='mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                        <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-[#333]'>
                          <Sparkles size={16} className='text-amber-500' />
                          Sản phẩm phù hợp ({message.products.length})
                        </h4>
                        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                          {message.products.slice(0, 6).map((product) => (
                            <ProductCard key={product._id} product={product} />
                          ))}
                        </div>
                        {message.products.length > 6 && (
                          <p className='mt-3 rounded-lg bg-gray-50 py-2 text-center text-xs text-gray-600'>
                            Và {message.products.length - 6} sản phẩm khác...
                          </p>
                        )}
                      </div>
                    )}

                    <div className='mt-2 px-1 text-xs text-gray-500'>{formatTime(message.timestamp)}</div>
                  </div>
                  {message.type === 'user' && (
                    <div className='mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-400 text-white'>
                      {isAuthenticated ? <img src={user.avatar} alt='' /> : <User size={16} />}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className='flex justify-start gap-3'>
                  <div className='mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#333] text-white'>
                    <Bot size={16} />
                  </div>
                  <div className='rounded-2xl rounded-bl-sm border border-gray-100 bg-white p-4 shadow-sm'>
                    <div className='flex gap-1'>
                      <div className='h-2 w-2 animate-bounce rounded-full bg-[#333]'></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-[#333]'
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-[#333]'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && messages.length <= 1 && (
              <div className='border-t border-gray-200 bg-white px-4 py-3'>
                <p className='mb-2 text-sm font-medium text-gray-700'>Gợi ý cho bạn:</p>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className='rounded-lg bg-gray-100 px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-[#333] hover:text-white'
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form className='border-t border-gray-200 bg-white p-4' onSubmit={handleSendMessage}>
              <div className='flex gap-2'>
                <input
                  ref={inputRef}
                  type='text'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder='Nhập tin nhắn của bạn...'
                  disabled={isLoading || !status?.available}
                  maxLength={500}
                  className='flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#333] disabled:cursor-not-allowed disabled:bg-gray-100'
                />
                <button
                  type='submit'
                  disabled={!inputMessage.trim() || isLoading || !status?.available}
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-[#333] text-white transition-colors duration-200 hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300'
                >
                  <Send size={16} />
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className='border-t border-gray-200 bg-gray-50 px-4 py-2'>
              <p className='text-center text-xs text-gray-500'>Phát triển bởi OpenAI • Hỗ trợ 24/7</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
