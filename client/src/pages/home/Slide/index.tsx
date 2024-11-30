import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styled from '@emotion/styled';
import icon2 from '../../../assets/images/homePage/1.jpg';
import icon3 from '../../../assets/images/homePage/2.jpg';
import icon4 from '../../../assets/images/homePage/3.jpg';
import icon5 from '../../../assets/images/homePage/4.jpg';

const StyledSlider = styled(Slider)`
  .slick-dots li {
    margin: 0 10px;
    transition: margin 0.3s ease;

    @media (max-width: 600px) {
      margin: 0 5px;
    }
  }

  .slick-dots li button:before {
    font-size: 20px; 
    color: #ff5364; 
    border-radius: 50%; 
    transition: all 0.3s ease;
  }

  .slick-dots li button:hover:before,
  .slick-dots li.slick-active button:before {
    transform: scaleX(2.0);
  }

  .slick-dots li:hover {
    margin: 0 20px;

    @media (max-width: 600px) {
      margin: 0 10px;
    }
  }
  
  @media (max-width: 768px) {
    .slick-prev:before, 
    .slick-next:before {
      color: gray;
      font-size: 30px;  
    }
    .slick-prev {
      left: -30px;
    }
    .slick-next {
      right: -30px;
    }
  }
`;

function UnevenSetsInfinite() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    slidesToShow: 1,
    autoplay: true,          // Enable autoplay
    autoplaySpeed: 4000,    // cài đặt 4s là chuyển 1 anh
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        }
      }
    ]
  };

  return (
    <div className="w-full h-96">
      <StyledSlider {...settings} arrows={true} className='w-full'>
        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
            <div className='flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border border-gray-300 hover:bg-cyan-950 transition-colors duration-500 hover:text-white'>
              <img src={icon2} className='w-full h-full' />
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
            <div className='flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border border-gray-300 hover:bg-cyan-950 transition-colors duration-500 hover:text-white'>
              <img src={icon3} className='w-full h-full' />
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
            <div className='flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border border-gray-300 hover:bg-cyan-950 transition-colors duration-500 hover:text-white'>
              <img src={icon4} className='w-full h-full' />
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
            <div className='flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border border-gray-300 hover:bg-cyan-950 transition-colors duration-500 hover:text-white'>
              <img src={icon5} className='w-full h-full' />
            </div>
          </div>
        </div>
      </StyledSlider>
    </div>
  );
}

export default UnevenSetsInfinite;
