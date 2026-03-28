import Foundation

// Enum này định nghĩa các luồng (màn hình) có thể điều hướng từ Home
public enum HomeRoute: Hashable {
    case todoApp    // Màn hình Todo & Pomodoro
    case userList   // Màn hình danh sách User (nếu bạn muốn giữ lại code cũ)
    // Thêm các tính năng sau này ở đây (case settings, case profile...)
}