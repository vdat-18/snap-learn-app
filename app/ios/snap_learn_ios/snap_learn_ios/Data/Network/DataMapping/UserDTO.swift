import Foundation

// DTO tuân thủ Codable để parse JSON từ API.
// Nó phản ánh chính xác 100% các keys mà backend trả về.
struct UserDTO: Codable {
    let id: Int             // Backend trả về Int
    let name: String
    let email: String
    let avatar_url: String? // Backend dùng snake_case
    
    // Nếu key của JSON khác với tên biến, ta dùng CodingKeys
    // enum CodingKeys: String, CodingKey { ... }
}

// MARK: - Mapping sang Domain Entity
// Đưa logic mapping vào extension để tái sử dụng và giữ code gọn gàng.
extension UserDTO {
    func toDomain() -> User {
        return User(
            id: String(self.id), // Ép kiểu Int từ server sang String của App
            name: self.name,
            email: self.email,
            avatarURL: self.avatar_url != nil ? URL(string: self.avatar_url!) : nil
        )
    }
}