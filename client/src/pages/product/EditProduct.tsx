/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// PAGE: Product
//    ========================================================================== */
// PAGE: Product
//    ========================================================================== */
import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { updateProduct, getProductById, getCategoryProductData } from '../../api/post/post.api'
import { toast } from 'react-toastify'
import { FileRejection, ErrorCode as DropzoneErrorCode, Accept } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  getBase64,
  getVideoCover
} from '../../utils/fileconfig'
import PreviewFiles from '../../components/PreviewFiles'
import UploadFiles from '../../components/UploadFiles'
import { IUploadFile } from '../../api/interfaces'


interface Product {
  id: string
  categoryCourseId: number
  name: string
  assignedBy: number
  Discount: number
  Inventory_quantity: number
  description: string
  locationPath: string | File
  prepare: string
  price: string
  publicStatus: number
  publicDate: string | null
}
interface IForm {
  locationPath: IUploadFile[]
}

const MAX_FILE_SIZE = 1024 * 1024 * 5
const MAX_NUMER_OF_FILES = 1

const FormValidationSchema = z.object({
  locationPath: z.array(z.instanceof(File)).min(1, 'Vui lòng chọn file!')
})

interface ErrorState {
  nameExists: boolean
}

interface Category {
  id: number
  name: string
}

const EditProduct = () => {
  const [dataCategory, setDataCategory] = useState<Category[] | null>(null)
  const [productData, setCourseData] = useState<Product | null>(null)
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [errorState, setErrorState] = useState<ErrorState>({ nameExists: false })
  const [statusChecked, setStatusChecked] = useState<boolean>(false)
  const [publicChecked, setPublicChecked] = useState<boolean>(false)
  const [descriptionParts, setDescriptionParts] = useState<string[]>([])
  const [newImage] = useState<File | null>(null)
  const [hasError, setHasError] = useState(false)

  const { id } = useParams<{ id?: string }>()

  useEffect(() => {
    if (productData) {
      const { publicStatus } = productData
      const { description } = productData
      const descriptionParts = description ? description.split(';;') : ['']
      setDescriptionParts(descriptionParts)
      console.log('Initial publicStatus:', publicStatus)
      setStatusChecked(publicStatus !== 0)
      setPublicChecked(publicStatus === 1 || publicStatus === 2)
      if (publicStatus === 2) {
        setPublicChecked(false) // Chọn radio "Hidden"
      }
      console.log(productData)
      // console.log('Initial statusChecked:', publicStatus !== 0)
      // console.log('Initial publicChecked:', publicStatus === 1)
    }
  }, [productData])

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    console.log('handleStatusChange - checked:', checked)
    setStatusChecked(checked)

    if (!checked) {
      setPublicChecked(false)
      setCourseData(prevState => ({
        ...(prevState as Product),
        publicStatus: 0,
        publicDate: '' // Set publicDate to null when status is unchecked
      }))
    } else if (publicChecked) {
      setCourseData(prevState => ({
        ...(prevState as Product),
        publicStatus: 1
      }))
    } else {
      setCourseData(prevState => ({
        ...(prevState as Product),
        publicStatus: 2
      }))
    }
    console.log('handleStatusChange - new courseData:', productData)
  }

  const { control, watch, getValues, setValue } = useForm<IForm>({
    defaultValues: {
      locationPath: []
    },
    shouldFocusError: false,
    resolver: zodResolver(FormValidationSchema)
  })

  const handleRemoveFile = (uid: string) => {
    const newFileList = getValues('locationPath').filter((file) => file.uid !== uid)
    setValue('locationPath', [...newFileList])
  }

  const handleChangeFile = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    const totalFiles =
      getValues('locationPath').length + acceptedFiles.length + fileRejections.length

    if (fileRejections.length || totalFiles > MAX_NUMER_OF_FILES) {
      const errorCode = fileRejections[0]?.errors?.[0]?.code
      setHasError(true)

      if (
        errorCode === DropzoneErrorCode.TooManyFiles ||
          totalFiles > MAX_NUMER_OF_FILES
      ) {
        toast.error(`Bạn chỉ được upload tối đa ${MAX_NUMER_OF_FILES} ảnh!`, {
          progress: undefined
        })
      } else if (errorCode === DropzoneErrorCode.FileInvalidType) {
        toast.error('Tệp tin này chưa được hổ trọ', {
          progress: undefined
        })
      } else if (errorCode === DropzoneErrorCode.FileTooLarge) {
        toast.error(
          'Bạn chỉ được phép upload tối đa file ảnh dưới 5MB!',
          {
            progress: undefined
          }
        )
      }
      return
    } else {
      setHasError(false) // Reset the error state if no errors
    }

    const acceptedFileListWithPreview: Array<Promise<IUploadFile>> =
      acceptedFiles.map(async (file) => ({
        uid: uuidv4(),
        originalFileObj: file,
        preview: await (file.type.includes('image')
          ? getBase64(file)
          : getVideoCover(file))
      }))

    Promise.all(acceptedFileListWithPreview).then((results) =>
      setValue('locationPath', [...getValues('locationPath'), ...results], {
        shouldValidate: true,
        shouldDirty: true
      })
    )
  }
  const getAcceptedFileTypes = (): Accept => {
    return { 'image/png': ['.png', '.jpg', '.jpeg'] } // Cho phép các định dạng ảnh khác nhau
  }

  const handlePublicRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (statusChecked) {
      setPublicChecked(true)
      setCourseData(prevState => ({
        ...(prevState as Product),
        publicStatus: 1,
        publicDate: ''
      }))
    }
  }

  const handleHiddenRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (statusChecked) {
      setPublicChecked(false)
      setCourseData(prevState => ({
        ...(prevState as Product),
        publicStatus: 2,
        publicDate: ''
      }))
    }
  }

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (id) {
          const response = await getProductById({ id })
          // console.log('check loadddddddddddddddddddddddddddddddddd', getProductById.data)
          const fetchedCourseData = response.data
          console.log('Fetched product Data:', fetchedCourseData)

          // Create a new object without the publicDate property if publicStatus is 0
          const updatedCourseData = (fetchedCourseData.publicStatus === 0 || fetchedCourseData.publicStatus === 2)
            ? { ...fetchedCourseData, publicDate: null } // Set publicDate to null
            : fetchedCourseData

          setCourseData(updatedCourseData)

          const { publicStatus } = fetchedCourseData
          console.log('publicStatus:', publicStatus)
        }
      } catch (error) {
        console.error('Không thể tải dữ liệu khóa học:', error)
      }
    }

    fetchCourseData()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Update courseData state
    setCourseData(prevState => ({
      ...(prevState as Product),
      [name]: value
    }))

    // Clear invalid field if user changes its value
    setInvalidFields(prevState => prevState.filter(field => field !== name))
  }
  const handleCancel = () => {
    window.location.href = '/product'
  }
  const removeInputDescriptionParts = (indexToRemove: number) => {
    // Nếu chỉ còn một phần tử trong mảng, không cho phép xóa
    if (descriptionParts.length === 1) {
      toast.error('Bạn không thể xóa dòng cuối') // Hiển thị thông báo lỗi
      return
    }
    setDescriptionParts((prevParts) => {
      const updatedParts = prevParts.filter((_, index) => index !== indexToRemove)
      // Log the updated descriptionParts after removal
      console.log('Updated descriptionParts:', updatedParts)
      // Concatenate the remaining parts to update `description`
      const updatedDescription = updatedParts.join(';;') // Ensure delimiter is consistent
      // Log the updated `description` string
      console.log('Updated description string:', updatedDescription)
      // Update courseData with the new `description` value
      setCourseData((prevCourseData) => {
        if (!prevCourseData) {
          return null // Handle the case where courseData is null
        }
        const newCourseData = {
          ...prevCourseData,
          description: updatedDescription // Update the description field
        }
        return newCourseData
      })
      return updatedParts
    })
    toast.success(`Xóa mô tả dòng  ${indexToRemove + 1} thành công`)
  }
  const handleDescriptionPartChange = (
    e: React.ChangeEvent<HTMLInputElement>, // Updated to HTMLInputElement
    index: number
  ) => {
    const newDescriptionParts = [...descriptionParts]
    newDescriptionParts[index] = e.target.value
    setDescriptionParts(newDescriptionParts)

    // Update the description field in courseData with the concatenated string
    const newDescription = newDescriptionParts.join(';;')
    setCourseData((prevState) => ({
      ...(prevState as Product),
      description: newDescription
    }))
  }

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setCourseData((prevState) => ({
      ...(prevState as Product),
      [name]: Number(value)
    }))
    setInvalidFields((prevState) => prevState.filter(field => field !== name))
  }

  const validateFields = (data: Product) => {
    if (data.categoryCourseId === 0) {
      toast.error('Vui lòng chọn danh mục sản phẩm !');
      return ['categoryCourseId'];
    }
    if (data.name.trim() === '') {
      toast.error('Tên sản phẩm không bỏ trống');
      return ['name'];
    }
    if (!/^\d+(\.\d+)?$/.test(data.price.trim())) {
      toast.error('Giá gốc yêu cầu nhập số');
      return ['price'];
    }
    
    const discountValue = parseFloat(String(data.Discount));
    const priceValue = parseFloat(data.price.trim());
  
    if (discountValue >= priceValue) {
      toast.error('Giảm giá phải nhỏ hơn giá gốc');
      return ['Discount'];
    }
  
    if (data.publicStatus === 1) {
      if (!data.publicDate || data.publicDate.trim() === '') {
        toast.error('Yêu cầu chọn ngày');
        return ['publicDate'];
      }
    }
  
    // Inventory_quantity validation
    if (String(data.Inventory_quantity).trim() === '') {
      toast.error('Số lượng tồn kho không để trống');
      return ['Inventory_quantity'];
    }
    if (!/^\d+$/.test(String(data.Inventory_quantity).trim())) {
      toast.error('Số lượng tồn kho phải là số nguyên');
      return ['Inventory_quantity'];
    }
  
    return [];
  };
  
  const handleUpdateCourse = async () => {
    if (!id || !productData) {
      toast.error('Không tìm thấy sản phẩm')
      return
    }
    const cleanedDescription = productData.description
    .split(';;')
    .filter((part) => part.trim() !== '')
    .join(';;')
    const updatedCourseData = {
      ...productData,
      description: cleanedDescription
    }

    const invalid = validateFields(productData)
    setInvalidFields(invalid)
    if (invalid.length > 0) {
      return
    }

    // If statusChecked is false, set publicDate to null
    if (!statusChecked) {
      productData.publicDate = null
    } else if (productData.publicStatus === 2) {
      productData.publicDate = new Date().toISOString()
    }

    const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id)
    productData.assignedBy = currentUserID // Set the assignedBy field

    // Check if publicDate is less than the current date
    // const currentDate = new Date().toISOString()
    // if (courseData.publicDate && courseData.publicDate < currentDate) {
    //   toast.error('Public Date cannot be in the past')
    //   setInvalidFields([...invalidFields, 'publicDate'])
    //   return
    // }
    if (!statusChecked) {
      updatedCourseData.publicDate = null
    } else if (updatedCourseData.publicStatus === 2) {
      updatedCourseData.publicDate = new Date().toISOString()
    }

    const formData = new FormData()
    formData.append('categoryCourseId', String(productData.categoryCourseId))
    formData.append('name', productData.name)
    formData.append('assignedBy', String(productData.assignedBy))
    formData.append('Discount', String(productData.Discount))
    formData.append('Inventory_quantity', String(productData.Inventory_quantity))
    formData.append('description', productData.description)
    formData.append('prepare', productData.prepare)
    formData.append('price', String(productData.price))
    formData.append('publicStatus', String(productData.publicStatus)) // Convert number to string
    if (productData.publicDate) {
      formData.append('publicDate', productData.publicDate)
    }

    // Check if 'locationPath' is empty and show an error message
    const selectedFiles = watch('locationPath')
    if (!selectedFiles && !productData.locationPath) {
      toast.error('Không bỏ trống ảnh')
      return
    }

    if (selectedFiles && selectedFiles.length > 0) {
      // Append the first file in locationPath (as the max number of files is 1)
      formData.append('locationPath', selectedFiles[0].originalFileObj)
    } else if (typeof productData.locationPath === 'string') {
      // If the existing image path is just a string (e.g., URL), append it
      formData.append('locationPath', productData.locationPath)
    }

    try {
      
      await updateProduct(id, formData)
      toast.success('Sửa sản phẩm thành công')
      // toast.success('Course updated successfully')
      window.location.href = '/product' // Redirect after successful update
    } catch (error) {
      const responseError = error as { message?: string }
      if (responseError.message === 'Product name already exists.') {
        setErrorState(prevState => ({ ...prevState, nameExists: true }))
        toast.error('Tên sản phẩm bị trùng.')
      } else {
        toast.error('lỗi hệ thống khi cập nhật.')
      }
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const response = await getCategoryProductData()
      setDataCategory(response.data)
    } catch (error) {
      setDataCategory(null)
    }
  }, [])

  const formatDateForDatetimeLocal = (dateString: string | null) => {
    if (!dateString) {
      return ''
    }
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const categoryNames = dataCategory?.map((item: Category) => ({ id: item.id, name: item.name })) ?? []

  return (
    <div className="flex flex-col space-y-4 mb-10">
      <div><h1 className='mt-5 ml-5 text-4xl'>Chỉnh sửa sản phẩm</h1></div>
      {productData && (
        <table className="border border-gray-300 bg-gray-100 ml-5 mr-5 rounded-md">
          <tbody>
            <div className="lg:flex md:flex mt-2 ">
              <div className="md:w-1/2 mr-5 ml-5">
                <label htmlFor="categoryCourseId" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                  Danh mục sản phẩm
                </label>
                <select
                  name='categoryCourseId'
                  className={`w-full bg-gray-100 border h-10 text-gray-800 outline-none cursor-pointer rounded-md mt-2 ${
                    invalidFields.includes('categoryCourseId') ? 'border-red-500' : ''
                  }`}
                  value={productData.categoryCourseId}
                  onChange={handleCategoryChange}
                >
                  <option value="">Danh mục Sản phẩm</option>
                  {categoryNames.map((category: Category, index: number) => (
                    <option key={index} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:w-1/2 ml-5 mr-5">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900  mt-2">
                  Tên sản phẩm:
                </label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  className={`bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                    invalidFields.includes('name') || errorState.nameExists ? 'border-red-500' : ''
                  }`}
                  placeholder='yêu cầu nhập tên sản phẩm'
                />
              </div>
            </div>
            <div className="ml-5 mr-5">
              <label className="block text-sm font-medium text-gray-900 ml-2">
               Mô tả sản phẩm:
              </label>
              {descriptionParts.map((part, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <input
                      name={`descriptionPart${index + 1}`}
                      value={part}
                      onChange={(e) => handleDescriptionPartChange(e, index)}
                      className="w-full border p-4 rounded px-3 py-2 mt-2 mb-2 text-gray-900"
                      placeholder={`Mô tả dòng ${index + 1} có thể bỏ qua`}
                    />
                  </div>
                  <svg
                    className="ml-2 mt-2 h-8 w-8 fill-current text-red-500 cursor-pointer"
                    viewBox="0 0 16 16"
                    onClick={() => {
                      removeInputDescriptionParts(index)
                      // toast.success(`Description Part ${index + 1} Successfully deleted.`)
                    }}
                  >
                    <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                  </svg>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDescriptionParts([...descriptionParts, '']) // Thêm dòng input mới
                  // toast.success('New Description Part added')
                }}
                className="btn bg-green-500 mt-3 hover:bg-green-400 p-1.5 rounded-sm"
              >
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                </svg>
              </button>
            </div>
              <div className="w-1/2 ml-5 mr-5 hidden">
                <label htmlFor="assignedBy" className="block mb-2 text-sm font-medium text-gray-900 mt-2">Người chỉnh sửa:</label>
                <input
                  type="number"
                  name="assignedBy"
                  value={productData.assignedBy}
                  onChange={handleInputChange}
                  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg hidden focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 mt-4 ${
                    invalidFields.includes('assignedBy') ? 'border-red-500' : ''
                  }`}
                  placeholder='Người chỉnh sửa'
                />
              </div>

            <div className="lg:flex md:flex">
              <div className="md:w-1/3 ml-5 mr-5 ">
                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                  Giá gốc (Ngàn VND):
                </label>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleInputChange}
                    className={`bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                      invalidFields.includes('price') ? 'border-red-500' : ''
                    }`}
                    placeholder='Yêu cầu nhập giá gốc'
                  />
              </div>
              <div className="md:w-1/3 ml-5 mr-5 mt-1">
                <label htmlFor="Discount" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                  Giảm giá (Ngàn VND):
                </label>
                <input
                  type="number"
                  name="Discount"
                  value={productData.Discount}
                  onChange={handleInputChange}
                  className={`bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                    invalidFields.includes('Discount') ? 'border-red-500' : ''
                  }`}
                  placeholder='Giảm giá có thể bỏ qua'
                />

              </div>
              <div className="md:w-1/3 ml-5 mr-5 mt-1">
                <label htmlFor="Inventory_quantity" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                Số lượng tồn kho:
                </label>
                <input
                  type="number"
                  name="Inventory_quantity"
                  value={productData.Inventory_quantity}
                  onChange={handleInputChange}
                  className={`bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                    invalidFields.includes('Inventory_quantity') ? 'border-red-500' : ''
                  }`}
                  placeholder='Yêu cầu nhập số lượng tồn kho'
                />

              </div>
            </div>
            <div className="lg:flex md:flex">
              <div className="md:w-1/2 ml-5 mr-5">
              <label
                htmlFor="locationPath"
                className="block mb-2 text-sm font-medium text-gray-900 mt-2"
              >
                Ảnh sản phẩm
              </label>
              <Controller
                control={control}
                name="locationPath"
                render={({ fieldState: { error } }) => (
                  <UploadFiles
                    maxFiles={MAX_NUMER_OF_FILES}
                    multiple
                    maxSize={MAX_FILE_SIZE}
                    accept={getAcceptedFileTypes()}
                    onDrop={handleChangeFile}
                    errorMessage={error?.message}
                    className={hasError ? 'border border-red-500' : ''}
                  />
                )}
              />
              <PreviewFiles
                fileList={watch('locationPath')}
                onRemoveFile={handleRemoveFile}
                className="mt-4"
              />

              {!(newImage ?? watch('locationPath')?.length > 0) && (
                <img
                className="object-contain max-w-full max-h-full rounded-t-md transition-transform Discount-700 hover:scale-110 mt-2.5"
                src={
                  productData.locationPath
                    ? require(`../../../public/assets/images/uploads/product/${productData.locationPath}`)
                    : 'https://picsum.photos/200/300'
                }
                style={{ width: '250px', height: '150px' }}
                alt="CourseImage"
              />
              
              )}
            </div>

                <div className="md:w-1/2 block ml-5 mr-5">
                  <div className="flex items-center mt-2">
                    <label className="block text-sm font-medium text-gray-900 mr-2">Trạng thái:</label>
                    <input
                      type="checkbox"
                      checked={statusChecked}
                      onChange={handleStatusChange}
                      className="ml-3"
                    />
                  </div>
                  {statusChecked && (
                    <div className="flex flex-col mt-2">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="publicAppointments"
                          name="publicStatus"
                          checked={publicChecked}
                          onChange={handlePublicRadioChange}
                          className="mr-2"
                        />
                        <div className="lg:w-full block mr-5">
                          <label
                            htmlFor="publicStatus"
                            className="text-sm font-medium text-gray-900 whitespace-nowrap mr-5"
                          >
                            Hiển thị theo thời gian:
                          </label>
                          <input
                            type="datetime-local"
                            name="publicDate"
                            value={productData.publicDate ? formatDateForDatetimeLocal(productData.publicDate) : ''}
                            onChange={handleInputChange}
                            className={`border bg-gray-100 rounded-md px-3 py-2 ${
                              invalidFields.includes('publicDate') ? 'border-red-500' : ''
                            } `}
                          />
                        </div>
                      </div>
                      <div className="flex items-center text-gray-900">
                        <input
                          type="radio"
                          id="public"
                          name="publicStatus"
                          checked={!publicChecked && statusChecked}
                          onChange={handleHiddenRadioChange}
                          className="mr-2"
                        />
                        <label htmlFor="public Now">Hiển thị lập tức:</label>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </tbody>
          <div className="flex justify-end mb-5">
            <button className="bg-gray-300 text-black px-4 py-2 rounded-full mr-2 hover:bg-gray-400 hover:text-black border border-gray-300 min-w-[100px]"onClick={handleCancel}>Hủy</button>
              <button
                onClick={handleUpdateCourse}
                className="bg-teal-400 text-white font-bold py-2 px-4 hover:bg-teal-500 rounded-full border border-teal-500 mr-4"
              >
                Lưu
            </button>
          </div>
        </table>
      )}
    </div>
  )
}

export default EditProduct
