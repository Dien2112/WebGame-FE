# WebGame Frontend - React + Vite

**Danh sách thành viên**

- Bùi Việt Bình (22120030)
- Lương Thị Kim Chi (22120034)
- Nguyễn Đăng Điền (22120062)
- Đoàn Gia Huệ (22120116)

## Quick Start

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Environment
Tạo file `.env`:
Sử dụng Backend local (đã chạy):
```
VITE_API_URL=http://localhost:3000
```

hoặc dùng Backend đã deploy online
```
VITE_API_URL=https://webgame-be.vercel.app
```

### 3. Khởi động Dev Server
```bash
npm start
```

Ứng dụng sẽ mở tại: **http://localhost:5173**

### 4. Build cho Production
```bash
npm run build
```
## Tài khoản
### Tài khoản Admin
- admin@gmail.com
123456
### Tài khoản User
- alex@gmail.com
123456

## Thông tin ứng dụng

- **Framework**: React 18+ với Vite
- **Styling**: CSS + Tailwind CSS
- **UI Components**: Shadcn/ui + Lucide Icons
- **State Management**: Context API + Local Storage
- **HTTP Client**: Fetch API

## Các tính năng

- Giao diện console retro
- 7 trò chơi: Caro 5, Caro 4, Tic Tac Toe, Snake, Line, Memory, Paint
- Hệ thống xác thực người dùng
- Bình luận và đánh giá game
- Quản lý bạn bè
- Tin nhắn trực tiếp
- Bảng xếp hạng
- Hệ thống thành tích
- Quản lý người chơi
- Xem thống kê
- Cài đặt game

## Cấu trúc thư mục

```
src/
├── components/          # React components
│   ├── games/          # Game UI components
│   └── ui/             # UI components (buttons, inputs, etc)
├── pages/              # Page components
├── game-logic/         # Game logic implementations
│   ├── model/          # Base game classes
│   └── utils/          # Game utilities & constants
├── context/            # React context (Auth, GameConfig)
├── lib/                # Utility functions & API client
├── App.jsx             # Main app component
└── index.css           # Global styles
```
