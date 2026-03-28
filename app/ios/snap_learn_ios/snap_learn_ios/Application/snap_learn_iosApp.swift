//
//  snap_learn_iosApp.swift
//  snap_learn_ios
//
//  Created by Pham Van Le Bao on 28/3/26.
//

import SwiftUI

@main
struct snap_learn_iosApp: App {
    
    // 1. Khởi tạo DI Container duy nhất cho toàn bộ App
    let appDIContainer = AppDIContainer()
    
    var body: some Scene {
        WindowGroup {
            // 2. Nhờ DI Container tạo ra màn hình Home và đặt làm Root View
            appDIContainer.makeHomeView()
        }
    }
}
