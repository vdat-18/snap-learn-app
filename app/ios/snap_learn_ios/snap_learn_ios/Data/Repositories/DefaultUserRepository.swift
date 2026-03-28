import Foundation

// Class này là Concrete Implementation của Interface từ tầng Domain.
public final class DefaultUserRepository: UserRepositoryProtocol {
    
    // Sử dụng URLSession để gọi mạng. Có thể thay bằng Alamofire nếu muốn.
    private let session: URLSession
    
    // Constructor Injection để dễ dàng truyền MockURLSession khi viết Unit Test
    public init(session: URLSession = .shared) {
        self.session = session
    }
    
    // MARK: - Thực thi các hàm của UserRepositoryProtocol
    
    public func fetchUsers() async throws -> [User] {
        // 1. Chuẩn bị URL (Giả lập gọi API thực tế)
        // Trong dự án lớn, bạn nên tách cái này ra thành NetworkService/Endpoint.
        guard let url = URL(string: "https://api.example.com/v1/users") else {
            throw URLError(.badURL)
        }
        
        // 2. Gọi API sử dụng async/await
        let (data, response) = try await session.data(from: url)
        
        // 3. Kiểm tra HTTP Status Code
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        // 4. Parse JSON thành mảng DTOs
        let decoder = JSONDecoder()
        let userDTOs = try decoder.decode([UserDTO].self, from: data)
        
        // 5. Mapping từ mảng DTOs sang mảng Entities và trả về cho Domain
        return userDTOs.map { $0.toDomain() }
    }
    
    public func fetchUserDetails(id: String) async throws -> User {
        // Triển khai tương tự cho chi tiết user
        guard let url = URL(string: "https://api.example.com/v1/users/\(id)") else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await session.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        let userDTO = try JSONDecoder().decode(UserDTO.self, from: data)
        return userDTO.toDomain()
    }
}