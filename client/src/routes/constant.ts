/* ROUTE CONSTANTS
   ========================================================================== */

const ROUTES = {
  homePage: '/',
  home: '/home',
  notfound: '*',
  login: '/login',
  // detail: '/exams/:id/:attempt?',
  // examHistory: '/exams/:id/history',
  // dashboard: '/dashboard', // TODO: remove later
  // myCourse: '/myCourses',
  productDetail: '/products/:id',
  // learning: '/learning/:courseId/:lessionId?',
  permission: '/permission',
  user: '/user',
  // course
  course: '/product',
  customer: '/customer',
  addCourse: '/product/productadd',
  editCoursePage: '/product/productedit/:id',
  // categorycourse
  categoryCourse: '/categoryProduct',
  profile: '/settings/profile',
  cart: '/cart',
  order: '/order',
  orderdetail: '/order/orderdetail/:id',
  cmtProduct: '/order/getcmtproduct/:id',
  orderconfirma: '/orderconfirma',
  ordershiper: '/ordershiper',
  orderConfirmaDetail: '/orderConfirmaDetail/:id',
  ordershipperDetail: '/ordershipperDetail/:id',
  test: '/chat',
  dashboard: '/dashboard',
  getcmtproduct: '/cmtproduct',
  getcmtproductall: '/cmtcontent',
  getcmtcontentPy: '/cmtcontentpy',
}

export default ROUTES
