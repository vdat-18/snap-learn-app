import Foundation

// Định nghĩa Protocol cho UseCase để tầng Presentation (ViewModel) dễ dàng viết Unit Test bằng cách Mock.
public protocol FetchUsersUseCaseProtocol {
    func execute() async throws -> [User]
}

public final class FetchUsersUseCase: FetchUsersUseCaseProtocol {
    
    // Inject Repository Interface thay vì Implementation (Concrete class)
    private let userRepository: UserRepositoryProtocol
    
    // Khởi tạo thông qua Dependency Injection
    public init(userRepository: UserRepositoryProtocol) {
        self.userRepository = userRepository
    }
    
    public func execute() async throws -> [User] {
        // Bước 1: Gọi tầng data để lấy dữ liệu thô
        let users = try await userRepository.fetchUsers()
        
        // Bước 2: Thực hiện các logic nghiệp vụ (Business Logic) ở đây nếu có.
        // Ví dụ: Chỉ trả về những user có avatar, hoặc sắp xếp tên theo Alphabet.
        let validUsers = users.filter { $0.avatarURL != nil }
        let sortedUsers = validUsers.sorted { $0.name < $1.name }
        
        // Bước 3: Trả dữ liệu cuối cùng cho tầng Presentation
        return sortedUsers
    }
}