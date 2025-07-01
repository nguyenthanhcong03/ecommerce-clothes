import axiosInstance from '@/config/axios';
const BASE_API = '/api/chatbot';

class ChatbotService {
  // Gửi tin nhắn chat tới server
  async sendMessage(message) {
    try {
      const response = await axiosInstance.post(`${BASE_API}/chat`, {
        message: message.trim()
      });
      return response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Lấy gợi ý sản phẩm và câu hỏi mẫu
  async getChatSuggestions() {
    try {
      const response = await axiosInstance.get(`${BASE_API}/suggestions`);
      return response;
    } catch (error) {
      console.error('Error getting chat suggestions:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái chatbot
  async getChatbotStatus() {
    try {
      const response = await axiosInstance.get(`${BASE_API}/status`);
      return response;
    } catch (error) {
      console.error('Error getting chatbot status:', error);
      throw error;
    }
  }
}

export default new ChatbotService();
