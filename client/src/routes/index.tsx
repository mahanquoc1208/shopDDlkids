/* ROUTES COMPONENT
   ========================================================================== */

import AuthRoute from '../containers/auth/auth-route'
import LayoutDefault from '../containers/layouts/default'
import Loading from '../containers/loadable-fallback/loading'
import ROUTES from './constant'
import { RouteObject } from 'react-router-dom'
import loadable from '@loadable/component'
import React from 'react'
/**
    * Lazy load page components. Fallback to <Loading /> when in loading phase
    */
const Cart = loadable(async () => await import('../pages/cart'), {
  fallback: <Loading />
})
const Login = loadable(async () => await import('../pages/login'), {
  fallback: <Loading />
})
// const NotFound = loadable(async () => await import('pages/not-found'), {
//   fallback: <Loading />
// })
// const Detail = loadable(async () => await import('pages/detail'), {
//   fallback: <Loading />
// })
// const ExamHistory = loadable(async () => await import('pages/examHistory'), {
//   fallback: <Loading />
// })
// // TODO: remove later
// const Dashboard = loadable(async () => await import('pages/dashboard'), {
//   fallback: <Loading />
// })
// const MyCourse = loadable(async () => await import('pages/myCourse'), {
//   fallback: <Loading />
// })

const ProductDetail = loadable(async () => await import('../pages/productDetail'), {
  fallback: <Loading />
})
// const Learning = loadable(async () => await import('pages/learning'), {
//   fallback: <Loading />
// })
const User = loadable(async () => await import('../pages/user'), {
  fallback: <Loading />
})
// const Permission = loadable(async () => await import('../pages/permission'), {
//   fallback: <Loading />
// })
const HomePage = loadable(async () => await import('../pages/home'), {
  fallback: <Loading />
})
const Profile = loadable(async () => await import('../pages/settings/Profile'), {
  fallback: <Loading />
})
// // course
const Course = loadable(async () => await import('../pages/product'), {
  fallback: <Loading />
})
const Customer = loadable(async () => await import('../pages/customer'), {
  fallback: <Loading />
})
const AddCourseForm = loadable(async () => await import('../pages/product/AddProduct'), {
  fallback: <Loading />
})

const EditCourseFrom = loadable(async () => await import('../pages/product/EditProduct'), {
  fallback: <Loading />
})
// categorycourse
const CategoryCourse = loadable(async () => await import('../pages/categoryProduct'), {
  fallback: <Loading />
})
// order
const Order = loadable(async () => await import('../pages/order'), {
  fallback: <Loading />
})
// order detail
// order
const OrderDetail = loadable(async () => await import('../pages/order/orderDetail'), {
  fallback: <Loading />
})
// đánh giá sản phẩm hiển thị dựa trên ngôi sao
const CmtProduct = loadable(async () => await import('../pages/order/cmt_product'), {
  fallback: <Loading />
})
// xác nhận đơn hàng cho nhân viên
const Orderconfirma = loadable(async () => await import('../pages/orderConfirma'), {
  fallback: <Loading />
})
//xác nhận đơn hàng cho shipper
const Ordershiper = loadable(async () => await import('../pages/orderShiper'), {
  fallback: <Loading />
})
// xem đơn hàng chi tiết của xác nhận đơn hàng
const OrderConfirmaDetail = loadable(async () => await import('../pages/orderConfirma/orderConfirmaDetail'), {
  fallback: <Loading />
})
// xem đơn hàng chi tiết của xác nhận đơn hàng cho shipper
const OrdershipperDetail = loadable(async () => await import('../pages/orderShiper/ordershipperDetail'), {
  fallback: <Loading />
})
// xem thống kê
const Dashboard = loadable(async () => await import('../pages/Dashboard'), {
  fallback: <Loading />
})
// xem đánh giá
const Getcmtproduct = loadable(async () => await import('../pages/get_cmt_product'), {
  fallback: <Loading />
})
// xem đánh giá sản phẩm bằng bình luận
const Getcmtproductall = loadable(async () => await import('../pages/cmt_content_product'), {
  fallback: <Loading />
})
// xem đánh giá sản phẩm bình luận bằng python
// const GetcmtcontentPy = loadable(async () => await import('../pages/py_ promptengineer'), {
//   fallback: <Loading />
// })
// test
// const Test = loadable(async () => await import('../pages/chat'), {
//   fallback: <Loading />
// })
/**
    * Use <AuthRoute /> to protect authenticate pages
    */
const routes: RouteObject[] = [
  {
    path: ROUTES.login,
    element: (
         <AuthRoute>
           <Login />
         </AuthRoute>
    )
  },
  {
    path: ROUTES.homePage,
    element: (
         <AuthRoute>
           <LayoutDefault />
         </AuthRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.productDetail, element: <ProductDetail /> },
      { path: ROUTES.cart, element: <Cart /> },
      { path: ROUTES.profile, element: <Profile /> },
      {
        path: ROUTES.user,
        element: (
             <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý']}>
               <User />
             </AuthRoute>
        )
      },
      // // course
      { path: ROUTES.course,
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý']}>
                <Course />
              </AuthRoute>
        )
      },
      { path: ROUTES.customer, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý']}>
                <Customer />
              </AuthRoute>
        )
      },
      { path: ROUTES.addCourse, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý']}>
                <AddCourseForm />
              </AuthRoute>
        )
      },
      { path: ROUTES.editCoursePage, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý']}>
                <EditCourseFrom />
              </AuthRoute>
        )
      },
      // categorycourse
      { path: ROUTES.categoryCourse, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý']}>
                <CategoryCourse />
              </AuthRoute>
        )
      },
      // order
      { path: ROUTES.order, element: <Order /> },
      //orderdetail
      { path: ROUTES.orderdetail, element: <OrderDetail /> },
      // cmt_product
      { path: ROUTES.cmtProduct, element: <CmtProduct /> },
      // hiển thị đơn hàng
      { path: ROUTES.orderconfirma, 
           element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý','Nhân viên xử lý đơn hàng']}>
                <Orderconfirma />
              </AuthRoute>
        )
      },
      // chi tiết đơn hàng, xác nhận cho nhân viên
      { path: ROUTES.orderConfirmaDetail, 
            element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý','Nhân viên xử lý đơn hàng']}>
                <OrderConfirmaDetail />
              </AuthRoute>
        )
      },
      // hiển thị đơn hàng cho shipper
      { path: ROUTES.ordershiper, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý','Nhân viên vận chuyển']}>
                <Ordershiper />
              </AuthRoute>
        )
      },
      // hiển thị đơn hàng chi tiết cho shipper
      { path: ROUTES.ordershipperDetail, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý','Nhân viên vận chuyển']}>
                <OrdershipperDetail />
              </AuthRoute>
        )
      },
      // Nhắn tin
    //   { path: ROUTES.test, 
    //       element: (
    //         <AuthRoute allowedRoles={['Chủ cửa hàng', 'Quản lý', 'Nhân viên xử lý đơn hàng']}>
    //           <Test />
    //         </AuthRoute>
    //   )
    // },
      // hiển thị thống kê
      { path: ROUTES.dashboard,
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng']}>
                <Dashboard />
              </AuthRoute>
        )
      },
      // xem đánh giá cho admin
      { path: ROUTES.getcmtproduct, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng']}>
                <Getcmtproduct />
              </AuthRoute>
        )
      },
      { path: ROUTES.getcmtproductall, 
              element: (
              <AuthRoute allowedRoles={['Chủ cửa hàng']}>
                <Getcmtproductall />
              </AuthRoute>
        )
      },
      // { path: ROUTES.getcmtcontentPy, 
      //         element: (
      //         <AuthRoute allowedRoles={['Chủ cửa hàng']}>
      //           <GetcmtcontentPy />
      //         </AuthRoute>
      //   )
      // },
    ]
  }
]


export default routes
