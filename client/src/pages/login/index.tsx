/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: LOGIN
   ========================================================================== */

   import { login, register } from '../../api/post/post.api'

   import ROUTES from '../../routes/constant'
   import { setToLocalStorage } from '../../utils/functions'
   import React, { useCallback, useState, useMemo } from 'react'
   import { useNavigate } from 'react-router-dom'
   import Styled from './index.style'
   import { FormProvider, useForm } from 'react-hook-form'
   import {
     FormControl,
     IconButton,
     InputAdornment,
     InputLabel,
     OutlinedInput
   } from '@mui/material'
   import { Visibility, VisibilityOff, AccountCircle } from '@mui/icons-material'
   import { useTranslation } from 'react-i18next'
   import { yupResolver } from '@hookform/resolvers/yup'
   import * as yup from 'yup'
   
   import Logo from './hinhanh/Logo.png';
   
   const Login = () => {
     const navigate = useNavigate()
     const [type, setType] = useState<boolean>(false)
     const [isSignUp, setIsSignUp] = useState<boolean>(false)
     const [errorMessage, setErrorMessage] = useState<string>('')
     const [focusedField, setFocusedField] = useState<string | null>(null)
     const { t } = useTranslation()
     const schema = useMemo(() => {
      const messEmailEmpty = t('Vui lòng nhập email');
      const messEmailInvalid = t('Email không hợp lệ');
      const messPasswordEmpty = t('Vui lòng nhập mật khẩu');
      const messConfirmEmpty = t('Vui lòng nhập lại mật khẩu');
      const messConfirmMismatch = t('Mật khẩu xác nhận không khớp');
    
      return yup
        .object({
          email: yup
            .string()
            .email(messEmailInvalid)
            .required(messEmailEmpty),
          password: yup.string().required(messPasswordEmpty),
          confirm_password: isSignUp
            ? yup
                .string()
                .required(messConfirmEmpty)
                .oneOf([yup.ref('password'), null], messConfirmMismatch)
            : yup.string(),
        })
        .required();
    }, [isSignUp, t]);
    
    
     const method = useForm({
       resolver: yupResolver(schema)
     })
     const handleFocus = (field: string) => {
      setFocusedField(field);
    };
    
    const handleBlur = () => {
      setFocusedField(null);
    };
   
     const handleMouseDownPassword = (
       event: React.MouseEvent<HTMLButtonElement>
     ) => {
       event.preventDefault()
     }
   
     const handleLogin = useCallback(async () => {
      try {
        const response = await login({
          email: method.getValues('email'),
          password: method.getValues('password')
        });
    
        const { accessToken } = response.data;
    
        // Lưu accessToken vào localStorage
        setToLocalStorage('accessToken', accessToken);
        const tokens = JSON.stringify(response.data);
        setToLocalStorage('tokens', tokens);
        setErrorMessage('');
    
        // Chuyển hướng về trang chính
        window.location.href = 'http://localhost:3000/';
      } catch (error) {
        if (error?.response?.status === 403) {
          setErrorMessage('Tài khoản của bạn đã bị xóa');
        } else {
          setErrorMessage(error?.message);
        }
      }
    }, [method])
     const handleRegister = useCallback(async () => {
       try {
         const result = await register({
           email: method.getValues('email'),
           password: method.getValues('password')
         });
         setErrorMessage(result?.data?.status.toString());
       } catch (error) {
         setErrorMessage(error?.message);
       }
     }, [method]);
   
     return (
    <div className="min-h-screen bg-amber-300 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          {isSignUp ? t('Đăng ký') : t('Đăng nhập')}
        </h2>
        <FormProvider {...method}>
          <form
            className="space-y-4"
            onSubmit={
              isSignUp
                ? method.handleSubmit(handleRegister)
                : method.handleSubmit(handleLogin)
            }
          >
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                {t('Email')}
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  type="email"
                  {...method.register('email', { required: true })}
                  onChange={(e) => method.setValue('email', e.target.value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-3 text-gray-400">
                  <AccountCircle />
                </span>
              </div>
              {method.formState.errors.email && (
                <p className="text-sm text-red-500">{method.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                {t('Mật Khẩu')}
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={type ? 'text' : 'password'}
                  {...method.register('password', { required: true })}
                  onChange={(e) => method.setValue('password', e.target.value)}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-3">
                  <button
                    type="button"
                    onClick={() => setType((prev) => !prev)}
                    className="focus:outline-none"
                  >
                    {type ? <VisibilityOff /> : <Visibility />}
                  </button>
                </span>
              </div>
              {method.formState.errors.password && (
                <p className="text-sm text-red-500">{method.formState.errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            {isSignUp && (
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-600">
                  {t('Xác nhận mật khẩu')}
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirm_password"
                    type={type ? 'text' : 'password'}
                    {...method.register('confirm_password', { required: true })}
                    onChange={(e) => method.setValue('confirm_password', e.target.value)}
                    onFocus={() => handleFocus('confirm_password')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-3">
                    <button
                      type="button"
                      onClick={() => setType((prev) => !prev)}
                      className="focus:outline-none"
                    >
                      {type ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </span>
                </div>
                {method.formState.errors.confirm_password && (
                  <p className="text-sm text-red-500">
                    {method.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            {!isSignUp ? (
              <>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t('Đăng nhập')}
                </button>
                <p className="text-center text-sm mt-2">
                  {t('Chưa có tài khoản?')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage('');
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    {t('Đăng ký')}
                  </button>
                </p>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t('Đăng ký')}
                </button>
                <p className="text-center text-sm mt-2">
                  {t('Bạn đã có tài khoản?')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage('');
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    {t('Đăng nhập')}
                  </button>
                </p>
              </>
            )}
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </form>
        </FormProvider>
      </div>
    </div>

     )
   }
   
   export default Login;
