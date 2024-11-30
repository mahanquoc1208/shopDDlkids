/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* LAYOUT FOOTER COMPONENT
   ========================================================================== */

import React from 'react'
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined'
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import logoSorimachi from '../../../assets/footer/3.png'
import { useTranslation } from 'react-i18next'
import Tooltip from '@mui/material/Tooltip'
const Footer = () => {
  const { t } = useTranslation()
  return (
      <div className='bg-neutral-800 text-white'>
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          <div className="col-span-1">
            <img src={logoSorimachi} alt="Sorimachi" className="w-52 mb-4" />
            <p className="mb-4 italic">{t('footer.introduction')}</p>
            <div className="flex space-x-4">
            {/* <Tooltip title={<span className="lg:text-sm text-xs text-white">{t('learning.shortcut')}</span>} placement="top" arrow>
                <div
                  className='border-2 border-green-500 text-green-500 p-2 font-bold rounded-lg cursor-pointer ml-4 hover:border-green-400 hover:bg-green-400 hover:text-white select-none lg:text-sm text-xs transition duration-500'
                  onClick={handleNextClick}
                >
                  {t('learning.next')} <ArrowForwardIosIcon />
                </div>
              </Tooltip> */}
            <Tooltip title={<span className="lg:text-sm text-xs text-white">{t('footer.facebook')}</span>} placement="bottom" arrow>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.675 0H1.325C.594 0 0 .594 0 1.325v21.351C0 23.406.594 24 1.325 24H12.82v-9.294H9.692v-3.623h3.128V8.413c0-3.1 1.893-4.788 4.656-4.788 1.324 0 2.463.099 2.795.142v3.24h-1.918c-1.505 0-1.796.715-1.796 1.763v2.311h3.588l-.467 3.623h-3.121V24h6.116c.73 0 1.324-.594 1.324-1.324V1.325C24 .594 23.406 0 22.675 0z" />
                </svg>
              </a>
            </Tooltip>
            <Tooltip title={<span className="lg:text-sm text-xs text-white">{t('footer.youtube')}</span>} placement="bottom" arrow>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 3a5 5 0 0 1 5 5v8a5 5 0 0 1 -5 5h-12a5 5 0 0 1 -5 -5v-8a5 5 0 0 1 5 -5zm-9 6v6a1 1 0 0 0 1.514 .857l5 -3a1 1 0 0 0 0 -1.714l-5 -3a1 1 0 0 0 -1.514 .857z" />
                </svg>
              </a>
            </Tooltip>
          </div>
        </div>
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-4">
              <div className='border-b pb-3 w-auto'>
              {t('footer.branch of the store')}
              </div>
            </h2>
            <ul>
            <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2">
                <div className=''>•</div>
                <div className='ml-3 font-normal hover:font-bold'>{t('footer.chinhanh1')}</div>
              </li>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2">
                <div className=''>•</div>
                <div className='ml-3'>{t('footer.chinhanh2')}</div>
              </li>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2">
                <div className=''>•</div>
                <div className='ml-3'>{t('footer.chinhanh3')}</div>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-4 border-b pb-3">{t('footer.quick_links')}</h2>
            <ul>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2"><div className=''>•</div><div className='ml-3'>{t('footer.overview')}</div></li>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2"><div className=''>•</div><div className='ml-3'>{t('footer.human_resource')}</div></li>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2"><div className=''>•</div><div className='ml-3'>{t('footer.recruitment')}</div></li>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2"><div className=''>•</div><div className='ml-3'>{t('footer.contact')}</div></li>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2"><div className=''>•</div><div className='ml-3'>{t('footer.compliance')}</div></li>
              <li className="mb-2 flex cursor-pointer hover:font-bold transition-transform duration-200 hover:translate-x-2"><div className=''>•</div><div className='ml-3'>{t('footer.sdgS')}</div></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-4 border-b pb-3">{t('footer.contact_with_us')}</h2>
            <address className="not-italic mb-4 font-semibold cursor-pointer">
              <PlaceOutlinedIcon className='mr-4'/>{t('footer.address')}
            </address>
            <p className="mb-2 font-semibold cursor-pointer"><LocalPhoneOutlinedIcon className='mr-4'/>0373350154</p>
            <p><a href="mailto:hotro@sorimachigroup.vn" className="hover:underline font-semibold cursor-pointer"><LocalPostOfficeOutlinedIcon className='mr-4'/>hanquocma@gmail.vn</a></p>
          </div>
        </div><div className="text-center mt-8 border-t border-gray-700 pt-4 mb-4">
          DDKIDS &copy; 2024 All Rights Reserved.
        </div>
      </div>
  )
}

export default Footer
