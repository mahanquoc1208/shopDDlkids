/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* POST API REQUESTS
   ========================================================================== */

   import { requestWithJwt, requestWithoutJwt } from '../request'

   import axios, { AxiosResponse } from 'axios'
   import { DataListCourse, ListCourseParams, DataListExam, DataListUser, ListExamParams, ListUserParams, DataListPermission, ListPermissionParams } from './post.interface'
   
   export const getListExams = async ({
     params
   }: {
     params?: ListExamParams
   }): Promise<AxiosResponse<DataListExam>> => {
     return await requestWithJwt.get<DataListExam>('/exams', { params })
   }
   
   export const getDetailExams = async ({
     id, attempt, status
   }: {
     id?: string
     attempt?: string | null
     status?: string | null
   }): Promise<AxiosResponse<any>> => {
     if (attempt != null || attempt !== undefined) {
       return await requestWithJwt.get<any>(`/exams/${id}/${attempt}?status=${status}`)
     } else {
       return await requestWithJwt.get<any>(`/exams/${id}?status=${status}`)
     }
   }
   
   export const getShortHistoryExams = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/exams/${id}/getShortHistory`)
   }
   
   export const getQuestionDiscussion = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/questions/${id}`)
   }
   
   export const getDashboardData = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/dashboard')
   }
   
   export const saveQuestionsForExam = async (
     payload: any
   ): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>('/dashboard/create', { data: payload })
   }
   
   export const login = async (payload: any): Promise<AxiosResponse<any>> => {
     return await requestWithoutJwt.post<any>('/auth/login', { data: payload }, { withCredentials: true })
   }
   
   export const register = async (payload: any): Promise<AxiosResponse<any>> => {
     return await requestWithoutJwt.post<any>('/auth/register', { data: payload }, { withCredentials: true })
   }
   
   // export const refresh = async (payload: any): Promise<AxiosResponse<any>> => {
   //   return await requestWithJwt.post<any>('/auth/refresh', { data: payload }, { withCredentials: true })
   // }
   export const refresh = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>('/auth/refresh', {}, { withCredentials: true })
   }
   // export const logout = async (payload: any): Promise<AxiosResponse<any>> => {
   //   return await requestWithJwt.post<any>('/auth/logout', { data: payload }, { withCredentials: true })
   // }
   export const logout = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>('/auth/logout', {}, { withCredentials: true })
   }
   export const markExam = async (
     id: string,
     payload: any
   ): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>(`/exams/${id}`, { data: payload })
   }
   
   export const saveTempAnswer = async (
     id: string,
     payload: any
   ): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>(`/exams/${id}/saveTemporaryAnswer`, { data: payload })
   }
   
   export const commentOnQuestion = async (
     questionId: string,
     payload: any
   ): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>(`/questions/${questionId}`, { data: payload })
   }
   
   export const fetchRole = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/roles/')
   }
   
   export const createRole = async (payload: any): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>('/roles/', { data: payload })
   }
   // course
   export const getProductData = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/product/all1')
   }
   export const deleteRole = async (id: string): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.delete<any>(`/roles/${id}`)
   }
   // course
   export const getProductById = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/product/${id}`)
   }
   export const getListMyCoursesDone = async ({
     params
   }: {
     params?: ListCourseParams
   }): Promise<AxiosResponse<DataListCourse>> => {
     return await requestWithJwt.get<DataListCourse>('/courses/myCoursesDone', { params })
   }
   export const getListMyCoursesActive = async ({
     params
   }: {
     params?: ListCourseParams
   }): Promise<AxiosResponse<DataListCourse>> => {
     return await requestWithJwt.get<DataListCourse>('/courses/myCoursesActive', { params })
   }
   // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
   export const updateProduct = async (id: string, data: FormData) => {
     try {
       const response = await requestWithJwt.put(`/product/${id}`, data, {
         headers: {
           'Content-Type': 'multipart/form-data'
         }
       })
       return response.data
     } catch (error) {
       // Assert the type of error as any to access response property
       const typedError = error as any
       // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
       throw typedError.response?.data || error
     }
   }
   
   export const addProduct = async (formData: FormData): Promise<void> => {
     try {
       console.log(formData)
       const response = await requestWithJwt.post('/product', formData, {
         headers: {
           'Content-Type': 'multipart/form-data'
         }
       })
       console.log(response)
     } catch (error: any) {
       if ((Boolean(axios.isAxiosError(error))) && error.response?.status === 409) {
         throw new Error('A course with this name already exists')
       }
       console.error('Failed to add course:', error)
       throw error
     }
   }
   
   export const getCategoryProductData = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/product/course-category')
   }
   export interface CheckCourseResponse {
     exists: boolean
     message: string
   }
   export const fetchAllPermission = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/permissions/')
   }
   
   export const createPermission = async (payload: any): Promise<AxiosResponse<any>> => {
     // console.log('payload:', payload)
     return await requestWithJwt.post<any>('/permissions/', { data: payload })
   }
   
   export const updatePermission = async (id: string, payload: any): Promise<AxiosResponse<any>> => {
     // console.log('payload:', payload)
     return await requestWithJwt.put<any>(`/permissions/${id}`, { data: payload })
   }
   
   export const deletePermission = async (id: string): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.delete<any>(`/permissions/${id}`)
   }
   
   export const fetchPermissionByRole = async (id: string): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/permissions/by-role/${id}`)
   }
   
   export const assignPermissonToRole = async (payload: any): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>('/permissions/assign-to-role', { data: payload })
   }
   
   export const fetchAllUser = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/users/')
   }
   export const fetchAllUserall = async (): Promise<AxiosResponse<any>> => {
    return await requestWithJwt.get<any>('/users/all')
  }
  
   
   export const fetchAllRole = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/roles/')
   }
   export const fetchAllRoleall = async (): Promise<AxiosResponse<any>> => {
    return await requestWithJwt.get<any>('/roles/all/')
  }
   
   export const fetchUserPagination = async ({
     params
   }: {
     params?: ListUserParams
   }): Promise<AxiosResponse<DataListUser>> => {
     return await requestWithJwt.get<DataListUser>('/users/pagination', { params })
   }
   
   // create user
   export const createUser = async (payload: any): Promise<AxiosResponse<any>> => {
    console.log('payload create user:', payload);
    return await requestWithJwt.post<any>('/users/', payload); // Không cần { data: payload }
}
   export const deleteUser = async (id: string): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.put<any>(`/users/delete/${id}`)
   }
   
   export const updateUser = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
    // Log the payload to confirm all data being sent
    console.log('Full payload sent to server:', { id, ...payload });
  
    // Send full data to the server, including id
    return await requestWithJwt.put<any>(`/users/${id}`, payload);
  }
   export const findUserById = async (id: string): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/users/${id}`)
   }
   
   export const fetchAllRoute = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/routes/')
   }
   export const getdeleteProduct = async (categoryId: string): Promise<AxiosResponse<any>> => {
     try {
       const response = await requestWithJwt.delete<any>(`/product/${categoryId}`)
       return response
     } catch (error) {
       console.error('Error:', error)
       throw new Error('Failed to delete category product')
     }
   }
   export const fetchPermissionPagination = async ({
     params
   }: {
     params?: ListPermissionParams
   }): Promise<AxiosResponse<DataListPermission>> => {
     return await requestWithJwt.get<DataListPermission>('/permissions/pagination', { params })
   }
   // course
   interface DeleteCoursesResponse {
     coursesUnableToDelete: any
     deletedCourses: any
   }
   export const getListMyCourses = async ({
     params
   }: {
     params?: ListCourseParams
   }): Promise<AxiosResponse<DataListCourse>> => {
     return await requestWithJwt.get<DataListCourse>('/product/myCourses', { params })
   }
   // course
   export const deleteCourses = async (ids: string[]): Promise<DeleteCoursesResponse> => {
     try {
       const response = await requestWithJwt.delete('/product', { data: { ids } })
       // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
       if (response.data && response.data.message === 'Deleted Course.') {
         const { coursesUnableToDelete, successfullyDeletedCourses } = response.data
         console.log('Courses unable to delete:', coursesUnableToDelete)
         console.log('Successfully deleted courses:', successfullyDeletedCourses)
         return { coursesUnableToDelete, deletedCourses: successfullyDeletedCourses }
       } else {
         console.error('Failed to delete courses:', response.data)
         throw new Error('Failed to delete courses')
       }
     } catch (error) {
       // ??ng nh?p l?i n?u co ngo?i l? x?y ra trong qua trinh xoa
       console.error('Failed to delete courses:', error)
       throw error
     }
   }
   
   export const getListProCourses = async ({
     params
   }: {
     params?: ListCourseParams
   }): Promise<AxiosResponse<DataListCourse>> => {
     return await requestWithJwt.get<DataListCourse>('/product/paidCourse', { params })
   }
   
   export const getListFreeCourses = async ({
     params
   }: {
     params?: ListCourseParams
   }): Promise<AxiosResponse<DataListCourse>> => {
     return await requestWithJwt.get<DataListCourse>('/product/freeCourse', { params })
   }
   
   export const getListCourses = async ({
     params
   }: {
     params?: ListCourseParams
   }): Promise<AxiosResponse<DataListCourse>> => {
     return await requestWithJwt.get<DataListCourse>('/product/', { params })
   }
   export const getListNewCourses = async ({
     params
   }: {
     params?: ListCourseParams
   }): Promise<AxiosResponse<DataListCourse>> => {
     return await requestWithJwt.get<DataListCourse>('/product/all', { params })
   }
  //  export const getListNewCourses2 = async ({
  //   params
  // }: {
  //   params?: ListCourseParams
  // }): Promise<AxiosResponse<DataListCourse>> => {
  //   return await requestWithJwt.get<DataListCourse>('/product/all', { params })
  // }
  export const getListNewCourses2 = async ({
    categoryCourseId,
    params
  }: {
    categoryCourseId?: string;
    params?: { page?: number };
  }): Promise<AxiosResponse<any>> => {
    const url = categoryCourseId ? `/product/all2/${categoryCourseId}` : `/product/all2`;
    return await requestWithJwt.get<any>(url, { params });
  };

   // export const getListAllNewCourses = async ({
   //   params
   // }: {
   //   params?: ListCourseParams
   // }): Promise<AxiosResponse<DataListCourse>> => {
   //   return await requestWithJwt.get<DataListCourse>('/courses/getAllNewCourse', { params })
   // }
  //  export const getCourseById = async (): Promise<AxiosResponse<any>> => {
  //    return await requestWithJwt.get<any>('/products/')
  //  }
  //  export const getCourseById = async (id: string): Promise<AxiosResponse<any>> => {
  //   return await requestWithJwt.get<any>(`/product/${id}`)
  // }
   export const getCourseDetail = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/product/${id}`)
   }
   
   // categoryproduct
   export const getCategoryproduct = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/categoryproduct/')
   }
   export const getCategoryLessionsByCourse = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/learn/getCategoryLessionsByCourse/${id}`)
   }
   // categoryproduct
   export const deleteCategoryProduct = async (categoryId: string): Promise<AxiosResponse<any>> => {
     try {
       const response = await requestWithJwt.delete<any>(`/categoryproduct/${categoryId}`)
       return response
     } catch (error) {
       console.error('Error:', error)
       throw new Error('Failed to delete category course')
     }
   }
   export const updateCategoryProduct = async (categoryId: string, name: string, description: string): Promise<AxiosResponse<any>> => {
     try {
       const response = await requestWithJwt.put<any>(`/categoryproduct/${categoryId}`, { name, description })
       return response
     } catch (error) {
       console.error('Error:', error)
       throw new Error('Failed to update category course')
     }
   }
   export const getLessionByCategory = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/learn/getLessionByCategory/${id}`)
   }
   
   export const getLessionById = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/lessions/${id}`)
   }
   
   export const addEnrollments = async (payload: any): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>('/learn/addEnrollment', { data: payload })
   }
   
   export const getEnrollmentByUserId = async (): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>('/learn/getEnrollmentByUserId')
   }
   // export const getEnrollmentByCourseId = async (courseId: any): Promise<AxiosResponse<any>> => {
   //   return await requestWithJwt.get<any>(`/learn/getEnrollmentByCourseId/${courseId}`)
   // }
   export const getEnrollmentByCourseId = async ({
     courseId
   }: {
     courseId?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/learn/getEnrollmentByCourseId/${courseId}`)
   }
   
   export const getProgressByEnrollmentId = async ({
     id
   }: {
     id?: string
   }): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.get<any>(`/learn/getProgressByEnrollmentId/${id}`)
   }
   // categorycourse
   interface CategoryCourse {
     id: string
     name: string
     description: string
   }
   
   export const createCategoryProduct = async (name: string, description: string): Promise<AxiosResponse<CategoryCourse>> => {
     try {
       if (name.trim().length === 0) {
         throw new Error('Name cannot be empty')
       }
       if (description.trim().length === 0) {
         throw new Error('Description cannot be empty')
       }
       const response = await requestWithJwt.post<CategoryCourse>('/categoryproduct', { name, description })
       return response
     } catch (error: any) {
       console.error('Error:', error)
       if ((Boolean(error.response)) && error.response.status === 400) {
         throw new Error('Please provide valid name and description')
       } else {
         throw new Error('Tên danh mục này đã tồn tại')
       }
     }
   }
   export const addProgress = async (payload: any): Promise<AxiosResponse<any>> => {
     return await requestWithJwt.post<any>('/learn/addProgress', { data: payload })
   }
   export const getYoutubeVideo = async (videoId: string, apiKey: string): Promise<any> => {
     const response = await requestWithoutJwt.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics,status,player`)
     return response.data
   }
   // trang home
   interface ProductCategory {
    id: number;
    name: string;
    products: string[];
  }
  
  // Function to fetch the category products
  export const fetchCategoryProductWithNames = async (): Promise<AxiosResponse<{ data: ProductCategory[] }>> => {
    try {
      // Make the GET request to the /home endpoint
      return await requestWithJwt.get<{ data: ProductCategory[] }>('homeuser/home');
    } catch (error) {
      console.error('Error fetching category products with names:', error);
      throw error;
    }
  };
  export const getCategoryCourseData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/product/course-category')
}
export interface CheckCourseResponse {
  exists: boolean
  message: string
}
export const getCourseData1 = async ({
  categoryProduct
}: {
  categoryProduct?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/product/category_product/${categoryProduct}`)
}
// khách hàng
export const fetchAllCustomer = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/customer/')
}
export const updateCustomer = async (
  customerId: string,
  fullName: string,
  email: string,
  age?: number,
  address?: string,
  phone?: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.put<any>(`/customer/${customerId}`, {
      fullName,
      email,
      age,
      address,
      phone,
    });
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to update customer');
  }
};
export const fetchCustomerById = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/customer/${id}`);
};

// export const deleteCustomer = async (customerId: string): Promise<AxiosResponse<any>> => {
//   try {
//     const response = await requestWithJwt.put<any>(`/customer/delete/${customerId}`);
//     return response;
//   } catch (error) {
//     console.error('Error:', error);
//     throw new Error('Failed to delete customer');
//   }
// };
export const deleteCustomer = async (customerId: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.put<any>(`/customer/delete/${customerId}`); // Use PUT for soft delete
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to delete customer');
  }
};
export const getListCart = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/cart/${id}`);
};
export const getListCountCart = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/cart/all/${id}`);
};
export const deleteProductFromCart = async (customerId: number, cartId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>(`/cart/${customerId}/product/${cartId}`);
};
export const addProductToCart = async (cartData: {
  productId: number;
  custumerId: number;
  quantity: number;
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/cart/add', cartData);
};
export const addProductToCarts = async (cartData: {
  productId: number;
  custumerId: number;
  quantity: number;
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/cart/adds', cartData);
};
export const addProductDetaillToCarts = async (cartData: {
  productId: number;
  custumerId: number;
  quantity: number;
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/cart/addproducts', cartData);
};
// api chi tiết thêm sp vào giỏ hàng 'mua ngay'
export const addProductDetaillToCart = async (cartData: {
  productId: number;
  custumerId: number;
  quantity: number;
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/cart/addproduct', cartData);
};
// categoryproduct
export const fetchAllPay = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/order/pay/')
}
// thêm đơn hàng
interface OrderData {
  payID: number;
  status: number;
  custumerID: number;
  Tota_amount: number;
}

export const createOrder = async (orderData: OrderData): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.post('/order', orderData); // Assuming '/order' is the API endpoint
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
// api cập nhật số lượng thay đổi ở sản phẩm trong giỏ hàng
export const updateOrderQuantity = async (
  cartId: number, // ID của mục giỏ hàng để cập nhật
  updateData: handleInputChange
): Promise<AxiosResponse<any>> => {
  try {
    // Thực hiện PUT request để cập nhật số lượng giỏ hàng
    const response = await requestWithJwt.put(`/cart/update-quantity/${cartId}`, updateData); // Điều chỉnh endpoint cho phù hợp
    return response;
  } catch (error) {
    console.error('Error updating order quantity:', error);
    throw error;
  }
};
// chi tiết đơn hàng
interface OrderData {
  productId: number; // Assuming you want productId instead of ProductID
  quantity: number;
  orderID: number;
  price: number;
}

export const createOrderDetail = async (orderData: OrderData): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.post('/order/order-details', orderData);
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
// hiển thị hết đơn hàng
export const getlistOrder = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/order/')
}
// hiển thị chi tiết đơn hàng
export const getOrderDetail = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/order/${id}`);
};
// hiển thị đơn hàng theo user
export const getOrderCustomer = async (custumerID: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/order/custumer/${custumerID}`);
};
// cập nhật khi khách hàng hủy đơn
export const updateStatusOrder = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/order/updateStatus/${id}`);
};
export const addCmtProduct = async (cartData: {
  orderDetailId: number; // đảm bảo là `orderDetailId`
  content: string;
  number_star: number;
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/order/add_cmtproduct', cartData);
};
// sửa thông tin khách hàng từ khách hàng
export const updateCutommer = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/customer/update-customer/${id}`, payload);
}

// hiên thị bình luận và số sao 
export const getCmtProduct = async (producr: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/order/comments/all/${producr}`);
};
// hiển thị số cmt và số trung bình sao 
export const getcountcmtStart = async (producr: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/order/comments/allcmt/${producr}`);
};
export const updateordersuccess = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  // console.log('payload:', payload)
  return await requestWithJwt.put<any>(`/order/updateStatusuccess/${id}`, { data: payload })
}
// hiển thị đơn hàng chờ xử lý cho nhân viên
export const getlistOrderconfirma = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/order/confirma/confirma')
}
export const updateorderconfirma = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  // console.log('payload:', payload)
  return await requestWithJwt.put<any>(`/order/updateorderconfirma/${id}`, { data: payload })
}
// hiển thị tin nhắn
export const getchatbot = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/chatbot/client/${id}`);
};
// thêm tin nhắn cho khách hàng
export const addcontentcustumer = async (contentData: {
  custumerID: number; // đảm bảo là `orderDetailId`
  content: string;
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/chatbot/', contentData);
};
// chat
export const fetchAllChatbot = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/chatbot')
}
// hiển thị tin nhắn cho khách hàng để quản lý xem
export const getChatMessages  = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/chatbot/${id}`);
};
// thêm tin nhắn rep khách hàng cho quản lý
// thêm tin nhắn cho khách hàng
export const addchatleader = async (contentData: {
  userID: number; // đảm bảo là `orderDetailId`
  content: string;
  name : string;
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/chatbot/all/', contentData);
};
// hiển thị đơn hàng chờ giao cho shipper
export const getlistOrdershipper = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/order/confirma/shipper')
}
// update trạng thánh thành công
export const updateordersucees = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  // console.log('payload:', payload)
  return await requestWithJwt.put<any>(`/order/succes/${id}`, { data: payload })
}
// update trạng thánh thất bại
export const updateordererorr = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  // console.log('payload:', payload)
  return await requestWithJwt.put<any>(`/order/erorr/${id}`, { data: payload })
}
// hiển thị thông số thống kê của đơn hàng
export const getlistDashboard= async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/order/order-stats/count')
}
// hiển thị khách hàng và hạng
export const getlistDashboardcustomer= async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/order/dashboard/customer')
}
// hiển thị sản phẩm đã bán
export const getlistDashboardproduct= async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/order/dashboard/order-details')
}
// hiển thị thông tin full của thống kê
export const getlistDashboardfull = async (day: string, month?: string, year?: string): Promise<AxiosResponse<any>> => {
  const params = { day, month, year };  // Include the date filters
  return await requestWithJwt.get<any>('/order/orders/dashboard', { params });
}
// hiên thị bình luận và số sao cho admin xem
export const getNumberStart = async (start: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/order/comments/all1/${start}`);
};
// cập nhật số lượng tồn kho khi trừ
export const updateProductInventory = async (productID: string, quantity: number): Promise<AxiosResponse<any>> => {
  // payload chứa productID và quantity
  const payload = {
    productID: productID,
    quantity: quantity
  };

  // Gửi request POST đến API /update-inventory
  return await requestWithJwt.post<any>('/order/update_inventory', payload);
}
// cập nhật số lượng tồn kho khi công
export const updateProductsumInventory = async (productID: string, quantity: number): Promise<AxiosResponse<any>> => {
  // payload chứa productID và quantity
  const payload = {
    productID: productID,
    quantity: quantity
  };

  // Gửi request POST đến API /update-inventory
  return await requestWithJwt.post<any>('/order/sum_update_inventory', payload);
}
// thêm đánh giá trang web cho khách hàng
export const reViewShop = async (customerID: string, number_star: number): Promise<AxiosResponse<any>> => {
  // payload chứa productID và quantity
  const payload = {
    customerID: customerID,
    number_star: number_star
  };

  // Gửi request POST đến API /update-inventory
  return await requestWithJwt.post<any>('/order/review/customer', payload);
}
// Cộng thêm tiền đơn hàng vào cột .. của bảng customer
export const updateRewardPoints = async (currentUserID: number, Tota_amount: number): Promise<AxiosResponse<any>> => {
  // payload chứa customerID và Tota_amount
  const payload = {
    currentUserID: currentUserID,  // Đổi từ currentUserID thành customerID
    Tota_amount: Tota_amount  // Đảm bảo Tota_amount là số
  };

  // Gửi request POST đến API /update-reward-points
  return await requestWithJwt.post<any>('/order/sum/_update_reward_points', payload);
};
// hiển thị tổng cmt, số sao từng %
export const getlistCommentsStart= async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('order/comments/all/start/all')
}
// hiên thị bình luận tất cả
export const getlistComments= async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('order/comments/all/start/all/numberstart')
}

export const getlistCommentsStart1= async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('order/comments/all/start/all1')
}