import SwiftUI

public struct TodoTimerView: View {
    
    @StateObject private var viewModel: TodoTimerViewModel
    
    public init(viewModel: TodoTimerViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }
    
    public var body: some View {
        VStack(spacing: 40) {
            // 1. Tiêu đề công việc
            Text(viewModel.task.title)
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            // 2. Đồng hồ đếm tới (Hình tròn)
            ZStack {
                Circle()
                    .stroke(lineWidth: 15)
                    .opacity(0.3)
                    .foregroundColor(viewModel.isRunning ? .blue : .gray) // Đổi sang màu xanh dương cho khác Pomodoro
                
                Text(viewModel.timeString)
                    .font(.system(size: 70, weight: .bold, design: .monospaced))
                    .foregroundColor(viewModel.isRunning ? .blue : .primary)
            }
            .frame(width: 250, height: 250)
            .padding()
            
            // 3. Cụm nút bấm
            HStack(spacing: 30) {
                if !viewModel.isRunning {
                    // Nút BẮT ĐẦU (hoặc TIẾP TỤC)
                    Button(action: { viewModel.startTimer() }) {
                        Text(viewModel.timeElapsed == 0 ? "Start" : "Resume") // Nếu đang đếm dở thì hiện "Resume"
                            .font(.title2).bold()
                            .frame(width: 120, height: 50)
                            .foregroundColor(.white).background(Color.green).cornerRadius(25)
                    }
                } else {
                    // Nút DỪNG LẠI (Stop)
                    Button(action: { viewModel.stopTimer() }) {
                        Text("Stop")
                            .font(.title2).bold()
                            .frame(width: 120, height: 50)
                            .foregroundColor(.white).background(Color.red).cornerRadius(25)
                    }
                }
                
                // Nút Reset chỉ hiện ra khi đồng hồ đang dừng VÀ thời gian đã chạy lớn hơn 0
                if !viewModel.isRunning && viewModel.timeElapsed > 0 {
                    Button(action: { viewModel.resetTimer() }) {
                        Image(systemName: "arrow.counterclockwise")
                            .font(.title2).bold()
                            .frame(width: 50, height: 50)
                            .foregroundColor(.primary).background(Color.gray.opacity(0.2)).clipShape(Circle())
                    }
                }
            }
            Spacer()
        }
        .padding(.top, 50)
        .navigationTitle("Stopwatch") // Đổi tên tiêu đề
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear { viewModel.stopTimer() }
    }
}