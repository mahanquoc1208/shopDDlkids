import React, { useState, useEffect, FC } from 'react';
import Notifications from '../../../components/DropdownNotifications';
import UserMenu from '../../../components/DropdownProfile';
import { useLocation, useParams } from 'react-router-dom';
import { getFromLocalStorage } from '../../../utils/functions';
import Styled from './navbar.style';
import { useSessionStorage } from '../../../hooks';
import { useTranslation } from '../../../services/i18n';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { getListCountCart } from '../../../api/post/post.api'; // Assuming you have this API method
// import { Outlet, useLocation, useParams } from 'react-router-dom'

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname } = location;
  const { id } = useParams<{ id: string }>()

  const tokens = getFromLocalStorage<any>('tokens');
  const userRole = tokens?.roleDescription; // Directly use roleDescription
  const [totalItems, setTotalItems] = useState(0); // State for cart count

  // Determine if the hamburger button should show
  const allowedRolesForSidebar = ['CHỦ CỬA HÀNG', 'QUẢN LÝ'];
  const showHamburgerButton =
    ['/categoryproduct', '/user', '/cmtproduct', '/cmtcontent', '/dashboard', '/customer', '/chat', '/categorycourse', '/product', '/settings/profile','/orderconfirma', `/ordershipperDetail/${id ?? ''}`,'/ordershiper', `/orderConfirmaDetail/${id ?? ''}`, '/product/productadd', `/product/productedit/${id ?? ''}`].includes(pathname) &&
    allowedRolesForSidebar.includes(userRole?.toUpperCase());

  // useEffect(() => {
  //   const fetchCartData = async () => {
  //     try {
  //       const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
  //       const response = await getListCountCart(currentUserID);
  //       setTotalItems(response.data.totalItems); // Update cart count
  //     } catch (error) {
  //       console.error('Error fetching cart data:', error);
  //     }
  //   };

  //   fetchCartData(); // Fetch cart data on component mount

  //   const intervalId = setInterval(fetchCartData, 3000); // Polling every 3 seconds
  //   return () => clearInterval(intervalId); // Cleanup interval on component unmount
  // }, []);

  return (
    <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-bottom">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            {showHamburgerButton && (
              <button
                className="text-slate-500 hover:text-slate-600 lg:hidden"
                aria-controls="sidebar"
                aria-expanded={sidebarOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="5" width="16" height="2" />
                  <rect x="4" y="11" width="16" height="2" />
                  <rect x="4" y="17" width="16" height="2" />
                </svg>
              </button>
            )}
          </div>

          {/* Header: Center */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:space-x-2">
            <a
              href="/"
              className={`block ${pathname === '/' ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 rounded px-2`}
            >
              Trang chủ
            </a>
            <a
              href="/order"
              className={`block ${pathname.includes('order') ? 'text-white bg-teal-300' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 rounded px-2`}
            >
              Đơn hàng của tôi
            </a>

            {/* Cart */}
            <a
              href="/cart"
              className={`items-center block ${pathname.includes('cart') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 rounded px-2 relative`}
            >
              <div className="relative flex items-center">
                <ShoppingCartOutlinedIcon sx={{ color: 'teal', fontSize: 20 }} />
                <span className="absolute top-[-2px] right-[-8px] text-orange-500 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center z-10">
                  {totalItems}
                </span>
              </div>
            </a>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <div className="lg:hidden">
            <a
              href="/cart"
              className={`items-center block ${pathname.includes('cart') ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 rounded px-2 relative`}
            >
              <div className="relative flex items-center">
                <ShoppingCartOutlinedIcon sx={{ color: 'teal', fontSize: 20 }} />
                <span className="absolute top-[-2px] right-[-8px] text-orange-500 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center z-10">
                  {totalItems}
                </span>
              </div>
            </a>
            </div>
            <Notifications align="right" />
            <hr className="w-px h-6 bg-slate-200 mx-3" />
            <UserMenu align="right" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
