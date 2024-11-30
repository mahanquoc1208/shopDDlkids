import React, { ReactElement, useEffect, useState, useMemo } from 'react';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import { addProductToCart, addProductToCarts, getcountcmtStart } from '../../../api/post/post.api';
import { toast } from 'react-toastify';

interface Props {
  description?: string;
  id?: string;
  name?: string;
  summary?: string;
  assignedBy?: string;
  durationInMinute?: number;
  startDate?: Date;
  endDate?: Date;
  price?: number;
  Discount?: number;
  category?: string;
  locationPath?: string;
  createdAt?: Date;
  lessonCount?: number;
  isEnrolled?: boolean;
}

const HomeCourseCard = ({
  name,
  id,
  assignedBy,
  locationPath,
  price,
  Discount,
  isEnrolled = false,
}: Props): ReactElement => {
  const navigate = useNavigate();
  const [averageStars, setAverageStars] = useState<number | null>(null); // State for storing average rating

  // Memoized path for course details
  const courseDetailView = useMemo(() => `/products/${id}`, [id]);
  useEffect(() => {
    if (id) {
      // Fetch averageStars using the getcountcmtStart API
      const fetchRating = async () => {
        try {
          const response = await getcountcmtStart(id);
          setAverageStars(response.data.averageStars); // Set the fetched rating
          // console.log('giá trị của id:', id); // Log the value of id
          // console.log('giá trị của ngôi sao:', response.data.averageStars); // Log the averageStars
        } catch (error) {
          console.error('Failed to fetch average stars:', error);
        }
      };
      fetchRating();
    }
  }, [id]);
  
  const handleCourseClick = () => {
    navigate(courseDetailView, { state: { assignedBy } });
  };

  const handleCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);

    const productData = {
      productId: Number(id),
      custumerId: currentUserID,
      quantity: 1,
    };

    try {
      const response = await addProductToCart(productData);
      toast.success('Đã thêm sản phẩm vào giỏ hàng', { position: toast.POSITION.TOP_RIGHT });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        const existingCartItem = error.response.data;
        const updatedCartItem = { ...existingCartItem, quantity: existingCartItem.quantity + 1 };
        await addProductToCart(updatedCartItem);

        toast.info('Đã cập nhật số lượng sản phẩm trong giỏ hàng!', { position: toast.POSITION.TOP_RIGHT });
      } else {
        toast.error('Không thể cập nhật giỏ hàng', { position: toast.POSITION.TOP_RIGHT });
      }
    }
  };

  const handlePurchaseClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);

    const productData = {
      productId: Number(id),
      custumerId: currentUserID,
      quantity: 1,
    };

    try {
      const response = await addProductToCarts(productData);
      toast.success('Đã thêm sản phẩm vào giỏ hàng', { position: toast.POSITION.TOP_RIGHT });
      navigate('/cart');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        const existingCartItem = error.response.data;
        const updatedCartItem = { ...existingCartItem, quantity: existingCartItem.quantity + 1 };
        await addProductToCarts(updatedCartItem);

        toast.info('Product quantity updated in cart!', { position: toast.POSITION.TOP_RIGHT });
      } else {
        toast.error('Không thể cập nhật giỏ hàng', { position: toast.POSITION.TOP_RIGHT });
      }
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageStars); // Full stars (e.g., 4 for 4.5)
    const hasPartialStar = averageStars - fullStars > 0; // Check for a partial star
  
    for (let i = 1; i <= 5; i++) {
      let fill;
      if (i <= fullStars) {
        fill = "#FFA500"; // Full star color
      } else if (i === fullStars + 1 && hasPartialStar) {
        fill = `url(#partialFill)`; // Half-filled star
      } else {
        fill = "white"; // Empty star
      }
  
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 cursor-pointer"
        >
          <defs>
            <linearGradient id="partialFill">
              <stop offset="50%" stopColor="#FFA500" /> {/* 50% filled */}
              <stop offset="50%" stopColor="white" /> {/* Remaining 50% white */}
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
      );
    }
    return stars;
  };
  

  
  return (
    <div
      className="mt-4 cursor-pointer col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 ease-in-out"
      onClick={handleCourseClick}
    >
      <div className="flex flex-col h-full">
        <div className="w-full rounded-t-md h-40 overflow-hidden">
          <img
            className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110"
            src={locationPath ? `../../../assets/images/uploads/product/${locationPath}` : 'https://picsum.photos/200/300'}
            width="286"
            height="160"
            alt="CourseImage"
          />
        </div>
        <div className="grow flex flex-col p-5">
        <header className="mb-3">
          <h3 className="text-lg text-slate-800 font-semibold h-16">{name}</h3>
          {averageStars !== null && (
            <div className="text-yellow-500 flex items-center mt-2">
              {renderStars()} {/* Gọi hàm renderStars ở đây để hiển thị ngôi sao */}
            </div>
          )}
        </header>
          <ul className="text-sm space-y-2 mb-5">
            <li className="flex items-center">
              <div>
                {Discount > 0 ? (
                  <>
                    <span className="text-green-500 line-through">Giá: </span>
                    <span className="line-through">{price}</span> {t('Ngàn VND')}
                  </>
                ) : (
                  <>
                    <span className="text-green-500">Giá: </span>
                    <span>{price}</span> {t('Ngàn VND')}
                  </>
                )}
              </div>
            </li>
            {Discount > 0 && (
              <li className="flex items-center">
                <div>
                  <span className="text-green-500">Giảm giá:</span> {Discount} {t(' Ngàn VND')}
                </div>
              </li>
            )}
          </ul>
          <div className="items-center flex gap-4">
            <button
              className="font-bold py-1 rounded-md items-center text-center px-5 bg-yellow-500 hover:bg-yellow-600 text-white flex justify-center"
              onClick={handleCartClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
            </button>

            <button
              className="w-full font-bold py-1 rounded-md items-center text-center px-5 bg-yellow-500 hover:bg-yellow-600 text-white flex justify-center"
              onClick={handlePurchaseClick}
            >
              {isEnrolled ? t('course.continue') : 'Mua ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCourseCard;
