import Foundation

public protocol AddTodoUseCaseProtocol {
    func execute(title: String, durationInMinutes: Int) async throws
}

public final class AddTodoUseCase: AddTodoUseCaseProtocol {
    private let repository: TodoRepositoryProtocol
    
    public init(repository: TodoRepositoryProtocol) {
        self.repository = repository
    }
    
    public func execute(title: String, durationInMinutes: Int) async throws {
        // Business Logic: Kiểm tra tính hợp lệ của dữ liệu trước khi lưu
        guard !title.trimmingCharacters(in: .whitespaces).isEmpty else {
            throw NSError(domain: "AddTodo", code: 1, userInfo: [NSLocalizedDescriptionKey: "Tên công việc không được để trống!"])
        }
        guard durationInMinutes > 0 else {
            throw NSError(domain: "AddTodo", code: 2, userInfo: [NSLocalizedDescriptionKey: "Thời gian phải lớn hơn 0 phút!"])
        }
        
        let newTask = TodoItem(title: title, durationInMinutes: durationInMinutes)
        try await repository.saveTask(newTask)
    }
}