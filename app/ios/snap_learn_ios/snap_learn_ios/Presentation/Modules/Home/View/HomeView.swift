import SwiftUI

public struct HomeView: View {
    
    // Hàm xưởng (Factory) để tạo màn hình đích. 
    // HomeView không cần biết màn hình đích được khởi tạo với ViewModel hay Repository nào!
    let destinationFactory: (HomeRoute) -> AnyView
    
    public init(destinationFactory: @escaping (HomeRoute) -> AnyView) {
        self.destinationFactory = destinationFactory
    }
    
    public var body: some View {
        // Sử dụng NavigationStack (chuẩn mới từ iOS 16)
        NavigationStack {
            List {
                // Option 1: Điều hướng sang Todo App
                NavigationLink(value: HomeRoute.todoApp) {
                    HStack(spacing: 16) {
                        Image(systemName: "checklist")
                            .font(.title2)
                            .foregroundColor(.blue)
                            .frame(width: 30)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Todo & Pomodoro")
                                .font(.headline)
                            Text("Manage work and count time")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                // Option 2 (Ví dụ): Bạn có thể thêm các NavigationLink khác ở đây sau này
            }
            .navigationTitle("Home")
            // Đây là nơi bắt sự kiện khi NavigationLink được bấm vào
            .navigationDestination(for: HomeRoute.self) { route in
                // Gọi hàm factory để trả về màn hình tương ứng
                destinationFactory(route)
            }
        }
    }
}
