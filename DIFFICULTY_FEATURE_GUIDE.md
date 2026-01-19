# Hướng Dẫn: Tính Năng Chọn Độ Khó Cho Game Caro

## Tổng Quan

Bạn đã thêm tính năng chọn độ khó (Easy, Medium, Hard) cho game Caro 4 và Caro 5. Quy trình của người dùng bây giờ:

```
MENU → Chọn Game Caro → DIFFICULTY_SELECT → PLAYING
```

## File Được Tạo / Sửa

### 1. **DifficultySelectLogic.js** (TẠO MỚI)

**Vị trí:** `src/game-logic/DifficultySelectLogic.js`

Quản lý UI và logic cho màn hình chọn độ khó:

- Hiển thị 3 lựa chọn: EASY, MEDIUM, HARD
- Cho phép điều hướng LEFT/RIGHT để chọn
- Nhấn ENTER để xác nhận và bắt đầu game
- Nhấn BACK để quay lại

**Độ khó hiện tại:** Tất cả đều gọi `getRandomMove()`. Sau này bạn có thể tùy chỉnh từng độ khó.

---

### 2. **BaseCaroLogic.js** (SỬA)

**Thêm tham số:**

```javascript
constructor(
  winLength,
  labelChar,
  gameName,
  setMatrix,
  setScore,
  setStatus,
  onExit,
  (difficulty = "EASY"),
);
```

- Nhận `difficulty` parameter
- Lưu vào `this.difficulty` để dùng khi cải tiến AI

---

### 3. **Caro5Logic.js & Caro4Logic.js** (SỬA)

**Thêm tham số:**

```javascript
constructor(setMatrix, setScore, setStatus, onExit, (difficulty = "EASY"));
```

Truyền `difficulty` cho BaseCaroLogic parent class.

---

### 4. **ScenarioSelectLogic.js** (SỬA)

**Thêm import:**

```javascript
import DifficultySelectLogic from "./DifficultySelectLogic";
```

**Sửa `createGameLogic` factory:**

```javascript
export const createGameLogic =
  (id,
  setMatrix,
  setScore,
  setStatus,
  onExit,
  (savedState = null),
  (difficulty = "EASY"));
```

Giờ có thể truyền `difficulty` parameter khi tạo game logic.

---

### 5. **RetroConsole.jsx** (SỬA)

**Thêm state mới:**

```javascript
const [currentGameItem, setCurrentGameItem] = useState(null);
const [selectedDifficulty, setSelectedDifficulty] = useState("EASY");
```

**Thêm import:**

```javascript
import DifficultySelectLogic from "@/game-logic/DifficultySelectLogic";
```

**Sửa `handleMenuSelection`:**

- Kiểm tra nếu game là CARO_4 hoặc CARO_5
- Nếu có, chuyển sang DIFFICULTY_SELECT state
- Nếu không, chuyển sang SCENARIO_SELECT như bình thường

**Sửa `startGame`:**

```javascript
const startGame = (item, gameId, (difficulty = "EASY"));
```

- Nhận `difficulty` parameter
- Truyền đến `createGameLogic`

**Thêm `initializeScenarioSelect` function:**
Tách logic ScenarioSelect thành function riêng để có thể tái sử dụng.

---

## Cách Mở Rộng Tính Năng

### Cải tiến AI theo độ khó

**Bước 1:** Sửa `BaseCaroLogic.onTick()`:

```javascript
if (!this.state.winner && currentRole === "COMPUTER" && !this.computerMoved) {
  // ...
  if (now >= this.computerThinkUntil && !this.computerMoved) {
    let move;

    if (this.difficulty === "EASY") {
      move = getRandomMove(this.state.board);
    } else if (this.difficulty === "MEDIUM") {
      move = this.getMediumMove(this.state.board);
    } else if (this.difficulty === "HARD") {
      move = this.getHardMove(this.state.board);
    }

    // ... tiếp tục
  }
}
```

**Bước 2:** Tạo các hàm AI:

```javascript
getMediumMove(board) {
    // Logic tìm nước đi trung bình (e.g., chặn player)
}

getHardMove(board) {
    // Logic AI mạnh (e.g., minimax algorithm)
}
```

---

## Flow Hiện Tại

1. **Menu** → User chọn CARO_5 hoặc CARO_4
2. **Difficulty Select** → User chọn Easy/Medium/Hard
3. **Game** → Game chơi với `getRandomMove` (sẽ cập nhật sau)

---

## Ghi Chú

- Tất cả 3 độ khó hiện tại đều sử dụng `getRandomMove`
- Delay suy nghĩ máy tính (1-3 giây) giống nhau cho tất cả độ khó
- Bạn có thể tùy chỉnh delay và strategy riêng cho từng độ khó

---

## Test

Chạy game và thử:

1. Chọn CARO_5 hoặc CARO_4 từ menu
2. Bạn sẽ thấy màn hình Difficulty Select
3. Điều hướng với LEFT/RIGHT
4. Nhấn ENTER để chơi
5. Máy tính sẽ đi ngẫu nhiên
