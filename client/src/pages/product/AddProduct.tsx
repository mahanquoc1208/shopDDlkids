/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// PAGE: Product
//    ========================================================================== */
import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { addProduct, getCategoryProductData } from '../../api/post/post.api'
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
// import { getFromLocalStorage } from 'utils/functions'

interface Product {
  categoryCourseId: number
  name: string
  assignedBy: number
  Discount: string // consider changing this to number if it's always a number
  Inventory_quantity: string // consider changing this to number if it's always a number
  description: string
  locationPath: string
  price: string
  file?: File // Change this property to File
  publicStatus: number
  status: number // 0 or 1 based on checkbox
  publicDate: string | null // Date if publicStatus is 1
  descriptionParts?: string[]
}

interface Category {
  id: number
  name: string
}
interface IForm {
  locationPath: IUploadFile[]
}
const MAX_FILE_SIZE = 1024 * 1024 * 5
const MAX_NUMER_OF_FILES = 1

const FormValidationSchema = z.object({
  locationPath: z.array(z.instanceof(File)).min(1, 'Vui lòng chọn file!')
})

const AddProduct = () => {
  const [dataCategory, setDataCategory] = useState<Category[] | null>(null)
  const [, setImagePreview] = useState<string | null>(null)
  const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id)
  const [isChecked, setIsChecked] = useState(false)
  // const tokens = getFromLocalStorage('tokens')
  // const currentUserID = tokens.id
  const [productData, setCourseData] = useState<Product>({
    categoryCourseId: 0,
    name: '',
    assignedBy: currentUserID,
    Discount: '',
    Inventory_quantity: '',
    description: '',
    locationPath: '',
    price: '',
    publicStatus: 0,
    status: 1,
    publicDate: null,
    descriptionParts: [''], // Initialize as an array of strings
  })
  // const currentUserID = Number(getFromLocalStorage('tokens')?.id)

  const [invalidFields, setInvalidFields] = useState<string[]>([])

  useEffect(() => {
    fetchData()
    console.log(fetchData)
  }, [])
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsChecked(checked)
    setCourseData(prevState => ({
      ...prevState,
      publicStatus: checked ? 2 : 0, // Default to Hidden if checked
      publicDate: checked ? null : prevState.publicDate // Set publicDate to null when checked
    }))
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setCourseData(prevState => ({
      ...prevState,
      publicStatus: value === 'publicDate' ? 1 : 2, // Set publicStatus based on selected radio button
      publicDate: value === 'publicDate' ? prevState.publicDate : null // Retain publicDate if 'publicDate' is selected
    }))
  }
  const fetchData = useCallback(async () => {
    try {
      const response = await getCategoryProductData()
      setDataCategory(response.data)
    } catch (error) {
      setDataCategory(null)
    }
  }, [])
  const removeInput = (index: number) => {
    if (productData.descriptionParts) {
      const newDescriptionParts = productData.descriptionParts.filter((_, i) => i !== index)
      console.log('Updated descriptionParts:', newDescriptionParts) // Kiểm tra giá trị mới
      setCourseData({
        ...productData,
        descriptionParts: newDescriptionParts
      })
    }
  }
  const addNewInput = () => {
    if (productData.descriptionParts) {
      // Tạo một bản sao mới của mảng descriptionParts và thêm phần tử mới
      const newDescriptionParts = [...productData.descriptionParts, '']

      setCourseData({
        ...productData,
        descriptionParts: newDescriptionParts
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // Ensure courseData.descriptionParts and courseData.prepareParts are defined as arrays
    const newDescriptionParts = productData.descriptionParts ? [...productData.descriptionParts] : []
    // const newPrepareParts = productData.prepareParts ? [...productData.prepareParts] : []

    // Handle description parts
    if (name.startsWith('descriptionPart')) {
      const index = parseInt(name.replace('descriptionPart', ''), 10) - 1
      newDescriptionParts[index] = value

      const description = newDescriptionParts.filter(Boolean).join(';; ')
      setCourseData(prevState => ({
        ...prevState,
        descriptionParts: newDescriptionParts,
        description
      }))

      if (invalidFields.includes(name)) {
        setInvalidFields(prevState => prevState.filter(field => field !== name))
      }
      console.log('Current courseData before API call:', productData)
    }
    const description = newDescriptionParts.filter(Boolean).join(';; ')
    setCourseData(prevState => ({
      ...prevState,
      descriptionParts: newDescriptionParts, // Update the descriptionParts array
      description: newDescriptionParts.filter(Boolean).join(';; ') // Combine all description parts
    }));

    if (name === 'publicDate') {
      setCourseData(prevState => ({
        ...prevState,
        publicDate: value
      }))
    } else if (name === 'locationPath') {
      const fileInput = e.target as HTMLInputElement
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0]
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          setImagePreview('')
          setCourseData(prevState => ({
            ...prevState,
            file: undefined,
            locationPath: '',
            publicStatus: prevState.publicStatus,
            publicDate: prevState.publicDate
          }))
          setInvalidFields(prevState => prevState.filter(field => field !== 'locationPath'))
        } else {
          setCourseData(prevState => ({
            ...prevState,
            file,
            locationPath: file.name,
            publicStatus: prevState.publicStatus,
            publicDate: prevState.publicDate
          }))
          const reader = new FileReader()
          reader.onloadend = () => {
            setImagePreview(reader.result as string)
          }
          reader.readAsDataURL(file)
          setInvalidFields(prevState => prevState.filter(field => field !== 'locationPath'))
        }
      }
    } else {
      setCourseData(prevState => ({
        ...prevState,
        [name]: value
      }))
      if (invalidFields.includes(name)) {
        e.target.classList.add('border-red-500')
      } else {
        e.target.classList.remove('border-red-500')
      }
      setInvalidFields(prevState => prevState.filter(field => field !== name))
      if (name === 'publicDate' && productData.publicStatus === 1) {
        setInvalidFields(prevState => prevState.filter(field => field !== 'publicDate'))
      } else if (invalidFields.includes(name)) {
        e.target.classList.add('border-red-500')
      } else {
        e.target.classList.remove('border-red-500')
      }
    }
  }

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setCourseData((prevState) => ({
      ...prevState,
      [name]: Number(value)
    }))

    // Remove field from invalidFields if it becomes valid
    setInvalidFields((prevState) => prevState.filter(field => field !== name))
  }
  // hàm kiểm tra các lỗi
  const validateFields = (data: Product) => {
    const invalid: string[] = []
    const now = new Date()
    now.setHours(now.getHours() + 7) // Add 7 hours to the current time
    const nowString = now.toISOString().slice(0, 16) // Convert to "yyyy-MM-ddTHH:mm" format
    if (data.Discount === '') {
      data.Discount = '0';
    }

    if (data.categoryCourseId === 0) {
      invalid.push('categoryCourseId')
      toast.error('Vui lòng chọn danh mục sản phẩm')
    } else if (data.name.trim() === '') {
      invalid.push('name')
      toast.error('Tên sản phẩm không bỏ trống')
    } 
    // else if (String(data.Discount).trim() === '') {
    //   invalid.push('Discount')
    //   toast.error('Giảm giá không bỏ trống')
    // }
     else if (!/^\d+(\.\d{1,2})?$/.test(String(data.Discount))) {
      invalid.push('Discount');
      toast.error('Giảm giá phải là số');
    }
    else if (data.price.trim() === '') {
      invalid.push('price')
      toast.error('Giá gốc không bỏ trống')
    } else if (!/^\d+(\.\d+)?$/.test(data.price.trim())) {
      invalid.push('price')
      toast.error('Giá gốc phải là số')
    } else if (data.publicStatus === 1 && (!data.publicDate || data.publicDate <= nowString)) {
      invalid.push('publicDate')
      toast.error('Ngày Hiển thị phải là ngày tương lai')
    }
    else if (parseFloat(data.Discount) >= parseFloat(data.price)) {
      invalid.push('Discount')
      toast.error('Giá gốc phải lớn hơn giảm giá')
      // Add red border to the Discount field
    }
    else if (data.Inventory_quantity.trim() === '') {
      invalid.push('Inventory_quantity')
      toast.error('Số lượng tồn kho không bỏ trống')
    }else if (!/^\d+$/.test(data.Inventory_quantity.trim())) {
      invalid.push('Inventory_quantity');
      toast.error('Số lượng tồn kho phải là số nguyên');
    }    
    return invalid
  }

  const handleAddProduct = async () => {
    // Update publicDate for 'Public' status before validation
    if (productData.publicStatus === 2) {
      productData.publicDate = new Date().toISOString()
    }

    const invalid = validateFields(productData)
    setInvalidFields(invalid)

    if (invalid.length === 0) {
      // Check file extension here
      const file = productData.file as File
      if (file) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          toast.error('Only image files (jpg, jpeg, png, gif) are allowed')
          setInvalidFields((prevState) => [...prevState, 'locationPath'])
          return
        }
      } else {
        toast.error('Vui lòng tải lên một tệp hình ảnh ')
        setInvalidFields((prevState) => [...prevState, 'locationPath'])
        return
      }

      if (isChecked && !(productData.publicStatus === 1 || productData.publicStatus === 2)) {
        toast.error('Yêu cầu chọn')
        setInvalidFields((prevState) => [...prevState, 'publicStatus'])
        return
      }

      try {
        const formData = new FormData()
        Object.keys(productData).forEach((key) => {
          if (key !== 'file' && (key !== 'publicDate' || productData.publicDate !== null)) {
            formData.append(key, String(productData[key as keyof Product]))
          }
        })

        if (productData.file) {
          formData.append('file', productData.file) // Ensure file is appended to FormData
        }

        await addProduct(formData)
        toast.success('Thêm sản phẩm thành công')
        window.location.href = '/product'

        setCourseData({
          categoryCourseId: 0,
          name: '',
          assignedBy: currentUserID,
          Discount: '',
          Inventory_quantity: '',
          description: '',
          locationPath: '', // Reset locationPath after successful submission
          price: '',
          publicStatus: 0,
          status: 1,
          publicDate: null,
          descriptionParts: [''], // Initialize as an array of strings
        })
        // boder đỏ các lỗi bên server
      } catch (error: any) {
        if (error.message === 'A product with this name already exists') {
          toast.error('Tên sản phẩm bị trùng')
          setInvalidFields((prevState) => [...prevState, 'name'])
        } else {
          toast.error('An error occurred while adding the product')
        }
      }
    }
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

    // Clear the file from courseData if no files are left
    if (newFileList.length === 0) {
      setCourseData(prevState => ({
        ...prevState,
        file: undefined
      }))
    }
  }

  const handleChangeFile = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    const totalFiles =
      getValues('locationPath').length + acceptedFiles.length + fileRejections.length

    // Reset invalidFields trước khi kiểm tra lỗi
    setInvalidFields(prev => prev.filter(field => field !== 'locationPath'))
    // kiểm tra các lỗi bên upload ảnh
    if (fileRejections.length || totalFiles > MAX_NUMER_OF_FILES) {
      const errorCode = fileRejections[0]?.errors?.[0]?.code
      if (
        errorCode === DropzoneErrorCode.TooManyFiles ||
        totalFiles > MAX_NUMER_OF_FILES
      ) {
        toast.error('Bạn chỉ được upload 1 ảnh', {
          progress: undefined
        })
        setInvalidFields(prev => [...prev, 'locationPath']) // Thêm 'locationPath' vào invalidFields
      } else if (errorCode === DropzoneErrorCode.FileInvalidType) {
        toast.error('Tệp này không được hổ trợ', {
          progress: undefined
        })
        setInvalidFields(prev => [...prev, 'locationPath']) // Thêm 'locationPath' vào invalidFields
      } else if (errorCode === DropzoneErrorCode.FileTooLarge) {
        toast.error(
          'Hình ảnh yêu cầu kích thước dưới 5mb',
          {
            progress: undefined
          }
        )
        setInvalidFields(prev => [...prev, 'locationPath']) // Thêm 'locationPath' vào invalidFields
      }
      return
    }

    const acceptedFileListWithPreview: Array<Promise<IUploadFile>> =
      acceptedFiles.map(async (file) => ({
        uid: uuidv4(),
        originalFileObj: file,
        preview: await (file.type.includes('image')
          ? getBase64(file)
          : getVideoCover(file))
      }))

    Promise.all(acceptedFileListWithPreview).then((results) => {
      setValue('locationPath', [...getValues('locationPath'), ...results], {
        shouldValidate: true,
        shouldDirty: true
      })
      // Update courseData with the selected file
      setCourseData(prevState => ({
        ...prevState,
        file: acceptedFiles[0]
      }))
    })
  }
  // các dạng file được upload
  const getAcceptedFileTypes = (): Accept => {
    return {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg']
    }
  }
  const handleCancel = () => {
    window.location.href = '/product'
  }
  // chuyển đổi kiểu dữ liệu thời gian
  const formatDateForDatetimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const categoryNames = dataCategory?.map((item: Category) => ({ id: item.id, name: item.name })) ?? []

  return (
    <div className="flex flex-col space-y-4 mb-10">
      <div><h1 className='mt-5 ml-5 text-4xl'>Thêm sản phẩm</h1></div>
      {/* <h2 className="text-xl font-bold mb-4">Add New Course</h2> */}
      <table className="border border-gray-300 bg-gray-100 ml-5 mr-5 rounded-md">
        <tbody>
          <div className="lg:flex md:flex mt-2">
            <div className="md:w-1/2 mr-5 ml-5">
              <label htmlFor="categoryCourseId" className="block mb-2 text-sm font-medium text-gray-900  mt-2">
                Danh mục sản phẩm
              </label>
              <select
                name='categoryCourseId'
                placeholder='Category is required '
                className={`w-full h-10 text-gray-800 outline-none cursor-pointer rounded-md mr-2 mt-2 bg-gray-100 border ${
                  invalidFields.includes('categoryCourseId') ? 'border-red-500' : ''
                }`}
                value={productData.categoryCourseId}
                onChange={handleCategoryChange}
              >
                <option value="">Danh mục sản phẩm:</option>
                {categoryNames.map((category: Category, index: number) => (
                  <option key={index} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:w-1/2 ml-5 mr-5">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                className={`w-full bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 mt-4 ${
                  invalidFields.includes('name') ? 'border-red-500' : ''
                }`}
                placeholder='Yêu cần nhập Tên sản phẩm '
              />
            </div>
          </div>
          <div className="ml-5 mr-5">
            <label htmlFor={'description'} className="block text-sm font-medium text-gray-900 ml-2">
              Mô tả:
            </label>
            {productData.descriptionParts?.map((description, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-grow">
                  <input
                    id={`description${index + 1}`}
                    name={`descriptionPart${index + 1}`}
                    value={description}
                    onChange={handleInputChange} // Updates the specific description part
                    className="w-full border rounded-md px-3 py-2 mt-2 mb-2 text-gray-900"
                    placeholder={`Mô tả dòng ${index + 1} có thể bỏ trống`}
                  />
                </div>
                <svg
                  className="ml-2 h-8 w-8 fill-current text-red-500 cursor-pointer mt-2"
                  viewBox="0 0 16 16"
                  onClick={() => removeInput(index)}
                >
                  <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                </svg>
              </div>
            ))}
            <button
              type="button"
              onClick={addNewInput}
              className="btn bg-green-500 mt-3 hover:bg-green-400 p-1.5 rounded-sm"
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </button>
          </div>
            {/* <div className="w-1/2 ml-5 mr-5 hidden">
              <label htmlFor="assignedBy" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                Người chỉnh sửa
              </label>
              <input
                type="number"
                name="assignedBy"
                readOnly
                value={productData.assignedBy}
                onChange={handleInputChange}
                className={`bg-gray-100 border text-gray-900 text-sm rounded-lg hidden focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 mt-4 ${
                  invalidFields.includes('assignedBy') ? 'border-red-500' : ''
                }`}
                placeholder='người chỉnh sửa'
              />
          </div> */}
          <div className="lg:flex md:flex">
            <div className="md:w-1/3 ml-5 mr-5">
              <label htmlFor="Discount" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
              Giảm giá
              </label>
              <input
                type="number"
                name="Discount"
                value={productData.Discount}
                onChange={handleInputChange}
                className={`bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                  invalidFields.includes('Discount') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='giảm giá'
              />
            </div>
            <div className="md:w-1/3 ml-5 mr-5">
              <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 mt-4">
                Giá gốc:
              </label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                className={`bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                  invalidFields.includes('price') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Yêu cầu nhập giá gốc'
              />
            </div>
            <div className="md:w-1/3 ml-5 mr-5">
              <label htmlFor="Inventory_quantity" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
              Số lượng tồn kho
              </label>
              <input
                type="number"
                name="Inventory_quantity"
                value={productData.Inventory_quantity}
                onChange={handleInputChange}
                className={`bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                  invalidFields.includes('Inventory_quantity') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Yêu cầu nhập số lượng tồn kho'
              />
            </div>
          </div>
          <div className="lg:flex md:flex">
            <div className="md:w-1/2 ml-5 mr-5">
              <label htmlFor="locationPath" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                Ảnh sản phẩm:
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
                    borderError={invalidFields.includes('locationPath')} // Thêm thuộc tính borderError
                  />
                )}
              />
              <PreviewFiles
                fileList={watch('locationPath')}
                onRemoveFile={handleRemoveFile}
                className="mt-4"
              />
            </div>
            <div className="md:w-1/2 block ml-5 mr-5">
              <div className="flex items-center mt-2">
                <label htmlFor="checkboxPublic" className="block text-sm font-medium text-gray-900 mr-2">Trạng thái:</label>
                <input
                  type="checkbox"
                  name="checkboxPublic"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  className="ml-5"
                />
              </div>
              {isChecked && (
                <div className="flex flex-col mt-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="publicStatus"
                      value="publicDate"
                      checked={productData.publicStatus === 1}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <div className="lg:w-full block ml-2">
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
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="publicStatus"
                      value="hidden"
                      checked={productData.publicStatus === 2}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <label htmlFor="publicStatus" className="ml-2 text-sm font-medium text-gray-900 ">
                      Hiển thị lập tức
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mb-5">
            <button className="bg-gray-300 text-black px-4 py-2 rounded-full mr-2 hover:bg-gray-400 hover:text-black border border-gray-300 min-w-[100px]" onClick={handleCancel}>Hủy</button>
            <button
              onClick={handleAddProduct}
              className="bg-teal-400 text-white font-bold py-2 px-4 hover:bg-teal-500 rounded-full border border-teal-500 mr-4"
            >
              Thêm sản phẩm
            </button>
          </div>
        </tbody>
      </table>
    </div>
  )
}

export default AddProduct
