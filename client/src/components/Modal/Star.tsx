import React from 'react';
import { FaStar } from 'react-icons/fa'; // Import icon ngôi sao từ react-icons

interface StarProps {
  filled: boolean;
  onClick: () => void;
}

const Star = ({ filled, onClick }: StarProps) => (
  <FaStar
    onClick={onClick}
    color={filled ? "#FFD700" : "#E0E0E0"} // Màu vàng khi đã chọn, xám khi chưa chọn
    style={{ cursor: 'pointer', fontSize: '24px' }}
  />
);

export default Star;
