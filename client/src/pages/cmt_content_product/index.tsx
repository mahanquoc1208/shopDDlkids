import React, { useEffect, useState, useMemo } from 'react';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
  MRT_TableOptions,
  MRT_RowSelectionState,
  MRT_Cell
} from 'material-react-table'

import { getlistCommentsStart1 } from '../../api/post/post.api';
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

const StarIcon = ({ full }: { full: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={full ? '#FFA500' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
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
  const [data, setData] = useState<categoryproduct[]>([]);
  const [filter, setFilter] = useState<string>(''); // Thêm state để lưu giá trị lọc


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await getlistCommentsStart1();
        console.log('API response:', response);

        const fetchedData = response?.data || [];
        setData(fetchedData);

        console.log('Fetched data:', fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      }
    };

    fetchAllData();
  }, []);

  const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    return (
      <div style={{ display: 'flex' }}>
        {Array.from({ length: fullStars }, (_, index) => (
          <StarIcon key={index} full={true} />
        ))}
      </div>
    );
  };

  // List of words for "Sản phẩm được khen" and "Sản phẩm bị chê"
  const goodWords = [
    'tuyệt vời', 'hài lòng', 'thích', 'ok', 'tốt', 'đáng tiền',
    'xuất sắc', 'chất lượng', 'hoàn hảo', 'tuyệt đỉnh', 'đáng giá',
    'ấn tượng', 'tuyệt mỹ', 'hiệu quả', 'bền bỉ', 'đỉnh cao',
    'dễ sử dụng', 'đáng tin cậy', 'yêu thích', 'không thể chê',
    'vượt mong đợi', 'tuyệt hảo', 'tôi muốn', 'đẹp', 'phù hợp'
  ];
  
  const badWords = [
    'không tốt', 'thất vọng', 'không hài lòng', 'tệ', 'xấu', 'chán',
    'dở', 'tệ hại', 'kém chất lượng', 'thất bại', 'phí tiền',
    'không đáng', 'vô dụng', 'dở tệ', 'không bền', 'phiền phức',
    'khó sử dụng', 'gây thất vọng', 'không ổn định', 'quá tệ',
    'không như mong đợi', 'chẳng ra gì', 'không phù hợp', 'không thích', 'không muốn ', 'tồi'
  ];
  

  const categorizeReview = (reviewText: string) => {
    const lowerCaseReview = reviewText.toLowerCase(); // Chuyển về chữ thường
    const containsGoodWords = goodWords.some(word => lowerCaseReview.includes(word));
    const containsBadWords = badWords.some(word => lowerCaseReview.includes(word));
  
    if (containsBadWords) {
      return "Sản phẩm bị chê";
    } else if (containsGoodWords) {
      return "Sản phẩm được khen";
    } else {
      return "Sản phẩm chưa thể đánh giá";
    }
  };
  const reviewSummary = useMemo(() => {
    const totalReviews = data.length; // Tổng số đánh giá
    const goodCount = data.filter((item) => categorizeReview(item.content) === 'Sản phẩm được khen').length;
    const badCount = data.filter((item) => categorizeReview(item.content) === 'Sản phẩm bị chê').length;
    const neutralCount = data.filter((item) => categorizeReview(item.content) === 'Sản phẩm chưa thể đánh giá').length;
  
    return {
      goodCount, // Số sản phẩm được khen
      badCount, // Số sản phẩm bị chê
      neutralCount, // Số sản phẩm chưa thể đánh giá
      totalReviews, // Tổng số đánh giá
      goodPercentage: totalReviews ? ((goodCount / totalReviews) * 100).toFixed(1) : 0,
      badPercentage: totalReviews ? ((badCount / totalReviews) * 100).toFixed(1) : 0,
      neutralPercentage: totalReviews ? ((neutralCount / totalReviews) * 100).toFixed(1) : 0,
    };
  }, [data]);

  const formatDateForDatetimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
    const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
    const hours = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`;
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const columns = useMemo<Array<MRT_ColumnDef<categoryproduct>>>(() => [
    {
      accessorKey: 'ProductID',
      header: 'Tên sản phẩm',
      size: 120,
    },
    {
      accessorKey: 'content',
      header: 'Nội dung đánh giá',
      size: 120,
    },
    {
      accessorKey: 'number_star',
      header: 'Sao đánh giá',
      size: 120,
      Cell: ({ row }) => <StarRating rating={row.original.number_star} />,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 120,
    },
    {
      accessorKey: 'createdAt',
      header: 'Thời gian đánh giá',
      Cell: ({ cell }) => formatDateForDatetimeLocal(cell.getValue<string>()),
      size: 120,
    },
    {
      accessorKey: 'category',
      header: 'Loại đánh giá',
      size: 140,
      Cell: ({ row }) => categorizeReview(row.original.content),
    },
  ], []);

  const filteredData = useMemo(() => {
    if (!filter) return data;
    return data.filter((item) => categorizeReview(item.content) === filter);
  }, [data, filter]);

  const dataWithFormattedDates = useMemo(() => {
    return filteredData.map((item) => ({
      ...item,
      formattedCreatedAt: formatDateForDatetimeLocal(item.createdAt),
    }));
  }, [filteredData]);

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
        'mrt-row-actions': false, // This hides the default action column completely
      },
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
        fontWeight: 'bold',
      },
      align: 'center',
    },
    muiTableBodyCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
      },
      align: 'center',
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
        grow: false,
      },
    },
    enableRowNumbers: false,
    layoutMode: 'grid',
  });

  return (
  <div>
    <div className="py-10 px-5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Phân tích bình luận sản phẩm từ khách hàng</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-4 p-2 border border-gray-300"
          >
            <option value="">Tất cả</option>
            <option value="Sản phẩm được khen">Sản phẩm được khen</option>
            <option value="Sản phẩm bị chê">Sản phẩm bị chê</option>
            <option value="Sản phẩm chưa thể đánh giá">Sản phẩm chưa thể đánh giá</option>
          </select>
        </div>

        {/* Right Column */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Tỉ lệ đánh giá sản phẩm</h1>
          {/* Progress Bars */}
          <div className="w-full h-6 bg-gray-200 rounded-lg overflow-hidden mt-4 relative">
            <div className="absolute inset-0 flex items-center justify-between px-2 z-10">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-400">Sản phẩm được khen</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-400">
                {reviewSummary.goodCount}/{reviewSummary.totalReviews} ({reviewSummary.goodPercentage}%)
              </span>
            </div>
            <div
              className="absolute inset-0 bg-yellow-300 rounded"
              style={{ width: `${reviewSummary.goodPercentage}%` }}
            ></div>
          </div>

          <div className="w-full h-6 bg-gray-200 rounded-lg overflow-hidden mt-4 relative">
            <div className="absolute inset-0 flex items-center justify-between px-2 z-10">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-400">Sản phẩm bị chê</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-400">
                {reviewSummary.badCount}/{reviewSummary.totalReviews} ({reviewSummary.badPercentage}%)
              </span>
            </div>
            <div
              className="absolute inset-0 bg-yellow-300 rounded"
              style={{ width: `${reviewSummary.badPercentage}%` }}
            ></div>
          </div>

          <div className="w-full h-6 bg-gray-200 rounded-lg overflow-hidden mt-4 relative">
            <div className="absolute inset-0 flex items-center justify-between px-2 z-10">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-400">Sản phẩm chưa thể đánh giá</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-400">
                {reviewSummary.neutralCount}/{reviewSummary.totalReviews} ({reviewSummary.neutralPercentage}%)
              </span>
            </div>
            <div
              className="absolute inset-0 bg-yellow-300 rounded"
              style={{ width: `${reviewSummary.neutralPercentage}%` }}
            ></div>
          </div>
        </div>

      </div>
      <hr className="my-4" />
      <div className="overflow-x-auto">
        <MaterialReactTable table={table} />
      </div>
    </div>

  </div>
  );
};

export default Categoryproduct;
