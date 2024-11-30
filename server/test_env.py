from dotenv import load_dotenv
import os

# Tải các biến từ file .env
load_dotenv()

# Kiểm tra giá trị của OPENAI_API_KEY
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key is None:
    raise ValueError("OPENAI_API_KEY chưa được cấu hình trong file .env")
else:
    print(f"OPENAI_API_KEY: {openai_api_key}")
