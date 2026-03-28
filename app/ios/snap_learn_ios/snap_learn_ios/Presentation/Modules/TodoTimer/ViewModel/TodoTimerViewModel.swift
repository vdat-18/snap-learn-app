import Foundation
import Combine

@MainActor
public final class TodoTimerViewModel: ObservableObject {
    
    // Vẫn nhận task vào để biết mình đang tính giờ cho công việc nào
    public let task: TodoItem
    
    // Đổi timeRemaining thành timeElapsed (thời gian đã trôi qua)
    @Published public var timeElapsed: Int = 0 // Bắt đầu từ 0 giây
    @Published public var isRunning: Bool = false
    
    private var timerCancellable: AnyCancellable?
    
    public init(task: TodoItem) {
        self.task = task
        // Khởi tạo bộ đếm bằng 0
        self.timeElapsed = 0
    }
    
    // MARK: - Format hiển thị (VD: "01:23")
    public var timeString: String {
        let minutes = timeElapsed / 60
        let seconds = timeElapsed % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
    
    // MARK: - Logic Đồng hồ
    public func startTimer() {
        guard !isRunning else { return }
        isRunning = true
        
        // Tạo Timer chạy mỗi giây và cộng dồn timeElapsed lên 1
        timerCancellable = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self = self else { return }
                self.timeElapsed += 1
            }
    }
    
    public func stopTimer() {
        guard isRunning else { return }
        isRunning = false
        // Huỷ timer để đồng hồ dừng lại
        timerCancellable?.cancel()
        timerCancellable = nil
    }
    
    // Nút Reset (nếu muốn làm lại từ đầu)
    public func resetTimer() {
        stopTimer()
        self.timeElapsed = 0
    }
}