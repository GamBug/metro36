// ======= MULTILINGUAL SUPPORT (i18n) =======

const TRANSLATIONS = {
    en: {
        // App Header
        logo_title: "Metro BaSau ",
        save: "SAVE (Ctrl+S)",
        load: "LOAD (Ctrl+O)",
        clear: "CLEAR",
        tutorial: "TUTORIAL",
        logout: "LOGOUT",
        guest_mode: "GUEST MODE",
        
        // Left Toolbar
        line_color: "Line Color",
        track_style: "Track Style",
        tools_group: "Tools",
        basic_tracks_group: "Basic Tracks",
        diagonals_group: "Diagonals",
        intersections_group: "Intersections",
        
        // Track Names
        eraser_btn: "Eraser (E)",
        magic_tool_btn: "Magic Tool (M)",
        station_btn: "Station (S)",
        connect_btn: "Connect (T)",
        move_btn: "Move (V)",
        oneway_btn: "One-Way (O)",
        
        // Right Panel
        find_route: "Find Route",
        exclude_colors: "Exclude Lines",
        routing_algo: "Routing Algorithm",
        from_label: "From",
        to_label: "To",
        select_station_placeholder: "-- Select Station --",
        find_route_btn: "Find Route (Enter)",
        random_route_btn: "🎲 Random",
        clear_route_btn: "Clear Route",
        pathfinding_tester: "Pathfinding Tester",
        tester_desc: "Compare standard A* vs Dijkstra across all possible network routes.",
        run_tester_btn: "Run Comparison Test",
        export_tester_btn: "📥 Export",
        routes_tested: "routes tested",
        track_stations_title: "Track Stations",
        no_tracks_placed: "No tracks placed.",
        no_stations_placed_tracks: "No stations placed on tracks.",
        ref_image_title: "Reference Image",
        upload_img_btn: "Upload Image",
        opacity_label: "Opacity",
        scale_label: "Scale",
        move_ref_btn: "Move Reference",
        shift_move_desc: "* Hold Shift to Move Image while drawing",
        
        // Login Page
        login_title: "Metro BaSau — Login",
        login_meta_desc: "Login to access Metro BaSau - Design beautiful metro maps with ease.",
        design_subtitle: "Design beautiful metro maps",
        password_label: "Password",
        enter_password_placeholder: "ENTER PASSWORD",
        sign_in_btn: "Sign In",
        signing_in_btn: "SIGNING IN...",
        guest_btn: "Guest",
        incorrect_password: "⚠️ Incorrect password. Try again.",
        secure_context_error: "Secure login requires HTTPS, localhost, or a supported browser.",
        blueprints_note: "METRO BASAU — Blueprints & Maps",
        
        // Prompts and alerts
        prompt_station_name: "Enter station name:",
        default_station_name: "New Station",
        confirm_clear_board: "Clear the entire board? This action can be undone with Ctrl+Z.",
        alert_invalid_map: "Invalid map file structure.",
        alert_map_too_large: "Map file is too large or invalid.",
        alert_map_read_error: "Error reading map file: ",
        alert_ref_image_invalid: "Reference image is too large or is not an image.",
        
        // Route results
        route_not_found: "No route found between these two stations.",
        route_not_found_general: "No path found between the selected stations.",
        route_select_both: "Please select both a departure and a destination station.",
        route_same_station: "Departure and destination stations are the same!",
        route_min_stations_random: "At least 2 stations are needed to use this feature.",
        route_stops_count: "{count} stops",
        route_transfers_count: "{count} transfers",
        route_direct: "Direct",
        route_distance: "📏 Distance",
        route_est_time: "⏱️ Est. time",
        route_minutes: "{count} mins",
        route_train_run: "Train",
        route_walk: "Walk",
        route_transfer_badge: "Transfer to {color} Line",
        line_name_format: "{color} Line",
        transfer_to_stations_list: "(To {stations})",
        shortcut_color: "Shortcut: {num}",
        
        // Measure Tool
        measure_btn: "📏 Measure",
        measure_mode_active: "📏 In measurement mode. Please click to select point 1 on the map.",
        measure_point_1_selected: "📍 Selected point 1: <strong>{name}</strong>.<br>Please click to select point 2 on the map.",
        measure_results_title: "📏 DISTANCE MEASUREMENT RESULTS",
        measure_from: "From",
        measure_to: "To",
        measure_track_distance: "🛤️ <strong>Distance along tracks:</strong>",
        measure_total_len: "• Total length",
        measure_train_walk_details: "(Train: {train} km, Walk: {walk} km)",
        measure_est_travel_time: "• Estimated travel time",
        measure_geo_distance: "🕊️ <strong>Geographical distance (as the crow flies):</strong>",
        measure_geo_len: "• Distance",
        measure_grid_cells: "{count} grid cells",
        measure_turn_off_tip: "Click the <strong>Measure</strong> button again to turn off measurement mode.",
        measure_station_prefix: "Station {name}",
        measure_coords_prefix: "Coordinates ({x},{y})",
        
        // Pathfinding Tester
        tester_min_stations: "⚠️ At least 2 stations are needed to run a comparison test.",
        tester_no_routes: "⚠️ No reachable routes found between the placed stations.",
        tester_testing_status: "Testing...",
        tester_routes_tested_label: "{tested}/{total} routes tested",
        tester_results_title: "📊 Test Results Summary",
        tester_total_stations: "Total Stations",
        tester_routes_evaluated: "Routes Evaluated",
        tester_reachable_routes: "Reachable Routes",
        tester_nodes_explored: "Nodes Explored (Avg)",
        tester_dijkstra: "Dijkstra's Algorithm",
        tester_astar: "A* Search (Admissible)",
        tester_astar_savings: "A* Search Savings",
        tester_fewer: "fewer",
        tester_search_time: "⏱️ Search Time (Total)",
        tester_execution_speedup: "Execution Speedup",
        tester_faster: "faster",
        tester_bfs: "BFS Algorithm",
        tester_dfs: "DFS Algorithm",
        tester_idfs: "IDFS Algorithm",
        tester_fewer_nodes: "fewer nodes",
        tester_more_nodes: "more nodes",
        tester_faster_time: "faster",
        tester_slower_time: "slower",
        tester_comparison_efficiency: "Node savings (Algo 1)",
        tester_comparison_speed: "Time savings (Algo 1)",
        
        // Pathfinding Tester Report TXT
        report_title: "METRO BASAU PATHFINDING TEST REPORT",
        report_generated_on: "Generated on",
        report_total_stations_txt: "Total Stations in Network",
        report_routes_evaluated_txt: "Total Routes Evaluated",
        report_reachable_routes_txt: "Total Reachable Routes",
        report_nodes_explored_section: "1. NODES EXPLORED (AVERAGE PER ROUTE)",
        report_execution_time_section: "2. SEARCH EXECUTION TIME (TOTAL)",
        report_efficiency_gain: "Efficiency Gain of A*",
        report_fewer_nodes: "fewer nodes explored",
        report_faster_time: "faster search time",
        report_end: "End of Report",
        
        // Color Names
        color_red: "Red",
        color_orange: "Orange",
        color_yellow: "Yellow",
        color_green: "Green",
        color_blue: "Blue",
        color_indigo: "Indigo",
        color_pink: "Pink",
        color_silver: "Silver",
        color_unknown: "Unknown",
        
        // Tooltips / Titles
        save_title: "Save Map File (Ctrl+S)",
        load_title: "Load Map File (Ctrl+O)",
        clear_title: "Clear Canvas (Ctrl+E)",
        tutorial_title: "Show User Guide",
        logout_title: "Back to Login Screen",
        swap_stations_title: "Swap departure and arrival stations",
        pick_from_title: "Pick station from map",
        pick_to_title: "Pick station from map",
        random_route_title: "Find a random route",
        export_title: "Export results as TXT",
        collapsible_trigger_title: "Click to expand/collapse Track Stations",
        
        // User Guide Modal
        guide_header: "Metro BaSau — User Guide",
        guide_tab_general: "General Guide",
        guide_tab_tools: "Tools & Features",
        guide_tab_shortcuts: "Shortcuts",
        guide_welcome_heading: "Welcome to Metro BaSau Map Builder!",
        guide_welcome_desc: "Metro BaSau is a professional, high-performance editor that allows you to construct and analyze complex transit maps. Whether you are building real-world network maps or abstract designs, these instructions will get you started quickly.",
        guide_drawing_heading: "Drawing Tracks & Stations",
        guide_drawing_color: "Select a Color: Choose a color from the Line Color palette in the left sidebar or press keys 1 to 8.",
        guide_drawing_tracks: "Draw Tracks: Select a track type or the Auto Tool (which resolves curves/crossings automatically). Hold down the left mouse button on the grid and drag to draw a line. Release to commit the track.",
        guide_drawing_stations: "Create a Station: Select the Station tool (represented by a white circle icon). Click on any grid cell to place a station. You will be prompted to enter a station name. You can place stations on top of existing tracks to make them stops.",
        guide_editing_heading: "Editing & Erasing",
        guide_editing_erase: "Erase Elements: Select the Eraser tool (trash can icon or press E). Click and drag over cells to remove tracks and stations.",
        guide_editing_undo: "Undo/Redo Actions: Use Ctrl + Z to undo and Ctrl + Y to redo your changes at any time.",
        guide_editing_pan: "Pan & Zoom: Select the Pan tool (hand icon or press V) to click and drag to scroll the canvas. Use your mouse scroll wheel to zoom in and out.",
        guide_adv_heading: "Advanced Features",
        guide_adv_transfer_h: "1. Transfer Connections",
        guide_adv_transfer_d: "Create transfer pathways between adjacent stations (especially on different lines) to allow passengers to transition. Choose the Transfer tool, then click the start station and then the destination station.",
        guide_adv_oneway_h: "2. One-Way Tracks",
        guide_adv_oneway_d: "Control the direction of flow on line tracks. Choose the One-Way tool and click on a placed track to assign an operating direction. Repeated clicks cycle through available directions.",
        guide_adv_route_h: "3. Route Finder",
        guide_adv_route_d: "Select a departure station in From and an arrival station in To. Click Find Route to see the path, distance, number of stations, and transition line instructions. You can also exclude specific lines or generate a random route.",
        guide_adv_ref_h: "4. Reference Image",
        guide_adv_ref_d: "Load an image file as a background blueprint underlay. Use the opacity and scale sliders to calibrate the drawing size, and click Move Reference (or hold Shift) to drag the blueprint around.",
        guide_shortcuts_heading: "Keyboard Shortcuts",
        guide_shortcuts_desc: "Work faster with quick keys for editing, navigating, and file actions.",
        guide_th_action: "Action",
        guide_th_shortcut: "Shortcut",
        guide_got_it: "Got It"
    },
    vi: {
        // App Header
        logo_title: "Metro BaSau ",
        save: "LƯU (Ctrl+S)",
        load: "MỞ (Ctrl+O)",
        clear: "XÓA HẾT",
        tutorial: "HƯỚNG DẪN",
        logout: "ĐĂNG XUẤT",
        guest_mode: "CHẾ ĐỘ KHÁCH",
        
        // Left Toolbar
        line_color: "Màu Tuyến",
        track_style: "Kiểu Đường Ray",
        tools_group: "Công cụ",
        basic_tracks_group: "Đường Ray Cơ Bản",
        diagonals_group: "Đường Chéo",
        intersections_group: "Giao Lộ",
        
        // Track Names
        eraser_btn: "Tẩy (E)",
        magic_tool_btn: "Tự Động (M)",
        station_btn: "Ga Tàu (S)",
        connect_btn: "Liên Kết (T)",
        move_btn: "Di Chuyển (V)",
        oneway_btn: "Một Chiều (O)",
        
        // Right Panel
        find_route: "Tìm Đường Đi",
        exclude_colors: "Loại Trừ Tuyến",
        routing_algo: "Thuật Toán Tìm Đường",
        from_label: "Từ Ga",
        to_label: "Đến Ga",
        select_station_placeholder: "-- Chọn Nhà Ga --",
        find_route_btn: "Tìm Đường (Enter)",
        random_route_btn: "🎲 Ngẫu Nhiên",
        clear_route_btn: "Xóa Lộ Trình",
        pathfinding_tester: "Kiểm Thử Tìm Đường",
        tester_desc: "So sánh thuật toán A* và Dijkstra trên tất cả lộ trình mạng lưới có thể.",
        run_tester_btn: "Chạy Thử Nghiệm So Sánh",
        export_tester_btn: "📥 Xuất Tệp",
        routes_tested: "tuyến đường được kiểm tra",
        track_stations_title: "Danh Sách Nhà Ga",
        no_tracks_placed: "Chưa có đường ray nào được đặt.",
        no_stations_placed_tracks: "Không có ga tàu nào được đặt trên đường ray.",
        ref_image_title: "Ảnh Bản Đồ Gốc",
        upload_img_btn: "Tải Ảnh Lên",
        opacity_label: "Độ Mờ",
        scale_label: "Tỷ Lệ",
        move_ref_btn: "Di Chuyển Ảnh",
        shift_move_desc: "* Giữ Shift để Di Chuyển Ảnh khi đang vẽ",
        
        // Login Page
        login_title: "Metro BaSau — Đăng Nhập",
        login_meta_desc: "Đăng nhập vào Metro BaSau - Thiết kế bản đồ metro dễ dàng và nhanh chóng.",
        design_subtitle: "Thiết kế bản đồ metro tuyệt đẹp",
        password_label: "Mật khẩu",
        enter_password_placeholder: "NHẬP MẬT KHẨU",
        sign_in_btn: "Đăng Nhập",
        signing_in_btn: "ĐANG ĐĂNG NHẬP...",
        guest_btn: "Khách",
        incorrect_password: "⚠️ Mật khẩu không chính xác. Vui lòng thử lại.",
        secure_context_error: "Đăng nhập bảo mật yêu cầu giao thức HTTPS, localhost, hoặc trình duyệt được hỗ trợ.",
        blueprints_note: "METRO BASAU — Thiết kế & Bản đồ",
        
        // Prompts and alerts
        prompt_station_name: "Nhập tên nhà ga:",
        default_station_name: "Ga Mới",
        confirm_clear_board: "Bạn có chắc chắn muốn xóa toàn bộ bản đồ? Hành động này có thể hoàn tác bằng Ctrl+Z.",
        alert_invalid_map: "Cấu trúc tệp bản đồ không hợp lệ.",
        alert_map_too_large: "Tệp bản đồ quá lớn hoặc không hợp lệ.",
        alert_map_read_error: "Lỗi đọc tệp bản đồ: ",
        alert_ref_image_invalid: "Ảnh bản đồ gốc quá lớn hoặc không đúng định dạng ảnh.",
        
        // Route results
        route_not_found: "Không tìm thấy lộ trình nào giữa hai nhà ga này.",
        route_not_found_general: "Không tìm thấy đường đi giữa các ga được chọn.",
        route_select_both: "Vui lòng chọn cả ga đi và ga đến.",
        route_same_station: "Ga đi và ga đến trùng nhau!",
        route_min_stations_random: "Cần có ít nhất 2 ga tàu để sử dụng tính năng này.",
        route_stops_count: "{count} ga dừng",
        route_transfers_count: "{count} lần đổi tuyến",
        route_direct: "Đi thẳng",
        route_distance: "Quãng đường",
        route_est_time: "Dự kiến",
        route_minutes: "{count} phút",
        route_train_run: "Tàu chạy",
        route_walk: "Đi bộ",
        route_transfer_badge: "Chuyển sang Tuyến {color}",
        line_name_format: "Tuyến {color}",
        transfer_to_stations_list: "(Đến {stations})",
        shortcut_color: "Phím tắt: {num}",
        
        // Measure Tool
        measure_btn: " Đo khoảng cách",
        measure_mode_active: " Đang ở chế độ đo. Hãy click chọn điểm thứ 1 trên bản đồ.",
        measure_point_1_selected: "📍 Đã chọn điểm 1: <strong>{name}</strong>.<br>Hãy click chọn điểm thứ 2 trên bản đồ.",
        measure_results_title: " KẾT QUẢ ĐO KHOẢNG CÁCH",
        measure_from: "Từ",
        measure_to: "Đến",
        measure_track_distance: "🛤️ <strong>Khoảng cách dọc đường ray:</strong>",
        measure_total_len: "• Tổng độ dài",
        measure_train_walk_details: "(Tàu chạy: {train} km, đi bộ: {walk} km)",
        measure_est_travel_time: "• Thời gian di chuyển ước tính",
        measure_geo_distance: "🕊️ <strong>Khoảng cách địa lý (chim bay):</strong>",
        measure_geo_len: "• Khoảng cách",
        measure_grid_cells: "{count} ô lưới",
        measure_turn_off_tip: "Nhấp nút <strong>Đo khoảng cách</strong> lần nữa để tắt chế độ đo.",
        measure_station_prefix: "Ga {name}",
        measure_coords_prefix: "Tọa độ ({x},{y})",
        
        // Pathfinding Tester
        tester_min_stations: "⚠️ Cần ít nhất 2 ga tàu để chạy thử nghiệm so sánh.",
        tester_no_routes: "⚠️ Không tìm thấy tuyến đường khả thi nào giữa các ga đã đặt.",
        tester_testing_status: "Đang kiểm thử...",
        tester_routes_tested_label: "Đã kiểm thử {tested}/{total} tuyến đường",
        tester_results_title: "📊 Tổng Hợp Kết Quả Thử Nghiệm",
        tester_total_stations: "Tổng số nhà ga",
        tester_routes_evaluated: "Lộ trình đánh giá",
        tester_reachable_routes: "Lộ trình khả thi",
        tester_nodes_explored: "Nút đã khám phá (TB)",
        tester_dijkstra: "Thuật toán Dijkstra",
        tester_astar: "Thuật toán tìm kiếm A*",
        tester_astar_savings: "Mức tiết kiệm của A*",
        tester_fewer: "ít hơn",
        tester_search_time: "⏱️ Tổng Thời Gian Tìm Kiếm",
        tester_execution_speedup: "Tốc độ gia tăng",
        tester_faster: "nhanh hơn",
        tester_bfs: "Thuật toán BFS",
        tester_dfs: "Thuật toán DFS",
        tester_idfs: "Thuật toán IDFS",
        tester_fewer_nodes: "ít nút hơn",
        tester_more_nodes: "nhiều nút hơn",
        tester_faster_time: "nhanh hơn",
        tester_slower_time: "chậm hơn",
        tester_comparison_efficiency: "Nút tiết kiệm (T.Toán 1)",
        tester_comparison_speed: "T.Gian tiết kiệm (T.Toán 1)",
        
        // Pathfinding Tester Report TXT
        report_title: "BÁO CÁO THỬ NGHIỆM TÌM ĐƯỜNG METRO BASAU",
        report_generated_on: "Thời gian tạo",
        report_total_stations_txt: "Tổng số nhà ga mạng lưới",
        report_routes_evaluated_txt: "Tổng số lộ trình đánh giá",
        report_reachable_routes_txt: "Tổng số lộ trình khả thi",
        report_nodes_explored_section: "1. SỐ NÚT KHÁM PHÁ (TRUNG BÌNH MỖI LỘ TRÌNH)",
        report_execution_time_section: "2. THỜI GIAN THỰC THI TÌM KIẾM (TỔNG CỘNG)",
        report_efficiency_gain: "Hiệu quả cải thiện của A*",
        report_fewer_nodes: "ít nút khám phá hơn",
        report_faster_time: "thời gian tìm kiếm nhanh hơn",
        report_end: "Kết thúc báo cáo",
        
        // Color Names
        color_red: "Đỏ",
        color_orange: "Cam",
        color_yellow: "Vàng",
        color_green: "Xanh lá",
        color_blue: "Xanh biển",
        color_indigo: "Chàm",
        color_pink: "Hồng",
        color_silver: "Bạc",
        color_unknown: "Không rõ",
        
        // Tooltips / Titles
        save_title: "Lưu bản đồ (Ctrl+S)",
        load_title: "Mở bản đồ (Ctrl+O)",
        clear_title: "Xóa toàn bộ bản đồ (Ctrl+E)",
        tutorial_title: "Xem hướng dẫn sử dụng",
        logout_title: "Trở lại màn hình đăng nhập",
        swap_stations_title: "Đảo vị trí ga đi và ga đến",
        pick_from_title: "Chọn ga trực tiếp từ bản đồ",
        pick_to_title: "Chọn ga trực tiếp từ bản đồ",
        random_route_title: "Tìm một lộ trình ngẫu nhiên",
        export_title: "Xuất kết quả dưới dạng văn bản TXT",
        collapsible_trigger_title: "Nhấp để mở rộng/thu gọn Danh sách Nhà ga",
        
        // User Guide Modal
        guide_header: "Metro BaSau — Hướng Dẫn Sử Dụng",
        guide_tab_general: "Hướng Dẫn Chung",
        guide_tab_tools: "Công Cụ & Tính Năng",
        guide_tab_shortcuts: "Phím Tắt",
        guide_welcome_heading: "Chào mừng đến với Metro BaSau Map Builder!",
        guide_welcome_desc: "Metro BaSau là một công cụ biên tập chuyên nghiệp, hiệu năng cao giúp bạn xây dựng và phân tích các mạng lưới bản đồ giao thông công cộng phức tạp. Dù bạn thiết kế bản đồ thực tế hay sơ đồ trừu tượng, những hướng dẫn này sẽ giúp bạn bắt đầu nhanh chóng.",
        guide_drawing_heading: "Vẽ Đường Ray & Nhà Ga",
        guide_drawing_color: "Chọn Màu sắc: Chọn một màu từ bảng Màu Tuyến bên thanh trái hoặc nhấn các phím từ 1 đến 8.",
        guide_drawing_tracks: "Vẽ Đường ray: Chọn một kiểu đường ray hoặc Công cụ Tự động (tự động xử lý các góc cong/nút giao). Nhấp giữ chuột trái trên lưới và kéo để vẽ. Thả chuột để hoàn thành.",
        guide_drawing_stations: "Tạo Nhà ga: Chọn công cụ Ga Tàu (biểu tượng hình tròn trắng). Nhấp vào bất kỳ ô nào trên lưới để đặt ga. Bạn sẽ được yêu cầu nhập tên ga. Bạn có thể đặt ga lên trên đường ray có sẵn để làm trạm dừng.",
        guide_editing_heading: "Chỉnh Sửa & Xóa",
        guide_editing_erase: "Xóa Đối tượng: Chọn công cụ Tẩy (biểu tượng thùng rác hoặc nhấn phím E). Nhấp giữ và kéo qua các ô để xóa đường ray và nhà ga.",
        guide_editing_undo: "Hoàn tác & Làm lại: Sử dụng Ctrl + Z để hoàn tác và Ctrl + Y để làm lại các thay đổi bất kỳ lúc nào.",
        guide_editing_pan: "Di chuyển & Thu phóng: Chọn công cụ Cuộn (biểu tượng bàn tay hoặc nhấn V) để kéo bản đồ. Dùng con lăn chuột để phóng to, thu nhỏ canvas.",
        guide_adv_heading: "Tính Năng Nâng Cao",
        guide_adv_transfer_h: "1. Liên Kết Chuyển Ga",
        guide_adv_transfer_d: "Tạo lối đi bộ chuyển tiếp giữa các ga nằm cạnh nhau (đặc biệt là khác màu tuyến) để hành khách đổi tàu. Chọn công cụ Liên Kết, sau đó nhấp vào ga xuất phát rồi nhấp vào ga đích.",
        guide_adv_oneway_h: "2. Đường Một Chiều",
        guide_adv_oneway_d: "Kiểm soát hướng di chuyển trên đường ray. Chọn công cụ Một Chiều và nhấp vào đường ray đã vẽ để gắn hướng hoạt động. Nhấp tiếp để đổi qua các hướng có thể hoặc hủy đường một chiều.",
        guide_adv_route_h: "3. Tìm Đường Đi",
        guide_adv_route_d: "Chọn ga đi ở ô Từ Ga và ga đến ở ô Đến Ga. Nhấp Tìm Đường để xem chi tiết lộ trình: khoảng cách, số nhà ga đi qua, ga cần chuyển tuyến. Bạn cũng có thể loại trừ một số màu tuyến nhất định hoặc chọn ngẫu nhiên.",
        guide_adv_ref_h: "4. Ảnh Bản Đồ Gốc",
        guide_adv_ref_d: "Tải lên một tệp hình ảnh để làm ảnh mẫu dưới nền lưới vẽ. Dùng thanh trượt độ mờ và tỷ lệ để căn chỉnh kích cỡ, nhấp Di Chuyển Ảnh (hoặc giữ Shift) để định vị hình ảnh mẫu.",
        guide_shortcuts_heading: "Phím Tắt Bàn Phím",
        guide_shortcuts_desc: "Làm việc nhanh hơn với các phím tắt tiện lợi cho chỉnh sửa, điều hướng và thao tác tệp tin.",
        guide_th_action: "Thao Tác",
        guide_th_shortcut: "Phím Tắt",
        guide_got_it: "Đã Hiểu"
    }
};

function getTranslation(key, params = {}) {
    const lang = 'en';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    let text = dict[key];
    if (text === undefined && lang !== 'en') {
        text = TRANSLATIONS['en'][key];
    }
    if (text === undefined) return '';
    
    // Replace parameters
    Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`{${p}}`, 'g'), params[p]);
    });
    return text;
}

const _t = getTranslation;

function getTranslatedColorName(color) {
    if (typeof colorNames === 'undefined') return color;
    const englishName = colorNames[color];
    if (!englishName) return _t('color_unknown') || 'Unknown';
    const key = `color_${englishName.toLowerCase()}`;
    return _t(key) || englishName;
}

function updatePageLanguage() {
    const lang = 'en';
    
    // Update active dropdown value
    const langSelects = document.querySelectorAll('#langSelect');
    langSelects.forEach(sel => {
        if (sel.value !== lang) {
            sel.value = lang;
        }
    });

    // Update simple text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = getTranslation(key);
        if (text !== undefined) {
            let textNodeFound = false;
            for (let child of el.childNodes) {
                if (child.nodeType === 3) { // Text node
                    child.nodeValue = text;
                    textNodeFound = true;
                }
            }
            if (!textNodeFound) {
                el.textContent = text;
            }
        }
    });

    // Update title tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const text = getTranslation(key);
        if (text) el.setAttribute('title', text);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = getTranslation(key);
        if (text) el.setAttribute('placeholder', text);
    });
    
    // Update select element placeholders if they have an empty-value option
    document.querySelectorAll('select').forEach(sel => {
        const opt = sel.querySelector('option[value=""]');
        if (opt) {
            const key = opt.getAttribute('data-i18n') || 'select_station_placeholder';
            const text = getTranslation(key);
            if (text) opt.textContent = text;
        }
    });

    // Rerender generated components if their functions exist
    if (typeof initToolbar === 'function') {
        initToolbar();
    }
    if (typeof updateTrackTable === 'function') {
        updateTrackTable();
    }
    if (typeof updateRouteDropdowns === 'function') {
        updateRouteDropdowns();
    }
}

// Automatically bind language select controls
document.addEventListener('DOMContentLoaded', () => {
    function setupLangSelectors() {
        const langSelects = document.querySelectorAll('#langSelect');
        langSelects.forEach(sel => {
            // Populate select options if empty
            if (sel.options.length === 0) {
                const optEn = document.createElement('option');
                optEn.value = 'en';
                optEn.textContent = 'English';
                const optVi = document.createElement('option');
                optVi.value = 'vi';
                optVi.textContent = 'Tiếng Việt';
                sel.appendChild(optEn);
                sel.appendChild(optVi);
            }
            
            sel.value = localStorage.getItem('metro_lang') || 'en';
            
            sel.addEventListener('change', (e) => {
                localStorage.setItem('metro_lang', e.target.value);
                updatePageLanguage();
            });
        });
    }

    setupLangSelectors();
    updatePageLanguage();

    // Watch for dynamic insertions of language selector
    const observer = new MutationObserver((mutations) => {
        let hasNewSelector = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.id === 'langSelect' || (node.querySelector && node.querySelector('#langSelect'))) {
                    hasNewSelector = true;
                }
            });
        });
        if (hasNewSelector) {
            setupLangSelectors();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

// For immediate run when script loads in app context
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(updatePageLanguage, 0);
}
