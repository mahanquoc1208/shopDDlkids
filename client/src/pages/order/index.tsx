import React, { useEffect, useState } from 'react';
import { getOrderCustomer, updateStatusOrder } from '../../api/post/post.api'; // Import the new API function
import { toast } from 'react-toastify'

const Order = () => {
  const [orders, setOrders] = useState([]); // State to store order data

  // Get the current user ID from localStorage
  const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);

  useEffect(() => {
    // Fetch order data for the current user when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await getOrderCustomer(currentUserID); // Pass currentUserID to the API
        setOrders(response.data); // Assuming response.data contains the array of orders
        // console.log('checkkkkkkkkkkkkkkkkkkkkkkkk', response.data)
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [currentUserID]);

  // Function to format the date and time for datetime-local input
  const formatDateForDatetimeLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`;
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`;
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount); // Convert amount to number
    if (isNaN(numericAmount)) {
      return '₫0,00'; // Return default value if not a number
    }
    return numericAmount
      .toFixed(2) // Ensure there are 2 decimal places
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.') // Format thousands with dot
      .replace('.', ','); // Replace decimal point with comma
  };

  // Function to handle view details and redirect
  const handleViewDetails = (orderId) => {
   window.location.href = `/order/orderdetail/${orderId}`
  };
  // hàm chuyển trang để đánh giá sản phẩm
  const hamCmtProduct = (orderId) => {
    window.location.href = `/order/getcmtproduct/${orderId}`
   };
  // hàm hủy đơn hàng 
  // Di chuyển fetchOrders ra ngoài useEffect để có thể tái sử dụng
  const fetchOrders = async () => {
    try {
      const response = await getOrderCustomer(currentUserID); // Truyền currentUserID vào API
      setOrders(response.data); // Giả sử response.data chứa mảng các đơn hàng
      // console.log('Đơn hàng đã được lấy:', response.data);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await updateStatusOrder(orderId);
      console.log('Phản hồi từ updateStatusOrder:', response);
      console.log('ID đơn hàng nhận được:', orderId);

      if (response.status === 200) {
        // Hiển thị thông báo thành công
        console.log('Trạng thái đơn hàng đã được cập nhật thành công');
        toast.success('Hủy đơn thành công!');

        // Làm mới danh sách đơn hàng
        await fetchOrders();
      } else {
        // Xử lý phản hồi lỗi
        console.error('Cập nhật trạng thái đơn hàng không thành công');
        toast.error('Cập nhật trạng thái đơn hàng không thành công!');
      }
    } catch (error) {
      console.error('Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng', error);
    }
  };

  useEffect(() => {
    // Lấy dữ liệu đơn hàng cho người dùng hiện tại khi component được gắn vào
    fetchOrders();
  }, [currentUserID]);


  return (
    <div>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="w-full border-b">
            <th className="py-2 px-4 text-left">Tên đơn hàng</th>
            <th className="py-2 px-4 text-left">Thanh toán</th>
            <th className="py-2 px-4 text-left">Ngày đặt hàng</th>
            <th className="py-2 px-4 text-left">Trạng thái</th>
            <th className="py-2 px-4 text-left">Thao tác</th>
            <th className="py-2 px-4 text-left">Số Tiền</th>
            {/* <th className="py-2 px-4 text-left">Thao tác</th> */}
            <th className="py-4 px-4 text-left">Xem chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-2 px-4 text-blue-500">{order.name}</td>
                <div className="py-2 px-4">
                  <span className={order.payID === 1 ? 'text-red-500' : 'text-green-500'}>
                    {order.payID === 1 ? 'Chưa thanh toán' : 'Đã thanh toán'}
                  </span>
                </div>
                <td className="py-2 px-4">{formatDateForDatetimeLocal(order.createdAt)}</td> {/* Format date for datetime-local */}
                <td className="py-2 px-4 text-blue-500">{order.order_status}</td>
                <td className="py-2 px-4 border-gray-300 text-left">
                  {order.order_status ? (
                    <>
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
                    </>
                  ) : (
                    'Unknown'
                  )}
                </td>

                <td className="py-2 px-4 ">{formatCurrency(order.Tota_amount)} Ngàn VND</td> {/* Format currency */}
                <td  className="py-2 px-4 ">
                  <button onClick={() => handleViewDetails(order.orderId)}>
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-2 px-4 text-center">Không có đơn hàng nào</td>
              <img src="../../assets/embekhoc.png" alt="No products" />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Order;
