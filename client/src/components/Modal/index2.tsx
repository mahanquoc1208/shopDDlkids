import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Styled from './index.style';
import Close from '@mui/icons-material/Close';
import Star from './Star'; // Import component ngôi sao

interface Props {
  isOpen: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  onOk?: (rating: number) => void; // Nhận giá trị rating khi nhấn OK
  onCancel?: () => void;
  cancelText?: string;
  okText?: string;
  children?: React.ReactNode;
  imageUrl?: string;
}


const ModalComponent = ({
  isOpen,
  title,
  description,
  onClose,
  onOk,
  onCancel,
  cancelText = 'Cancel',
  okText = 'OK',
  children,
  imageUrl
}: Props) => {
  const [rating, setRating] = useState(0);

  const handleStarClick = (index: number) => {
    setRating(index + 1); // Cập nhật đánh giá dựa trên ngôi sao được chọn
  };

  return (
    <Modal open={isOpen}>
      <Styled.ModalContainer>
        <Styled.ModalChildren>
          <Styled.CloseButton onClick={onClose}>
            <Close />
          </Styled.CloseButton>
          <Styled.ModalTitle>{title}</Styled.ModalTitle>
          {(imageUrl != null) &&
            <div className="flex items-center justify-center">
              <img className="w-24 h-24 object-cover" src={imageUrl} alt={title} />
            </div>
          }
          <Styled.ModalDescription>{description}</Styled.ModalDescription>
          
          {/* Hiển thị các ngôi sao đánh giá */}
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                filled={index < rating} // Tô màu vàng cho các ngôi sao được chọn
                onClick={() => handleStarClick(index)}
              />
            ))}
          </div>

          <Styled.ModalDescription>{children}</Styled.ModalDescription>
          <div>
            <Styled.OKButton onClick={() => onOk && onOk(rating)}>{okText}</Styled.OKButton>
          </div>
          <div>
            <Styled.CancelButton onClick={onCancel}>
              {cancelText}
            </Styled.CancelButton>
          </div>
        </Styled.ModalChildren>
      </Styled.ModalContainer>
    </Modal>
  );
};

export default ModalComponent;
