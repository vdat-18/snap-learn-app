import Foundation

// Giao thức này quy định các hành động có thể làm với User.
// Sử dụng async/await của Swift hiện đại để xử lý bất đồng bộ.
public protocol UserRepositoryProtocol {
    /// Lấy danh sách người dùng
    /// - Returns: Một mảng các User (Entities)
    /// - Throws: Lỗi nếu network hỏng hoặc lỗi mapping
    func fetchUsers() async throws -> [User]
    
    /// Lấy thông tin chi tiết của một người dùng dựa vào ID
    func fetchUserDetails(id: String) async throws -> User
}