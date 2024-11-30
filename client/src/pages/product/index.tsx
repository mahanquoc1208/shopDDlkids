import React, { useEffect, useState, useMemo } from 'react'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
  MRT_TableOptions,
  MRT_RowSelectionState,
  MRT_Cell
} from 'material-react-table'
import { getProductData, getdeleteProduct } from '../../api/post/post.api' // gọi api bên client
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import ModalComponent from '../../components/Modal/index'
import Anh from '../../assets/img/categoryCourse/category-course1.png'// lấy ảnh bên model
import { toast } from 'react-toastify'
// import { Link } from 'react-router-dom'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { i18n } from '../../services/i18n'
function isVietnamese () {
  return i18n.language === 'vi'
}
interface categorycourse {
  assignBy: number
  categoryCoursename: number
  id: string
  categoryCourseId: number
  name: string
  assignedBy: number
  durationInMinute: number
  description: string
  locationPath: string
  price: number
  Discount: number
}
const CategoryCourse = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<categorycourse[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  useEffect(() => {
    const fetchAllData = async () => {
      const categoryCourseResponse = await getProductData()
      console.log('check dữ liệu lên',categoryCourseResponse.data.data)
      setData(categoryCourseResponse.data.data)
    }
    fetchAllData()
  }, [])
  // const handleDelete = (id: number) => {
  //   setDeleteId(id)
  //   setIsModalOpen(true)
  // }
  const handleConfirmDeleteSingle = async () => {
    try {
      if (deleteId === null) {
        console.log('No id to delete')
        return
      }
      await getdeleteProduct(deleteId.toString())
      setData((prevData) => prevData.filter((row) => Number(row.id) !== deleteId))
      if (rowSelection[deleteId]) {
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        setRowSelection(newRowSelection)
      }
      console.log('Deleted ID:', deleteId)
      setDeleteId(null)
      setIsModalOpen(false)
      toast.success('Xóa thành công')
    } catch (error: any) {
      if (error.response && error.response.data === 'Cannot delete product due to existing references.') {
        toast.error('Cannot delete product due to existing references')
      } else {
        console.error('Error deleting product:', error)
        toast.error('Không thể xóa sản phẩm')
      }
      // Remove the failed deleteId from rowSelection
      if (deleteId !== null && rowSelection[deleteId]) {
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key]
          }
          return obj
        }, {})
        setRowSelection(newRowSelection)
      }
      setDeleteId(null)
      setIsModalOpen(false)
    }
  }
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error('No rows selected')
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
          await getdeleteProduct(id.toString())
          successfullyDeletedIds.push(id)
        } catch (error: any) {
          const categoryName = error.response?.data?.categoryCourseName
          if (categoryName) {
            unsuccessfullyDeletedIds.push({ id, name: categoryName })
          } else {
            unsuccessfullyDeletedIds.push({ id, name: 'Unknown' })
          }
        }
      })
    )
    setData((prevData) => prevData.filter((row) => !successfullyDeletedIds.includes(Number(row.id))))
    setRowSelection({})
    setIsModalOpen(false)
    setIsSecondModalOpen(false)
    const successfullyDeletedCount = successfullyDeletedIds.length
    const unsuccessfullyDeletedCount = unsuccessfullyDeletedIds.length
    if (successfullyDeletedCount > 0) {
      toast.success(`Xóa thành công`)
    }
    if (unsuccessfullyDeletedCount > 0) {
      const errorMessage = unsuccessfullyDeletedIds
        .map((item) => `Name: ${item.name} (ID: ${item.id})`)
        .join('\n')
      toast.error(`Failed to delete the following category product:\n${errorMessage}`)
    }
  }
  const columns = useMemo<Array<MRT_ColumnDef<categorycourse>>>(
    () => [
      {
        accessorKey: 'categoryCoursename',
        header: 'Danh mục sản phẩm',
        grow: true,
        size: 120,
        Cell: ({ cell }) => {
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
        accessorKey: 'name',
        header: 'Tên sản phẩm',
        grow: true,
        size: 120,
        Cell: ({ cell }) => {
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
        grow: true,
        size: 170,
        enableGlobalFilter: false,
        Cell: ({ cell }) => {
          const description = cell.getValue<string>().replace(/;;/g, '.'); // Replace ;; with . Dấu ;; để xuống dòng         
          const maxLength = 80; // Define your max length here
          return (
            <div>
              {description.length > maxLength ? (
                <Tooltip title={description}>
                  <span>{`${description.substring(0, maxLength)}...`}</span>
                </Tooltip>
              ) : (
                description
              )}
            </div>
          );
        }
      },      
      {
        accessorKey: 'Discount',
        header: 'Giảm giá',
        grow: true,
        size: 120,
        Cell: ({ cell }) => {
          const discountValue = cell.getValue<string>();
          const displayText = discountValue === '0.00' ? 'Sản phẩm chưa giảm giá' : discountValue;
          
          return (
            <Tooltip title={displayText}>
              <div className="truncate w-full sm:w-auto">
                {displayText}
              </div>
            </Tooltip>
          );
        }
      },
      {
        accessorKey: 'price',
        header: 'Giá',
        grow: true,
        size: 120,
        Cell: ({ cell }) => {
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
        accessorKey: 'locationPath',
        header: 'Ảnh',
        grow: true,
        size: 120,
        Cell: ({ cell }) => {
          const locationPath = cell.getValue<string>()
          return (
            <div className="w-[80px] h-[60px] flex justify-center items-center">
              <img
                className="w-full h-full object-cover rounded-t-md transition-transform duration-700 hover:scale-110"
                src={locationPath ? `../../../assets/images/uploads/product/${locationPath}` : 'https://picsum.photos/200/300'}
                width="286"
                height="160"
                alt="CourseImage"
              />
            </div>
          )
        }
      },
      {
        accessorKey: 'Inventory_quantity',
        header: 'số lượng tồn kho',
        grow: true,
        size: 120,
        Cell: ({ cell }) => {
          const assignBy = cell.getValue<string>()
          return (
            <Tooltip title={assignBy}>
              <div className="truncate w-full sm:w-auto">
                {assignBy}
              </div>
            </Tooltip>
          )
        }
      }
    ],
    []
  )
  const table = useMaterialReactTable({
    columns,
    data,
    paginationDisplayMode: 'pages',
    enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 5, pageIndex: 1 },
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: { id: false }
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    getRowId: (row: categorycourse) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false,
    positionActionsColumn: 'last',
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
          <Tooltip title= {('delete')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={() => handleDelete(Number(row.original.id))}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box> */}
        <Box>
          <Tooltip title= {('Chỉnh sửa')}>
            <button className="btn bg-sky-500 hover:bg-sky-400  p-1.5 rounded-sm" onClick={() => handleEditProduct(row.original.id)}>
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
          <Tooltip title= {('Nhấn vào để xóa')}>
            <button className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm" onClick={handleDeleteSelected}>
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title= {('Nhấn vào để thêm mới')}>
            <button
              className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
              onClick={handleCreateProduct}
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </button>
          </Tooltip>
        </Box>
      </div>
    ),
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })
  const handleEditProduct = (courseId: string) => {
    window.location.href = `/product/productedit/${courseId}`
  }
  const handleCreateProduct = () => {
    window.location.href = '/product/productadd'
  }
  return (
    <>
    <div className="mb-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Quản lý sản phẩm✨</h1>
        </div>
    {/* <div className="flex justify-end mr-5 mt-5">
      <button
        type="button" // Thay đổi từ "submit" thành "button" để tránh submit form
        className="px-2 py-2 bg-green-500 text-white rounded"
        onClick={handleCreateProduct}
      >
        Thêm sản phẩm
      </button>
    </div> */}
    <hr className="my-4" />
      <MaterialReactTable table={table} />
      <ModalComponent
        isOpen={isModalOpen}
        title="Confirm Delete"
        imageUrl={Anh}
        description="Bạn có chắc chắn muốn xóa sản phẩm này không"
        onClose={() => {
          setIsModalOpen(false)
        }}
        onOk={handleConfirmDeleteSingle} //Hàm xóa 1
        onCancel={() => {
          setIsModalOpen(false)
        }}
      />
      <ModalComponent
        isOpen={isSecondModalOpen}
        title="Xác nhận xóa"
        imageUrl={Anh}
        description={`Bạn có muốn xóa ${Object.keys(rowSelection).length} sản phẩm này không?`}
        onClose={() => {
          setIsSecondModalOpen(false)
        }}
        onOk={deleteId !== null ? handleConfirmDeleteSingle : handleConfirmDelete} // Hàm xóa nhiều
        onCancel={() => {
          setIsSecondModalOpen(false)
        }}
      />
    </>
  )
}
export default CategoryCourse
