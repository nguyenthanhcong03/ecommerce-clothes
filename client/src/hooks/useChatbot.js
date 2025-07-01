import { useState, useCallback, useEffect } from 'react';
import chatbotService from '../services/chatbotService';

const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [status, setStatus] = useState({ available: false });

  // Khởi tạo chat với tin nhắn chào mừng
  const initializeChat = useCallback(async () => {
    try {
      // Lấy trạng thái chatbot
      const statusResponse = await chatbotService.getChatbotStatus();
      console.log('statusResponse', statusResponse);
      setStatus(statusResponse.data);

      // Lấy gợi ý
      const suggestionsResponse = await chatbotService.getChatSuggestions();
      setSuggestions(suggestionsResponse.data?.sampleQuestions);
      setFeaturedProducts(suggestionsResponse.data?.featuredProducts);

      // Tin nhắn chào mừng
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content:
          'Xin chào! Tôi là Trợ lý thông minh của cửa hàng Outfitory. Tôi có thể giúp bạn tìm kiếm sản phẩm theo ý muốn. Hãy mô tả sản phẩm bạn đang tìm kiếm nhé! 😊',
        timestamp: new Date(),
        products: []
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Có lỗi khi khởi tạo ChatBot:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: 'Xin lỗi, chatbot hiện không khả dụng. Bạn có thể tìm kiếm sản phẩm thông qua trang chủ.',
        timestamp: new Date(),
        products: []
      };
      setMessages([errorMessage]);
    }
  }, []);

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (messageContent) => {
      if (!messageContent.trim() || isLoading) return;

      // Thêm tin nhắn của user
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: messageContent.trim(),
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Gửi tới server
        const response = await chatbotService.sendMessage(messageContent);
        console.log('response', response);

        // Thêm phản hồi của bot
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.response,
          timestamp: new Date(),
          products: response.data.products || [],
          analysis: response.data.analysis
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Có lỗi xảy ra khi gửi tin nhắn:', error);

        // Thêm tin nhắn lỗi
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
          timestamp: new Date(),
          products: []
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  // Gửi tin nhắn gợi ý
  const sendSuggestion = useCallback(
    (suggestion) => {
      sendMessage(suggestion);
    },
    [sendMessage]
  );

  // Xóa lịch sử chat
  const clearChat = useCallback(() => {
    initializeChat();
  }, [initializeChat]);

  // Toggle chat
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Khởi tạo khi hook được sử dụng lần đầu
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  return {
    messages,
    isLoading,
    isOpen,
    suggestions,
    featuredProducts,
    status,
    sendMessage,
    sendSuggestion,
    clearChat,
    toggleChat,
    setIsOpen
  };
};

export default useChatbot;
