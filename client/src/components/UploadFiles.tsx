/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UploadFiles
   ========================================================================== */
import { FC } from 'react'
import { DropzoneOptions, useDropzone, FileRejection, Accept } from 'react-dropzone'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useTranslation } from 'react-i18next'

interface IUploadFilesProps extends DropzoneOptions {
  className?: string
  errorMessage?: string
  borderError?: boolean
  maxFiles?: number
  multiple?: boolean
  maxSize?: number
  accept?: Accept
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[]) => Promise<void>
}

const UploadFiles: FC<IUploadFilesProps> = ({
  className,
  errorMessage,
  borderError,
  ...dropzoneOptions
}) => {
  const { getInputProps, getRootProps } = useDropzone({ ...dropzoneOptions })
  const { t } = useTranslation()
  const getFriendlyFileTypes = (accept: Accept | undefined) => {
    if (!accept) return 'various'
    const mimeTypes = Object.keys(accept)
    return mimeTypes
      .map((mime) => {
        switch (mime) {
          case 'application/pdf':
            return '.pdf'
          case 'application/msword':
            return '.doc'
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return '.docx'
          case 'image/jpeg':
            return '.jpeg'
          case 'image/png':
            return '.png'
          case 'video/mp4':
            return '.mp4'
          default:
            return mime.split('/')[1]
        }
      })
      .join(', ')
  }

  return (
    <>
      <div
        {...getRootProps({
          className: `${className || ''
            } flex flex-col items-center p-4 bg-[#00000005] border border-dashed ${borderError ? 'border-red-500' : 'border-[#d9d9d9]'
            } transition-colors duration-300 hover:cursor-pointer`
        })}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon color="success" sx={{ fontSize: 50 }} />
        <p className="text-[#000000e0] text-base mb-1">
          {t('Nhấn vào đây để tải hình lên')}
        </p>
        <p className="text-sm text-[#00000073]">
          {t('Hỗ trợ tải anh có đuôi tệp .png .jpg .jpeg')}
        </p>
      </div>
      {errorMessage && (
        <p className="text-base text-red-500 mt-1">{errorMessage}</p>
      )}
    </>
  )
}

export default UploadFiles
