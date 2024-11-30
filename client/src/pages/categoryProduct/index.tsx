import React, { useEffect, useState, useMemo } from 'react'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
  MRT_TableOptions,
  MRT_RowSelectionState,
  MRT_Cell
} from 'material-react-table'
import { getCategoryproduct, updateCategoryProduct, createCategoryProduct, deleteCategoryProduct } from '../../api/post/post.api'// updateCategoryCourse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import ModalComponent from '../../components/Modal/index'
import Anh from '../../assets/img/categoryCourse/category-course1.png'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form' // Import useForm
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { i18n } from '../../services/i18n'
function isVietnamese () {
  return i18n.language === 'vi'
}
interface categoryproduct {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}
interface FormInput {
  name: string
  description: string
}
const Categoryproduct = () => {
  const [data, setData] = useState<categoryproduct[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [nameError, setNameError] = useState<string>('')
  const [descriptionError, setDescriptionError] = useState<string>('')
  const [duplicateNameError, setDuplicateNameError] = useState(false)

  useEffect(() => {
    const fetchAllData = async () => {
      const categoryCourseResponse = await getCategoryproduct()
      setData(categoryCourseResponse.data.data)
    }
    fetchAllData()
  }, [])

  // const handleDelete = (id: number) => {
  //   setDeleteId(id)
  //   setIsModalOpen(true)
  // }
  const { register, handleSubmit, reset } = useForm<FormInput>()

  const handleCreatePermission = async (data: FormInput) => {
    try {
      const { name, description } = data
      if (!name.trim()) {
        toast.error('Tên danh mục không bỏ trống')
        setNameError('Name cannot be empty')
        return
      }
      if (!description.trim()) {
        toast.error('Mô tả không bỏ trống')
        setDescriptionError('Description cannot be empty')
        return
      }
      await createCategoryProduct(name, description)
      reset()
      const createData = await getCategoryproduct()
      setData(createData.data.data)
      toast.success('Thêm danh mục sản phẩm thành công')
      setNameError('')
      setDescriptionError('')
      setDuplicateNameError(false)
    } catch (error: any) {
      if (error.message === 'Tên danh mục này đã tồn tại') {
        setDuplicateNameError(true)
      }
      toast.error(error.message)
    }
  }
  const handleConfirmDeleteSingle = async () => {
    try {
      if (deleteId === null) {
        console.log('No id to delete')
        return
      }
      await deleteCategoryProduct(deleteId.toString())
      setData((prevData) => prevData.filter((row) => row.id !== deleteId))
      if (rowSelection[deleteId]) {
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        setRowSelection(newRowSelection)
      }
      toast.success('Xóa thành công')
    } catch (error: any) {
      if (error.response && error.response.data === 'Cannot delete category_product because it is referenced by other tables') {
        toast.error('Không thể xóa danh mục sản phẩmsản phẩm')
      } else {
        console.error('Error deleting category_product:', error)
        toast.error('Không thể xóa danh mục')
      }
    } finally {
      setDeleteId(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      console.log('No rows selected')
      toast.error('không tìm thấy')
      return
    }
    setIsSecondModalOpen(true)
  }
  const handleConfirmDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    const successfullyDeletedIds: number[] = []
    const unsuccessfullyDeletedIds: Array<{ id: number, name: string }> = []
    await Promise.all(
      selectedIds.map(async (id) => {
        try {
          await deleteCategoryProduct(id.toString())
          successfullyDeletedIds.push(id)
        } catch (error: any) { // or use 'unknown' instead of 'any'
          // Ki?m tra n?u error.response t?n t?i va error.response.data.categoryCourseName t?n t?i
          const categoryName = error.response?.data?.categoryCourseName
          if (categoryName) {
            unsuccessfullyDeletedIds.push({ id, name: categoryName })
          } else {
            // N?u khong co ten, them 'Unknown' vao m?ng
            unsuccessfullyDeletedIds.push({ id, name: 'Unknown' })
          }
        }
      })
    )
    setData((prevData) => prevData.filter((row) => !successfullyDeletedIds.includes(row.id)))
    setRowSelection({})
    setIsModalOpen(false)
    setIsSecondModalOpen(false)
    const successfullyDeletedCount = successfullyDeletedIds.length
    const unsuccessfullyDeletedCount = unsuccessfullyDeletedIds.length
    if (successfullyDeletedCount > 0) {
      toast.success(`Xóa Thành công`)
    }
    if (unsuccessfullyDeletedCount > 0) {
      const errorMessage = unsuccessfullyDeletedIds
        .map((item) => `Name: ${item.name} (ID: ${item.id})`)
        .join('\n')
      toast.error(`Không thể xóa danh mục sản phẩm sau:\n${errorMessage}`)
    }
  }
  // ham chuy?n ??i th?i gian
  const formatDateForDatetimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const columns = useMemo<Array<MRT_ColumnDef<categoryproduct>>>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        grow: true,
        size: 100
      },
      {
        accessorKey: 'name',
        header: 'Tên danh mục sản phẩm',
        enableEditing: true,
        grow: true,
        size: 120,
        Cell: ({ cell }: { cell: MRT_Cell<categoryproduct> }) => {
          const assignBy = cell.getValue<string>()
          return (
            <Tooltip title={assignBy}>
              <div className="truncate w-full sm:w-auto">
                {assignBy}
              </div>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        enableEditing: true,
        grow: true,
        size: 200,
        enableGlobalFilter: false,
        Cell: ({ cell }: { cell: MRT_Cell<categoryproduct> }) => {
          const description = cell.getValue<string>()
          const maxLength = 100
          return (
            <div>
              {description.length > maxLength
                ? (
                <Tooltip title={description}>
                  <span>{`${description.substring(0, maxLength)}...`}</span>
                </Tooltip>
                  )
                : (
                    description
                  )}
            </div>
          )
        }
      },
      {
        accessorKey: 'formattedCreatedAt',
        header: 'Ngày tạo',
        enableEditing: false,
        grow: true,
        size: 120
      },
      {
        accessorKey: 'formattedUpdatedAt',
        header: 'Ngày cập nhật',
        enableEditing: false,
        grow: true,
        size: 120
      }
    ],
    []
  )
  const dataWithFormattedDates = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
      formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }))
  }, [data])

  const handleSavecategoryCourseResponse: MRT_TableOptions<categoryproduct>['onEditingRowSave'] = async ({
    values,
    table
  }) => {
    const { id, name, description } = values
    if (!name.trim()) {
      toast.error('Tên danh mục không rỗng')
      return
    }
    if (!description.trim()) {
      toast.error('Mô tả không rỗng')
      return
    }
    try {
      const existingCategory = data.find((category) => category.name === name && category.id !== id)
      if (existingCategory) {
        toast.error('Tên danh mục này đã tồn tại')
        return
      }
      await updateCategoryProduct(id.toString(), name, description)
      table.setEditingRow(null)
      const updatedData = await getCategoryproduct()
      setData(updatedData.data.data)
      toast.success('Sửa danh mục sản phẩm thành công')
    } catch (error) {
      console.error('Error:', error)
      throw new Error('Failed to update category product')
    }
  }
  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates,
    paginationDisplayMode: 'pages',
    enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 5, pageIndex: 1 }, // set m?c ??nh s? l??ng b?n ghi tren 1 trang va trang ??u tien
      sorting: [{ id: 'id', desc: true }], // dung ?? s?p x?p m?c ??nh cho b?ng d? li?u khi load l?n ??u theo id gi?m d?n
      columnVisibility: { id: false } // ?n c?t id khi b?ng d? li?u ???c load l?n ??u
    },
    positionToolbarAlertBanner: 'top', // v? tri c?a alert banner
    enableFilterMatchHighlighting: false, // t?t ch?c n?ng highlight khi filter
    getRowId: (row: categoryproduct) => row.id.toString(), // give each row a more useful id
    onRowSelectionChange: setRowSelection, // connect internal row selection state to your own
    state: { rowSelection }, // pass our managed row selection state to the table to use
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false, // N?u ???c ??t thanh true, phan trang s? ???c ??t l?i v? trang ??u tien khi tr?ng thai thay ??i trang thay ??i, vd. d? li?u ???c c?p nh?t, thay ??i b? l?c, thay ??i nhom, v.v.
    onEditingRowSave: handleSavecategoryCourseResponse,
    positionActionsColumn: 'last', // lam cho c?t action n?m cu?i cung
    muiTableHeadCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
        fontStyle: 'bold',
        fontWeight: 'bold'
      },
      align: 'center'
    },
    muiTableBodyCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)'
      },
      align: 'center'

    },
    displayColumnDefOptions: {
      'mrt-row-numbers': {
        enableResizing: true, // allow the row numbers column to be resized
        size: 40,
        grow: false // new in v2.8 - do not fill remaining space using this column
      }
    },
    // enableRowNumbers: true,
    layoutMode: 'grid',
    renderRowActions: ({ row, table }) => (
      <div className="flex flex-row items-center justify-center space-x-2 ">
        {/* <Box>
          <Tooltip title= {('Nhấn vào để xóa')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={() => handleDelete(row.original.id)}
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box> */}
        <Box>
          <Tooltip title= {('nhấn vào để sửa')}>
            <button className="btn bg-sky-500 hover:bg-sky-400  p-1.5 rounded-sm" onClick={() => table.setEditingRow(row)}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-2 mt-2">
      <Box>
        <Tooltip title= {('Nhấn vào để xóa nhiều')}>
          <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
            <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
              <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
            </svg>
          </button>
        </Tooltip>
      </Box>
      {/* <Box>
        <Tooltip title= {('click_to_create_new')}>
          <button
            className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
            onClick={handleCreateCourse}
          >
            <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </button>
        </Tooltip>
      </Box> */}
    </div>
    ),
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    if (name === 'name' && value.trim()) {
      setNameError('')
      setDuplicateNameError(false)
    }
    if (name === 'description' && value.trim()) {
      setDescriptionError('')
    }
  }

  return (
    <>
    <div className="mb-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Quản lý danh mục sản phẩm ✨</h1>
        </div>
      <form onSubmit={handleSubmit(handleCreatePermission)}>
        <div className="lg:flex md:flex">
          <div className="md:w-1/2 mr-5 ml-5 flex flex-col space-y-2 m-5 h-20">
            <label>Tên danh mục</label>
            <input
              {...register('name')}
              placeholder="Vui lòng nhập tên danh mục"
              className={`shadow appearance-none border rounded w-full h-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10 ${
                nameError || duplicateNameError ? 'border-red-500' : ''
              }`}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:w-1/2 mr-5 ml-5 flex flex-col space-y-2 mt-5 h-full">
            <label>Mô tả</label>
            <textarea
              {...register('description')}
              placeholder="Vui lòng nhập mô tả"
              rows={3} // Set default number of rows to 3
              className={`shadow appearance-none border rounded w-full h-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10 ${
                descriptionError ? 'border-red-500' : ''
              }`}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex justify-end mr-5 mt-5">
          <button type="submit" className="px-2 py-2 bg-green-500 text-white rounded">
            <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
          </button>
        </div>
      </form>
      <hr className="my-4" />
      <div className="overflow-x-auto">
        <MaterialReactTable table={table} />
      </div>
      <ModalComponent
        isOpen={isModalOpen}
        title="Xác nhận xóa"
        imageUrl={Anh}
        description="Bạn có chắc chắn muốn xóa danh mục sản phẩm này không?"
        onClose={() => {
          setIsModalOpen(false)
        }}
        onOk={handleConfirmDeleteSingle}
        onCancel={() => {
          setIsModalOpen(false)
        }}
      />
      <ModalComponent
        isOpen={isSecondModalOpen}
        title="Xác nhận xóa"
        imageUrl={Anh}
        description={`Bạn có chắc muốn xóa  ${Object.keys(rowSelection).length} danh mục sản phẩm này không?`}
        onClose={() => {
          setIsSecondModalOpen(false)
        }}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setIsSecondModalOpen(false)
        }}
      />
    </>
  )
}

export default Categoryproduct
