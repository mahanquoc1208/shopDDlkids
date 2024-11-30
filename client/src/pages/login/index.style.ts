import styled from 'styled-components';

const Styled = {
  PageContainer: styled.div`
    width: 100%;
    height: 100vh;
    background-color: #73bfff5e; /* Nền xanh div lớn */
    display: flex;
    flex-direction: column; /* Để căn chỉnh các phần tử theo chiều dọc */
  `,
  

  LoginContainer: styled.div` /* div login */
    width: 50%;
    margin: auto;
    padding: 50px 0;
    margin-top: 140px; /* Cách header */
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative; /* Đặt relative để chứa các phần tử con */
  `,
  FormContainer: styled.form`
    display: flex;  
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `,
  SignUpText: styled.button<{ isSignUpMode: boolean }>` 
    position: absolute;
    right: 250px;
    bottom: 23px;
    background: none;
    border: none;
    color: ${({ isSignUpMode }) => isSignUpMode ? '#21409a' : '#21409a'}; /* Light blue */
    font-size: 16px;
    cursor: pointer;
    text-decoration: none; /* Remove underline */
    
    &:hover {
        color: ${({ isSignUpMode }) => isSignUpMode ? '#00baf2' : '#00baf2'}; /* Dark blue on hover */
    }
`,

  BackText: styled.button` //Chữ Login khi có button Sign up
    position: absolute;
    right: 260px;
    bottom: 55px;
    background: none;
    border: none;
    color:  #21409a;
    font-size: 16px;
    cursor: pointer;
    text-decoration: none; /* Remove underline */

    &:hover {
        color: #00baf2; /* Dark blue on hover */
    }
`,

  Title: styled.div`
    text-align: center;
    font-weight: bold;
    font-size: 36px;
    margin-bottom: 24px;
  `,
  LoginButton: styled.button`
    width: 222.45px;
    height: 40px;
    margin: 10px;
    cursor: pointer;
    background-color: #00baf2; /* Blue */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #21409a;
    }
  `,
  Errors: styled.div`
    color: red;
  `
}

export default Styled;
