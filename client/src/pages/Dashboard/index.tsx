import React, { useEffect, useState } from 'react';
import { getlistDashboardfull } from '../../api/post/post.api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, ArcElement, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>({});
  const [timePeriod, setTimePeriod] = useState<string>('today');
  const [customerData, setCustomerData] = useState<any>({});
  const [products, setProducts] = useState<any>([]);
  const [pieData, setPieData] = useState<any>({});
  const [statusOrderData, setStatusOrderData] = useState<any>({});
  const [successfulOrders, setSuccessfulOrders] = useState<number>(0); // New state for successfulOrders

  const orderStatuses = {
    'Thành công': '#33CC33',
    'Thất bại': '#FF3300',
    'Bạn đã hủy đơn hàng': '#FF3366',
    'Đánh giá thành công': '#FFFF66',
  };

  const fetchDashboardData = async () => {
    const today = new Date();
    const day = today.toISOString().split('T')[0];
    const month = (today.getMonth() + 1).toString();
    const year = today.getFullYear().toString();
  
    let response;
    if (timePeriod === 'today') {
      response = await getlistDashboardfull(day);
    } else if (timePeriod === 'month') {
      response = await getlistDashboardfull(undefined, month, year);
    } else if (timePeriod === 'year') {
      response = await getlistDashboardfull(undefined, undefined, year);
    }
  
    if (response && response.data) {
      setDashboardData(response.data);
      console.log('checkkkkkkkkkkkkkkkkk', response.data)
  
      // Calculate successful orders based on statuses "Thành công" and "Đánh giá thành công"
      const successfulOrdersCount = response.data.orders.filter(
        (order) => order.order_status === "Thành công" || order.order_status === "Đánh giá thành công"
      ).length;
      setSuccessfulOrders(successfulOrdersCount); // Update the successfulOrders state
  
      // Set customer data based on time period
      if (timePeriod === 'today') {
        setCustomerData({
          labels: ['Hôm nay'],
          datasets: [
            {
              label: 'Số lượng khách hàng',
              data: [response.data.customers.length],
              backgroundColor: '#33CCFF',
            },
          ],
        });
      } else if (timePeriod === 'month') {
        const dailyCustomerData = Array(31).fill(0);
        response.data.customers.forEach((customer) => {
          const customerDay = new Date(customer.createdAt).getDate() - 1;
          dailyCustomerData[customerDay]++;
        });
        setCustomerData({
          labels: Array.from({ length: 31 }, (_, i) => `Ngày ${i + 1}`),
          datasets: [
            {
              label: 'Số lượng khách hàng',
              data: dailyCustomerData,
              backgroundColor: '#4caf50',
            },
          ],
        });
      } else if (timePeriod === 'year') {
        const monthlyCustomerData = Array(12).fill(0);
        response.data.customers.forEach((customer) => {
          const customerMonth = new Date(customer.createdAt).getMonth();
          monthlyCustomerData[customerMonth]++;
        });
        setCustomerData({
          labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
          datasets: [
            {
              label: 'Số lượng khách hàng',
              data: monthlyCustomerData,
              backgroundColor: '#4caf50',
            },
          ],
        });
      }
  
      // Set order status data
      const statusLabels =
        timePeriod === 'today'
          ? ['Hôm nay']
          : timePeriod === 'month'
          ? Array.from({ length: 31 }, (_, i) => `Ngày ${i + 1}`)
          : Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  
      const statusDatasets = Object.keys(orderStatuses).map((status) => ({
        label: status,
        backgroundColor: orderStatuses[status],
        data:
          timePeriod === 'today'
            ? [response.data.orders.filter((order) => order.order_status === status).length]
            : statusLabels.map((_, i) => {
                const dateFilter =
                  timePeriod === 'month'
                    ? (order) => new Date(order.createdAt).getDate() === i + 1
                    : (order) => new Date(order.createdAt).getMonth() === i;
                return response.data.orders.filter(
                  (order) => dateFilter(order) && order.order_status === status
                ).length;
              }),
      }));
  
      setStatusOrderData({ labels: statusLabels, datasets: statusDatasets });
  
      // Product sales data
      const productSales = {};
      response.data.orderDetails.forEach((order) => {
        const productId = order.ProductID;
        productSales[productId] = (productSales[productId] || 0) + order.quantity;
      });
      const productList = Object.entries(productSales).map(([productId, totalQuantity]) => ({
        productName: `Sản phẩm ${productId}`,
        totalQuantity,
      }));
      setProducts(productList);
  
      // Pie chart for order statuses
      const pieChartData = {
        labels: Object.keys(orderStatuses),
        datasets: [
          {
            data: Object.keys(orderStatuses).map((status) =>
              response.data.orders.filter((order) => order.order_status === status).length
            ),
            backgroundColor: Object.values(orderStatuses),
          },
        ],
      };
      setPieData(pieChartData);
    }
  };
  const reviews = dashboardData.reviews && dashboardData.reviews[0];
  const averageStar = reviews ? reviews.average_star : '0.0';
  const reviewCount = reviews ? reviews.review_count : '0';
  const getDashboardTitle = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
  
    if (timePeriod === 'today') {
      return `Thống kê số liệu cửa hàng DDKIDS ngày ${day} tháng ${month} năm ${year}`;
    } else if (timePeriod === 'month') {
      return `Thống kê số liệu cửa hàng DDKIDS Tháng ${month}`;
    } else if (timePeriod === 'year') {
      return `Thống kê số liệu cửa hàng DDKIDS Năm ${year}`;
    }
  };
  

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimePeriod(event.target.value);
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const total = tooltipItem.dataset.data.reduce((acc: number, value: number) => acc + value, 0);
            const value = tooltipItem.raw;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          },
        },
      },
      legend: {
        position: 'bottom', // Add the legend with the position set to 'bottom'
      },
    },
  };
  const pieChartOptions1 = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom', // Add the legend with the position set to 'bottom'
      },
    },
  };
  
  const downloadPDF = () => {
    const originalContent = document.getElementById('dashboard-content');
    const pdfContent = originalContent.cloneNode(true);

    // Adjust layout for better PDF display
    pdfContent.style.display = "flex";
    pdfContent.style.flexDirection = "column";

    // Remove max-height to prevent content cut-off in PDF
    const tableContainer = pdfContent.querySelector('[class*="max-h-[400px]"]');
    if (tableContainer) {
        tableContainer.classList.remove('max-h-[400px]');
    }

    // Add a title at the top of the PDF content
    const title = document.createElement('h1');
    // title.textContent = 'Thống kê số liệu của cửa hàng';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    pdfContent.insertBefore(title, pdfContent.firstChild);

    const grids3 = pdfContent.querySelectorAll('.grid-cols-1');
    grids3.forEach(grid => {
      grid.style.display = "flex";
      grid.style.flexDirection = "column";
      grid.style.alignItems = "center";
    });

    const grids2 = pdfContent.querySelectorAll('.grid-cols-2');
    grids2.forEach(grid => {
      grid.style.display = "flex";
      grid.style.flexDirection = "column";
      grid.style.alignItems = "center";
    });

    const originalCharts = originalContent.querySelectorAll('canvas');
    const clonedCharts = pdfContent.querySelectorAll('canvas');
    originalCharts.forEach((chart, index) => {
      if (clonedCharts[index]) {
        const img = document.createElement('img');
        img.src = chart.toDataURL('image/png');
        img.style.width = '80%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';

        const imgContainer = document.createElement('div');
        imgContainer.style.display = 'flex';
        imgContainer.style.justifyContent = 'center';
        imgContainer.style.alignItems = 'center';
        imgContainer.style.margin = '10px 10px';

        imgContainer.appendChild(img);
        clonedCharts[index].replaceWith(imgContainer);

        if (index === originalCharts.length - 1) {
          const pageBreakDiv = document.createElement('div');
          pageBreakDiv.style.height = '1px';
          pageBreakDiv.style.pageBreakBefore = 'always';
          pdfContent.appendChild(pageBreakDiv);
        }
      }
    });

    // Delay to ensure images are rendered before generating the PDF
    setTimeout(() => {
      const options = {
        margin: [10, 25, 25, 10],
        filename: 'dashboard.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().from(pdfContent).set(options).save();
    }, 500);
};
const getChartTitle = (chartName: string) => {
  if (timePeriod === 'today') {
    return `${chartName} Hôm nay`;
  } else if (timePeriod === 'month') {
    return `${chartName} Tháng ${new Date().getMonth() + 1}`;
  } else if (timePeriod === 'year') {
    return `${chartName} Năm ${new Date().getFullYear()}`;
  }
};
return (
    
<div className="bg-gray-100 font-sans leading-normal tracking-normal">
  {/* Section 1: Filter & Download */}
  <div className="mb-4">
    <select onChange={handlePeriodChange} className="mb-4">
      <option value="today">Hôm nay</option>
      <option value="month">Tháng</option>
      <option value="year">Năm</option>
    </select>
    <button
      onClick={downloadPDF}
      className="bg-blue-500 text-white p-2 rounded mb-4"
    >
      Tải xuống PDF
    </button>
  </div>

 {/* Section 2: Dashboard Content */}
<div className="dashboard-content-wrapper" id="dashboard-content">
  <div className="container mx-auto p-4">
    <h1 className="text-center text-2xl font-bold mb-4">{getDashboardTitle()}</h1>
  </div>

  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 mr-2 ml-2">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded shadow">
        <h2 className="text-gray-600">
          {`Doanh số ${getChartTitle("")} Ngàn VND`}
        </h2>
        <p className="text-4xl font-bold">{dashboardData.totalAmount}</p>
      </div>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded shadow">
        <h2 className="text-gray-600">Đánh giá shop</h2>
        <p className="text-3xl font-bold">
          {`${averageStar} sao (${reviewCount} đánh giá)`}
        </p>
      </div>

      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded shadow">
        <h2 className="text-gray-600">{getChartTitle("Số lượng đơn hàng đã đặt trong")}</h2>
        <p className="text-4xl font-bold">{dashboardData.totalOrders}</p>
      </div>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded shadow">
        <h2 className="text-gray-600">{getChartTitle("Số lượng đơn hàng thành công trong")}</h2>
        <p className="text-4xl font-bold">{successfulOrders}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Biểu đồ thể hiện Tỉ lệ đơn hàng */}
      <div className="bg-white p-4 rounded shadow">
        <div style={{ height: '350px', width: '100%' }}>
          {pieData && pieData.datasets ? (
            <Pie data={pieData} options={pieChartOptions} />
          ) : (
            <p>Loading...</p>
          )}
          <h2 className="text-center mt-4 text-sm md:text-base whitespace-nowrap overflow-auto">
            {getChartTitle("Biểu đồ thể hiện Tỉ lệ đơn hàng")}
          </h2>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div style={{ height: '350px', width: '100%' }}>
          {statusOrderData && statusOrderData.datasets ? (
            <Bar data={statusOrderData} options={pieChartOptions1} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <h2 className="text-center mt-4 text-sm md:text-base whitespace-nowrap overflow-auto">
          {getChartTitle("Biểu đồ thể hiện số lượng đơn hàng")}
        </h2>
      </div>
    </div>


    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">
        <div style={{ height: '350px', width: '100%' }}>
          {customerData && customerData.datasets ? (
            <Bar data={customerData} options={pieChartOptions1} />
          ) : (
            <p>Loading...</p>
          )}
          <h2 className="text-center mt-4">{getChartTitle("Biểu đồ thể hiện số lượng khách hàng đã đăng kí trong")}</h2>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow overflow-auto max-h-[400px]">
        <br />
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Tên Sản Phẩm</th>
              <th className="py-2 px-4 border-b">Số Lượng</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any, index: number) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{product.productName}</td>
                <td className="py-2 px-4 border-b">{product.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="text-center mt-4">{getChartTitle("Biểu đồ thể hiện sản phẩm đã bán")}</h2>
      </div>
    </div>

  </div>
</div>

</div>

  );
};

export default Dashboard;
