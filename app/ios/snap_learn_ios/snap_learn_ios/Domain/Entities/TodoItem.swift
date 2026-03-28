import Foundation

public struct TodoItem: Identifiable, Equatable {
    public let id: UUID
    public let title: String
    public let durationInMinutes: Int
    
    public init(id: UUID = UUID(), title: String, durationInMinutes: Int) {
        self.id = id
        self.title = title
        self.durationInMinutes = durationInMinutes
    }
}