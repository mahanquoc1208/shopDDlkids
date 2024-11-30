import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetail, fetchCustomerById, updateordersucees, updateordererorr, updateProductsumInventory } from '../../api/post/post.api';
import { toast } from 'react-toastify'
import { Toast } from 'react-toastify/dist/components';
const ProductTable = () => {
  const { id } = useParams(); // Extract the order ID from the URL
  const [orderDetails, setOrderDetails] = useState(null);
  const [customer, setCustomer] = useState(null); // State to hold customer data
  const [, setError] = useState<string | null>(null); // State for error handling
  const [, setLoading] = useState(true);   // State for loading status

  // Fetch order details when the component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetail(id); // Call the API with the ID
        setOrderDetails(response.data.data); // Set the fetched data to the state
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetail(id); // Call the API with the ID
        const data = response.data.data;

        setOrderDetails(data); // Set the fetched data to the state

        // Fetch customer data using custumerID from the order details
        if (data && data.custumerID) {
          const customerResponse = await fetchCustomerById(data.custumerID);
          setCustomer(customerResponse.data); // Set the customer data
        }
      } catch (error) {
        console.error('Error fetching order details or customer data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false); // Stop the loading state
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Helper function to format prices
  const formatPrice = (price) => {
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
    const priceWithDot = formattedPrice.replace(/,([^,]*)$/, '.$1');
    return priceWithDot + ' Ngàn VND';
  };

  // Function to handle order confirmation
  const handleConfirmOrder = async () => {
    try {
      await updateordersucees(id); // Call the API with the order ID
      toast.success('Giao hàng thành công');
      setTimeout(() => {
        window.location.href = `/ordershiper`;
      }, 1000);
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Lỗi không thể xác nhận');
    }
  };
  const handleConfirmOrdererorr = async () => {
    try {
      // First, update the order status as failed
      await updateordererorr(id); // Call the API with the order ID
      toast.success('Đơn hàng giao thất bại');
  
      // After that, update the product inventory for each item in the order
      for (const item of orderDetails.OrderDetails) {
        const { ProductID, quantity } = item;
        await updateProductsumInventory(ProductID, quantity); // Call the API to update the inventory
      }
  
      setTimeout(() => {
        window.location.href = `/ordershiper`; // Redirect after a short delay
      }, 1000);
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Lỗi không thể xác nhận');
    }
  };
  

  if (!orderDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-lg font-bold mb-4 text-center">
        Thông tin chi tiết đơn hàng: {orderDetails.name}
      </h2>

      {customer && (
        <div className="mb-4">
          <h3 className="font-bold">Thông tin khách hàng</h3>
          <p>Tên: {customer.fullName}</p>
          <p>Số điện thoại: {customer.phone}</p>
          <p>Địa chỉ: {customer.address}</p>
          <p>Hạng khách hàng: {customer.role}</p>
        </div>
      )}
      <table className="min-w-full bg-white">
        <thead>
          <tr className="w-full border-b">
            <th className="py-2 px-4 text-left">Sản Phẩm</th>
            <th className="py-2 px-4 text-left">Đơn Giá</th>
            <th className="py-2 px-4 text-left">Số Lượng</th>
            <th className="py-2 px-4 text-left">Số Tiền</th>
          </tr>
        </thead>
        <tbody>
          {orderDetails.OrderDetails.map((item) => (
            <tr key={item.ProductID} className="border-b">
              <td className="py-2 px-4">
                <div className="flex items-start">
                  <img
                    alt={item.Product.name}
                    className="w-20 h-20 object-cover mr-4"
                    src={`../../../assets/images/uploads/product/${item.Product.locationPath}`}
                    width="100"
                    height="100"
                  />
                  <div>
                    <p>{item.Product.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-2 px-4">
                <span className="text-red-500">{formatPrice(item.price)}</span>
              </td>
              <td className="py-2 px-4">
                <div className="flex items-center">
                  <input className="w-12 text-center border-t border-b" type="text" value={item.quantity} readOnly />
                </div>
              </td>
              <td className="py-2 px-4 text-red-500">
                {formatPrice(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <h3 className="font-bold">
          Tổng Tiền: <span className="text-red-500">{formatPrice(orderDetails.Tota_amount)}</span>
        </h3>
        <p>Trạng Thái Đơn Hàng: {orderDetails.order_status}</p>
        <p>
          {orderDetails.payID === 1
            ? 'Đơn hàng thanh toán bằng tiền mặt'
            : orderDetails.payID === 2
            ? 'Đơn hàng của bạn đã thanh toán'
            : ''}
        </p>
        {/* Confirm Order Button */}
        <button
          onClick={handleConfirmOrder}
          className="bg-teal-500 text-white rounded px-4 py-2 mt-4 hover:bg-teal-900 transition-all duration-300"
        >
          Thành công
        </button>
        <button
          onClick={handleConfirmOrdererorr}
          className="bg-red-500 text-white rounded px-4 py-2 mt-4 hover:bg-red-800 transition-all duration-300"
        >
          Thất bại
        </button>
      </div>
    </div>
  );
};

export default ProductTable;
