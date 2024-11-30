/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TableRole
   ========================================================================== */

import React, { useState, useEffect } from 'react'
import { fetchRole, fetchPermissionByRole, assignPermissonToRole, createRole, deleteRole } from '../../../api/post/post.api'
import _ from 'lodash'
import DeleteIcon from '@mui/icons-material/Delete'
import { toast } from 'react-toastify'
import ModalComponent from '../../../components/Modal'
import { useForm } from 'react-hook-form'
import Anh from '../../../assets/img/categoryCourse/category-course1.png'
import { IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface Role {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: number
  name: string
  description: string
}

interface PermissionObject {
  id: number
  description: string
  isAssigned: boolean
}
interface TableRoleProps {
  permissions: Permission[]
}
interface FormInput {
  name: string
  description: string
}

const TableRole = ({ permissions }: TableRoleProps) => {
  const nameInputRef = React.useRef<HTMLInputElement>(null)
  const descriptionTextRef = React.useRef<HTMLTextAreaElement>(null)
  const [errorField, setErrorField] = useState<string>('')

  const [userRole, setUserRole] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [assignedPermissionsByRole, setAssignedPermissionsByRole] = useState<PermissionObject[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  const { t } = useTranslation()

  const openDeleteModal = () => {
    if (selectedRole === '') {
      toast.error(t('permissionpage.toast.pleaseSelectARoleFirst'))
    } else {
      setIsDeleteModalOpen(true)
    }
  }
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  useEffect(() => {
    async function fetchData () {
      try {
        const roleResponse = await fetchRole()
        setUserRole(roleResponse.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedRole !== '') {
      const updateAssignedPermissions = async () => {
        try {
          const response = await fetchPermissionByRole(selectedRole)
          const result = buildDataPermissonByRole(response.data, permissions)
          setAssignedPermissionsByRole(result)
        } catch (error) {
          console.error('Failed to fetch permissions by role:', error)
        }
      }
      updateAssignedPermissions()
    }
  }, [permissions, selectedRole])

  const handleOnchangeRole = async (value: string) => {
    setSelectedRole(value)
    if (value !== '') {
      try {
        const response = await fetchPermissionByRole(value)
        const result = buildDataPermissonByRole(response.data, permissions)
        setAssignedPermissionsByRole(result)
      } catch (error) {
        console.error('Failed to fetch permissions by role:', error)
      }
    }
  }

  const buildDataPermissonByRole = (groupPermisson: Permission[], allPermisson: Permission[]): PermissionObject[] => {
    const result: PermissionObject[] = []
    if (allPermisson.length > 0) {
      allPermisson.forEach((permission: Permission) => {
        const object: PermissionObject = {
          id: permission.id,
          description: permission.description,
          isAssigned: false
        }
        if (groupPermisson.length > 0) {
          object.isAssigned = groupPermisson.some((item: Permission) => item.name === permission.name)
        }
        result.push(object)
      })
    }
    return result
  }
  const handleSelectPermission = (value: string) => {
    const _assignedPermissionsByRole = _.cloneDeep(assignedPermissionsByRole)
    const foundIndex = _assignedPermissionsByRole.findIndex(item => +item.id === +value)
    if (foundIndex > -1) {
      _assignedPermissionsByRole[foundIndex].isAssigned = !_assignedPermissionsByRole[foundIndex].isAssigned
    }
    setAssignedPermissionsByRole(_assignedPermissionsByRole)
  }

  const handleSave = async () => {
    try {
      const permissionIds = assignedPermissionsByRole
        .filter(permission => permission.isAssigned)
        .map(permission => permission.id)

      const payload = { roleId: selectedRole, permissionIds }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await assignPermissonToRole(payload)
      toast.success(t('permissionpage.toast.assignPermissionSuccessfully'))
    } catch (error: any) {
      console.error('Failed to assign permissions to role:', error)
      toast.error(error.message)
    }
  }

  const handleDeleteRole = async () => {
    try {
      if (selectedRole === '') {
        toast.error(t('permissionpage.toast.pleaseSelectARoleToDelete'))
      } else {
        await deleteRole(selectedRole)
        const fetchResponse = await fetchRole()
        setUserRole(fetchResponse.data)
        setSelectedRole('')
        toast.success(t('permissionpage.toast.deleteRoleSuccessfully'))
        closeDeleteModal()
      }
    } catch (error: any) {
      console.error('Failed to delete role or fetch roles:', error)
      toast.error(t('permissionpage.toast.roleCanNot'))
    }
  }

  const { register, handleSubmit, reset } = useForm<FormInput>()
  const handleCreatePermission = async (data: FormInput) => {
    try {
      const response = await createRole(data)
      setUserRole(prevData => [...prevData, response.data])
      reset()
      toast.success(t('permissionpage.toast.createRoleSuccessfully'))
    } catch (error: any) {
      toast.error(error.message)
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'name' && nameInputRef.current) {
          nameInputRef.current?.focus()
        } else if (error.field === 'description' && descriptionTextRef.current) {
          descriptionTextRef.current?.focus()
        }
      }
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit(handleCreatePermission)}
        className="space-y-4 px-4 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Name Input */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">
                 {t('permissionpage.name')}
              </label>
              <input
                {...register('name')}
                placeholder={t('permissionpage.enterRoleName') ?? 'Defaultplaceholder'}
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
                placeholder={t('permissionpage.enterRoleDescription') ?? 'Defaultplaceholder'}
                className={`form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none ${errorField === 'description' ? 'border-red-500' : 'focus:ring-1 focus:ring-teal-400'}`}
                onChange={() => setErrorField('')}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className='px-4 py-2 bg-green-500 text-white rounded'>
            {t('permissionpage.create')}
          </button>
        </div>
      </form>
      <hr className="my-4" />
      <div className="space-y-4 px-4">
        <h4 className="text-xl font-bold">{t('permissionpage.listRole')}</h4>

        <div className="flex flex-row items-start gap-4">

          <IconButton onClick={openDeleteModal}>
            <DeleteIcon />
          </IconButton>
          <select className="block w-full sm:w-80 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400" onChange={async (event) => await handleOnchangeRole(event.target.value)}>
            <option value="">{t('permissionpage.pleaseSelectRole')}</option>
            {userRole.length > 0 &&
              userRole.map((role, index) => {
                return (
                  <option key={`role-${index}`} value={role.id}>
                    {role.description}
                  </option>
                )
              })}
          </select>
        </div>
        <hr className="my-8" />
        <div className="flex items-center justify-between pb-5">
          <h5 className="text-lg font-semibold">{t('permissionpage.assignPermissions')}</h5>
          <button className='bg-blue-500 text-white px-4 py-2 rounded' onClick={handleSave}>{t('permissionpage.save')}</button>
        </div>
        {selectedRole !== '' &&
          <div className='permission grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-48'>
            {
              assignedPermissionsByRole.length > 0 && assignedPermissionsByRole.map((permission, index) => {
                return (
                  <div key={`permission-${index}`} className='form-check mt-2'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      id={`permission-${index}`}
                      value={permission.id.toString()}
                      checked={permission.isAssigned || false}
                      onChange={(event) => handleSelectPermission(event.target.value)}
                    />
                    <label className='form-check-label ml-2' htmlFor={`permission-${index}`}>
                      {permission.description}
                    </label>
                  </div>
                )
              })
            }
          </div>
        }
      </div>

      <ModalComponent
        isOpen={isDeleteModalOpen}
        title="Confirm Delete"
        imageUrl={Anh}
        description="Are you sure you want to delete this permission?"
        onClose={() => setIsDeleteModalOpen(false)}
        onOk={async () => {
          await handleDeleteRole()
          closeDeleteModal()
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}

export default TableRole
