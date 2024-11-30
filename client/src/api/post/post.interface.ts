/* POST API INTERFACES
   ========================================================================== */

import { IBaseResponse } from '../interfaces'

export interface IPostData {
  createdAt: string
  name: string
  id: string
}

export interface IPostResponse extends IBaseResponse {
  data: IPostData
}

export interface IPostListResponse extends IBaseResponse {
  data: IPostData[]
}

export type ExamItem = Record<string, any>
export type CourseItem = Record<string, any>
export interface DataListExam {
  data: ExamItem[]
  page: number
  size: number
  totalRecords: number
};

export interface ListExamParams {
  page?: number
  search?: string
}
export interface DataListCourse {
  data: CourseItem[]
  page: number
  size: number
  totalRecords: number
};

export interface ListCourseParams {
  page?: number
  search?: string
  startDate?: Date
  endDate?: Date
  category?: string
}

export type User = Record<string, any>
export interface DataListUser {
  totalPages: number
  data: User[]
  page: number
  size: number
  totalRecords: number
  totalPage: number
};
export interface ListUserParams {
  page?: number
  search?: string
  sortKey?: keyof DataListUser | null
  sortDirection?: 'ASC' | 'DESC' | 'none'
}

export type Permission = Record<string, any>
export interface DataListPermission {
  totalPages: number
  data: Permission[]
  page: number
  size: number
  totalRecords: number
  totalPage: number
};
export interface ListPermissionParams {
  page?: number
  search?: string
  sortKey?: keyof DataListUser | null
  sortDirection?: 'ASC' | 'DESC' | 'none'
}
