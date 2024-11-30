/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TableUser
========================================================================== */
import React, { useEffect, useState, useMemo } from 'react'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
  MRT_EditActionButtons,
  MRT_TableOptions,
  MRT_RowSelectionState,
  
  MRT_Cell
} from 'material-react-table'

import { fetchAllUser, fetchAllUserall, fetchAllRole, fetchAllRoleall, updateUser, deleteUser, createUser } from '../../../api/post/post.api'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import ModalComponent from '../../../components/Modal'
import Anh from '../../../assets/img/categoryCourse/category-course1.png'
import { toast } from 'react-toastify'

import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from '../../../services/i18n'

function isVietnamese () {
  return i18n.language === 'vi'
}

interface User {
  id: number
  username: string
  fulltName: string
  roleId: string
  roleDescription: string
  createdAt: string
  updatedAt: string
}

interface Role {
  id: string
  name: string
  description: string
}

const TableUser = () => {
  const { t } = useTranslation()
  const [data, setData] = useState<User[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roles, setRoles] = useState<Role[]>([])
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [deleteUsername, setDeleteUsername] = useState<string | null>(null)

  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [shouldFetch, setShouldFetch] = useState(false);


  useEffect(() => {
    const fetchAllData = async () => {
      // Retrieve current user's roleId
      const currentUserRoleId = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').roleId);
  
      // Decide which role API to call based on the roleId
      const rolesResponse = currentUserRoleId === 2 
        ? await fetchAllRole() 
        : await fetchAllRoleall(); // Fetch all roles if roleId is not 2
  
      setRoles(rolesResponse.data);
  
      // Decide which user API to call based on the roleId
      const usersResponse = currentUserRoleId === 2 
        ? await fetchAllUser() 
        : await fetchAllUserall(); // Fetch all users if roleId is 1
  
      const usersWithRoleDescriptions = usersResponse.data.map((user: { roleId: any }) => {
        const role = rolesResponse.data.find((role: { id: any }) => role.id === user.roleId);
        return { ...user, roleDescription: role ? role.description : 'N/A' };
      });
      
      setData(usersWithRoleDescriptions);
    };
  
    fetchAllData();
  }, [shouldFetch]); // Call useEffect again when shouldFetch changes
  

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])
  

  const handleDelete = (id: number, username: string) => {
    setDeleteId(id)
    setDeleteUsername(username)
    setIsModalOpen(true)
  }

  const handleConfirmDeleteSingle = async () => {
    if (deleteId === null) {
      toast.error(t('Vui lòng chọn dòng để xóa'))
      return
    }
    try {
      await deleteUser(deleteId.toString())
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
      toast.success(t('Xóa thành công'))
    } catch (error) {
      toast.error(t('Xóa thất bại'))
    } finally {
      setDeleteId(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('Vui lòng chọn dòng để thực hiện'))
      return
    }
    setIsSecondModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    try {
      await Promise.all(selectedIds.map(async (id) => await deleteUser(id.toString())))
      setData((prevData) => prevData.filter((row) => !selectedIds.includes(row.id)))
      setRowSelection({})
      toast.success(t('Xóa thành công'))
    } catch (error) {
      toast.error(t('Xóa các dòng đã chọn thất bại'))
    } finally {
      setIsModalOpen(false)
      setIsSecondModalOpen(false)
    }
  }
  // hàm chuyển đổi thời gian
  const formatDateForDatetimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    const seconds = `${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`
    return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`
  }

  const dataWithFormattedDates = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
      formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }))
  }, [data])

  const columns = useMemo<Array<MRT_ColumnDef<User>>>(
    () => [
      // {
      //   accessorKey: 'id',
      //   header: t('userpage.id'),
      //   enableHiding: false
      // },
      {
        accessorKey: 'email',
        header: t('Email'),
        enableEditing: true,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },
      {
        accessorKey: 'fullName',
        header: t('Họ Tên'),
        enableEditing: true,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.fullName,
          helperText: validationErrors?.fullName,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },
      {
        accessorKey: 'roleId',
        header: t('Chức vụ'),
        editVariant: 'select',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.roleId,
          helperText: validationErrors?.roleId,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
        editSelectOptions: roles.map((role) => ({ value: role.id, label: role.description })),
        Cell: ({ cell }) => {
          const roleId = cell.getValue()
          const role = roles.find(role => role.id === roleId)
          return role ? role.description : 'N/A'
        },
        filterVariant: 'select',
        filterSelectOptions: roles.map((role) => ({ value: role.id, label: role.description }))
      },
      {
        accessorKey: 'address',
        header: t('Địa chỉ'),
        enableEditing: true,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.address,
          helperText: validationErrors?.address,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },
      {
        accessorKey: 'phone',
        header: t('Số Điện thoại'),
        enableEditing: true,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },  
      {
        accessorKey: 'age',
        header: t('Tuổi'),
        enableEditing: true,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.age,
          helperText: validationErrors?.age,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      }
    ],
    [roles, t, currentLanguage]
  )
  // thêm 
  const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    // Validate required fields
    const requiredFields = {
      email: 'Vui lòng nhập email',
      fullName: 'Vui lòng nhập họ và tên',
      roleId: 'Vui lòng chọn chức vụ',
      address: 'Vui lòng nhập địa chỉ',
      phone: 'Vui lòng nhập số điện thoại',
      age: 'Vui lòng nhập tuổi',
    };
  
    // Filter out `id` from values when performing validations
    const userValues = { ...values };
    delete userValues.id;
  
    // Kiểm tra từng trường bắt buộc
    for (const field in requiredFields) {
      if (!userValues[field]) {
        toast.error(requiredFields[field]);
        return; // Dừng lại ngay khi phát hiện lỗi đầu tiên
      }
    }
  
    // Ràng buộc cho email
    if (!/^[\w.+\-]+@gmail\.com$/.test(userValues.email)) {
      toast.error('Email phải có đuôi là @gmail.com.');
      return;
    }
  
    // Ràng buộc cho số điện thoại
    if (!/^0\d{9,10}$/.test(userValues.phone)) {
      toast.error('Số điện thoại phải bắt đầu bằng số 0 và có 10-11 chữ số.');
      return;
    }
  
    // Ràng buộc cho tuổi
    const age = parseInt(userValues.age, 10);
    if (isNaN(age) || age < 18 || age > 60) {
      toast.error('Tuổi phải là số và nằm trong khoảng từ 18 đến 60.');
      return;
    }
  
    try {
      console.log('Creating user with values:', userValues);
      await createUser(userValues);
  
      setShouldFetch((prev) => !prev); // Refresh data
  
      table.setCreatingRow(null); // Exit creating mode
      toast.success(t('Thêm nhân viên thành công'));
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(t('Nhân viên này đã tồn tại'));
    }
  };
  
  
  
  
  const handleSaveUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    try {
      // Log values before editing
      console.log('Giá trị trước khi chỉnh sửa:', values);
  
      // Required fields and their corresponding messages
      const requiredFields: { [key: string]: string } = {
        fullName: 'Vui lòng nhập họ và tên',
        email: 'Vui lòng nhập email',
        roleId: 'Vui lòng chọn chức vụ',
        address: 'Vui lòng nhập địa chỉ',
        phone: 'Vui lòng nhập số điện thoại',
        age: 'Vui lòng nhập tuổi',
      };
  
      // Validate phone field
      const validatePhone = (phone: string) => {
        // Kiểm tra nếu phone không phải là chuỗi số hoặc không khớp định dạng hợp lệ
        const phoneRegex = /^0\d{9,10}$/; // Bắt đầu bằng 0, theo sau là 9-10 chữ số
        if (!phoneRegex.test(phone)) {
          return 'Số điện thoại phải bắt đầu bằng số 0 và có từ 10 đến 11 chữ số';
        }
      
        return null; // Hợp lệ
      };
      
  
      // Validate age field
      const validateAge = (age: any) => {
        // Kiểm tra nếu age không phải là số nguyên hoặc không nằm trong khoảng 18-60
        if (isNaN(age) || !Number.isInteger(Number(age)) || age < 18 || age > 60) {
          return 'Tuổi phải là số và nằm trong khoảng từ 18 đến 60';
        }
      
        return null; // Hợp lệ
      };
      
      
  
      // Validate email field
      const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@gmail\.com$/; // Địa chỉ email phải kết thúc bằng @gmail.com
        if (!emailRegex.test(email)) {
          return 'Email không hợp lệ, phải sử dụng địa chỉ @gmail.com';
        }
        return null; // Hợp lệ
      };
  
      // Object to hold validation errors
      const fieldErrors: { [key: string]: string | null } = {
        fullName: values.fullName ? null : requiredFields.fullName,
        email: values.email ? validateEmail(values.email) : requiredFields.email,
        roleId: values.roleId ? null : requiredFields.roleId,
        address: values.address ? null : requiredFields.address,
        phone: values.phone ? validatePhone(values.phone) : requiredFields.phone,
        age: values.age ? validateAge(Number(values.age)) : requiredFields.age,
      };
  
      // Find the first error
      const firstErrorKey = Object.keys(fieldErrors).find(
        (key) => fieldErrors[key] !== null
      );
  
      // If there's an error, show it and stop execution
      if (firstErrorKey) {
        toast.error(fieldErrors[firstErrorKey]!); // Display the first error
        return;
      }
  
      // Proceed with saving if all validations pass
      await updateUser(editingId ?? 0, values);
      table.setEditingRow(null);
      toast.success(t('Cập nhật nhân viên thành công'));
  
      // Fetch updated user data
      const currentUserRoleId = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').roleId);
      const updatedData =
        currentUserRoleId === 2 ? await fetchAllUser() : await fetchAllUserall();
  
      const updatedDataWithRoleDescriptions = updatedData.data.map((user: { roleId: any }) => {
        const role = roles.find((role: { id: any }) => role.id === user.roleId);
        return { ...user, roleDescription: role ? role.description : 'N/A' };
      });
  
      // Log values after editing
      console.log('Giá trị sau khi chỉnh sửa:', updatedDataWithRoleDescriptions);
  
      setData(updatedDataWithRoleDescriptions);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  
  
  
  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates,
    paginationDisplayMode: 'pages',
    // enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 5, pageIndex: 1 },
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: { id: false }
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    getRowId: (row: User) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false,
    onEditingRowSave: handleSaveUser,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h4">Thêm nhân viên</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    positionActionsColumn: 'last',
    muiSearchTextFieldProps: {
      label: t('Tìm kiếm')
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    renderRowActions: ({ row, table }) => (
      row.original.roleDescription.toLowerCase() !== 'admin'
        ? (
          <Box>
            <Tooltip title="Chỉnh sửa">
              <button
                className="btn bg-sky-500 hover:bg-sky-400 p-1.5 rounded-sm"
                onClick={() => {
                  setEditingId(row.original.id);
                  table.setEditingRow(row);
                }}
              >
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
                </svg>
              </button>
            </Tooltip>
          </Box>

          )
        : null
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-2 mt-2">
       <Tooltip title="Nhấn vào để thêm mới">
        <button
          className="btn bg-green-500 hover:bg-green-400 p-1 rounded-sm"
          onClick={() => {
            
            table.setCreatingRow(true); // Opens the create row modal with no default values
          }}
        >
          <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
          </svg>
        </button>
      </Tooltip>
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
    enableRowSelection: (row) => row.original.roleDescription.toLowerCase() !== 'admin',
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })

  return (
    <>
    
      <MaterialReactTable table={table} />
      <ModalComponent
        isOpen={isModalOpen}
        title="Confirm Delete"
        imageUrl={Anh}
        description={`Bạn có chắc chắn muốn xóa nhân viên ${deleteUsername}?`}
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
        title="Confirm Delete"
        imageUrl={Anh}
        description={`Bạn có chắc chắn muốn xóa ${Object.keys(rowSelection).length} nhân viên này không?`}
        onClose={() => {
          setIsSecondModalOpen(false)
        }}
        onOk={deleteId !== null ? handleConfirmDeleteSingle : handleConfirmDelete}
        onCancel={() => {
          setIsSecondModalOpen(false)
        }}
      />
      
    </>
  )
}

export default TableUser
