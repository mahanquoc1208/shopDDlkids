/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TablePermission
========================================================================== */
import React, { useEffect, useState, useMemo, useRef } from 'react'
import ModalComponent from '../../../components/Modal'
import Anh from '../../../assets/img/categoryCourse/category-course1.png'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MRT_EditActionButtons,
  MaterialReactTable,
  type MRT_ColumnDef,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type MRT_Row,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type MRT_TableOptions,
  useMaterialReactTable,
  type MRT_RowSelectionState
} from 'material-react-table'
import { IconButton } from '@mui/material'
import { fetchAllPermission, deletePermission, createPermission, updatePermission, fetchAllRoute } from '../../../api/post/post.api'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { useTranslation } from 'react-i18next'
import { i18n } from '../../../services/i18n'

function isVietnamese () {
  return i18n.language === 'vi'
}

interface FormInput {
  name: string
  description: string
  url: string
  method: string
}

interface Permisson {
  id: number
  name: string
  description: string
  url: string
  method: string
  createdAt: string
  updatedAt: string
}
interface CustomCellProps {
  cell: {
    getValue: () => unknown
  }
}

interface Route {
  url: string
  method: string
}

interface TablePermissionProps {
  onPermissionsChange: (updatedPermissions: any[]) => void
}

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-green-600'
    case 'POST':
      return 'bg-blue-600'
    case 'PUT':
      return 'bg-yellow-600'
    case 'DELETE':
      return 'bg-red-600'
    case 'ANY':
      return 'bg-purple-600'
    default:
      return 'bg-gray-600'
  }
}
const TablePermission: React.FC<TablePermissionProps> = ({ onPermissionsChange }) => {
  const { t } = useTranslation()
  const nameInputRef = React.useRef<HTMLInputElement>(null)
  const descriptionTextRef = React.useRef<HTMLTextAreaElement>(null)
  const routeSelectRef = React.useRef<HTMLSelectElement>(null)
  const [errorField, setErrorField] = useState<string>('')

  const [data, setData] = useState<Permisson[]>([])

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)

  const [editingPermission, setEditingPermission] = useState<Permisson | null>(null)
  const [route, setRoute] = useState<Route[]>([])

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteName, setDeleteName] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onPermissionsChange(data)
  }, [data, onPermissionsChange])

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  const handleDelete = (id: number, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setIsModalOpen(true)
  }

  const handleConfirmDeleteSingle = async () => {
    if (deleteId === null) {
      toast.error(t('permissionpage.toast.noRowSelectedDelete'))
      return
    }
    await deletePermission(deleteId.toString())
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
    setDeleteId(null)
    setIsModalOpen(false)
    toast.success(t('permissionpage.toast.deleteSuccessfully'))
    reset() // reset form after delete
  }

  useEffect(() => {
    fetchData()
    fetchRoute()
  }, [])

  const fetchRoute = async () => {
    const response = await fetchAllRoute()
    setRoute(response.data)
  }

  const fetchData = async () => {
    const response = await fetchAllPermission()
    setData(response.data)
  }

  const { register, handleSubmit, reset, setValue } = useForm<FormInput>()

  const handleCreatePermission = async (data: FormInput) => {
    try {
      const [method, url] = data.method.split(' ')
      const response = await createPermission({ ...data, method, url })
      setData(prevData => [...prevData, response.data])
      reset()
      toast.success(t('permissionpage.toast.createPermissionSuccessfully'))
    } catch (error: any) {
      toast.error(error.message)
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'name' && nameInputRef.current) {
          nameInputRef.current?.focus()
        } else if (error.field === 'description' && descriptionTextRef.current) {
          descriptionTextRef.current?.focus()
        } else if (error.field === 'route' && routeSelectRef.current) {
          routeSelectRef.current?.focus()
        }
      }
    }
  }

  const handleEditPermission = (permission: Permisson) => {
    setEditingPermission(permission)
    setValue('name', permission.name)
    setValue('description', permission.description)
    setValue('method', `${permission.method} ${permission.url}`)
  }

  const handleUpdatePermission = async (data: FormInput) => {
    if (!editingPermission) return
    try {
      const [method, url] = data.method.split(' ')
      const response = await updatePermission(editingPermission.id.toString(), { ...data, method, url })
      const updatedPermission = response.data
      setData(prevData => prevData.map(row => row.id === editingPermission.id ? updatedPermission : row))
      setEditingPermission(null)
      reset()
      toast.success(t('permissionpage.toast.updatePermissionSuccessfully'))
    } catch (error: any) {
      toast.error(error.message)
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'name' && nameInputRef.current) {
          nameInputRef.current?.focus()
        } else if (error.field === 'description' && descriptionTextRef.current) {
          descriptionTextRef.current?.focus()
        } else if (error.field === 'route' && routeSelectRef.current) {
          routeSelectRef.current?.focus()
        }
      }
    }
  }

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    if (selectedIds.length === 0) {
      toast.error(t('permissionpage.toast.noRowSelected'))
      return
    }
    setIsSecondModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    await Promise.all(selectedIds.map(async (id) => await deletePermission(id.toString())))
    setData((prevData) => prevData.filter((row) => !selectedIds.includes(row.id)))
    setRowSelection({})
    setIsModalOpen(false)
    setIsSecondModalOpen(false)
    toast.success(t('permissionpage.toast.deleteSelectedSuccessfully'))
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

  const columns = useMemo<Array<MRT_ColumnDef<Permisson>>>(
    () => [
      {
        accessorKey: 'id',
        header: t('permissionpage.id'),
        enableColumnActions: false,
        enableColumnDragging: false,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        enableEditing: false,
        enableGlobalFilter: false,
        enableGrouping: false,
        enableHiding: false,
        enableResizing: false
      },
      {
        accessorKey: 'name',
        header: t('permissionpage.name')
      },
      {
        accessorKey: 'description',
        header: t('permissionpage.description')
      },
      {
        accessorKey: 'url',
        header: t('permissionpage.url')
      },
      {
        accessorKey: 'method',
        header: t('permissionpage.method'),
        Cell: ({ cell }: CustomCellProps) => (
          <div
            className={getMethodColor(String(cell.getValue())) + ' text-white rounded-none inline-flex justify-center px-2 text-[10px]'}
          >
            {String(cell.getValue())}
          </div>
        )
      },
      {
        accessorKey: 'formattedCreatedAt',
        header: t('permissionpage.createdAt'),
        enableEditing: false
      },
      {
        accessorKey: 'formattedUpdatedAt',
        header: t('permissionpage.updatedAt'),
        enableEditing: false
      },
      {
        accessorKey: 'actions',
        header: t('permissionpage.actions'),
        enableColumnActions: false,
        enableColumnDragging: false,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        enableEditing: false,
        enableGlobalFilter: false,
        enableGrouping: false,
        enableHiding: false,
        enableResizing: false,
        enableSorting: false,
        Cell: ({ row }: { row: MRT_Row<Permisson> }) => (
          <div>
            <IconButton color="warning" onClick={() => handleEditPermission(row.original)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(row.original.id, row.original.name)}>
              <DeleteIcon />
            </IconButton>
          </div>
        )
      }
    ],
    [t, currentLanguage]
  )

  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates,
    paginationDisplayMode: 'pages',
    enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 5, pageIndex: 1 },
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: { id: false }
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    getRowId: (row: Permisson) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    muiSearchTextFieldProps: {
      label: t('permissionpage.searchAllFields')
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex space-x-4 -ml-0.5">
        <IconButton onClick={handleDeleteSelected}>
          <DeleteIcon />
        </IconButton>
      </div>
    ),
    autoResetPageIndex: false,
    localization: isVietnamese() ? MRT_Localization_VI : undefined
  })

  return (
    <>
      <form
        onSubmit={handleSubmit(editingPermission ? handleUpdatePermission : handleCreatePermission)}
        className="space-y-4 px-4 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Name Input */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('permissionpage.name')}
              </label>
              <input
                {...register('name')}
                placeholder={t('permissionpage.enterPermissionName') ?? 'Defaultplaceholder'}
                className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'name' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400'}`}
                onChange={() => setErrorField('')}
              />
            </div>
          </div>
          {/* Description Input */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('permissionpage.description')}
              </label>
              <textarea
                {...register('description')}
                placeholder={t('permissionpage.enterPermissionDescription') ?? 'Defaultplaceholder'}
                className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'description' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400'}`}
                onChange={() => setErrorField('')}
              />
            </div>
          </div>
          {/* Select Route */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('permissionpage.selectRoute')}
            </label>
            <select
              {...register('method')}
              className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'route' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400'}`}
              onChange={() => setErrorField('')}
            >
              <option value="">{t('permissionpage.pleaseSelectRoute')}</option>
              {route.map((routeObj, index) => {
                const displayText = `${routeObj.method} ${routeObj.url}`
                return (
                  <option key={index} value={displayText}>
                    {displayText}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded shadow-md hover:bg-green-600 transition"
          >
            {editingPermission ? t('permissionpage.update') : t('permissionpage.create')}
          </button>
        </div>
      </form>
      <hr className="my-4" />
      {/* Table and Modals */}
      <MaterialReactTable table={table} />
      <ModalComponent
        isOpen={isModalOpen}
        title="Confirm Delete"
        imageUrl={Anh}
        description={`Are you sure you want to delete permission ${deleteName}?`}
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
        description={`Are you sure you want to delete ${Object.keys(rowSelection).length} selected permissions?`}
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
export default TablePermission
