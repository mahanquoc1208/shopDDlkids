/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: HOMEPAGE
   ========================================================================== */

// TODO: remove later
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { Pagination } from '@mui/material'
import { styled } from '@mui/system'
import { DataListCourse, ListCourseParams } from '../../api/post/post.interface'
import { getListCourses, getCategoryCourseData, getListNewCourses, reViewShop } from '../../api/post/post.api'
import { getFromLocalStorage } from '../../utils/functions'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
// import MenuIcon from '@mui/icons-material/Menu'
import FilterListIcon from '@mui/icons-material/FilterList'
import HomeCourseCard from '../home/HomeCourseCard'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import SlideBar from '../home/Slide'
import { toast } from 'react-toastify'
import { PacmanLoader } from 'react-spinners'
import { ShowButtonTopContext, DivRefContext } from '../../containers/layouts/default'
import { useMediaQuery } from 'react-responsive'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faComment } from '@fortawesome/free-solid-svg-icons';
import { getchatbot, addcontentcustumer, getChatMessages } from '../../api/post/post.api';
// hiển thị model
import ModalComponent from '../../components/Modal/index2'

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

const HomePage = () => {
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
  const targetDivRef = useRef<HTMLDivElement>(null)
  const { showButtonTop, setShowButtonTop } = useContext(ShowButtonTopContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [dataCategory, setDataCategory] = useState<any>(null)
  const [categorySearch, setCategorySearch] = useState('all')
  const [search, setSearch] = useState<string>('')
  const [pagePaid, setPagePaid] = useState<number>(1)
  const [pageFree, setPageFree] = useState<number>(1)
  const [page, setPage] = useState<number>(1)
  const [isPressed, setIsPressed] = useState(false)
  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  //chat
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
  const scrollRef = useRef(null);
  const pollingInterval = useRef(null); // Sử dụng để lưu trữ interval cho polling
  //model
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [numberStar, setNumberStar] = useState(0); // Lưu số sao người dùng chọn
  const customerID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);

  const [dataStatePaid, setDataStatePaid] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateFree, setDataStateFree] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateNew, setDataStateNew] = useState<DataListCourse | undefined>(
    undefined
  )
  const [newCurrentPage, setNewCurrentPage] = useState(1)
  const [isNewLoading, setIsNewLoading] = useState<boolean>(false)
  const [isNewAllLoading, setIsNewAllLoading] = useState<boolean>(false)
  const [pageNew, setPageNew] = useState<number>(1)
  const [isNewViewAll, setIsNewViewAll] = useState<boolean>(false)
  const [pageMoreNew, setPageMoreNew] = useState<number>(1)

  const [dataState, setDataState] = useState<DataListCourse | undefined>(
    undefined
  )
  const [displayGrid, setDisplayGrid] = useState<boolean>(true)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handlePress = () => {
    setIsPressed(!isPressed)
  }
  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(event.target.value ? parseFloat(event.target.value) : '')
  }
  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(event.target.value ? parseFloat(event.target.value) : '')
  }
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setIsPressed(false)
    setIsLoading(true)
    if (currentTab === 0) {
      getDataCourse({ page: 1, search, minPrice: minPrice === '' ? undefined : minPrice, maxPrice: maxPrice === '' ? undefined : maxPrice, category: categorySearch })
    }
    setDisplayGrid(false)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }
  useEffect(() => {
    getDataCourse({ page: 1, search, minPrice: minPrice === '' ? undefined : minPrice, maxPrice: maxPrice === '' ? undefined : maxPrice, category: categorySearch })
    getDataNewCourse({ page: 1, search: '', category: 'all' })
  }, [currentTab])
  // model 
  useEffect(() => {
    const orderSuccess = localStorage.getItem('orderSuccess');
    if (orderSuccess === 'true') {
      setIsModalOpen(true); // Hiển thị modal
      localStorage.removeItem('orderSuccess'); // Xóa trạng thái để modal chỉ hiển thị một lần
    }
  }, []);
  // gọi khi nhấn ok hiện model
  const handleOk = async (numberStar: number) => {
    try {
      // Log giá trị được truyền vào API
      console.log('Số sao:', numberStar);
      console.log('Customer ID:', customerID);
  
      // Gọi API với number_star và customerID
      await reViewShop(customerID, numberStar);
  
      console.log('Đánh giá thành công');
      toast.success('Cảm ơn khách hàng đã đánh giá cửa hàng!')
      
      setIsModalOpen(false); // Đóng modal
    } catch (error) {
      console.error('Lỗi khi đánh giá:', error);
    }
  };
  const fetchMoreNewCourses = async () => {
    try {
      setIsNewLoading(true)
      const nextPage = newCurrentPage + 1
      console.log('trang dang tim:', nextPage)
      const newData = await getListNewCourses({ params: { page: nextPage } })
      console.log(newCurrentPage, 'hein tai')
      console.log('newData:', newData)
      setTimeout(() => {
        if (!isNewViewAll) {
          setIsNewViewAll(false)
          setDataStateNew({
            ...newData.data,
            data: [...(dataStateNew?.data ?? []), ...newData.data.data]
          })

          setNewCurrentPage(nextPage)
          console.log('set lai trang:', newCurrentPage)
          setIsNewLoading(false)
        } else {
          setIsNewViewAll(false)
          setDataStateNew(newData.data)
          setNewCurrentPage(nextPage)
          console.log('set lai trang:', newCurrentPage)
          setIsNewLoading(false)
        }
      }, 500)
    } catch (error) {
      console.error('Error fetching more courses:', error)
    }
  }
  const fetchAllNewCourse = async () => {
    try {
      setIsNewAllLoading(true)
      setNewCurrentPage(0)
      setTimeout(() => {
        setIsNewViewAll(true)
        getDataNewCourse()
        setIsNewAllLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching all new courses:', error)
    }
  }
  // KHONG DUNG LS
const getDataNewCourse = async (params?: ParamsList) => {
  try {
    const listCourseResponse = await getListNewCourses({ params });
    
    // Log the response data
    console.log('listCourseResponse:', listCourseResponse.data);

    if (!listCourseResponse.data) {
      setDataStateNew(undefined);
      console.log('No data found.');
    } else {
      setDataStateNew(listCourseResponse?.data);
      setPageNew(params?.page ?? 1);
      // Log the new state
      console.log('Data set to state:', listCourseResponse.data);
      console.log('Current page:', params?.page ?? 1);
    }
  } catch (e) {
    console.error('Error fetching new courses:', e);
    const tokens = getFromLocalStorage<any>('tokens');
    
    if (tokens === null) {
      navigate('/login', {
        replace: true
      });
    }
  }
}

  useEffect(() => {
    getDataNewCourse({ page: 1, search: '', category: 'all' })
  }, [])
  const getDataCourse = async (params?: ParamsList) => {
    try {
      // Gọi API để lấy dữ liệu khóa học mới
      const listCourseResponse = await getListCourses({ params })
      // console.log('API Responseccccccccccccccc:', listCourseResponse.data)
      if (!listCourseResponse.data) {
        setDataState(undefined);
      } else {
        const fullData: DataListCourse = listCourseResponse?.data
        const data = {
          data: fullData.data.map(course => ({
            id: course.id,
            name: course.name,
            locationPath: course.locationPath,
            categoryCourseName: course.categoryCourseName,
            price: course.price,
            Discount: course.Discount,
            // enrollmentCount: course.enrollmentCount
          })),
          page: fullData.page,
          size: fullData.size,
          totalRecords: fullData.totalRecords
        };
        setDataState(data);
      }
      setPage(params?.page ?? 1)
    } catch (e) {
      console.error('Error fetching courses:')
      const tokens = getFromLocalStorage<any>('tokens')
      if (tokens === null) {
        navigate('/login', { replace: true })
      }
    }
  }  
  const handleChangePaginationNew = (value: number) => {
    getDataNewCourse({ ...defaultParams, page: value })
  }

  const totalPageNew = useMemo(() => {
    const size = (dataStateNew != null) ? dataStateNew.size : 5
    const totalRecord = (dataStateNew != null) ? dataStateNew.totalRecords : 5
    return Math.ceil(totalRecord / size)
  }, [dataStateNew])

  const handleChangePagination = (value: number) => {
    getDataCourse({ page: value, search, minPrice: minPrice === '' ? undefined : minPrice, maxPrice: maxPrice === '' ? undefined : maxPrice, category: categorySearch })
  }

  const totalPage = useMemo(() => {
    const size = (dataState != null) ? dataState.size : 5
    const totalRecord = (dataState != null) ? dataState.totalRecords : 5
    return Math.ceil(totalRecord / size)
  }, [dataState])

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategorySearch(event.target.value)
  }
  const fetchData = async () => {
    try {
      console.log('Đang fetch dữ liệu từ API...')
      const response = await getCategoryCourseData()
      // console.log('check api 4:', response.data)
      if (response.data) {
        setDataCategory(response.data)
      } else {
        setDataCategory(null)
      }
    } catch (error) {
      console.log('Lỗi khi fetch dữ liệu:', error)
      setDataCategory(null)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const categoryNames = dataCategory?.map((item: { name: any }) => item.name) ?? []

  const moveToTop = () => {
    if (divRef && divRef.current) {
      divRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const scrollToTargetDiv = () => {
    if (targetDivRef && targetDivRef.current) {
      targetDivRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }
// Chat
// Hàm lấy tin nhắn mới
const fetchMessages = () => {
  getchatbot(currentUserID)
    .then((response) => {
      const names = response.data.map((message) => message.name);
      const firstName = names.length > 0 ? names[0] : null;
      if (firstName) {
        return getChatMessages([firstName]);
      }
    })
    .then((response) => {
      if (response) {
        setMessages(response.data);
      }
    })
    .catch((error) => console.error('Failed to fetch messages:', error));
};

useEffect(() => {
  if (isChatOpen) {
    fetchMessages(); // Lấy tin nhắn ngay khi mở chat
    pollingInterval.current = setInterval(fetchMessages, 3000); // Polling mỗi 3 giây
  } else if (pollingInterval.current) {
    clearInterval(pollingInterval.current); // Ngừng polling khi đóng chat
  }
  return () => clearInterval(pollingInterval.current); // Xóa interval khi component bị unmount
}, [isChatOpen, currentUserID]);

useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}, [messages]);

const handleMessageChange = (e) => {
  setMessage(e.target.value);
};

const handleSendMessage = () => {
  if (message.trim()) {
    addcontentcustumer({
      custumerID: currentUserID,
      content: message,
    })
      .then(() => {
        setMessage('');
        fetchMessages(); // Gọi lại fetchMessages để cập nhật tin nhắn sau khi gửi
      })
      .catch((error) => console.error('Failed to send message:', error));
  }
};

const formatDateForDatetimeLocal = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const toggleChatBox = () => {
  setIsChatOpen(!isChatOpen);
};
  return (
    <div>
     <ModalComponent
        isOpen={isModalOpen}
        title="Đặt hàng thành công"
        description="Cảm ơn bạn đã đặt hàng! Vui lòng đánh giá shop DDKIDS chúng tôi nhé"
        onClose={() => {
          setIsModalOpen(false);
        }}
        onOk={handleOk} // Gọi handleOk khi nhấn OK
        onCancel={() => {
          setIsModalOpen(false);
        }}
        cancelText="Hủy" // Đổi nhãn nút "Cancel" thành "Hủy"
        okText="OK" // Nếu cần tùy chỉnh nhãn nút OK
      />

      <div>
        <div className='w-full mx-auto pb-12'>
          <div className='flex justify-between items-center border-y-2'>
            <div className='flex items-center w-full'>
              <form className="flex flex-col sm:flex-row justify-between items-center rounded-lg w-full space-x-0 sm:space-x-2 py-2 sm:py-0" onSubmit={handleSearch}>
                <div className='flex flex-col sm:flex-row items-center sm:space-x-0 px-2 space-x-0 w-full sm:w-5/12 md:w-1/2'>
                  <div className='flex sm:w-1/2 w-full space-x-2 items-center'>
                    <div className="h-11 sm:w-2/5 w-1/5 flex justify-center items-center rounded-md">
                      <img 
                        src={require('../../assets/footer/3.png')} 
                        alt="Filter Icon" 
                        className="h-8 w-8 object-contain" 
                      />
                    </div>
                    <select
                      className="h-10 p-2 text-gray-800 w-4/5 sm:w-3/5 outline-none cursor-pointer rounded-md border"
                      value={categorySearch}
                      onChange={handleCategoryChange}
                    >
                      <option value="all">{t('Danh mục sản phẩm')}</option>
                      {categoryNames.map((name: string, index: number) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex my-4 w-full sm:w-1/2 items-center justify-center sm:space-x-0 space-x-4">
                    <div className='font-bold md:hidden flex w-1/5 justify-end'>
                      <div className='sm:hidden flex'>Search</div>
                    </div>
                    <div className='w-4/5 flex border border-gray-300 rounded-md'>
                      <div className="p-2 bg-white border-r">
                        <SearchIcon className="" />
                      </div>
                      <input
                        className="py-2 px-4 outline-none w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('Tìm kiếm theo tên sản phẩm') ?? 'Defaultplaceholder'}
                      />
                    </div>
                  </div>
                </div>
                <div className='flex flex-col sm:flex-row items-center justify-between space-x-0 sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-7/12 md:w-1/2 px-2'>
                  <div className='flex items-center space-x-4 w-full sm:w-1/4 xl:w-1/3 justify-between'>
                    <div className='font-bold w-1/5 text-end justify-end flex sm:hidden md:flex'>{t('Từ')}</div>
                    <input
                      type='number'
                      className='w-full text-gray-700 border rounded-md p-2 bg-white'
                      value={minPrice === '' ? '' : minPrice}
                      onChange={handleMinPriceChange}
                      placeholder={('Từ Giá trị') as string}
                    />
                  </div>
                  <div className='flex items-center space-x-4 w-full sm:w-1/4 xl:w-1/3 justify-between'>
                    <div className='font-bold w-1/5 text-end justify-end flex sm:hidden md:flex'>{t('Đến')}</div>
                    <input
                      type='number'
                      className='w-full text-gray-700 border rounded-md p-2 bg-white'
                      value={maxPrice === '' ? '' : maxPrice}
                      onChange={handleMaxPriceChange}
                      placeholder={('Đến giá trị') as string}
                    />

                  </div>
                  <div className='flex items-center sm:w-auto'>
                    <button type='submit' className='bg-yellow-500 hover:bg-yellow-600 rounded-md font-bold px-7 sm:px-4 py-2 m-2 transition duration-200 ' onClick={handleSearch}>{t('Tìm')}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          {displayGrid && (
          <div className='w-full h-full flex flex-col sm:flex-row justify-center relative'>
          </div>
          )}
          {displayGrid && (
            <div className='w-full flex justify-center' id='learnerViewing' ref={targetDivRef}>
              <div className='w-4/5'>
                <p className='ml-5 font-bold text-2xl text-shadow-lg mt-14'></p>
                <SlideBar></SlideBar>
              </div>
            </div>
          )}
          {isLoading
            ? <div className="flex justify-center items-center w-full h-140 mt-20">
              <PacmanLoader
                className='flex justify-center items-center w-full mt-20'
                color='#5EEAD4'
                cssOverride={{
                  display: 'block',
                  margin: '0 auto',
                  borderColor: 'blue'
                }}
                loading
                margin={10}
                speedMultiplier={3}
                size={40}
              /></div>
            : <div className='w-4/5 mx-auto pt-5'>
              <Tabs selectedIndex={currentTab} onSelect={(index) => setCurrentTab(index)}>
                <TabPanel className="flex flex-col justify-between">
                  <div className='grid grid-cols-12 gap-6 mt-4'>
                    {dataState?.data?.length
                      ? (
                          dataState?.data.map((item, index) => (
                          <HomeCourseCard
                            name={item.name}
                            description={item.description}
                            assignedBy={item.assignedBy}
                            key={index}
                            summary={item.summary}
                            price={item.price}
                            Discount={item.Discount}
                            id={item.id}
                            startDate={new Date(item.startDate)}
                            endDate={new Date(item.endDate)}
                            category={item.categoryCourseName}
                            locationPath={item.locationPath}
                            // enrollmentCount={item.enrollmentCount}
                            createdAt={item.createdAt}
                            lessonCount={item.lessonCount}
                          />
                          ))
                        )
                      : (
                        <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{('Không tìm thấy sản phẩm')}</div>
                        )}
                  </div>
                  <div className='flex justify-center mt-10 md:mt-5 lg:mt-3'>
                    <CustomPagination
                      count={totalPage}
                      page={page}
                      onChange={(_, page) => handleChangePagination(page)}
                      boundaryCount={1}
                      siblingCount={1}
                    />
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          }
        </div>
        {/* {displayGrid && (
          <TopCategoryGrid/>
        )} */}
        <div className='w-4/5 mx-auto pt-5'>
          <div className="mt-8">
            <div className='-ml-5 text-yellow-600 font-bold'>{t('Sản phẩm dành cho bạn')}</div>
            <div className="grid grid-cols-12 gap-6">
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
                      locationPath={item.locationPath}
                      // enrollmentCount={item.enrollmentCount}
                    />
                    ))
                  )
                : (
                  <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('Không có sản phẩm')}</div>
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
            <div className='mt-8 lg:-ml-5 flex xl:w-1/6 md:w-2/5 w-full space-x-3 lg:space-x-5'>
              { }
              <button onClick={fetchMoreNewCourses} className='flex-1 py-1 px-2 bg-yellow-500 text-white rounded-md shadow-lg shadow-gray-500 sm:flex items-center justify-between hidden'>
                {isNewLoading
                  ? (
                    <>
                      <svg className="animate-spin h-4 fill-current shrink-0 w-1/4" viewBox="0 0 16 16">
                        <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                      </svg>
                      <span className='w-3/4 text-center'>Đang tải</span>
                    </>
                    )
                  : (
                    <div className='w-full'>
                      {t('Xem thêm')}
                    </div>
                    )}
              </button>
              <button onClick={fetchAllNewCourse} className='sm:flex hidden sm:w-auto w-4/5 flex-1 py-1 px-2 bg-white text-yellow-300 rounded-md border border-yellow-400 hover:bg-yellow-500 hover:text-white items-center justify-between'>
                {
                  isNewAllLoading
                    ? (
                      <>
                        <svg className="animate-spin h-4 fill-current shrink-0 w-1/4" viewBox="0 0 16 16">
                          <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                        </svg>
                        <span className='w-3/4 text-center'>Loading</span>
                      </>
                      )
                    : (
                      <div className='w-full'>
                        {t('Xem tất cả')} <ArrowForwardIcon fontSize='small' />
                      </div>
                      )
                }
              </button>
            </div>
          </div>
        </div>
        <button
          className={`rounded-full fixed bottom-3 right-8 z-50 text-lg border-none outline-none bg-yellow-500 hover:bg-yellow-700 text-white cursor-pointer p-4 transition-colors duration-500 ${showButtonTop ? '' : 'hidden'}`}
          onClick={moveToTop}
        >
          <KeyboardArrowUpIcon style={{ fill: 'rgba(0, 0, 0, 1)', stroke: 'black', strokeWidth: 5 }} />
        </button>

        <div>
        {!isChatOpen ? (
          <button
          className={`rounded-full fixed bottom-20 right-8 z-50 text-lg border-none outline-none bg-blue-500 hover:bg-blue-700 text-white cursor-pointer p-4 transition-colors duration-500 ${showButtonTop ? '' : 'hidden'}`}
          onClick={toggleChatBox}
          title="Hệ thống hỗ trợ khách hàng"
        >
          <ChatBubbleOutlineIcon icon={faComment} style={{ fill: 'rgba(0, 0, 0, 1)' }} />
        </button>
        
        ) : (
          // chat
          <div className="bg-white w-full max-w-sm h-[32rem] rounded-lg shadow-lg flex flex-col fixed bottom-0 right-0 mb-0 md:right-8 md:mb-20">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between rounded-t-lg">
              <div className="font-semibold text-sm md:text-base">Hệ thống hỗ trợ khách hàng</div>
              <FontAwesomeIcon icon={faTimes} className="cursor-pointer" onClick={toggleChatBox} />
            </div>

            {/* Chat Content */}
            <div ref={scrollRef} className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[20rem]">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.custumerID === currentUserID ? 'justify-end' : ''}`}>
                  <div 
                    className={`p-3 rounded-lg text-sm md:text-base w-4/5 ${
                      msg.custumerID === currentUserID 
                        ? 'bg-gray-100 ml-auto text-right' // Tin nhắn khách hàng căn bên phải
                        : 'bg-gray-200 mr-auto text-left'  // Tin nhắn shop căn bên trái
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDateForDatetimeLocal(msg.createdAt)}
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Input Section */}
            <div className="border-t p-4 flex items-center">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                className="flex-grow p-2 border rounded-lg text-sm md:text-base"
                placeholder="Nhập tin nhắn..."
              />
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="text-gray-500 ml-4 cursor-pointer"
                onClick={handleSendMessage}
              />
            </div>
          </div>

        )}
      </div>

        
      </div>
      
      
    </div>

  )
}
export default HomePage
