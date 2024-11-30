import React, { useEffect, useState } from 'react';
import { getlistOrdershipper } from '../../api/post/post.api'; 
const Order = () => {
  const [orders, setOrders] = useState([]); // State to store order data

  useEffect(() => {
    // Fetch order data when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await getlistOrdershipper(); // Call API without arguments
        console.log('checkkkkkkkk', response.data.data)
        setOrders(response.data.data); 
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const formatDateForDatetimeLocal = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '₫0,00';
    return numericAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace('.', ',');
  };

  const handleViewDetails = (orderId) => {
    window.location.href = `/ordershipperDetail/${orderId}`;
  };


  return (
    <div>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="w-full border-b">
            <th className="py-2 px-4 text-left">Tên đơn hàng</th>
            {/* <th className="py-2 px-4 text-left">Thanh toán</th> */}
            <th className="py-2 px-4 text-left">Ngày đặt hàng</th>
            <th className="py-2 px-4 text-left">Trạng thái</th>
            {/* <th className="py-2 px-4 text-left">Thao tác</th> */}
            <th className="py-2 px-4 text-left">Số Tiền</th>
            <th className="py-4 px-4 text-left">Xem chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-2 px-4 text-blue-500">{order.name}</td>
                {/* <td className="py-2 px-4">{order.payID === 1 ? 'Chưa thanh toán' : 'Đã thanh toán'}</td> */}
                <td className="py-2 px-4">{formatDateForDatetimeLocal(order.createdAt)}</td>
                <td className="py-2 px-4 text-blue-500">{order.order_status}</td>
                {/* <td className="py-2 px-4">
                  {order.order_status === 'Chờ xử lý' ? (
                    <button
                      className="btn-cancel ml-2 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition-all duration-300"
                      onClick={() => handleCancelOrder(order.orderId)}
                    >
                      Hủy
                    </button>
                  ) : order.order_status === 'Thành công' ? (
                    <button
                      onClick={() => hamCmtProduct(order.orderId)}
                      className="btn-review ml-2 bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition-all duration-300"
                    >
                      Đánh giá
                    </button>
                  ) : null}
                </td> */}
                <td className="py-2 px-4">{formatCurrency(order.Tota_amount)} Ngàn VND</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleViewDetails(order.id)}>Xem chi tiết</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="py-2 px-4 text-center">Không có đơn hàng nào</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Order;
