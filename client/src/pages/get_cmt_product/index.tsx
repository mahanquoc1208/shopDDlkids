import React, { useEffect, useState, useMemo } from 'react'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
  MRT_TableOptions,
  MRT_RowSelectionState,
  MRT_Cell
} from 'material-react-table'
import { getNumberStart, getlistComments } from '../../api/post/post.api'// updateCategoryCourse
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { i18n } from '../../services/i18n'
function isVietnamese () {
  return i18n.language === 'vi'
}
interface categoryproduct {
  id: number;
  ProductID: number;
  createdAt: string;
  content: string;
}
interface StarDistribution {
  number_star: number;
  count: number;
  percentage: string;
}

interface CommentData {
  totalComments: number;
  starDistribution: StarDistribution[];
}

const StarIcon = ({ full }: { full: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={full ? '#FFA500' : 'none'} // Fill the star with orange when full, otherwise transparent
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-6"
    style={{ width: '24px', height: '24px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

const Categoryproduct = () => {
  const [data, setData] = useState<categoryproduct[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStars, setSelectedStars] = useState<number>(5); // Track the selected stars
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // % số sao
  const [comments, setComments] = useState<Comment[]>([]); // State to store comments data
  const [loading, setLoading] = useState<boolean>(true); // State to handle loading status
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [starDistribution, setStarDistribution] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // console.log('Selected stars value:', selectedStars);
        const numberStartResponse = await getNumberStart(selectedStars);
        console.log('API response:', numberStartResponse); // Log API response to check structure
  
        // Check if data exists and is an array, otherwise set an empty array
        const fetchedData = numberStartResponse?.data || [];
        setData(fetchedData);
  
        // console.log('Fetched data:', fetchedData); // Log fetched data to verify it's set correctly
      } catch (error) {
        // console.error("Error fetching data:", error);
        setData([]); // Ensure data is an empty array if there's an error
      }
    };
    fetchAllData();
  }, [selectedStars]);
  const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating); // Full stars based on integer part
    return (
      <div style={{ display: 'flex' }}>
        {Array.from({ length: fullStars }, (_, index) => (
          <StarIcon key={index} full={true} />
        ))}
      </div>
    );
  };
  // hiển thị số sao và %
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await getlistComments();
        setStarDistribution(response.data.starDistribution || []);
        setTotalComments(response.data.totalComments || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Đang chờ xử lý');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);
  
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

  const columns = useMemo<Array<MRT_ColumnDef<categoryproduct>>>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      grow: true,
      size: 100,
    },
    {
      accessorKey: 'ProductID',
      header: 'Tên sản phẩm',
      enableEditing: true,
      grow: true,
      size: 120,
    },
    {
      accessorKey: 'content',
      header: 'Nội dung đánh giá',
      grow: true,
      size: 120,
    },
    {
      accessorKey: 'number_star',
      header: 'Sao đánh giá',
      grow: true,
      size: 120,
      Cell: ({ row }) => <StarRating rating={row.original.number_star} />,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      grow: true,
      size: 120,
    },
    {
      accessorKey: 'createdAt',
      header: 'Thời gian đánh giá',
      Cell: ({ cell }) => formatDateForDatetimeLocal(cell.getValue<string>()), // format date if needed
      grow: true,
      size: 120,
    }
  ], []);
  
  const dataWithFormattedDates = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
      // formattedUpdatedAt: formatDateForDatetimeLocal(item.updatedAt)
    }))
  }, [data])

  const table = useMaterialReactTable({
    columns,
    data: dataWithFormattedDates,
    paginationDisplayMode: 'pages',
    enableRowSelection: false, // Disable row selection to hide the checkbox column
    initialState: {
      pagination: { pageSize: 5, pageIndex: 1 },
      sorting: [{ id: 'id', desc: true }],
      columnVisibility: {
        id: false,
        'mrt-row-actions': false // This hides the default action column completely
      }
    },
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    getRowId: (row: categoryproduct) => row.id.toString(),
    editDisplayMode: 'row',
    enableEditing: true,
    autoResetPageIndex: false,
    localization: isVietnamese() ? MRT_Localization_VI : undefined,
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
      'mrt-row-actions': {
        enableResizing: false,
        size: 0,
        grow: false,
        enableColumnActions: false,
        enableEditing: false,
        enableSorting: false,
        header: '',
      },
      'mrt-row-numbers': {
        enableResizing: true,
        size: 40,
        grow: false
      }
    },
    enableRowNumbers: false,
    layoutMode: 'grid'
  });
  
  const starOptions = [1, 2, 3, 4, 5];

  const handleSelectStar = (stars: number) => {
    // console.log('Selected star:1111111111111111111', stars); // Log the selected star rating
    setSelectedStars(stars); // Update the selected stars
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  return (
    <div>
      <div className="py-10 px-5 w-full">
        {/* Container with Flexbox */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Section */}
          <div className="flex-1">
            <div className="mb-8">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Xem đánh giá sản phẩm ✨</h1>
            </div>
            <div className="flex flex-col">
              <label htmlFor="starSelect" className="mb-2 font-bold">
                {'Chọn số sao'}
              </label>
              <div className="relative">
                {/* Button to show the selected stars */}
                <button
                  className="w-full h-10 border p-2 rounded text-left flex items-center"
                  type="button"
                  onClick={toggleDropdown} // Toggle dropdown visibility when clicked
                >
                  {/* Render the selected stars */}
                  {[...Array(selectedStars)].map((_, index) => (
                    <StarIcon key={index} full={true} />
                  ))}
                </button>

                {/* Custom dropdown */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border rounded shadow-lg z-20">
                    {starOptions.map((stars) => (
                      <div
                        key={stars}
                        className="cursor-pointer p-2 flex items-center hover:bg-gray-200"
                        onClick={() => handleSelectStar(stars)} // Select the star rating
                      >
                        {/* Render stars for each option */}
                        {[...Array(stars)].map((_, index) => (
                          <StarIcon key={index} full={true} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1">
            <div className="mb-8">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Tỉ lệ đánh giá sản phẩm</h1>
            </div>
            {/* Nội dung bên phải */}
              {/* Thêm nội dung cho phần "Tỉ lệ đánh giá sản phẩm" ở đây */}
              <div className="star-distribution">
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && (
                  <>
                    <div className="flex items-center mb-2">
                      <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {(
                          starDistribution.reduce((sum, item) => sum + item.number_star * item.count, 0) /
                          totalComments
                        ).toFixed(2)}
                      </p>
                      <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">Trên</p>
                      <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">5</p>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {totalComments} Tổng đánh giá
                    </p>
                    {starDistribution.map((star) => (
                      <div key={star.number_star} className="flex items-center mt-4">
                        <a
                          href="#"
                          className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          {star.number_star} Sao
                        </a>
                        <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                          <div
                            className="h-5 bg-yellow-300 rounded"
                            style={{ width: star.percentage }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {star.percentage}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
          </div>
        </div>
      </div>

  
      <hr className="my-4" />
      <div className="overflow-x-auto">
        <MaterialReactTable table={table} />
      </div>
    </div>
  )
  
}

export default Categoryproduct
