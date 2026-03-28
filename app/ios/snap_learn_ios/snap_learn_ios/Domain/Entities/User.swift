import Foundation

// Entity là những Model thuần tuý, phản ánh nghiệp vụ thực tế.
// Chú ý: Chúng ta KHÔNG dùng "Codable" ở đây nếu JSON từ server có cấu trúc khác biệt,
// vì việc mapping (chuyển đổi) sẽ do tầng Data lo liệu.
public struct User: Identifiable, Equatable {
    public let id: String
    public let name: String
    public let email: String
    public let avatarURL: URL?
    
    public init(id: String, name: String, email: String, avatarURL: URL?) {
        self.id = id
        self.name = name
        self.email = email
        self.avatarURL = avatarURL
    }
}