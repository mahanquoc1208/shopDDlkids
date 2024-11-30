import React, { useEffect, useState, useMemo } from 'react'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
  MRT_TableOptions,
  MRT_RowSelectionState,
  MRT_Cell
} from 'material-react-table'
import { fetchAllCustomer, updateCustomer, deleteCustomer } from '../../api/post/post.api'// updateCategoryCourse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import ModalComponent from '../../components/Modal/index'
import Anh from '../../assets/img/categoryCourse/category-course1.png'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form' // Import useForm
import { i18n } from '../../services/i18n'
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
function isVietnamese () {
  return i18n.language === 'vi'
}
interface Customer {
  id: string;
  fullName: string;
  email: string;
  gender: boolean;
  age: number;
  password: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  address: string;
  phone: string;
  status: number;
  rewardPoints: string;
  roleId: number;
}
const Customer = () => {
  const [data, setData] = useState<Customer[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  useEffect(() => {
    const fetchAllData = async () => {
        try {
            const categoryCourseResponse = await fetchAllCustomer();
            console.log('checkkkkkkkkkkk', categoryCourseResponse.data);
            setData(categoryCourseResponse.data || []); // Default to an empty array if undefined
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Failed to fetch customers");
        }
    }
    fetchAllData();
  }, []);
  const handleConfirmDeleteSingle = async () => {
    try {
      if (deleteId === null) {
        console.log('No id to delete');
        return;
      }
  
      // Call the deleteCustomer function to soft delete the customer
      await deleteCustomer(deleteId.toString());
  
      // Update the data state to remove the deleted customer
      setData((prevData) => prevData.filter((row) => row.id !== deleteId));
  
      // Update rowSelection if the deleted customer was selected
      if (rowSelection[deleteId]) {
        const newRowSelection = Object.keys(rowSelection).reduce((obj: Record<string, boolean>, key) => {
          if (Number(key) !== deleteId) {
            obj[key] = rowSelection[key];
          }
          return obj;
        }, {});
        setRowSelection(newRowSelection);
      }
  
      // Show success message
      toast.success('Xóa thành công'); // 'Deleted successfully'
    } catch (error: any) {
      // Handle specific error messages for customer deletion
      console.error('Error deleting customer:', error);
      toast.error('Không thể xóa khách hàng'); // 'Cannot delete customer'
    } finally {
      // Reset the deleteId and close the modal
      setDeleteId(null);
      setIsModalOpen(false);
    }
  };
  

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
          await deleteCustomer(id.toString())
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
      toast.success(`Xóa ${successfullyDeletedCount} Thành công`)
    }
    if (unsuccessfullyDeletedCount > 0) {
      const errorMessage = unsuccessfullyDeletedIds
        .map((item) => `Name: ${item.name} (ID: ${item.id})`)
        .join('\n')
      toast.error(`Không thể xóa khách hàng sau:\n${errorMessage}`)
    }
  }
  const columns = useMemo<Array<MRT_ColumnDef<Customer>>>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        grow: true,
        size: 100
      },
      {
        accessorKey: 'fullName',
        header: 'Họ Tên khách hàng',
        enableEditing: true,
        grow: true,
        size: 120,
        Cell: ({ cell }: { cell: MRT_Cell<Customer> }) => {
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
        accessorKey: 'address',
        header: 'Địa chỉ ',
        // enableEditing: false,
        grow: true,
        size: 120
      },
      {
        accessorKey: 'email',
        header: 'Email ',
        // enableEditing: false,
        grow: true,
        size: 120
      },
      {
        accessorKey: 'age',
        header: 'Tuổi của bé',
        // enableEditing: false,
        grow: true,
        size: 120
      },
      {
        accessorKey: 'phone',
        header: 'Số điện thoại',
        // enableEditing: false,
        grow: true,
        size: 120
      }
    ],
    []
  )
  const dataWithFormattedDates = useMemo(() => {
    console.log('Data before mapping:', data); // Debug log
    return data.map((item) => ({
        ...item,
        // formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
        // formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }));
  }, [data]);
  const handleSaveCustomerResponse: MRT_TableOptions<Customer>['onEditingRowSave'] = async ({
    values,
    table
  }) => {
    const { id, fullName, email, age, address, phone } = values;
  
    // Validate required fields with fallback for possible null or undefined values
    if (!(fullName || '').trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }
    if (!(email || '').trim()) {
      toast.error('Email không được để trống');
      return;
    }
    if (!age) {
      toast.error('Tuổi không được để trống');
      return;
    }
    if (!(address || '').trim()) {
      toast.error('Địa chỉ không được để trống');
      return;
    }
    if (!(phone || '').trim()) {
      toast.error('Số điện thoại không được để trống');
      return;
    }
  
    // Additional validation for age (must be greater than 12)
    if (age >= 12) {
      toast.error('Tuổi phải nhỏ hơn 12');
      return;
    }
  
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email || '')) {
      toast.error('Email không hợp lệ');
      return;
    }
  
    // Phone number validation (must be 10 digits and start with '0')
    const phoneRegex = /^0\d{10}$/;
    if (!phoneRegex.test(phone || '')) {
      toast.error('Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0');
      return;
    }
  
    try {
      // Check for existing customer with the same email (excluding current customer)
      const existingCustomer = data.find(
        (customer) => customer.email === email && customer.id !== id
      );
      if (existingCustomer) {
        toast.error('Email này đã được sử dụng');
        return;
      }
  
      // Update customer details
      await updateCustomer(id.toString(), fullName, email, age, address, phone);
      
      // Exit editing mode
      table.setEditingRow(null);
  
      // Fetch updated customer data
      const updatedData = await fetchAllCustomer();
      setData(updatedData.data);
  
      toast.success('Cập nhật khách hàng thành công');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật khách hàng');
    }
  };
  
  
  
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
    getRowId: (row: Customer) => row.id.toString(), // give each row a more useful id
    onRowSelectionChange: setRowSelection, // connect internal row selection state to your own
    state: { rowSelection }, // pass our managed row selection state to the table to use
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false, // N?u ???c ??t thanh true, phan trang s? ???c ??t l?i v? trang ??u tien khi tr?ng thai thay ??i trang thay ??i, vd. d? li?u ???c c?p nh?t, thay ??i b? l?c, thay ??i nhom, v.v.
    onEditingRowSave: handleSaveCustomerResponse,
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
    </div>
    ),
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })


  return (
    <>
     <div className="mb-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold"> Quản lý khách hàng✨</h1>
        </div>
      <hr className="my-4" />
      <div className="overflow-x-auto">
        <MaterialReactTable table={table} />
      </div>
      <ModalComponent
        isOpen={isModalOpen}
        title="Xác nhận xóa"
        imageUrl={Anh}
        description="Bạn có chắc chắn muốn xóa khách hàng này không?"
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
        description={`Bạn có chắc muốn xóa  ${Object.keys(rowSelection).length} khách hàng này không?`}
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

export default Customer
