import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import { getListCart, deleteProductFromCart, fetchCustomerById, fetchAllPay, createOrder, updateOrderQuantity, createOrderDetail,getlistOrder, updateRewardPoints  } from '../../api/post/post.api';
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import { toast } from 'react-toastify';
// import { toast } from '../../assets/embekhoc.png';
const ProductList = () => {
  const [cartItems, setCartItems] = useState([]);
  const [data, setData] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [user, setuser] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [allChecked, setAllChecked] = useState(false); // State for the main checkbox
  const [totalItemsDisplayed, setTotalItemsDisplayed] = useState(0); // State for total displayed items
  const [customer, setCustomer] = useState(null); // State to hold customer data
  const [loading, setLoading] = useState(true);   // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error handling
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  // lấy địa chỉ 
  const [coordinatesA, setCoordinatesA] = useState(null);
  const [coordinatesB, setCoordinatesB] = useState(null);
  const [distance, setDistance] = useState(null);
  const [total, setTotal] = useState<number>(0); // State for total count
  const [orders, setOrders] = useState<any[]>([]); // State for order data
  ///
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getlistOrder();
        const { total } = response.data;
        setTotalOrders(total);
        console.log('Total Orders:', total);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the user ID from localStorage
        const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
        if (!currentUserID) {
          throw new Error('User ID not found');
        }

        // Call the API to fetch customer by ID
        const response = await fetchCustomerById(currentUserID);
        // console.log('checkkkkkkk thoong tin khachs hangf',response.data )

        // Check if the response is valid
        if (!response.data) {
          throw new Error('Invalid API response format');
        }

        setCustomer(response.data); // Set the customer data
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch customer data'); // Handle errors
      } finally {
        setLoading(false); // Stop the loading state
      }
    };

    fetchData(); // Fetch the customer data when the component mounts
  }, []); // Empty dependency array means this will only run once on mount
  // pay
  // Interface cho dữ liệu của đơn hàng
// interface OrderData {
//   payID: number;
//   status: number;
//   custumerID: number;
//   Tota_amount: number;
// }
  useEffect(() => {
    const fetchAllData = async () => {
      const payResponse = await fetchAllPay(); // Assuming this fetches the payment data
      // console.log('checkk ppay', payResponse.data.data);
      setData(payResponse.data.data);
    };
    fetchAllData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
        // console.log('Current User ID:', currentUserID);
        if (!currentUserID) {
          throw new Error('User ID not found');
        }

        const response = await getListCart(currentUserID);
        // console.log('API Response:', response);

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid API response format');
        }

        setCartItems(response.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch cart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const totalItems = cartItems.length;
    setTotalItemsDisplayed(totalItems); // Update state
    localStorage.setItem('totalItemsDisplayed', totalItems.toString()); // Store in localStorage
  }, [cartItems]);
  useEffect(() => {
    const updatedCheckedItems = {};
    cartItems.forEach(item => {
      // Check the status and allChecked condition
      updatedCheckedItems[item.id] = item.status === 1 || allChecked;
    });
    setCheckedItems(updatedCheckedItems);
  }, [cartItems, allChecked]);
  const updateQuantity = (itemId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  useEffect(() => {
    const selected = cartItems
      .filter(item => checkedItems[item.id])
      .map(item => ({
        id: item.id, // Thêm id vào đối tượng
        productId: item.productId,
        quantity: item.quantity,
        price: item.Product.Discount > 0 ? item.Product.Discount : item.Product.price,
      }));
    setSelectedItems(selected);
    console.log('Thông tin các sản phẩm được tích chọn:', selected);
  }, [checkedItems, cartItems]);  
  // kiểm tra xem sản phẩm có được tích chọn hay chưa
  const hasSelectedItems = cartItems.some(item => checkedItems[item.id]);
  // lấy địa chỉ 
  const getCoordinates = async (address, setCoordinates, fallbackAddress) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      setCoordinates({ lat: parseFloat(lat), lon: parseFloat(lon) });
    } else {
      alert(`Không tìm thấy tọa độ của địa chỉ ${address}. Đang tìm địa chỉ thay thế...`);
      findNearbyAddress(fallbackAddress, setCoordinates);
    }
  };

  const findNearbyAddress = async (fallbackAddress, setCoordinates) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackAddress)}&format=json`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      setCoordinates({ lat: parseFloat(lat), lon: parseFloat(lon) });
    } else {
      alert('Không tìm thấy địa chỉ thay thế!');
    }
  };
    const handlePaymentChange = (event) => {
    setSelectedPayment(event.target.value);
  };

  const calculateDistance = () => {
    if (!coordinatesA || !coordinatesB) {
      alert('Vui lòng nhập địa chỉ chính xác');
      return;
    }

    const { lat: latA, lon: lonA } = coordinatesA;
    const { lat: latB, lon: lonB } = coordinatesB;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(latB - latA);
    const dLon = toRad(lonB - lonA);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(latA)) * Math.cos(toRad(latB)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c; // Distance in km

    setDistance(dist);
  };

  const handleGetCoordinatesA = () => {
    getCoordinates('12 Đường Quang Trung, phường 11, Gò Vấp, Hồ Chí Minh', setCoordinatesA);
  };

  const handleGetCoordinatesB = (address) => {
    const fallbackAddressB = createFallbackAddress(address); // Create fallback address
    getCoordinates(address, setCoordinatesB, fallbackAddressB);
  };

  const createFallbackAddress = (address) => {
    return address.replace(/\/[^,]*/, ''); // Remove the part after the slash (if any)
  };
  // Helper function to calculate cart total
const calculateCartTotal = (cartItems, checkedItems) => {
  return cartItems.reduce((total, item) =>
    (checkedItems[item.id] ? total + item.Product.Discount * item.quantity : total), 0);
};

// Helper function to calculate discount based on customer roleId
const calculateDiscount = (cartTotal, deliveryFee, customer) => {
  const totalAmount = cartTotal + deliveryFee;
  let discountPercentage = 0;

  if (customer.roleId === 6) {
    discountPercentage = 0;
  } else if (customer.roleId === 7) {
    discountPercentage = 0.015; // 1.5%
  } else if (customer.roleId === 8) {
    discountPercentage = 0.032; // 3.2%
  }

  return totalAmount * discountPercentage;
};
const calculateFinalTotalAmount = () => {
  const cartTotal = calculateCartTotal(cartItems, checkedItems);
  const deliveryFee = distance > 3 ? (distance - 3) * 6.00 : 0;  // Tính phí giao hàng
  const discountAmount = calculateDiscount(cartTotal, deliveryFee, customer);  // Tính giảm giá
  const finalTotal = calculateFinalTotal(cartTotal, deliveryFee, discountAmount);  // Tổng tiền cuối cùng
  return finalTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');  // Format số với dấu chấm
};

// thanh toán
const handlePaymentSelect = (id) => {
  setSelectedPayment(id);  // Cập nhật trạng thái phương thức thanh toán
  console.log(`ID của phương thức thanh toán được chọn: ${id}`);
};

// Helper function to calculate the final total
const calculateFinalTotal = (cartTotal, deliveryFee, discountAmount) => {
  return cartTotal + deliveryFee - discountAmount;
};

  useEffect(() => {
    handleGetCoordinatesA();
    if (customer?.address) {
      handleGetCoordinatesB(customer.address);
    }
  }, [customer]);

  useEffect(() => {
    if (coordinatesA && coordinatesB) {
      calculateDistance(); // Calculate distance once both coordinates are available
    }
  }, [coordinatesA, coordinatesB]);

  
  const handleIncrease = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + 1;
      if (newQuantity > item.Product.Inventory_quantity) {
        toast.error('Số lượng vượt quá tồn kho');
      } else {
        try {
          await updateOrderQuantity(itemId, { quantity: newQuantity }); // Call API to update quantity
          const updatedCartItems = cartItems.map((cartItem) =>
            cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
          );
          setCartItems(updatedCartItems); // Update local state
          // toast.success('Số lượng đã được cập nhật');
        } catch (error) {
          console.error('Error updating quantity:', error);
          toast.error('Cập nhật số lượng thất bại');
        }
      }
    }
  };

  const handleDecrease = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      try {
        await updateOrderQuantity(itemId, { quantity: newQuantity }); // Call API to update quantity
        const updatedCartItems = cartItems.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
        );
        setCartItems(updatedCartItems); // Update local state
        // toast.success('Số lượng đã được cập nhật');
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('Cập nhật số lượng thất bại');
      }
    }
  };

  const handleInputChange = async (itemId, newQuantity) => {
    const item = cartItems.find(item => item.id === itemId);
  
    if (item) {
      // Check if the new quantity exceeds inventory or is less than 1
      if (newQuantity > item.Product.Inventory_quantity) {
        toast.error('Số lượng vượt quá tồn kho');
      } else if (newQuantity >= 1) {
        try {
          // Update the quantity in the database
          await updateOrderQuantity(itemId, { quantity: newQuantity });
          
          // Optionally, you can update the local state to reflect the change
          // This step depends on how you're managing the cartItems state
          const updatedCartItems = cartItems.map(cartItem => 
            cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
          );
          setCartItems(updatedCartItems); // Update state if you're using React's state management
  
          // toast.success('Số lượng đã được cập nhật'); // Notify user of success
        } catch (error) {
          console.error('Error updating quantity:', error);
          toast.error('Cập nhật số lượng thất bại'); // Notify user of failure
        }
      }
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  // thêm đơn hàng
  const submitOrder = async () => {
    try {
      // Lấy payID từ phương thức thanh toán đã chọn hoặc gán mặc định là 1
      const payID = selectedPayment || 1;  // Mặc định là 1 nếu chưa chọn phương thức thanh toán
  
      // Lấy custumerID từ localStorage
      const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
  
      // Lấy Tota_amount từ kết quả của hàm calculateFinalTotalAmount
      const totalAmount = calculateFinalTotalAmount();
  
      // Chuyển đổi totalAmount từ chuỗi định dạng '2.550.00' thành '2550'
      const formattedTotalAmount = totalAmount
        .replace(/\./g, '')              // Loại bỏ tất cả dấu chấm
        .slice(0, -2);                   // Bỏ hai ký tự ở cuối (số 0 sau dấu phẩy)
  
      // Gọi API updateRewardPoints để cập nhật điểm thưởng
      await updateRewardPoints(currentUserID, formattedTotalAmount); // Truyền currentUserID và formattedTotalAmount vào API
  
      // Chuẩn bị dữ liệu cho API tạo đơn hàng
      const orderData = {
        payID: payID,
        status: 1,  // Status mặc định là 1
        custumerID: currentUserID,
        Tota_amount: Number(formattedTotalAmount)  // Chuyển đổi sang số
      };
      console.log('Order giá trị:', orderData);
  
      // Gọi API tạo đơn hàng
      const response = await createOrder(orderData);
      console.log('Order created successfully:', response.data);
      toast.success('Đặt hàng thành công'); // Notify user of successful deletion  
      localStorage.setItem("orderSuccess", "true"); // Lưu trạng thái vào localStorage
      setTimeout(() => {
        window.location.href = `http://localhost:3000/`;
      }, 1000);
  
      // Sau khi tạo đơn hàng thành công, bạn có thể thực hiện các hành động khác
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };
  
  // thêm chi tiết đơn hàng
  const createOrderDetails = async () => {
    if (totalOrders === null) {
      console.error('Order ID không khả dụng');
      return;
    }
  
    const orderID = totalOrders + 1; // Cộng thêm 1 vào totalOrders
  
    try {
      // Đảm bảo rằng selectedItems là một mảng
      const itemsToProcess = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
      
      // Log toàn bộ mảng
      console.log('Toàn bộ các sản phẩm cần xử lý:', itemsToProcess);
  
      // Sử dụng vòng lặp để xử lý từng phần tử trong mảng
      for (const item of itemsToProcess) {
        // Đảm bảo từng item có đầy đủ các trường cần thiết
        if (!item.productId || !item.quantity || !item.price) {
          console.error('Thiếu các trường cần thiết trong sản phẩm:', item);
          continue; // Bỏ qua sản phẩm này nếu thiếu dữ liệu
        }
  
        const orderDetail = {
          ProductID: item.productId,
          quantity: item.quantity,
          orderID,
          price: item.price,
        };
  
        // Log dữ liệu chi tiết đơn hàng trước khi gọi API
        console.log('Dữ liệu chi tiết đơn hàng trước khi thêm:', orderDetail);
  
        // Gọi API để tạo OrderDetail
        try {
          const response = await createOrderDetail(orderDetail);
          console.log('Chi tiết đơn hàng đã được tạo:', response.data);
  
          // Gọi hàm để xóa sản phẩm đã thêm khỏi giỏ hàng
          try {
            await handleDelete1(item.id); // Xóa sản phẩm khỏi giỏ hàng
          } catch (deleteError) {
            console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', item.id, deleteError);
          }
          
        } catch (apiError) {
          console.error('Lỗi API khi tạo chi tiết đơn hàng cho sản phẩm:', item.productId, apiError);
        }
      }
    } catch (error) {
      console.error('Lỗi trong createOrderDetails:', error);
    }
  };
  const handleDelete = async (cartId) => {
    const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
    try {
      await deleteProductFromCart(currentUserID, cartId); // Call the delete API
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartId)); // Remove the deleted item from state
      toast.success('Sản phẩm đã được xóa khỏi giỏ hàng'); // Notify user of successful deletion  
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Xóa sản phẩm không thành công'); // Notify user of deletion failure
    }
  };
  const handleDelete1 = async (cartId) => {
    const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
    try {
      await deleteProductFromCart(currentUserID, cartId); // Call the delete API
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartId)); // Remove the deleted item from state
      // toast.success('Sản phẩm đã được xóa khỏi giỏ hàng'); // Notify user of successful deletion  
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Xóa sản phẩm không thành công'); // Notify user of deletion failure
    }
  };
  // ham onclick bttom
  const handleSubmit = async () => {
    await submitOrder();          // Gọi hàm tạo đơn hàng
    await createOrderDetails();   // Gọi hàm tạo chi tiết đơn hàng
  };
  if (
    showCustomerDetails &&
    (!customer.phone || !customer.address || !customer.role)
  ) {
    alert("Thông tin khách hàng không đầy đủ. Vui lòng cập nhật thông tin trong hồ sơ của bạn.");
    // Redirect immediately after the alert is triggered
    window.location.href = `/settings/profile`;
    return null; // Prevent further rendering after the redirect
  }
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="container mx-auto">
      {cartItems.length > 0 && (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded shadow space-y-4 sm:space-y-0">
    <div className="flex items-center space-x-8">
      <div className="flex items-center space-x-2">
        <input 
          className="mr-2" 
          type="checkbox" 
          checked={allChecked}
          onChange={() => setAllChecked(prev => !prev)} 
        />
        <span className="bg-lime-500 text-white px-2 py-1 rounded text-sm">Chọn tất cả</span>
      </div>
    </div>
    <div className="flex justify-between sm:space-x-4 text-center w-full sm:w-auto">
          <span className="font-semibold text-sm sm:text-base">Đơn Giá</span>
          <span className="font-semibold text-sm sm:text-base">Số Lượng</span>
          <span className="font-semibold text-sm sm:text-base">Số Tiền</span>
        <span className="font-semibold">
        <Box>
          <Tooltip title="Xóa">
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm">
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
      </span>
    </div>
  </div>
)}


        {cartItems.length > 0 ? (
          <div className="bg-white mt-4 p-4 rounded shadow">
            {cartItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 space-y-4 sm:space-y-0">
                 <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <input 
                    className="mr-2" 
                    type="checkbox" 
                    checked={checkedItems[item.id] || false} 
                    onChange={() => {
                      setCheckedItems(prev => ({
                        ...prev,
                        [item.id]: !prev[item.id] 
                      }));
                    }}
                  />
                  <img
                    className="w-24 h-24 object-cover rounded-md transition-transform duration-700 hover:scale-110"
                    src={item.Product.locationPath ? `../../../assets/images/uploads/product/${item.Product.locationPath}` : 'https://picsum.photos/200/300'}
                    alt="Product Image"
                  />
                  <div className="ml-0 sm:ml-4 w-40">
                    <p>{item.Product.name}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between sm:space-x-10 space-y-2 sm:space-y-0">
                  <div className="text-gray-500 line-through text-xs sm:text-base">{item.Product.price} Ngàn VND</div>
                  <div className="text-red-500 font-semibold text-sm sm:text-base">{item.Product.Discount} Ngàn VND</div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center space-x-2">
                      <button className="px-2 py-1 border text-sm" onClick={() => handleDecrease(item.id)}>-</button>
                      <input 
                        className="w-12 text-center border text-sm"
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => handleInputChange(item.id, parseInt(e.target.value))}
                      />
                      <button className="px-2 py-1 border text-sm" onClick={() => handleIncrease(item.id)}>+</button>
                    </div>
                    <div className="text-gray-500">Còn {item.Product.Inventory_quantity} sản phẩm</div>
                  </div>
                  <div className="text-red-500 font-semibold text-sm sm:text-base">
                    {(item.Product.Discount * item.quantity)
                      .toFixed(2)  // Keep two decimal places
                      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Ngàn VND
                  </div>
                  <div className="text-red-500">
                  <a 
                     className="hover:underline cursor-pointer text-sm"
                    onClick={() => handleDelete(item.id)} // Call delete handler on click
                  >
                    Xóa
                  </a>
                </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-8">
          <p>Không có sản phẩm nào trong giỏ hàng</p>
          <img src="../../assets/embekhoc.png" alt="No products" />
        </div>
        )}

<div>
      {/* First Section: Cart Summary */}
      {!showCustomerDetails && hasSelectedItems && (
        <div className="bg-white mt-4 p-4 rounded shadow">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="font-semibold text-center sm:text-left">
            Tổng thanh toán ({cartItems.filter(item => checkedItems[item.id]).length} Sản phẩm):
          </div>
          <div className="text-red-500 font-semibold text-center">
            {cartItems.reduce((total, item) =>
              (checkedItems[item.id] ? total + item.Product.Discount * item.quantity : total), 0)
              .toFixed(2)  // Ensure two decimal places
              .replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Ngàn VND  {/* Add dots as thousands separator */}
          </div>
        </div>

        {hasSelectedItems && (
           <div className="flex justify-center sm:justify-end mt-4">
            <button
              className="bg-lime-500 text-white px-4 py-2 rounded text-sm sm:text-base"
              onClick={() => setShowCustomerDetails(true)}
            >
              Mua Hàng
            </button>
          </div>
        )}
        </div>
      )}

      {/* Second Section: Customer Details */}
      {showCustomerDetails && (
        <div className="bg-white mt-4 p-4 rounded shadow">
          <div>
            Thông tin khách hàng: <br />
            Số điện thoại: {customer.phone} <br />
            Địa chỉ: {customer.address} <br />
            Hạng khách hàng: {customer.role} <br />
          </div>

          <div className="flex items-center justify-between mt-4">
          <div className="font-semibold">
            Tổng thanh toán ({cartItems.filter(item => checkedItems[item.id]).length} Sản phẩm):
          </div>
          <div className="text-red-500 font-semibold">
            {calculateCartTotal(cartItems, checkedItems)
              .toFixed(2)  // Ensure two decimal places
              .replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Ngàn VND  {/* Add dots as thousands separator */}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="font-semibold">Giảm giá dựa trên Hạng khách hàng:</div>
          <div className="text-red-500 font-semibold">
            {(() => {
              const cartTotal = calculateCartTotal(cartItems, checkedItems); // Calculate total for checked items
              const discountAmount = calculateDiscount(cartTotal, 0, customer); // Pass 0 for delivery fee
              return discountAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Format with dots
            })()}Ngàn VND
          </div>
        </div>
          {distance && (
            <div className="flex justify-between items-center">
              <h2 className="mr-4">Khoảng cách: {distance.toFixed(2)} km</h2>
              {distance > 3 ? (
                <div className="text-red-500 font-semibold br-2">
                  Phí vận chuyển: {((distance - 3) * 6.00).toFixed(2)} Ngàn VND
                </div>
              ) : (
                <div className="text-green-500 font-semibold br-2">
                  Miễn phí giao hàng
                </div>
              )}
            </div>
          )}
  <div>
    {/* Lựa chọn phương thức thanh toán */}
    <div className="flex items-center space-x-4 p-4">
      {/* Label bên trái */}
      <div className="font-medium text-gray-700">Phương thức thanh toán:</div>

      {/* Các nút thanh toán */}
      <div className="flex space-x-2">
        {data.map((pay) => (
          <button
            key={pay.id}
            onClick={() => handlePaymentSelect(pay.id)}
            className={`px-4 py-2 border rounded-lg transition-colors duration-300 ${
              selectedPayment === pay.id
                ? 'border-red-500 text-red-500'  // Khi được chọn
                : 'border-gray-300 text-gray-700'  // Khi chưa được chọn
            }`}
          >
            {pay.description}
          </button>
        ))}
      </div>
    </div>

          {/* Hiển thị tổng tiền */}
          <div className="flex items-center justify-between mt-4">
            <div className="font-semibold">Tổng tiền:</div>
            <div className="text-red-500 font-semibold">
              {calculateFinalTotalAmount()} Ngàn VND
            </div>
          </div>
          {/* Nút đặt hàng chỉ hiện nếu đã chọn phương thức thanh toán */}
          {selectedPayment && (
            <div className="flex items-center justify-between mt-4">
            <button 
              className="bg-lime-500 text-white px-4 py-2 rounded" 
              onClick={handleSubmit}
            >
              Đặt hàng
            </button>
          </div>
          )}
        </div>
        <div>
    </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
};

export default ProductList;
