/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */
   import React, { useState, useEffect, useRef, useCallback } from 'react'
   import { NavLink, useLocation, useNavigate } from 'react-router-dom'
   import SidebarLinkGroup from './SidebarLinkGroup'
   import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
   import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined'
   import { getFromLocalStorage, removeLocalStorage } from 'utils/functions'
   import ROUTES from 'routes/constant'
   import { useTranslation } from 'react-i18next'
   import logoSorimachi from '../assets/footer/3.png'
   
   interface SidebarProps {
     sidebarOpen: boolean
     setSidebarOpen: (open: boolean) => void
   }
   
   const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
     const navigate = useNavigate()
     const { t } = useTranslation()
   
     const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
     useEffect(() => {
       const handleStorageChange = () => {
         setTokens(getFromLocalStorage<any>('tokens'))
       }
       window.addEventListener('storage', handleStorageChange)
       return () => {
         window.removeEventListener('storage', handleStorageChange)
       }
     }, [])
     const userRole = tokens?.roleDescription;
     const userFullname = tokens?.fullName;
     const userEmail = tokens?.roleDescription;
     
     // If you don't need to decrypt userRole, just use it as is
     let data: string | undefined;
     if (userRole) {
       data = userRole;  // No decryption needed
     }
     const isAdmin = userRole?.toUpperCase() === 'CHỦ CỬA HÀNG';
      const isManager = userRole?.toUpperCase() === 'QUẢN LÝ';
      const isDeliveryStaff = userRole?.toUpperCase() === 'NHÂN VIÊN VẬN CHUYỂN';
      const isOrderProcessor = userRole?.toUpperCase() === 'NHÂN VIÊN XỬ LÝ ĐƠN HÀNG';
        
   
     const location = useLocation()
     const { pathname } = location
    //  console.log('ccccccccccccccccccccccccccccccccccccccccccccc', pathname)
   
     const sidebar = useRef<HTMLDivElement>(null)
     const trigger = useRef<HTMLButtonElement>(null)
   
     const storedSidebarExpanded = localStorage.getItem('sidebar-expanded')
     const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true')
   
     // close on click outside
     useEffect(() => {
       const clickHandler = ({ target }: { target: EventTarget | null }) => {
         if (!sidebar.current || !trigger.current) return
         if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return
         setSidebarOpen(false)
       }
       document.addEventListener('click', clickHandler)
       return () => document.removeEventListener('click', clickHandler)
     })
   
     // close if the esc key is pressed
     useEffect(() => {
       const keyHandler = ({ keyCode }: { keyCode: number }) => {
         if (!sidebarOpen || keyCode !== 27) return
         setSidebarOpen(false)
       }
       document.addEventListener('keydown', keyHandler)
       return () => document.removeEventListener('keydown', keyHandler)
     })
   
     useEffect(() => {
       localStorage.setItem('sidebar-expanded', sidebarExpanded.toString())
       if (sidebarExpanded) {
         document.querySelector('body')?.classList.add('sidebar-expanded')
       } else {
         document.querySelector('body')?.classList.remove('sidebar-expanded')
       }
     }, [sidebarExpanded])
   
     const handleLogout = useCallback(() => {
      // Xóa toàn bộ localStorage
      localStorage.clear();
      console.log('LocalStorage sau khi xóa:', localStorage); // Kiểm tra dữ liệu đã bị xóa
    
      // Chuyển hướng người dùng đến trang login
      navigate(ROUTES.login);
    }, [navigate]);
    
    
    
   
     return (
       <div>
         {/* Sidebar backdrop (mobile only) */}
         <div
           className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
             }`}
           aria-hidden="true"
         ></div>
   
         {/* Sidebar */}
         <div
           id="sidebar"
           ref={sidebar}
           className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white shadow-right p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'
             }`}
         >
           {/* Sidebar header */}
           <div className="flex justify-between mb-10 pr-3 sm:px-2">
             {/* Close button */}
             <button
               ref={trigger}
               className="lg:hidden text-slate-500 hover:text-slate-400"
               onClick={() => setSidebarOpen(!sidebarOpen)}
               aria-controls="sidebar"
               aria-expanded={sidebarOpen}
             >
               <span className="sr-only">Close sidebar</span>
               <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
               </svg>
             </button>
             {/* Logo */}
             <NavLink end to="/" className="block">
             <div className="h-14 sm:w-full w-full flex justify-center items-center">
                <img 
                  src={logoSorimachi} 
                  alt="Logo Sorimachi" 
                  className="h-8 w-8 object-contain rounded-md shadow-lg" 
                />
              </div>
             </NavLink>
           </div>
   
           {/* Links */}
           <div className="space-y-8">
             {/* Pages group */}
             <div>
               <div>
                 <div className="flex items-center">
                   <div className="flex-shrink-0">
                     {/* <img className="rounded-full object-cover w-10 h-10" src={userAvatar} alt="User upload" /> */}
                   </div>
                   <div className="w-36 ml-4 flex flex-col justify-center lg:hidden lg:sidebar-expanded:block 2xl:block">
                      <p className='font-semibold text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>
                        {"Xin chào! "} {userFullname || ''}  {/* Display Xin chào before userFullname */}
                      </p>
                      <p className='text-gray-500 text-base font-mono overflow-hidden overflow-ellipsis whitespace-nowrap'>
                        {userEmail}
                      </p>
                    </div>


                 </div>
                 {/* <div className=" ml-1 text-gray-500 text-base font-mono">
                   <p>{data}</p>
                 </div> */}
               </div>
              
               <ul className="mt-3">
                 {/* danh mục sản phẩm */}
                 {(isAdmin || isManager) && (
                   <li
                    className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/categoryproduct' && 'bg-teal-300 text-blue-500'}`}
                  >
                    <NavLink
                      end
                      to="/categoryproduct"
                      className={`block ${pathname === '/categoryproduct' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/categoryproduct' && 'hover:text-slate-200'}`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#555555', stroke: 'white' }}>
                          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path>
                        </svg>
                        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          {'Danh mục sản phẩm'}
                        </span>
                      </div>
                    </NavLink>
                  </li>
                           
                  )}
  
                 {/* sản phẩm */}
                 {(isAdmin || isManager) && (
                    <li
                      className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.startsWith('/product') && 'bg-teal-300 text-blue-500'}`}
                    >
                      <NavLink
                        end
                        to="/product"
                        className={`block ${pathname.startsWith('/product') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.startsWith('/product') && 'hover:text-slate-200'}`}
                      >
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            style={{ fill: 'black' }}
                          >
                            <path
                              d="M4 20h2V10a1 1 0 0 1 1-1h12V7a1 1 0 0 0-1-1h-3.051c-.252-2.244-2.139-4-4.449-4S6.303 3.756 6.051 6H3a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2zm6.5-16c1.207 0 2.218.86 2.45 2h-4.9c.232-1.14 1.243-2 2.45-2z"
                              style={{ stroke: 'black', fill: 'white' }}
                            ></path>
                            <path
                              d="M21 11H9a1 1 0 0 0-1 1v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a1 1 0 0 0-1-1zm-6 7c-2.757 0-5-2.243-5-5h2c0 1.654 1.346 3 3 3s3-1.346 3-3h2c0 2.757-2.243 5-5 5z"
                              style={{ stroke: 'black', fill: 'white' }}
                            ></path>
                          </svg>
                          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            {'Sản phẩm'}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                  )}
                 {/* Chat */}
                 {(isAdmin || isManager || isOrderProcessor) && (
                <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('chat') && 'bg-teal-300 text-blue-500'}`}>
                  <NavLink
                    end
                    to="/chat"
                    className={`block ${pathname.includes('chat') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('course') && 'hover:text-slate-200'}`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        style={{ fill: '#555555' }}
                        className="shrink-0 h-6 w-6"
                      >
                        <path d="M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z"></path>
                        <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                      </svg>
                      <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        {'Hỗ trợ khách hàng'}
                      </span>
                    </div>
                  </NavLink>
                </li>
              )}
                 {/* Khách hàng */}
                 {(isAdmin || isManager) && (
                   <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('customer') && 'bg-teal-300 text-blue-500'}`}>
                   <NavLink
                     end
                     to="/customer"
                     className={`block ${pathname.includes('customer') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('customer') && 'hover:text-slate-200'}`}
                   >
                     <div className="flex items-center">
                       <svg
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke-width="1.5"
                         stroke="currentColor"
                         className="shrink-0 h-6 w-6"
                       >
                         <path
                           stroke-linecap="round"
                           stroke-linejoin="round"
                           d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                         />
                       </svg>
                       <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                         {t('Khách hàng')}
                       </span>
                     </div>
                   </NavLink>
                 </li>
 
                )}


                 {/* Nhân viên */}
                 {(isAdmin || isManager) && (
                <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('user') && 'bg-teal-300 text-blue-500'}`}>
                  <NavLink
                    end
                    to="/user"
                    className={`block ${pathname.includes('user') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('user') && 'hover:text-slate-200'}`}
                  >
                    <div className="flex items-center">
                      {/* Updated SVG icon with lighter color */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#777777' }}>
                        <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z" />
                      </svg>
                      <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        {t('Nhân viên')}
                      </span>
                    </div>
                  </NavLink>
                </li>
              
               
                )}

                 {/* đơn hàng xác nhận */}
                 {(isAdmin || isManager || isOrderProcessor) && (
                    <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('orderconfirma') && 'bg-teal-300 text-blue-500'}`}>
                      <NavLink
                        end
                        to="/orderconfirma"
                        className={`block ${pathname.includes('orderconfirma') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('customer') && 'hover:text-slate-200'}`}
                      >
                        <div className="flex items-center">
                          {/* Replace the SVG with an image */}
                          <img
                            className={`shrink-0 h-6 w-6 ${pathname.includes('orderconfirma') && 'text-white'}`}
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAgElEQVR4nO2WsQ3AMAzD9P/T7AdFOwixAxLIlEkIrTiRPTD0/Oa6IFPAIPFFKqBaUa09anHgr8AgcUYqYP1GtSqgWlGtCqhWVKsCqpXv2+/b3artd22QE2CQ+CIVcNhja1XA1oqtVQFbK7ZWBWyt2FoVUK2o1ky1GHZ+c00QyQEeotHsIubs6JEAAAAASUVORK5CYII="
                            alt="purchase-order"
                          />
                          <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            {t('Xác nhận đơn hàng')}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                  )}

                 {/* đơn hàng cần giao */}
                 {(isAdmin || isManager || isDeliveryStaff) && (
                 <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('ordershiper') && 'bg-teal-300 text-blue-500'}`}>
                  <NavLink
                    end
                    to="/ordershiper"
                    className={`block ${pathname.includes('ordershiper') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('customer') && 'hover:text-slate-200'}`}
                  >
                    <div className="flex items-center">
                      {/* New Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#555555', stroke: 'white' }}>
                        <path d="M5 22h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H5c-1.103 0-2 .897-2 2v15c0 1.103.897 2 2 2zM5 5h2v2h10V5h2v15H5V5z"></path>
                        <path d="m11 13.586-1.793-1.793-1.414 1.414L11 16.414l5.207-5.207-1.414-1.414z" style={{ fill: '#333333' }}></path>
                      </svg>
                      <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        {t('Đơn hàng cần giao')}
                      </span>
                    </div>
                  </NavLink>
                </li>
                )}
                {(isAdmin) && (
                  <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('cmtproduct') && 'bg-teal-300 text-blue-500'}`}>
                    <NavLink
                      end
                      to="/cmtproduct"
                      className={`block ${pathname.includes('cmtproduct') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('cmtproduct') && 'hover:text-slate-200'}`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#555555', stroke: 'white' }}>
                          <path d="M22 8a.76.76 0 0 0 0-.21v-.08a.77.77 0 0 0-.07-.16.35.35 0 0 0-.05-.08l-.1-.13-.08-.06-.12-.09-9-5a1 1 0 0 0-1 0l-9 5-.09.07-.11.08a.41.41 0 0 0-.07.11.39.39 0 0 0-.08.1.59.59 0 0 0-.06.14.3.3 0 0 0 0 .1A.76.76 0 0 0 2 8v8a1 1 0 0 0 .52.87l9 5a.75.75 0 0 0 .13.06h.1a1.06 1.06 0 0 0 .5 0h.1l.14-.06 9-5A1 1 0 0 0 22 16V8zm-10 3.87L5.06 8l2.76-1.52 6.83 3.9zm0-7.72L18.94 8 16.7 9.25 9.87 5.34zM4 9.7l7 3.92v5.68l-7-3.89zm9 9.6v-5.68l3-1.68V15l2-1v-3.18l2-1.11v5.7z"></path>
                        </svg>
                        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          {t('Xem đánh giá sản phẩm')}
                        </span>
                      </div>
                    </NavLink>
                  </li>
                )}
                 {/* dashboard */}
                 {(isAdmin) && (
                  <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('dashboard') && 'bg-teal-300 text-blue-500'}`}>
                  <NavLink
                    end
                    to="/dashboard"
                    className={`block ${pathname.includes('dashboard') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('dashboard') && 'hover:text-slate-200'}`}
                  >
                    <div className="flex items-center">
                      {/* New Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                      </svg>
                      <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        {t('Thống kê')}
                      </span>
                    </div>
                  </NavLink>
                </li>
                )}
                {isAdmin && (
                  <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/cmtcontent' && 'bg-teal-300 text-blue-500'}`}>
                    <NavLink
                      to="/cmtcontent"
                      className={`block ${pathname === '/cmtcontent' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/cmtcontent' && 'hover:text-slate-200'}`}
                    >
                      <div className="flex items-center">
                        {/* New Icon with adjusted size */}
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
                          <path d="M 25 4.0625 C 12.414063 4.0625 2.0625 12.925781 2.0625 24 C 2.0625 30.425781 5.625 36.09375 11 39.71875 C 10.992188 39.933594 11 40.265625 10.71875 41.3125 C 10.371094 42.605469 9.683594 44.4375 8.25 46.46875 L 7.21875 47.90625 L 9 47.9375 C 15.175781 47.964844 18.753906 43.90625 19.3125 43.25 C 21.136719 43.65625 23.035156 43.9375 25 43.9375 C 37.582031 43.9375 47.9375 35.074219 47.9375 24 C 47.9375 12.925781 37.582031 4.0625 25 4.0625 Z M 25 5.9375 C 36.714844 5.9375 46.0625 14.089844 46.0625 24 C 46.0625 33.910156 36.714844 42.0625 25 42.0625 C 22.996094 42.0625 21.050781 41.820313 19.21875 41.375 L 18.65625 41.25 L 18.28125 41.71875 C 18.28125 41.71875 15.390625 44.976563 10.78125 45.75 C 11.613281 44.257813 12.246094 42.871094 12.53125 41.8125 C 12.929688 40.332031 12.9375 39.3125 12.9375 39.3125 L 12.9375 38.8125 L 12.5 38.53125 C 7.273438 35.21875 3.9375 29.941406 3.9375 24 C 3.9375 14.089844 13.28125 5.9375 25 5.9375 Z"></path>
                        </svg>
                        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          {t('Phân tích bình luận')}
                        </span>
                      </div>
                    </NavLink>
                  </li>
                )}

                {isAdmin && (
                  <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname === '/cmtcontentpy' && 'bg-teal-300 text-blue-500'}`}>
                  <NavLink
                    to="/cmtcontentpy"
                    className={`block ${pathname === '/cmtcontentpy' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/cmtcontentpy' && 'hover:text-slate-200'}`}
                  >
                    <div className="flex items-center">
                      {/* New Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: 'rgba(0, 0, 0, 1)' }}>
                        <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                      </svg>
                      <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        {t('Bình luận bằng AI')}
                      </span>
                    </div>
                  </NavLink>
                </li>                
                )}


                 {/* sửa thông tin */}
                 {(isAdmin || isManager || isDeliveryStaff || isOrderProcessor) && (
                  <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes('profile') && 'bg-teal-300 text-blue-500'}`}>
                  <NavLink
                    end
                    to="/settings/profile"
                    className={`block ${pathname.includes('profile') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('profile') && 'hover:text-slate-200'}`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        style={{ stroke: 'black', strokeWidth: 1 }}
                        className="shrink-0 h-6 w-6"
                      >
                        <path
                          d="M20 2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-6 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM19 15H9v-.25C9 12.901 11.254 11 14 11s5 1.901 5 3.75V15z"
                          style={{ fill: 'white' }}
                        ></path>
                        <path
                          d="M4 8H2v12c0 1.103.897 2 2 2h12v-2H4V8z"
                          style={{ stroke: 'white' }}
                        ></path>
                      </svg>
                      <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        {t('Thay đổi thông tin')}
                      </span>
                    </div>
                  </NavLink>
                </li>
                )}
                 <hr className="bg-slate-200 my-5" />
                
                 {/* Log out */}
                 <NavLink
                  end
                  to="/login"
                  onClick={(e) => {
                    e.preventDefault(); // Ngăn điều hướng mặc định
                    handleLogout(); // Gọi hàm xóa dữ liệu và chuyển hướng
                  }}
                  className={`block ${pathname.includes('logout') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname.includes('logout') && 'hover:text-slate-200'}`}
                >
                  <div className="flex items-center">
                    <LogoutOutlinedIcon />
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      {t('Đăng xuất')}
                    </span>
                  </div>
                </NavLink>
               </ul>
             </div>
           </div>
   
           {/* Expand / collapse button */}
           <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
             <div className="px-3 py-2">
               <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
                 <span className="sr-only">Expand / collapse sidebar</span>
                 <svg className="w-6 h-6 fill-current sidebar-expanded:rotate-180" viewBox="0 0 24 24">
                   <path className="text-slate-400" d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
                   <path className="text-slate-600" d="M3 23H1V1h2z" />
                 </svg>
               </button>
             </div>
           </div>
         </div>
       </div>
     )
   }
   
   export default Sidebar
   