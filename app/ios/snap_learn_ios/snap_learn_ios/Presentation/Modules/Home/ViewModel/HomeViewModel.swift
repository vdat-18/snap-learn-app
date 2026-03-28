import Foundation
import Combine

// MainActor đảm bảo mọi cập nhật UI đều diễn ra trên Main Thread
@MainActor
public final class HomeViewModel: ObservableObject {
    
    // MARK: - Trạng thái của màn hình (States)
    @Published public var users: [User] = []
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String? = nil
    
    // Inject UseCase thông qua Protocol để dễ dàng Mock khi viết Unit Test
    private let fetchUsersUseCase: FetchUsersUseCaseProtocol
    
    public init(fetchUsersUseCase: FetchUsersUseCaseProtocol) {
        self.fetchUsersUseCase = fetchUsersUseCase
    }
    
    // MARK: - User Intents (Hành động từ UI)
    
    public func loadUsers() {
        isLoading = true
        errorMessage = nil
        
        // Sử dụng Task để gọi hàm async từ UseCase
        Task {
            do {
                // Gọi Domain Layer lấy dữ liệu
                let fetchedUsers = try await fetchUsersUseCase.execute()
                self.users = fetchedUsers
            } catch {
                // Xử lý lỗi (Thực tế nên có một ErrorMapper để dịch lỗi cho user)
                self.errorMessage = error.localizedDescription
            }
            self.isLoading = false
        }
    }
}