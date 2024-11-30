
import { useParams } from 'react-router-dom'; // Import useParams to access route parameters
import { getProductById, getListNewCourses2, addProductDetaillToCarts, addProductDetaillToCart, getCmtProduct, getcountcmtStart } from '../../api/post/post.api'; // Import your API call
import { toast } from 'react-toastify'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { Pagination } from '@mui/material'
import { styled } from '@mui/system'
import { DataListCourse, ListCourseParams } from '../../api/post/post.interface'
import { getFromLocalStorage } from '../../utils/functions'
import { useNavigate } from 'react-router-dom'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import HomeCourseCard from '../home/HomeCourseCard'
import 'react-tabs/style/react-tabs.css'
import { ShowButtonTopContext, DivRefContext } from '../../containers/layouts/default'
import { useMediaQuery } from 'react-responsive'

interface ParamsList extends ListCourseParams {
    page: number
    search: string
    minPrice?: number
    maxPrice?: number
    category: string
    startDate?: Date
    endDate?: Date
  }
  const defaultParams: ParamsList = {
    page: 1,
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    category: 'all'
  }

const ProductDetail = () => {
    const isSmallScreen = useMediaQuery({ maxWidth: 767 })
    const CustomPagination = styled(Pagination)({
      '.MuiPagination-ul': {
        display: 'inline-flex',
        fontSize: 'large',
        listStyle: 'none',
        margin: '10px',
        '@media (max-width: 600px)': {
          margin: '5px'
        }
      },
      '.MuiPaginationItem-root': {
        fontSize: 'large',
        fontWeight: 'bold',
        borderRadius: '4px',
        margin: '2px',
        border: '1px solid #cbd5e0',
        backgroundColor: 'white',
        color: '#718096',
        '&:hover': {
          backgroundColor: '#667eea',
          color: 'white'
        },
        '@media (max-width: 600px)': {
          margin: '0px'
        }
      },
      '.MuiPaginationItem-firstLast': {
        borderRadius: '4px'
      },
      '.MuiPaginationItem-previousNext': {
        borderRadius: '4px',
        margin: '10px',
        '@media (min-width: 600px)': {
          margin: '20px'
        },
        '@media (max-width: 600px)': {
          fontSize: 'medium',
          margin: '0px'
        }
      },
      '.MuiPaginationItem-page.Mui-selected': {
        color: '#667eea',
        fontWeight: 'bold',
        border: '2px solid #667eea',
        '&:hover': {
          backgroundColor: '#667eea',
          color: 'white'
        }
      },
      '.MuiPaginationItem-ellipsis': {
        color: '#a0aec0',
        border: '1px solid #cbd5e0',
        backgroundColor: 'white',
        padding: '2px',
        margin: '0',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    })
    const divRef = useContext(DivRefContext)
    const { showButtonTop, setShowButtonTop } = useContext(ShowButtonTopContext)
    const [dataStateNew, setDataStateNew] = useState<DataListCourse | undefined>(
      undefined
    )
    const [newCurrentPage, setNewCurrentPage] = useState(1)
    const [isNewLoading, setIsNewLoading] = useState<boolean>(false)
    const [isNewAllLoading, setIsNewAllLoading] = useState<boolean>(false)
    const [pageNew, setPageNew] = useState<number>(1)
    const [isNewViewAll, setIsNewViewAll] = useState<boolean>(false)
    const navigate = useNavigate()
    const { id } = useParams(); // Get the id from the URL
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); // Manage quantity state
    const [comments, setComments] = useState([]);
    const [averageStars, setAverageStars] = useState(''); // Default placeholder value
    const [commentFrequency, setCommentFrequency] = useState(0); // Default placeholder value
    const [showMore, setShowMore] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

    useEffect(() => {
      const fetchComments = async () => {
        try {
          const response = await getCmtProduct(id); // Pass id to the API function
          // console.log('check đánh giá sản phẩm', response.data)
          setComments(response.data); // Assuming response data is directly the comments array
        } catch (error) {
          console.error('Error fetching comments:', error);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) fetchComments();
    }, [id]);
    // hiển thị nội dung đánh giá
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseData = await getProductById({ id }); // Use id from URL
                setCourse(courseData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
      }, [id]); // The effect depends on the id
      // hiển thị số cmt và sao
      useEffect(() => {
        const fetchCommentStats = async () => {
          try {
            const response = await getcountcmtStart(id); // Use id from URL params
            console.log('checkkkkkkkk soos sao va binh luan', response.data);
            
            setAverageStars(response.data.averageStars);
            setCommentFrequency(response.data.commentFrequency);
          } catch (error) {
            console.error('Error fetching comment stats:', error);
          }
        };
    
        if (id) {
          fetchCommentStats();
        }
      }, [id]);
      useEffect(() => {
        if (course) {
            // Call fetchMoreNewCourses with categoryCourseId from course data
            fetchMoreNewCourses(course.data.categoryCourseId);
        }
    }, [course]); // This effect runs whenever the course changes
    const fetchMoreNewCourses = async (categoryCourseId: string) => {
      try {
        setIsNewLoading(true);
    
        // Gọi API chỉ một lần để lấy toàn bộ dữ liệu
        const newData = await getListNewCourses2({
          categoryCourseId
        });
    
        // console.log('Dữ liệu mới:', newData);
    
        // Sau khi nhận dữ liệu từ API, lưu tất cả vào state mà không cần phân trang
        setDataStateNew(newData.data);
        setIsNewLoading(false);
    
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        setIsNewLoading(false);
      }
    };    
    const handlePurchaseClick = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering course click
    
      // Get the customer ID from local storage
      const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
    
      // Define the payload for adding the product to the cart
      const productData = {
        productId: Number(id), // Ensure id is a number
        custumerId: currentUserID,
        quantity: quantity, // Use the quantity from the input
      };
    
      try {
        // Call the API to add product to cart (or update if exists)
        const response = await addProductDetaillToCarts(productData);
    
        // Show a success toast notification to the user
        toast.success('Đã thêm sản phẩm vào giỏ hàng', {
          position: toast.POSITION.TOP_RIGHT,
        });
    
        console.log('Product added to cart:', productData);
        navigate('/cart');
        
      } catch (error) {
        if (error.response && error.response.status === 409) { // Check for conflict (product already in cart)
          // If product is already in the cart, increment the quantity by the input quantity
          const existingCartItem = error.response.data;
    
          // Call an API to update the cart with the new quantity
          const updatedCartItem = {
            ...existingCartItem,
            quantity: existingCartItem.quantity + quantity, // Increment quantity by input value
          };
    
          await addProductDetaillToCarts(updatedCartItem); // Make an API call to update quantity
    
          // Show a success toast notification for quantity increment
          toast.info('Cập nhật số lượng', {
            position: toast.POSITION.TOP_RIGHT,
          });
    
          console.log('Product quantity updated:', updatedCartItem);
          
        } else {
          // Handle other errors
          toast.error('Không thể cập nhật giỏ hàng', {
            position: toast.POSITION.TOP_RIGHT,
          });
          console.error('Failed to add product to cart:', error);
        }
      }
    };
    const handleCartClick = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering course click
    
      // Get the customer ID from local storage
      const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
    
      // Define the payload for adding the product to the cart
      const productData = {
        productId: Number(id), // Ensure id is a number
        custumerId: currentUserID,
        quantity: quantity, // Use the quantity from the input
      };
    
      try {
        // Call the API to add product to cart (or update if exists)
        const response = await addProductDetaillToCart(productData);
    
        // Show a success toast notification to the user
        toast.success('Đã thêm sản phẩm vào giỏ hàng', {
          position: toast.POSITION.TOP_RIGHT,
        });
    
        console.log('Product added to cart:', productData);
        // navigate('/cart');
        
      } catch (error) {
        if (error.response && error.response.status === 409) { // Check for conflict (product already in cart)
          // If product is already in the cart, increment the quantity by the input quantity
          const existingCartItem = error.response.data;
    
          // Call an API to update the cart with the new quantity
          const updatedCartItem = {
            ...existingCartItem,
            quantity: existingCartItem.quantity + quantity, // Increment quantity by input value
          };
    
          await addProductDetaillToCart(updatedCartItem); // Make an API call to update quantity
    
          // Show a success toast notification for quantity increment
          toast.info('Đã cập nhật số lượng sản phẩm trong giỏ hàng!', {
            position: toast.POSITION.TOP_RIGHT,
          });
    
          console.log('Product quantity updated:', updatedCartItem);
          
        } else {
          // Handle other errors
          toast.error('Không thể cập nhật giỏ hàng', {
            position: toast.POSITION.TOP_RIGHT,
          });
          console.error('Failed to add product to cart:', error);
        }
      }
    };
    const toggleShowAllComments = () => setShowAllComments((prev) => !prev);

    // Adjust the number of comments to show initially here
    const commentsToShow = showAllComments ? comments : comments.slice(0, 2);
    
      // KHONG DUNG LS
      const getDataNewCourse = async (params?: ParamsList, categoryCourseId?: string) => {
        try {
          const listCourseResponse = await getListNewCourses2({
            categoryCourseId, // Pass categoryCourseId here
            params
          });
      
          console.log('check 4444444:', listCourseResponse.data);
      
          if (!listCourseResponse.data) {
            setDataStateNew(undefined);
            console.log('No data found.');
          } else {
            setDataStateNew(listCourseResponse?.data);
            setPageNew(params?.page ?? 1);
          }
        } catch (e) {
          console.error('Error fetching new courses:', e);
        }
      };
      
      useEffect(() => {
        // Gọi API để lấy toàn bộ dữ liệu khi component được render
        fetchMoreNewCourses('all');
      }, []);
      
      const handleChangePaginationNew = (value: number) => {
        getDataNewCourse({ ...defaultParams, page: value })
      }
    
      const totalPageNew = useMemo(() => {
        const size = (dataStateNew != null) ? dataStateNew.size : 5
        const totalRecord = (dataStateNew != null) ? dataStateNew.totalRecords : 5
        return Math.ceil(totalRecord / size)
      }, [dataStateNew])
    //   useEffect(() => {
    //     fetchData()
    //   }, [])
      const moveToTop = () => {
        if (divRef && divRef.current) {
          divRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    const handleDecrement = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1)); // Ensure quantity doesn't go below 1
    };

    const handleIncrement = () => {
        if (quantity < course.data.Inventory_quantity) {
            setQuantity((prev) => prev + 1); // Increment quantity
        } else {
            toast.error(`Số lượng không thể lớn hơn ${course.data.Inventory_quantity}`);
        }
    };
    
    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > course.data.Inventory_quantity) {
            toast.error(`Số lượng không thể lớn hơn ${course.data.Inventory_quantity}`);
        }
        setQuantity(value > 0 ? value : 1); // Ensure positive values
    };
    // hiển thị phần sao/5
    const renderStars = () => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        // Full star if index is less than integer part of averageStars
        const fill = i <= Math.floor(averageStars) ? "#FFA500" 
                      // Partial star if it's the next star with fractional part
                      : i === Math.ceil(averageStars) ? `url(#partialFill)`
                      : "none";
    
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
                <stop offset="33%" stopColor="#FFA500" />
                <stop offset="33%" stopColor="white" /> {/* Change 'none' to 'white' */}
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
        <div className="w-4/5 mx-auto flex flex-col mt-5 mb-2 bg-bluishGray border-2 ">
        {course ? (
           <div className="w-full flex flex-col md:flex-row mt-1 space-y-4 md:space-y-0">
           {/* Image tag for Location Path */}
           <div className="w-full md:w-1/3">
             <img 
               src={course.data.locationPath ? `../../../assets/images/uploads/product/${course.data.locationPath}` : 'https://picsum.photos/200/300'} 
               alt={course.data.name} 
               className="w-full object-cover rounded-md"
             />
           </div>
           {/* Course details */}
           <div className="w-full md:w-2/3 pl-4 md:pl-6 space-y-4">
             <p className="text-xl md:text-2xl font-bold">{course.data.name}</p>
             <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:items-center md:space-x-4">
               <div className="text-base md:text-xl flex items-center space-x-1">
                 <div className="flex">{renderStars()}</div>
                 <span className="ml-2">{commentFrequency} Đánh giá</span>
               </div>
             </div>
             <p className="text-sm md:text-base">
               <strong>Danh mục sản phẩm:</strong> {course.data.categoryCourseName}
             </p>
         
             {/* Price and Discount logic */}
             <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
               <p>
                 <strong className="text-lg md:text-xl">Giá: </strong>
                 <span className={`${course.data.Discount > 0 ? 'line-through' : ''} text-red-600 text-lg md:text-xl`}>
                   {course.data.price} Ngàn VND
                 </span>
               </p>
               {course.data.Discount > 0 && (
                 <p className="text-red-600 text-lg md:text-xl">
                   {course.data.Discount} Ngàn VND
                 </p>
               )}
             </div>
         
             {/* Shipping Information */}
             <div className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
               </svg>
               <span className="text-lg md:text-xl">Miễn phí vận chuyển: Dưới 3km</span>
             </div>
         
             {/* Product Description */}
             <div>
               <p className="text-lg md:text-xl font-bold">Thông tin sản phẩm</p>
               <p>
                 {course.data.description
                   .split(';;')
                   .filter(sentence => sentence.trim() !== '') // Filter out empty sentences
                   .map((sentence, index) => (
                     <span key={index} className="flex items-start space-x-2">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#FFA500" className="w-5 h-5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                       </svg>
                       <span>{sentence.trim()}</span>
                     </span>
                   ))}
               </p>
             </div>
         
             {/* Quantity Selector */}
             <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
               <div className="flex items-center border rounded-md">
                 <button 
                   className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded-l-md"
                   onClick={handleDecrement}
                 >
                   -
                 </button>
                 <input 
                   type="number" 
                   className="w-16 text-center border-l border-r outline-none" 
                   min="1" 
                   value={quantity}
                   onChange={handleInputChange}
                 />
                 <button 
                   className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded-r-md"
                   onClick={handleIncrement}
                 >
                   +
                 </button>
               </div>
               <p><strong>{course.data.Inventory_quantity}</strong> sản phẩm có sẵn</p>
             </div>
         
             {/* Action Buttons */}
             <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
               <button
                 className="font-bold py-2 rounded-md text-center px-6 bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center"
                 onClick={handleCartClick}
               >
                 Thêm vào giỏ hàng
               </button>
               <button
                 className="font-bold py-2 rounded-md text-center px-6 bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center"
                 onClick={handlePurchaseClick}
               >
                 Mua ngay
               </button>
             </div>
           </div>
         </div>
         
            

        ) : (
            <p>Chưa thể tìm thấy thông tin của sản phẩm</p>
        )}
        <div>
        <div>
        <div className='w-full mx-auto pt-5 mr-5'> CÁC SẢN PHẨM TƯƠNG TỰ
          <div className="mt-8">
            {/* <div className='-ml-5 text-purple-700 font-bold'>{('Sản phẩm dành cho bạn')}</div> */}
            <div className="grid grid-cols-12 gap-6 bg-yellow-100">
              {dataStateNew?.data?.length
                ? (
                    dataStateNew?.data.map((item, index) => (
                    <HomeCourseCard
                      name={item.name}
                      key={index}
                      price={item.price}
                      Discount={item.Discount}
                      id={item.id}
                      category={item.categoryCourseName}
                      // categoryid={item.categoryCourseId}
                      locationPath={item.locationPath}
                    />
                    ))
                  )
                : (
                  <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{('Không tìm thấy sản phẩm')}</div>
                  )}
            </div>
            {(isNewViewAll || isSmallScreen) && (
              <div className='flex justify-center mt-10'>
                <CustomPagination
                  count={totalPageNew}
                  page={pageNew}
                  onChange={(_, page) => handleChangePaginationNew(page)}
                  boundaryCount={1}
                  siblingCount={1}
                />
              </div>
            )}
            <button
              className={`rounded-full fixed bottom-3 right-8 z-50 text-lg border-none outline-none bg-yellow-500 hover:bg-yellow-700 text-white cursor-pointer p-4 transition-colors duration-500 ${showButtonTop ? '' : 'hidden'}`}
              onClick={moveToTop}
            ><KeyboardArrowUpIcon style={{ fill: 'rgba(0, 0, 0, 1)', stroke: 'black', strokeWidth: 5 }} />
            </button>
          </div>
        </div>
      </div>
    <div>
      <h1 className="text-2xl font-bold mb-4 mt-5">ĐÁNH GIÁ SẢN PHẨM</h1>
      <div className="flex items-center mb-4">
        <div className="text-xl flex items-center space-x-1">
          <span>{(Number(averageStars) || 0).toFixed(2)} trên 5</span>
          <div className="flex">{renderStars()}</div>
        </div>
          <div className="ml-2 text-red-500">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star-half-alt"></i>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
        {/* Display commentFrequency */}
        <button className="px-4 py-2 bg-gray-100 text-gray-500 border border-gray-300 rounded">
          Có Bình Luận ({commentFrequency})
        </button>
      </div>

      <div className="border-t border-gray-300 pt-4">
        {commentsToShow.map((comment) =>
          comment.ComentProducts.map((comentProduct) => (
            <div key={comentProduct.id} className="flex items-start mb-4">
              <img
                src="https://storage.googleapis.com/a1aa/image/fefvILVimiWfelIMHPEf5uh1km1gReJkpbx3C91HXVlNsGn1JA.jpg"
                alt="User avatar"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <div className="flex items-center mb-2">
                  <div className="font-bold">{comment.Email}</div>
                  <div className="ml-2 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        fill={star <= parseInt(comentProduct.number_star) ? "#FFA500" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 cursor-pointer"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  {comentProduct.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {comments.length > 2 && (
        <button
          onClick={toggleShowAllComments}
          className="text-blue-500 underline mt-4"
    
    >
          {showAllComments ? 'Ẩn bớt' : 'Xem thêm'}
        </button>
      )}
    </div>

    </div>
  </div>

    );
};

export default ProductDetail;
