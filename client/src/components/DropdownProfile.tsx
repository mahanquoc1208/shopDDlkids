/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */

   import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
   import { Link, useNavigate } from 'react-router-dom'
   import Transition from '../utils/Transition'
   import { getFromLocalStorage, removeLocalStorage, removeAllLocalStorage } from '../utils/functions'
   import UserAvatar from '../assets/images/profiler/user-avatar.png'
   import AccountCircleIcon from '@mui/icons-material/AccountCircle'
   import LogoutIcon from '@mui/icons-material/Logout'
   import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
   import ROUTES from '../routes/constant'
   import { useTranslation } from '../services/i18n'
   import { useTheme } from '../services/styled-themes'
   import getUnicodeFlagIcon from 'country-flag-icons/unicode'
   import CryptoJS from 'crypto-js'
   import { logout } from '../api/post/post.api'
   import { useDispatch } from 'react-redux'
   import { startLogout, finishLogout } from '../redux/logout/logoutSlice'
   import ChoiceModal from './ChoiceModal'
   import { getListCountCart } from '../api/post/post.api'; // Assuming you have this API method
   interface DropdownProfileProps {
     align: string
   }
   
   function DropdownProfile ({ align }: DropdownProfileProps) {
     const navigate = useNavigate()
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
     const dispatch = useDispatch()
   
     const userLastName = tokens?.lastName
     const userFirstName = tokens?.firstName
     const userEmail = tokens?.email
     const { t, i18n } = useTranslation()
     const { theme, setTheme } = useTheme()
     const [dropdownOpen, setDropdownOpen] = useState(false)
     const dropdown = useRef<HTMLDivElement | null>(null)
     const trigger = useRef<HTMLButtonElement | null>(null)
     const [selectedLanguage, setSelectedLanguage] = useState('vi')
     const [choiceModalOpen, setChoiceModalOpen] = useState(false)
     // hiển thị thêm
     const [roleDescription, setRoleDescription] = useState<string | null>(null);

     useEffect(() => {
       const storedRoleDescription = tokens?.roleDescription
       setRoleDescription(storedRoleDescription);
       
       // In giá trị của roleDescription ra console sau khi đã cập nhật
      //  console.log('Role Description:1111111111111111111111111111111111111', storedRoleDescription);
     }, []);
     useEffect(() => {
      i18n.changeLanguage('vi') // Change language to Vietnamese
    }, [i18n])
    
     // close on click outside
     useEffect(() => {
       const clickHandler = ({ target }: { target: EventTarget | null }) => {
         if (!dropdown.current) return
         if (!dropdownOpen || dropdown.current?.contains(target as Node) || trigger.current?.contains(target as Node)) return
         setDropdownOpen(false)
       }
       document.addEventListener('click', clickHandler)
       return () => document.removeEventListener('click', clickHandler)
     })
     // hiển thị bậc khách hàng 
   
     // close if the esc key is pressed
     useEffect(() => {
       const keyHandler = ({ keyCode }: { keyCode: number }) => {
         if (!dropdownOpen || keyCode !== 27) return
         setDropdownOpen(false)
       }
       document.addEventListener('keydown', keyHandler)
       return () => document.removeEventListener('keydown', keyHandler)
     })
   
     const handleLogout = useCallback(() => {
      // Xóa toàn bộ localStorage
      localStorage.clear();
      console.log('LocalStorage sau khi xóa:', localStorage); // Kiểm tra dữ liệu đã bị xóa
    
      // Chuyển hướng người dùng đến trang login
      navigate(ROUTES.login);
    }, [navigate]);
     const handleOpenLogOutModal = useCallback(() => {
       setChoiceModalOpen(true)
     }, [])
   
     const userRole = tokens?.key
     let data: string | undefined
     if (userRole) {
       try {
         const giaiMa = CryptoJS.AES.decrypt(userRole, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
         data = giaiMa.toString(CryptoJS.enc.Utf8)
       } catch (error) {
         console.error('Decryption error:', error)
       }
     }
   
     const handleThemeSwitch = useCallback(async () => {
       try {
         const newTheme = theme === 'dark' ? 'light' : 'dark'
         setTheme(newTheme)
       } catch (error) {
         console.log(error)
       }
     }, [setTheme, theme])
     const locationPath = 'delete.png'
     const renderThemeSwitcher = useMemo(() => {
       const icon = theme === 'dark' ? <span className='flex items-center'><div className='mr-3'>☀️</div> <div>{t('dropdown.lightTheme')}</div></span> : <span className='flex items-center'><div className='mr-3'>🌙</div> <div>{t('dropdown.darkTheme')}</div></span>
   
       return (
            <div className='cursor-pointer py-1 px-6 font-medium text-sm text-gray-500 hover:text-teal-600 hidden' onClick={handleThemeSwitch}>
              {icon}
            </div>
       )
     }, [handleThemeSwitch, theme])
     return (
          <div className="relative inline-flex">
            <button
              ref={trigger}
              className="inline-flex justify-center items-center group"
              aria-haspopup="true"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <img className="w-8 h-8 rounded-full" src={UserAvatar} width="32" height="32" alt="User" />
            </button>
            <Transition
              className={`origin-top-right z-10 absolute top-full w-64 bg-white border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
              show={dropdownOpen}
              enter="transition ease-out duration-200 transform"
              enterStart="opacity-0 -translate-y-2"
              enterEnd="opacity-100 translate-y-0"
              leave="transition ease-out duration-200"
              leaveStart="opacity-100"
              leaveEnd="opacity-0"
            >
              <div
                ref={dropdown}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
              >
                <div className="flex items-center py-1 px-3">
                  <img className="w-12 h-12 rounded-full -mt-2" src={UserAvatar} width="44" height="44" alt="User" />
                  <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-slate-200 w-32">
                    <p className='font-bold text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>
                      {`${userFirstName || ''} ${userLastName || ''}`}
                    </p>
                    <p className='text-gray-500 text-xs overflow-hidden overflow-ellipsis whitespace-nowrap'>{userEmail}</p>
                  </div>
                </div>
                <ul>
                  <li>
                    <Link
                      className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                      to="/settings/profile"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <AccountCircleIcon className="mr-2" />
                      {t('Hồ sơ')}
                    </Link>
                  </li>
                  <li>
                    <button
                      className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                      onClick={() => {
                        setDropdownOpen(!dropdownOpen);

                        // Lấy và hiển thị roleDescription
                        const storedRoleDescription = tokens?.roleDescription || 'Chủ cửa hàng';
                        setRoleDescription(storedRoleDescription);
                        console.log('Role Description:', storedRoleDescription);

                        // Điều hướng đến trang dựa trên roleDescription
                        if (storedRoleDescription === 'Quản lý') {
                          navigate('/user');
                        } else if (storedRoleDescription === 'Nhân viên xử lý đơn hàng') {
                          navigate('/orderconfirma');
                        } else if (storedRoleDescription === 'Nhân viên vận chuyển') {
                          navigate('/ordershiper');
                        } else if (storedRoleDescription === 'Chủ cửa hàng') {
                          navigate('/dashboard'); // Thêm điều kiện cho "Chủ cửa hàng"
                        } else {
                          // Nếu roleDescription không khớp với bất kỳ giá trị nào ở trên, không điều hướng
                          console.log('No navigation for this role');
                        }
                      }}
                    >
                      <AccountCircleIcon className="mr-2" />
                      {roleDescription}
                    </button>
                  </li>
                  {renderThemeSwitcher}
                  <li>
                    <button
                      className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                      onClick={handleOpenLogOutModal}
                    >
                      <LogoutIcon className="mr-2" />
                      {t('Đăng xuất')}
                    </button>
                  </li>
                  <hr className="bg-slate-200 my-2" />
                  {(data === 'ADMIN' || data === 'MANAGER') && (
                    <li>
                      <Link
                        className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                        to="/admin"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <AdminPanelSettingsIcon className="mr-2" />
                        {t('dropdown.gottoadmin')}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </Transition>
            <ChoiceModal
              title={t('homepage.logout')}
              modalOpen={choiceModalOpen}
              setModalOpen={setChoiceModalOpen}
            >
              <div className="text-sm mb-5">
                <div className="space-y-2">
                  <p className='text-gray-500 font-bold'>{t('homepage.logout_confirm')}</p>
                </div>
              </div>
              {/* Modal footer */}
              <div className="flex flex-wrap justify-end space-x-2">
                <div className='space-x-2 flex'>
                  <button className="flex-1 border rounded-lg btn-sm border-slate-300 hover:border-slate-400 text-slate-600 p-2 font-bold text-sm" onClick={(e) => { e.stopPropagation(); setChoiceModalOpen(false) }}>{t('homepage.decline')}</button>
                  <button className="flex-1 border rounded-lg btn-sm bg-indigo-500 hover:bg-indigo-600 text-white p-2 font-bold text-sm" onClick={handleLogout}>{t('homepage.continue')}</button>
                </div>
              </div>
            </ChoiceModal>
          </div>
     )
   }
   export default DropdownProfile
   