
import Foundation // (Có thể có hoặc không)
import SwiftUI

final class AppDIContainer {
    
    // MARK: - Core Dependencies
    // Khởi tạo các service dùng chung ở đây (Network, Local Storage...)
    // lazy var networkService = DefaultNetworkService()
    // lazy var coreDataStorage = CoreDataStorage.shared
  private let sharedTodoRepository: TodoRepositoryProtocol
    
    init() {
        self.sharedTodoRepository = DefaultTodoRepository()
    }
    
    // MARK: - Module Factories
    // Ví dụ: Hàm tạo Home Module
    // Trong thực tế, bạn có thể tạo HomeDIContainer riêng biệt nếu logic quá lớn
   @MainActor
    func makeHomeView() -> HomeView {
        // Truyền logic điều hướng vào HomeView
        return HomeView(destinationFactory: { [weak self] route in
            guard let self = self else { return AnyView(EmptyView()) }
            
            // Dựa vào Enum để quyết định build màn hình nào
            switch route {
            case .todoApp:
                // Trả về AddTodoView đã được bọc trong AnyView
                // SỬA Ở ĐÂY: Tạo một công việc giả (Mock Data) để test màn hình đếm giờ
                                let dummyTask = TodoItem(title: "Tập trung code Clean Architecture", durationInMinutes: 25)
                                
                                // Truyền task giả vào hàm
                                return AnyView(self.makeTodoTimerView(for: dummyTask))
                
            case .userList:
                // Nếu sau này bạn có màn hình khác, trả về ở đây
                return AnyView(Text("Màn hình User List đang xây dựng..."))
            }
        })
    }

    @MainActor
        func makeTodoTimerView(for task: TodoItem) -> TodoTimerView {
            // SỬA LỖI Ở DÒNG NÀY: Khởi tạo đúng TodoTimerViewModel
            let viewModel = TodoTimerViewModel(task: task)
            return TodoTimerView(viewModel: viewModel)
        }
}
