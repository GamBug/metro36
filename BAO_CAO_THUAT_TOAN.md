# Báo cáo Thuật toán Tìm đường Metro36

Tài liệu này trình bày chi tiết về kiến trúc thuật toán tìm đường (routing) được thiết kế và triển khai trong dự án mô phỏng mạng lưới tàu điện ngầm Metro36.

---

## 1. Phương pháp Tiếp cận (Methodology)

Hệ thống sử dụng thuật toán **A\* Search (A-Star)** để tìm đường đi tối ưu giữa hai ga bất kỳ. 

### Lý do lựa chọn:
* **Dijkstra** đảm bảo tính chính xác cho đồ thị có trọng số nhưng duyệt qua quá nhiều đỉnh không cần thiết.
* **BFS** chỉ tìm được đường đi ít chặng nhất (đồ thị không trọng số) chứ không thể tối ưu hóa các yếu tố thời gian thực tế như tốc độ di chuyển, thời gian dừng ga, và phạt chuyển tuyến.
* **A\*** kết hợp ưu điểm của cả hai: sử dụng hàm **Heuristic** để định hướng tìm kiếm giúp đẩy nhanh tốc độ hội tụ, đồng thời giữ lại cơ chế tính tổng chi phí tích lũy (gScore) của Dijkstra để đảm bảo tính tối ưu tuyệt đối.

---

## 2. Mô hình Đồ thị (Graph Representation)

Đồ thị đường sắt đô thị được biểu diễn dưới dạng danh sách kề (**Adjacency List**):
* **Đỉnh (Nodes):** Chỉ các ô lưới được xác định là Ga tàu (`cell.hasStation && cell.stationName`). Các ô ray thông thường không đóng vai trò là đỉnh độc lập trong đồ thị tìm đường mà chỉ được dùng để tính toán khoảng cách giữa các ga.
* **Cạnh (Edges):** Liên kết trực tiếp giữa các ga kề nhau. Có hai loại cạnh chính:
  1. **Cạnh chạy tàu (Track Edges):** Được tạo tự động dựa trên các đường ray kết nối liên tục cùng màu tuyến (color) giữa hai ga.
  2. **Cạnh chuyển tuyến đi bộ (Transfer Edges):** Được tạo thủ công bởi người dùng (thông qua phím tắt `T` để nối hai ga bất kỳ), biểu diễn việc hành khách đi bộ chuyển ga.

---

## 3. Thiết lập Trọng số & Chi phí (Weight & Cost Formulation)

Để phản ánh chính xác hành vi của hành khách trong thực tế, trọng số cạnh không dùng đơn vị khoảng cách (km) hay số ô lưới thông thường, mà quy đổi hoàn toàn về **thời gian di chuyển (giờ)**.

### Các tham số cơ sở:
* **Kích thước một ô lưới (`CELL_KM`):** $0.25\text{ km}$.
* **Vận tốc tàu chạy (`V_TRAIN`):** $35\text{ km/h}$.
* **Vận tốc đi bộ (`V_WALK`):** $4.5\text{ km/h}$.
* **Thời gian dừng ga trung gian (`T_DWELL`):** $0.5\text{ phút}$ ($0.5 / 60\text{ giờ}$ hoặc $30\text{ giây}$).
* **Thời gian phạt đổi tuyến (`T_TRANSFER`):** $3.0\text{ phút}$ ($3.0 / 60\text{ giờ}$).

### Công thức tính chi phí cạnh $W(u, v)$ từ ga $u$ sang ga $v$:

#### A. Đối với cạnh chuyển tuyến đi bộ (`viaTransfer = true`):
Chi phí được tính bằng thời gian đi bộ giữa hai ga dựa trên khoảng cách hình học thực tế trên lưới:
$$W(u, v) = \frac{\text{gridDist}(u, v) \times \text{CELL\_KM}}{\text{V\_WALK}} \text{ (giờ)}$$

#### B. Đối với cạnh chạy tàu thường (`viaTransfer = false`):
Chi phí bao gồm thời gian tàu chạy giữa hai ga, thời gian dừng tại ga đến để đón trả khách, và thời gian chờ đổi tuyến (nếu có):
$$W(u, v) = \left( \frac{\text{gridDist}(u, v) \times \text{CELL\_KM}}{\text{V\_TRAIN}} \right) + \text{T\_DWELL} + \text{T\_PENALTY} \text{ (giờ)}$$

Trong đó, phí phạt chuyển tuyến $\text{T\_PENALTY}$ được áp dụng nếu hành khách đổi sang một tuyến tàu khác màu so với chặng ngay trước đó tại ga $u$:
$$\text{T\_PENALTY} = \begin{cases} 3.0 / 60 \text{ (giờ)} & \text{nếu } \text{color}(u, v) \neq \text{prev\_color} \\ 0 & \text{nếu trùng tuyến} \end{cases}$$

---

## 4. Hàm Heuristic (Ước lượng Lạc quan)

Hàm Heuristic $H(n)$ ước lượng khoảng thời gian tối thiểu (giờ) cần thiết để đi từ ga hiện tại $n$ đến ga đích.

### Khoảng cách hình học Octile:
Vì lưới cho phép di chuyển theo 8 hướng (ngang, dọc và chéo 45 độ), khoảng cách hình học chính xác nhất trên lưới tọa độ là **Octile Distance**:
$$dx = |x_n - x_{\text{target}}|$$
$$dy = |y_n - y_{\text{target}}|$$
$$\text{gridDist} = |dx - dy| + \sqrt{2} \times \min(dx, dy)$$

### Công thức Heuristic:
$$H(n) = \frac{\text{gridDist} \times \text{CELL\_KM}}{\text{V\_TRAIN}} \text{ (giờ)}$$

### Tính chất của Heuristic:
1. **Admissible (Chấp nhận được):** $H(n)$ luôn nhỏ hơn hoặc bằng chi phí thực tế để đi từ $n$ đến đích, vì nó giả định hành khách đi thẳng bằng phương tiện nhanh nhất (tàu điện $35\text{ km/h}$) theo đường chim bay ngắn nhất và không tính thời gian dừng ga hay đổi tuyến.
2. **Consistent (Nhất quán):** Thỏa mãn bất đẳng thức tam giác $H(u) \le W(u, v) + H(v)$.

Do đó, thuật toán A\* được đảm bảo luôn tìm ra đường đi ngắn nhất về mặt thời gian mà không cần duyệt hết toàn bộ đồ thị.

---

## 5. Cơ chế Tối ưu hóa Hiệu năng (Performance Optimizations)

Để đảm bảo phản hồi tức thì dưới $10\text{ ms}$ trên giao diện web, thuật toán áp dụng các kỹ thuật tối ưu sau:

### A. Graph Caching (Bộ nhớ đệm đồ thị)
Việc duyệt lưới để sinh danh sách kề (`buildStationGraph()`) tốn nhiều tài nguyên tính toán. Thuật toán lưu trữ đồ thị đã dựng vào bộ nhớ đệm (`cachedGraph`). 
Hệ thống tạo ra một chuỗi băm trạng thái (`getGridStateHash()`) đại diện cho cấu trúc hiện tại của bản đồ (vị trí ga, kiểu ray, các hướng nối, các cổng chuyển tuyến). Đồ thị chỉ được xây dựng lại khi có sự thay đổi thực tế trên bản đồ (như đặt ray mới, xóa ga hoặc bật/tắt tuyến tàu).

### B. Thu gọn Không gian trạng thái (Lazy Graph/State Reduction)
Thay vì đưa mọi ô ray đơn lẻ trên bản đồ vào danh sách đỉnh của A\*, hệ thống chỉ xây dựng liên kết trực tiếp giữa các ga kế cận. Khi chạy A\*, thuật toán chỉ duyệt qua các đỉnh là Ga. Các chi tiết đường đi cụ thể giữa hai ga kế kề sẽ được truy xuất động qua BFS phụ (`getTrackCellsBetweenStations`) chỉ khi cần hiển thị trực quan hóa tuyến đường lên giao diện. Kỹ thuật này giảm số lượng đỉnh trong không gian tìm kiếm từ hàng nghìn ô lưới xuống còn vài chục ga tàu.

---

## 6. So sánh Thực nghiệm

| Tiêu chí so sánh | BFS thường (Mặc định trước đây) | A\* Hiện tại (Đang áp dụng) |
| :--- | :--- | :--- |
| **Đơn vị tối ưu** | Số chặng dừng (Hops) | Thời gian di chuyển thực tế (Phút) |
| **Phạt đổi tuyến** | Không hỗ trợ (Coi đổi tuyến = đi thẳng) | Hỗ trợ (Phạt 3 phút cho mỗi lần đổi màu tàu) |
| **Hỗ trợ đi bộ chuyển ga** | Không thể phân biệt chi phí | Ưu tiên tối ưu theo khoảng cách thực tế |
| **Thời gian tính toán** | Trung bình, phụ thuộc kích thước lưới | Rất nhanh nhờ Heuristic định hướng và Cache |
| **Độ chính xác trải nghiệm** | Thấp (Có thể chỉ đường đi qua 3 ga nhưng phải đổi tuyến 2 lần) | Cao (Ưu tiên đi thẳng, chỉ chuyển tuyến khi tiết kiệm thời gian) |
