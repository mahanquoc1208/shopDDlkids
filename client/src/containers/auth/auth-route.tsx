/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PRIVATE ROUTE: AUTHENTICATION
   ========================================================================== */

   import { Navigate, useLocation, useNavigate } from 'react-router-dom'

   import ROUTES from '../../routes/constant'
   import { getFromLocalStorage, removeAllLocalStorage, setToLocalStorage } from '../../utils/functions'
   import { useCallback, useEffect, useState } from 'react'
   import { jwtDecode } from 'jwt-decode'
   import { refresh } from '../../api/post/post.api'
   import { PacmanLoader } from 'react-spinners'
   import { selectIsLoggingOut } from '../../redux/logout/logoutSlice'
   import { useSelector } from 'react-redux'
   import Swal from 'sweetalert2'
   import { useTranslation } from '../../services/i18n'
   
   interface IAuthRouteProps {
     children: JSX.Element
     allowedRoles?: string[] // add this line
   }
   
   const AuthRoute = ({ children, allowedRoles }: IAuthRouteProps) => {
     const location = useLocation()
     const navigate = useNavigate()
     const [loading, setLoading] = useState<boolean>(true)
     const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
     const [userRole, setUserRole] = useState<string | null>(null)
     const isLoggingOut = useSelector(selectIsLoggingOut)
     const { t, i18n } = useTranslation()
   
     const checkTokenValidity = (token: string) => {
       try {
         const { exp } = jwtDecode<{ exp: number }>(token)
         return exp * 1000 > Date.now()
       } catch (error) {
         return false
       }
     }
   
     const handleTokenRefresh = async () => {
       console.log('HANDLE TOKEN REFRESH')
       const tokens = getFromLocalStorage<any>('tokens')
       if (tokens?.accessToken && checkTokenValidity(tokens.accessToken)) {
         setIsAuthenticated(true)
         setUserRole(tokens.roleDescription) // Updated to use roleDescription
         return tokens.accessToken
       }
       if (!tokens) {
         return null
       }
       try {
         const response = await refresh()
         const newAccessToken = response.data.accessToken
         setToLocalStorage('tokens', JSON.stringify(response.data))
         setUserRole(response.data.roleDescription) // Updated to use roleDescription
         return newAccessToken
       } catch (error) {
         const currentLanguage = i18n.language
         console.log(currentLanguage)
         removeAllLocalStorage()
         await i18n.changeLanguage(currentLanguage)
         const title = t('alert.sessionExpired')
         const text = t('alert.pleaseLoginAgain')
         if (typeof title === 'string') {
           Swal.fire({
             title,
             text,
             icon: 'warning',
             confirmButtonText: 'OK'
           })
         }
         setIsAuthenticated(false)
         return null
       }
     }
   
     useEffect(() => {
       const verifyAuthentication = async () => {
         const validAccessToken = await handleTokenRefresh()
         console.log(validAccessToken, 'VALID ACCESS TOKEN')
         setIsAuthenticated(!!validAccessToken)
         setLoading(false)
       }
       console.log(isAuthenticated, 'IS AUTHENTICATED')
       if (!isLoggingOut) {
         if (location.pathname !== ROUTES.login) {
           verifyAuthentication()
         } else {
           setLoading(false)
           if (isAuthenticated) {
             navigate(ROUTES.homePage)
           }
         }
       } else {
         setLoading(false)
       }
     }, [location, isAuthenticated, isLoggingOut, navigate])
   
     useEffect(() => {
       if (isLoggingOut) {
         setIsAuthenticated(false)
       }
     }, [isLoggingOut])
   
     if (loading) {
       return (
         <div className="tw-flex tw-justify-center tw-items-center tw-w-full tw-h-140 tw-mt-20">
           <PacmanLoader
             className='tw-flex tw-justify-center tw-items-center tw-w-full tw-mt-20'
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
           />
         </div>
       )
     }
   
     if (isAuthenticated && location.pathname === ROUTES.login) {
       return <Navigate to={ROUTES.homePage} />
     }
     if (!isAuthenticated && location.pathname !== ROUTES.login) {
       return <Navigate to={ROUTES.login} />
     }
   
     if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
       return <Navigate to={ROUTES.notfound} />
     }
   
     return children
   }
   
   export default AuthRoute
   