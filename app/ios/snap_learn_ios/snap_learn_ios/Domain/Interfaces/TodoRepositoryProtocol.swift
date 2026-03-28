import Foundation

public protocol TodoRepositoryProtocol {
    func saveTask(_ task: TodoItem) async throws
    func getTasks() async throws -> [TodoItem] // Chuẩn bị sẵn cho màn hình Home
}