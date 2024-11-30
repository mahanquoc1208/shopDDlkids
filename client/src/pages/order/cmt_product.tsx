import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetail, fetchCustomerById, addCmtProduct, updateordersuccess } from '../../api/post/post.api';
import { toast } from 'react-toastify';

const ProductTable = () => {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [, setError] = useState<string | null>(null);
  const [, setLoading] = useState(true);
  const [selectedStars, setSelectedStars] = useState({});
  const [productComments, setProductComments] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetail(id);
        setOrderDetails(response.data.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
        if (!currentUserID) {
          throw new Error('User ID not found');
        }

        const response = await fetchCustomerById(currentUserID);
        if (!response.data) {
          throw new Error('Invalid API response format');
        }

        setCustomer(response.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update star selection without calling the API
  const handleStarClick = (orderDetailID, star) => {
    const commentContent = productComments[orderDetailID] || '';

    if (!commentContent) {
      toast.error('Vui lòng nhập bình luận trước khi chọn đánh giá sao.');
      return;
    }

    setSelectedStars((prev) => ({ ...prev, [orderDetailID]: star }));
  };

  // Submit comments and ratings when the button is clicked
  const handleCommentsSubmit = async () => {
    let hasError = false;
    let hasRating = false;
  
    for (const orderDetailID in productComments) {
      const commentContent = productComments[orderDetailID] || '';
      const number_star = selectedStars[orderDetailID] || 0;
  
      // Check if the user has given a star rating
      if (number_star > 0) {
        hasRating = true;
  
        // If there is a rating but no comment, prompt the user to enter a comment
        if (!commentContent) {
          toast.error('Vui lòng nhập bình luận trước khi gửi đánh giá.');
          return; // Stop execution if comment is missing
        }
      }
  
      // Proceed with submitting feedback if the comment content is not empty
      if (commentContent) {
        const cartData = {
          orderDetailId: orderDetailID,
          content: commentContent,
          number_star: number_star,
        };
  
        try {
          const response = await addCmtProduct(cartData);
          console.log(`Feedback for order detail ${orderDetailID} submitted successfully:`, response.data);
        } catch (error) {
          console.error(`Error submitting feedback for order detail ${orderDetailID}:`, error);
          hasError = true;
        }
      }
    }
  
    // If no ratings have been given, prompt the user
    if (!hasRating) {
      toast.error('Vui lòng đánh giá sao');
      return;
    }
  
    // Handle potential errors
    if (hasError) {
      toast.error('Lỗi không thể đánh giá');
    } else {
      try {
        // Call update order success status
        await updateordersuccess(id);  // `id` is taken from `useParams()`
        toast.success('Đánh giá đơn hàng thành công');
        setTimeout(() => {
          window.location.href = `/order`;
        }, 1000);
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error('Lỗi khi cập nhật trạng thái đơn hàng');
      }
    }
  };
  

  const handleCommentChange = (orderDetailID, comment) => {
    setProductComments((prev) => {
      const newComments = { ...prev, [orderDetailID]: comment };
      console.log(`Comment for order detail ${orderDetailID}:`, newComments[orderDetailID]);
      console.log('Updated productComments:', newComments);
      return newComments;
    });
  };
  
  const formatPrice = (price) => {
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
    return formattedPrice.replace(/,([^,]*)$/, '.$1') + 'Ngàn VND';
  };

  if (!orderDetails) {
    return <p>Loading...</p>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Đánh giá đơn hàng: {orderDetails.name}</h2>
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
            <React.Fragment key={item.id}>
              <tr className="border-b">
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
                  <input className="w-12 text-center border-t border-b" type="text" value={item.quantity} readOnly />
                </td>
                <td className="py-2 px-4 text-red-500">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>

              <tr>
                <td colSpan="4" className="py-2 px-4">
                  <div className="lg:flex md:flex">
                    <div className="md:w-1/2 ml-5 mr-5 flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          fill={star <= (selectedStars[item.id] || 0) ? "#FFA500" : "none"}
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 cursor-pointer"
                          onClick={() => handleStarClick(item.id, star)} // Just update the stars
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      ))} 
                    </div>

                    <div className="md:w-1/2 ml-5 mr-5">
                      <label className="sr-only">Ý kiến của bạn:</label>
                      <input
                        className="border rounded w-full p-2"
                        placeholder="Nhận xét của bạn về sản phẩm ..."
                        value={productComments[item.id] || ''}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)} // Only updates state
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleCommentsSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Gửi đánh giá
          
        </button>
      </div>
    </div>
  );
};

export default ProductTable;
