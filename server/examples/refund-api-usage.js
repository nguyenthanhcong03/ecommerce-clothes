// Hướng dẫn sử dụng API hoàn tiền mới

/**
 * API hoàn tiền riêng biệt
 * POST /api/orders/refund
 *
 * Flow mới:
 * 1. Hủy đơn hàng (không hoàn tiền) -> POST /api/orders/:id/cancel
 * 2. Hoàn tiền riêng biệt -> POST /api/orders/refund
 */

// ============ VÍ DỤ SỬ DỤNG ============

// 1. Hủy đơn hàng (user hoặc admin)
const cancelOrderExample = async () => {
  const response = await fetch("/api/orders/ORDER_ID/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_TOKEN",
    },
    body: JSON.stringify({
      reason: "Khách hàng yêu cầu hủy đơn hàng",
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log("Đơn hàng đã hủy:", result.message);

    // Kiểm tra xem có cần hoàn tiền không
    if (result.data.needRefund) {
      console.log("Đơn hàng cần hoàn tiền, gọi API hoàn tiền...");
      // Gọi API hoàn tiền
      await processRefundExample(result.data.order._id);
    }
  }
};

// 2. Hoàn tiền riêng biệt (user hoặc admin)
const processRefundExample = async (orderId) => {
  const response = await fetch("/api/orders/refund", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_TOKEN",
    },
    body: JSON.stringify({
      orderId: orderId,
      reason: "Hoàn tiền do hủy đơn hàng",
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log("Hoàn tiền thành công:", result.message);
    console.log("Thông tin hoàn tiền:", result.data.refund);
  } else {
    console.error("Hoàn tiền thất bại:", result.message);
  }
};

// ============ FRONTEND IMPLEMENTATION ============

// React component cho việc hủy đơn hàng và hoàn tiền
const OrderCancelRefund = ({ orderId, orderData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Cancel, 2: Refund

  const handleCancelOrder = async () => {
    setIsProcessing(true);

    try {
      const response = await cancelOrder(orderId, "Khách hàng yêu cầu hủy");

      if (response.success) {
        // Hiển thị thông báo hủy thành công
        toast.success("Đơn hàng đã được hủy thành công");

        // Nếu cần hoàn tiền, chuyển sang bước 2
        if (response.data.needRefund) {
          setStep(2);
          // Tự động gọi API hoàn tiền hoặc yêu cầu user xác nhận
          await handleRefund();
        }
      }
    } catch (error) {
      toast.error("Lỗi khi hủy đơn hàng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    setIsProcessing(true);

    try {
      const response = await processRefund(orderId, "Hoàn tiền do hủy đơn hàng");

      if (response.success) {
        toast.success("Hoàn tiền thành công");
        // Cập nhật UI để hiển thị trạng thái hoàn tiền
      }
    } catch (error) {
      toast.error("Lỗi khi hoàn tiền");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="order-cancel-refund">
      {step === 1 && (
        <div>
          <h3>Hủy đơn hàng</h3>
          <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
          {orderData.payment.status === "Paid" && (
            <p className="text-warning">Đơn hàng đã thanh toán sẽ được hoàn tiền sau khi hủy.</p>
          )}
          <button onClick={handleCancelOrder} disabled={isProcessing} className="btn btn-danger">
            {isProcessing ? "Đang xử lý..." : "Hủy đơn hàng"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Hoàn tiền</h3>
          <p>Đơn hàng đã được hủy. Đang thực hiện hoàn tiền...</p>
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Đang xử lý hoàn tiền với VNPay...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ BACKEND SERVICES ============

// Service để xử lý logic business
const OrderService = {
  // Hủy đơn hàng và hoàn tiền (workflow hoàn chỉnh)
  async cancelAndRefund(orderId, reason, userId) {
    try {
      // Bước 1: Hủy đơn hàng
      const cancelResult = await this.cancelOrder(orderId, reason, userId);

      if (!cancelResult.success) {
        throw new Error(cancelResult.message);
      }

      // Bước 2: Hoàn tiền nếu cần
      if (cancelResult.data.needRefund) {
        const refundResult = await this.processRefund(orderId, reason, userId);

        return {
          success: true,
          message: "Hủy đơn hàng và hoàn tiền thành công",
          data: {
            cancelResult: cancelResult.data,
            refundResult: refundResult.data,
          },
        };
      }

      return {
        success: true,
        message: "Hủy đơn hàng thành công",
        data: cancelResult.data,
      };
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng và hoàn tiền:", error);
      throw error;
    }
  },

  async cancelOrder(orderId, reason, userId) {
    // Gọi API hủy đơn hàng
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ reason }),
    });

    return await response.json();
  },

  async processRefund(orderId, reason, userId) {
    // Gọi API hoàn tiền
    const response = await fetch("/api/orders/refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ orderId, reason }),
    });

    return await response.json();
  },
};

// ============ ADMIN DASHBOARD ============

// Component admin để quản lý đơn hàng
const AdminOrderManagement = ({ order }) => {
  const [showRefundModal, setShowRefundModal] = useState(false);

  const handleCancelOrder = async () => {
    try {
      const result = await OrderService.cancelOrder(order._id, "Admin hủy đơn hàng");

      if (result.success && result.data.needRefund) {
        // Hiển thị modal xác nhận hoàn tiền
        setShowRefundModal(true);
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
    }
  };

  const handleConfirmRefund = async () => {
    try {
      const result = await OrderService.processRefund(order._id, "Admin hoàn tiền");

      if (result.success) {
        toast.success("Hoàn tiền thành công");
        setShowRefundModal(false);
        // Reload data
      }
    } catch (error) {
      toast.error("Lỗi khi hoàn tiền");
    }
  };

  return (
    <div className="admin-order-management">
      <div className="order-actions">
        <button onClick={handleCancelOrder} className="btn btn-danger" disabled={order.status === "Cancelled"}>
          Hủy đơn hàng
        </button>

        <button
          onClick={() => setShowRefundModal(true)}
          className="btn btn-warning"
          disabled={order.payment.status !== "Paid"}
        >
          Hoàn tiền
        </button>
      </div>

      {/* Modal xác nhận hoàn tiền */}
      {showRefundModal && (
        <RefundConfirmationModal
          order={order}
          onConfirm={handleConfirmRefund}
          onCancel={() => setShowRefundModal(false)}
        />
      )}
    </div>
  );
};

export { cancelOrderExample, processRefundExample, OrderCancelRefund, OrderService, AdminOrderManagement };
