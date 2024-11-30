/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: AccountPanel
   ========================================================================== */
   import React, { useEffect, useState, useRef } from 'react'
   import Image from '../../../assets/images/profiler/user-avatar.png'
   import ImageCover from '../../../assets/images/profiler/cover-image.png'
   import { fetchCustomerById, updateCutommer } from '../../../api/post/post.api'
   import { getFromLocalStorage } from '../../../utils/functions'
   import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
   import { toast } from 'react-toastify'
   import { useTranslation } from 'react-i18next'
   import axios from 'axios';
   
   interface User {
    id: string
    fullName: string
    lastName: string
    gender: string
    age: string
    email: string
    username: string
    password?: string
    newPassword?: string
    currentPassword?: string
    phuong?: string
    quan?: string
    tinh?: string
    duong?: string
    address?: string
    phone?: string; // Add this line
  }
   
   interface PayloadType {
    fullName: string
     lastName: string
     gender: string
     age: string
     email: string
     username: string
     password?: string
     newPassword?: string
     currentPassword?: string
     phuong?: string
     quan?: string
     tinh?: string
     address?: string
     duong?: string
     phone?: string; // Add this line

   }
   
   function AccountPanel () {
     const { t } = useTranslation()
   
     const [user, setUser] = useState<User>({
       id: '',
       fullName: '',
       lastName: '',
       gender: '',
       age: '',
       email: '',
       username: '',
       password: '',
       newPassword: '',
       currentPassword: '',
       phuong: '',
       quan: '',
       tinh: '',
       address: '',
       duong: '',
       phone:''
     })
     const [originalUser, setOriginalUser] = useState<User>(user)
     const [selectedTinh, setSelectedTinh] = useState('0'); // For Tỉnh / Thành phố
     const [selectedQuan, setSelectedQuan] = useState('0'); // For Quận / Huyện
     const [selectedPhuong, setSelectedPhuong] = useState('0'); // For Phường / Xã
   
     // Load the list of available options for Tinh, Quan, Phuong, etc.
     const [tinhList, setTinhList] = useState([]);
     const [quanList, setQuanList] = useState([]);
     const [phuongList, setPhuongList] = useState([]);
   
     useEffect(() => {
       const fetchUser = async () => {
         const tokens = getFromLocalStorage<any>('tokens')
         const userId = tokens?.id
         if (userId) {
           const response = await fetchCustomerById(userId)
           console.log("load du lieu len", response.data)
           setUser(response.data)
           setOriginalUser(response.data)
         } else {
           console.error('User not found')
         }
       }
       fetchUser()
     }, [])
     useEffect(() => {
       axios.get('https://esgoo.net/api-tinhthanh/1/0.htm')
         .then(response => {
           if (response.data.error === 0) {
             setTinhList(response.data.data);
           }
         })
         .catch(error => console.error('Error fetching provinces:', error));
     }, []);
     
     useEffect(() => {
       if (selectedTinh !== '0') {
         axios.get(`https://esgoo.net/api-tinhthanh/2/${selectedTinh}.htm`)
           .then(response => {
             if (response.data.error === 0) {
               setQuanList(response.data.data);
               setPhuongList([]); // Clear phuongList when quanList changes
               setSelectedQuan('0');
             }
           })
           .catch(error => console.error('Error fetching districts:', error));
       }
     }, [selectedTinh]);
     
     useEffect(() => {
       if (selectedQuan !== '0') {
         axios.get(`https://esgoo.net/api-tinhthanh/3/${selectedQuan}.htm`)
           .then(response => {
             if (response.data.error === 0) {
               setPhuongList(response.data.data);
             }
           })
           .catch(error => console.error('Error fetching wards:', error));
       }
     }, [selectedQuan]);

     const [isEditing, setIsEditing] = useState(false)
     const handleEditProfile = () => {
       setIsEditing(true) // chỉ cho phép edit 1 lần
       // setIsEditing(prevIsEditing => !prevIsEditing) // cho phép edit nhiều lần
     }
     const handleCancelEdit = () => {
       setIsEditing(false)
       setUser(originalUser)
       setObjCheckInput({ ...defaultObjCheckInput })
       setIsSettingNewPassword(false)
     }
     const handleCancelSet = () => {
       setObjCheckInput({ ...defaultObjCheckInput })
       setIsSettingNewPassword(false)
       setUser(prevUser => ({ ...prevUser, newPassword: '', currentPassword: '' }))
     }
   
     // validate
     const defaultObjCheckInput = {
       isValidfullName: true,
       isValidLastName: true,
       isValidAge: true,
       isValidEmail: true,
       isValidGender: true,
       isValidPassword: true,
       isValidCurrentPassword: true,
       isValidPhoneNumber: true
     }
     const [objCheckInput, setObjCheckInput] = useState(defaultObjCheckInput)
     const fullNameRef = useRef<HTMLInputElement>(null)
     const lastNameRef = useRef<HTMLInputElement>(null)
     const ageRef = useRef<HTMLInputElement>(null)
     const emailRef = useRef<HTMLInputElement>(null)
     const genderRef = useRef<HTMLSelectElement>(null)
     const passwordRef = useRef<HTMLInputElement>(null)
     const currentPasswordRef = useRef<HTMLInputElement>(null)
   
     const [errorField, setErrorField] = useState<string>('')
   
     // function validate
     // name
     const isValidInputs = () => {
       setObjCheckInput(defaultObjCheckInput)
       if (user.fullName === '' || user.fullName === null) {
         toast.error('Nhập đủ Họ và Tên')
         setObjCheckInput({ ...defaultObjCheckInput, isValidfullName: false })
         if (fullNameRef.current) {
          fullName.current.focus()
         }
         return false
       }
      //  const regxfullName = /^[a-zA-Z\u00C0-\u017F\u1E00-\u1EFF\s]*$/
      //  if (!regxfullName.test(user.fullName)) {
      //    toast.error('Nhập đúng định dạng')
      //    setObjCheckInput({ ...defaultObjCheckInput, isValidfullName: false })
      //    if (fullNameRef.current) {
      //     fullNameRef.current.focus()
      //    }
      //    return false
      //  }
       const regxLastName = /^[a-zA-Z\u00C0-\u017F\u1E00-\u1EFF\s]*$/
       if (user.gender === '' || user.gender === null) {
         toast.error('Vui lòng chọn giới tính')
         setObjCheckInput({ ...defaultObjCheckInput, isValidGender: false })
         if (genderRef.current) {
           genderRef.current.focus()
         }
         return false
       }
       if (user.age === '' || user.age === null) {
         toast.error('Nhập tuổi')
         setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
         if (ageRef.current) {
           ageRef.current.focus()
         }
         return false
       }
       if (isNaN(Number(user.age))) {
         toast.error('Tuổi là số')
         setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
         if (ageRef.current) {
           ageRef.current.focus()
         }
         return false
       }
       if (Number(user.age) > 10) {
         toast.error('Tuổi của bé dưới 10')
         setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
         if (ageRef.current) {
           ageRef.current.focus()
         }
         return false
       }
       const regxs = /^[0-9]*$/
       if (!regxs.test(user.age)) {
         toast.error('Tuổi bé không âm')
         setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
         if (ageRef.current) {
           ageRef.current.focus()
         }
         return false
       }
       if (user.email === '' || user.email === null) {
         toast.error('Vui lòng nhập email')
         setObjCheckInput({ ...defaultObjCheckInput, isValidEmail: false })
         if (emailRef.current) {
           emailRef.current.focus()
         }
         return false
       }
       if (!selectedTinh || selectedTinh === '0') {
        toast.error('Vui lòng chọn Tỉnh/Thành phố');
        return false;
      }
      if (!selectedQuan || selectedQuan === '0') {
        toast.error('Vui lòng chọn Quận/Huyện');
        return false;
      }
      if (!selectedPhuong || selectedPhuong === '0') {
        toast.error('Vui lòng chọn Phường/Xã');
        return false;
      }
      if (!user.duong || user.duong.trim() === '') {
        toast.error('Vui lòng nhập Tên đường');
        return false;
      }
       const regx = /\S+@\S+\.\S+/
       if (!regx.test(user.email)) {
         toast.error('Email chưa đúng định dạng')
         setObjCheckInput({ ...defaultObjCheckInput, isValidEmail: false })
         if (emailRef.current) {
           emailRef.current.focus()
         }
         return false
       }
       const regxPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
       if (user.newPassword && !regxPassword.test(user.newPassword)) {
         toast.error('Password yêu cầu 8 chữ số')
         setObjCheckInput({ ...defaultObjCheckInput, isValidPassword: false })
         if (passwordRef.current) {
           passwordRef.current.focus()
         }
         return false
       }
       if (isSettingNewPassword && (user.currentPassword === '' || user.currentPassword === null || user.currentPassword === undefined)) {
         toast.error('Mật khẩu hiện tại là bắt buộc')
         setObjCheckInput({ ...defaultObjCheckInput, isValidCurrentPassword: false })
         if (currentPasswordRef.current) {
           currentPasswordRef.current.focus()
         }
         return false
       }
       if (isSettingNewPassword && (user.newPassword === '' || user.newPassword === null || user.newPassword === undefined)) {
         toast.error('Nhập mật khẩu mới')
         setObjCheckInput({ ...defaultObjCheckInput, isValidPassword: false })
         if (passwordRef.current) {
           passwordRef.current.focus()
         }
         return false
       }
       if (user.phone === '' || user.phone === null) {
        toast.error('Số điện thoại chưa là số');
        setObjCheckInput({ ...defaultObjCheckInput, isValidPhoneNumber: false });
        return false;
      }
      const regxPhoneNumber = /^0\d{9}$/;
      if (!regxPhoneNumber.test(user.phone)) {
        toast.error('Số điện thoại từ 0-10');
        setObjCheckInput({ ...defaultObjCheckInput, isValidPhoneNumber: false });
        return false;
      }    
       return true
     }
   
     const [isSettingNewPassword, setIsSettingNewPassword] = useState(false)
   
     const handleSetNewPasswordClick = () => {
       setIsSettingNewPassword(true)
     }
     useEffect(() => {
      if (!isEditing && user.address) {
        const [duong, phuong, quan, tinh] = user.address.split(',').map(part => part.trim());
    
        const selectedTinhObj = tinhList.find(item => item.full_name === tinh);
        const selectedQuanObj = quanList.find(item => item.full_name === quan);
        const selectedPhuongObj = phuongList.find(item => item.full_name === phuong);
    
        setSelectedTinh(selectedTinhObj ? selectedTinhObj.id : '0');
        setSelectedQuan(selectedQuanObj ? selectedQuanObj.id : '0');
        setSelectedPhuong(selectedPhuongObj ? selectedPhuongObj.id : '0');
        setUser({
          ...user,
          duong,
          phuong: selectedPhuongObj ? selectedPhuongObj.id : '0',
        });
      }
    }, [isEditing, user.address, tinhList, quanList, phuongList]);
    
    const handleTinhChange = (e) => {
      const tinhID = e.target.value;
      if (isEditing) {
        setSelectedTinh(tinhID);
    
        // Reset dependent fields
        setSelectedQuan('0');
        setSelectedPhuong('0');
        setUser({ ...user, duong: '' });
    
        if (tinhID !== '0') {
          axios.get(`https://esgoo.net/api-tinhthanh/2/${tinhID}.htm`)
            .then(response => {
              if (response.data.error === 0) {
                setQuanList(response.data.data);
              }
            })
            .catch(error => console.error('Error fetching districts:', error));
        } else {
          setQuanList([]);
          setPhuongList([]);
        }
      }
    };
    
    const handleQuanChange = (e) => {
      const quanID = e.target.value;
      if (isEditing) {
        setSelectedQuan(quanID);
    
        // Reset dependent fields
        setSelectedPhuong('0');
        setUser(prevState => ({
          ...prevState,
          quan: quanID, // Cập nhật Quận vào user
          phuong: '',   // Xóa Phường nếu Quận thay đổi
          duong: '',    // Xóa Tên đường nếu Quận thay đổi
        }));
    
        if (quanID !== '0') {
          axios.get(`https://esgoo.net/api-tinhthanh/3/${quanID}.htm`)
            .then(response => {
              if (response.data.error === 0) {
                setPhuongList(response.data.data);
              }
            })
            .catch(error => console.error('Error fetching wards:', error));
        } else {
          setPhuongList([]);
        }
      }
    };
    
    
    const handlePhuongChange = (e) => {
      const phuongID = e.target.value;
      if (isEditing) {
        setSelectedPhuong(phuongID);
    
        // Reset dependent fields
        setUser({ ...user, duong: '' });
      }
    };
    
    

    
    const handleSaveChanges = async () => {
      try {
        if (!isValidInputs()) {
          return; // Dừng nếu có lỗi
        }
    
        const { id, newPassword, password, ...payload } = user;
    
        // Tìm thông tin đầy đủ của Tỉnh, Quận, Phường
        const selectedTinhObj = tinhList.find(tinh => tinh.id === selectedTinh);
        const selectedQuanObj = quanList.find(quan => quan.id === selectedQuan);
        const selectedPhuongObj = phuongList.find(phuong => phuong.id === selectedPhuong);
    
        // Kết hợp địa chỉ
        const address = `${user.duong ?? ''}, ${selectedPhuongObj?.full_name ?? ''}, ${selectedQuanObj?.full_name ?? ''}, ${selectedTinhObj?.full_name ?? ''}`;
        console.log("Concatenated Address:", address);
    
        let finalPayload: PayloadType = {
          ...payload,
          address, // Bao gồm địa chỉ đã kết hợp
          phone: user.phone, // Bao gồm số điện thoại
        };
    
        if (newPassword) {
          finalPayload = { ...finalPayload, password: newPassword };
        }
    
        // Log dữ liệu trước khi lưu
        console.log("Data before saving:", finalPayload);
    
        const response = await updateCutommer(parseInt(id), finalPayload);
    
        // Log dữ liệu sau khi lưu
        console.log("Data after saving:", response.data);
    
        if (response.status === 200) {
          toast.success('Cập nhật thông tin thành công');
          setIsEditing(false);
          setIsSettingNewPassword(false);
    
          // Cập nhật localStorage
          const tokens = getFromLocalStorage<any>('tokens');
          tokens.fullName = response.data.fullName;
          tokens.lastName = response.data.lastName;
          tokens.email = response.data.email;
          localStorage.setItem('tokens', JSON.stringify(tokens));
          window.dispatchEvent(new Event('storage'));
        } else {
          toast.error('Lỗi cập nhật');
        }
      } catch (error: any) {
        if (error.field) {
          setErrorField(error.field);
          if (error.field === 'currentPassword') {
            currentPasswordRef.current?.focus();
          }
        }
      }
    };
    
     return (
       <div className="bg-white shadow-lg rounded-sm border border-slate-200 w-full">
         <div className="relative">
           <img className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover" src={ImageCover} alt="User cover" />
           {/* <div className="absolute left-4 sm:left-8 md:left-10 -bottom-14 sm:-bottom-16 md:-bottom-20 flex items-center">
             <div className="rounded-full border-4 border-teal-400 overflow-hidden w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 flex-shrink-0">
               <img className="w-full h-full object-cover" src={Image} alt="User upload" />
             </div>
             <div className="mt-16 ml-4 sm:ml-6 flex flex-col justify-center w-36 sm:w-44 md:w-64 lg:w-72 xl:w-80">
               <p className='font-semibold text-base sm:text-lg md:text-xl overflow-hidden overflow-ellipsis whitespace-nowrap'>{user?.fullName}</p>
               <p className='text-gray-500 text-xs sm:text-sm md:text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>{user?.email}</p>
             </div>
           </div> */}
         </div>
         <div className="mt-8 sm:mt-12 md:mt-16 flex justify-end pr-4 sm:pr-8 md:pr-10 lg:pr-12">
           <button className="bg-gray-300 text-black rounded-md px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-400 hover:text-black flex items-center" onClick={handleEditProfile}>
             <ManageAccountsIcon className='mr-2 -mt-1' />
             <span className="hidden sm:inline">{t('Cập nhật thông tin cá nhân')}</span>
           </button>
         </div>
   
         <div className='p-5'>
         <div className="my-16 bg-white border border-gray-200 rounded-lg shadow p-5">
           <div>
             <h2 className="text-2xl text-slate-800 font-bold mb-6">Thông tin cá nhân</h2>
             <div className="grid gap-5 md:grid-cols-4">
               <div>
                 {/* Start */}
                 <div>
                   <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="fullName">
                     {t('Họ Tên')}
                   </label>
                   <input
                     placeholder= {t('Vui lòng nhập họ và tên')}
                     ref={fullNameRef}
                     id="fullName"
                     className={objCheckInput.isValidfullName ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                     type="text"
                     required
                     value={user?.fullName ?? ''}
                     onChange={(e) => {
                       setUser({ ...user, fullName: e.target.value })
                       setObjCheckInput({ ...objCheckInput, isValidfullName: true })
                     }}
                     disabled={!isEditing}
                   />
                 </div>
                 {/* End */}
               </div>

   
               {/* Select */}
                <div>
                 <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="gender">
                 Giới tính
                 </label>
                  <select
                    id="gender"
                    className={objCheckInput.isValidGender ? `form-select w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-select w-full border p-2 rounded-md focus:outline-none border-red-500'}
                    value={user?.gender === true ? "Male" : (user?.gender === false ? "Female" : '')} // Chuyển giá trị true thành "Male" và false thành "Female"
                    onChange={(e) => {
                      const genderValue = e.target.value === "Male" ? true : (e.target.value === "Female" ? false : null); // Trả về true nếu là Male, false nếu là Female
                      setUser({ ...user, gender: genderValue });
                      setObjCheckInput({ ...objCheckInput, isValidGender: true });
                    }}                    
                    disabled={!isEditing}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">{t('Nam')}</option>
                    <option value="Female">{t('Nữ')}</option>
                  </select>
                </div>
               <div>
                 {/* Start */}
                 <div className='w-1/2'>
                   <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="age">
                     {t('Tuổi của bé')}
                   </label>
                   <input id="age"
                    placeholder= {t('Nhập tuổi cho bé')}
                     className={objCheckInput.isValidAge ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                     type="text"
                     required
                     value={user?.age ?? ''}
                     onChange={(e) => {
                       setUser({ ...user, age: e.target.value })
                       setObjCheckInput({ ...objCheckInput, isValidAge: true })
                     }}
                     disabled={!isEditing}
                   />
                 </div>
                 {/* End */}
               </div>
             </div>
             <div className="grid gap-5 md:grid-cols-2 mt-5">
               {/* Start */}
               <div>
                 <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="email">
                   {t('Email')}
                 </label>
                 <input id="email"
                  placeholder= {t('Vui lòng nhập email')}
                   className={objCheckInput.isValidEmail ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                   type="email"
                   required
                   value={user?.email ?? ''}
                   onChange={(e) => {
                     setUser({ ...user, email: e.target.value })
                     setObjCheckInput({ ...objCheckInput, isValidEmail: true })
                   }}
                   disabled={!isEditing}
                 />
               </div>
               {/* End */}
             </div>
             <div className="grid gap-5 md:grid-cols-2 mt-5">
               {/* Start */}
               <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`}
                  htmlFor="phone"
                >
                  {t('Số điện thoại')}
                </label>
                <input
                 placeholder= {t('Vui lòng nhập số điện thoại')}
                  id="phone"
                  className={objCheckInput.isValidPhoneNumber ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                  type="tel"
                  required
                  value={user?.phone ?? ''}
                  onChange={(e) => {
                    setUser({ ...user, phone: e.target.value });
                    setObjCheckInput({ ...objCheckInput, isValidPhoneNumber: true });
                  }}
                  disabled={!isEditing}
                />
              </div>
               {/* End */}
             </div>
             <div className="my-16 bg-white border border-gray-200 rounded-lg shadow p-5">
              <h2 className="text-2xl text-slate-800 font-bold mb-6">{t('Thông tin địa chỉ')}</h2>
              <div className="grid gap-5 md:grid-cols-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="tinh">
                    {t('Tỉnh / Thành phố')}
                  </label>
                  <select
                    id="tinh"
                    className={`form-select w-full border ${isEditing ? 'border-gray-300' : 'border-neutral-300'} p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400`}

                    value={selectedTinh}
                    onChange={handleTinhChange}
                    disabled={!isEditing}
                  >
                    <option value="0">{t('Tỉnh /Thành phố')}</option>
                    {tinhList.map(tinh => (
                      <option key={tinh.id} value={tinh.id}>
                        {tinh.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="quan">
                    {t('Quận/ Huyện')}
                  </label>
                  <select
                    id="quan"
                    className={`form-select w-full border ${isEditing ? 'border-gray-300' : 'border-neutral-300'} p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400`}

                    value={selectedQuan}
                    onChange={handleQuanChange}
                    disabled={!isEditing}
                  >
                    <option value="0">{t('Chọn Quận/ Huyện')}</option>
                    {quanList.map(quan => (
                      <option key={quan.id} value={quan.id}>
                        {quan.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="phuong">
                    {t('Phường/ Xã')}
                  </label>
                  <select
                    id="phuong"
                    className={`form-select w-full border ${isEditing ? 'border-gray-300' : 'border-neutral-300'} p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400`}

                    value={selectedPhuong}
                    onChange={handlePhuongChange}
                    disabled={!isEditing}
                  >
                    <option value="0">{t('Chọn Phường/ Xã')}</option>
                    {phuongList.map(phuong => (
                      <option key={phuong.id} value={phuong.id}>
                        {phuong.full_name}
                      </option>
                    ))}
                  </select>

                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="duong">
                    {t('Tên đường')}
                  </label>
                  <input
                    type="text"
                    id="duong"
                    className={`form-select w-full border ${isEditing ? 'border-gray-300' : 'border-neutral-300'} p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400`}
                    value={user.duong ?? ''}
                    onChange={e => setUser({ ...user, duong: e.target.value })}
                    disabled={!isEditing || !selectedTinh || !selectedQuan || !selectedPhuong}
                  />
                </div>
              </div>
            </div>
   
             <div className="grid gap-5 md:grid-cols-1 mt-5">
               {/* Start */}
               <div>
                 <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="password">
                   
                 </label>
                 {isSettingNewPassword && (
                   <>
                     <div className="grid gap-5 md:grid-cols-3 mb-4">
                       <input
                         className={objCheckInput.isValidCurrentPassword ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'} ${errorField === 'currentPassword' ? 'border-red-500' : ''} ` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                         type="password"
                         id="currentPassword"
                         placeholder={t('Nhập mật khẩu hiện tại') ?? 'Defaultplaceholder'}
                         onChange={(e) => {
                           setUser({ ...user, currentPassword: e.target.value })
                           setObjCheckInput({ ...objCheckInput, isValidCurrentPassword: true })
                           setErrorField('')
                         }}
                       />
                     </div>
                     <div className="grid gap-5 md:grid-cols-3 mb-4">
                       <input
                         className={objCheckInput.isValidPassword ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                         type="password"
                         id="newPassword"
                         placeholder={t('Nhập mật khẩu mới') ?? 'Defaultplaceholder'}
                         onChange={(e) => {
                           setUser({ ...user, newPassword: e.target.value })
                           setObjCheckInput({ ...objCheckInput, isValidPassword: true })
                         }}
                       />
                     </div>
                   </>
                 )}
                 {isSettingNewPassword && (
                   <div>
                     <button className="bg-white text-teal-400 px-2 py-2 rounded-md border border-gray-300 hover:bg-teal-400 hover:text-white" onClick={handleCancelSet}>{t('Hủy thay đổi mật khẩu')}</button>
                   </div>
                 )}
                 {!isSettingNewPassword && (
                   <div>
                     <p className={`text-gray-500 ${isEditing ? '' : 'text-neutral-400'}`}>{t('bạn có thể thay đổi mật khẩu nếu muốn')}</p>
                     <button
                       className={`bg-white text-teal-400 px-2 py-2 rounded-md border border-gray-300 hover:bg-teal-400 hover:text-white ${isEditing ? '' : 'opacity-50 cursor-not-allowed text-neutral-400 hover:bg-white hover:text-neutral-400'}`}
                       disabled={!isEditing}
                       onClick={handleSetNewPasswordClick}
                     >
                       {t('Thay đổi mật khẩu')}
                     </button>
                   </div>
                 )}
   
               </div>
               {/* End */}
             </div>
             {isEditing
               ? (
                 <div className="flex justify-end mt-6">
                   <button className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2  hover:bg-gray-400 hover:text-black" onClick={handleCancelEdit}>{t('Hủy')}</button>
                   <button className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white" onClick={handleSaveChanges}>{t('Lưu thông tin')}</button>
                 </div>
                 )
               : null}
           </div>
         </div>
         </div>
       </div >
     )
   }
   
   export default AccountPanel
   