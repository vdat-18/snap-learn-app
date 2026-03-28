import Foundation

// Dùng actor để đảm bảo an toàn luồng (Thread-safe) khi đọc/ghi dữ liệu
public actor DefaultTodoRepository: TodoRepositoryProtocol {
    
    private var tasks: [TodoItem] = []
    
    public init() {}
    
    public func saveTask(_ task: TodoItem) async throws {
        tasks.append(task)
        print("✅ Đã lưu: \(task.title) - \(task.durationInMinutes) phút. Tổng: \(tasks.count) tasks.")
    }
    
    public func getTasks() async throws -> [TodoItem] {
        return tasks
    }
}
