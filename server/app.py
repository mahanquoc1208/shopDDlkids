from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os

# Tải các biến từ file .env
load_dotenv()

# Sử dụng các biến từ file .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PORT = int(os.getenv("PORT", 8000))  # Cổng mặc định là 8000 nếu không tìm thấy trong .env

# Gán API key cho OpenAI
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY chưa được cấu hình trong file .env")
openai.api_key = OPENAI_API_KEY

# Khởi tạo Flask app
app = Flask(__name__)

# Thêm cấu hình CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

def nhanxet(content):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": """Bạn là chuyên gia đánh giá thái độ khách hàng thông qua phân tích các nhận xét sản phẩm. Bạn sẽ phân loại dựa trên các tiêu chí sau:
                    - Hài lòng: Nhận xét tích cực, khen ngợi về chất lượng/trải nghiệm
                    - Không hài lòng: Nhận xét tiêu cực, chê bai, phàn nàn 
                    - Trung lập: Nhận xét không thể hiện rõ thái độ
                    - Hỗn hợp: Vừa khen vừa chê trong cùng nhận xét
                    - Mỉa mai: Nhận xét châm biếm, sarcasm
                    - Gợi ý: Đưa ra đề xuất cải thiện
                    - Không xác định: Nhận xét không thể phân loại"""
                },
                {
                    "role": "user",
                    "content": f"Phân tích và phân loại mức độ hài lòng dựa trên nhận xét sau: '{content}'. Chỉ đưa ra kết quả phân loại, không giải thích."
                }
            ],
            max_tokens=60,
            temperature=0.7
        )
        return response['choices'][0]['message']['content'].strip()
    except openai.error.RateLimitError:
        return "Lỗi: Bạn đã vượt quá hạn mức sử dụng API. Vui lòng kiểm tra gói dịch vụ của bạn hoặc nâng cấp tài khoản."
    except openai.error.AuthenticationError:
        return "Lỗi xác thực API. Vui lòng kiểm tra API key."
    except openai.error.OpenAIError as e:
        return f"Lỗi OpenAI: {str(e)}"
    except Exception as e:
        return f"Lỗi không xác định: {str(e)}"

@app.route('/api/nanxet', methods=['POST'])
def handle_feedback():
    """
    API endpoint để xử lý nhận xét của người dùng.
    """
    data = request.get_json()
    contents = data.get('contents', [])  # Lấy danh sách nhận xét từ yêu cầu

    if not contents or not isinstance(contents, list):
        return jsonify({"error": "Invalid input", "message": "Please provide a list of feedback contents"}), 400

    results = []
    for content in contents:
        feedback = nhanxet(content)
        results.append({"content": content, "feedback": feedback})
    
    return jsonify({"results": results}), 200


if __name__ == '__main__':
    # Chạy ứng dụng Flask
    app.run(host="127.0.0.1", port=PORT, debug=True)
