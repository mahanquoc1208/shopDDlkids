import Footer from './footer/footer'
import Header from '../layouts/navbar/navbar'
import Sidebar from '../../components/Sidebar'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import Styled from './default.style'
import { getFromLocalStorage } from 'utils/functions'
import CryptoJS from 'crypto-js'
import React, { useEffect, useRef, useState, createContext, RefObject } from 'react'

export const ShowButtonTopContext = createContext({
  showButtonTop: false,
  setShowButtonTop: (value: boolean) => {}
})
export const DivRefContext = createContext<RefObject<HTMLDivElement> | null>(null)

const Default = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showButtonTop, setShowButtonTop] = useState(false)
  const divRef = useRef(null)
  const location = useLocation()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    document.body.classList.add('overflow-y-hidden')
    return () => {
      document.body.classList.remove('overflow-y-hidden')
    }
  }, [])

  useEffect(() => {
    const divElement = divRef.current as HTMLDivElement | null
    if (divElement) {
      const scrollFunction = () => {
        if (divElement.scrollTop > 200) {
          setShowButtonTop(true)
        } else {
          setShowButtonTop(false)
        }
      }
      divElement.addEventListener('scroll', scrollFunction)
      return () => {
        divElement.removeEventListener('scroll', scrollFunction)
      }
    }
  }, [])

  const tokens = getFromLocalStorage<any>('tokens');
  const userRole = tokens?.roleDescription;

  const isAdmin = userRole?.toUpperCase() === 'CHỦ CỬA HÀNG';
  const isManager = userRole?.toUpperCase() === 'QUẢN LÝ';
  const isDeliveryStaff = userRole?.toUpperCase() === 'NHÂN VIÊN VẬN CHUYỂN';
  const isOrderProcessor = userRole?.toUpperCase() === 'NHÂN VIÊN XỬ LÝ ĐƠN HÀNG';

  const pathRegEx = /^\/lesson\/edit\/[^/]+$/;
  const isPathMatch = pathRegEx.test(location.pathname);

  const sidebarPaths = {
    admin: ['/categoryproduct', '/user', '/cmtproduct', '/cmtcontent', '/cmtcontentpy', '/dashboard', '/customer', '/chat', '/categorycourse', '/product', '/settings/profile','/orderconfirma', `/ordershipperDetail/${id ?? ''}`,'/ordershiper', `/orderConfirmaDetail/${id ?? ''}`, '/product/productadd', `/product/productedit/${id ?? ''}`],
    manager: ['/categoryproduct', '/user','/customer', '/chat', '/categorycourse', '/product', '/settings/profile','/orderconfirma', `/ordershipperDetail/${id ?? ''}`,'/ordershiper', `/orderConfirmaDetail/${id ?? ''}`, '/product/productadd', `/product/productedit/${id ?? ''}`],
    deliveryStaff: ['/settings/profile',`/ordershipperDetail/${id ?? ''}`,'/ordershiper'],
    orderProcessor: ['/chat', '/settings/profile','/orderconfirma', `/orderConfirmaDetail/${id ?? ''}`],
  };

  const showSidebar =
    (isAdmin && sidebarPaths.admin.includes(location.pathname)) ||
    (isManager && sidebarPaths.manager.includes(location.pathname)) ||
    (isDeliveryStaff && sidebarPaths.deliveryStaff.includes(location.pathname)) ||
    (isOrderProcessor && sidebarPaths.orderProcessor.includes(location.pathname)) ||
    (isAdmin && isPathMatch);

  const showFooter = !location.pathname.startsWith('/learning');

  useEffect(() => {
    const divElement = divRef.current as HTMLDivElement | null
    if (divElement) {
      divElement.scrollTop = 0
    }
  }, [location.pathname])

  return (
    <DivRefContext.Provider value={divRef}>
      <ShowButtonTopContext.Provider value={{ showButtonTop, setShowButtonTop }}>
        <div className="flex h-screen overflow-hidden">
          {showSidebar && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
          <div className={`relative flex flex-col flex-1 overflow-x-hidden ${showFooter ? 'overflow-y-auto' : 'overflow-y-hidden'}`} ref={divRef}>
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Styled.Main>
              <Outlet />
            </Styled.Main>
            <Footer />
          </div>
        </div>
      </ShowButtonTopContext.Provider>
    </DivRefContext.Provider>
  )
}

export default Default
