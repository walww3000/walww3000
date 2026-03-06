import Foundation

struct CalendarEvent: Identifiable, Equatable {
    let id: UUID
    let title: String
    let description: String
    let date: String        // yyyy-MM-dd
    let startTime: String   // HH:mm
    let endTime: String     // HH:mm

    init(title: String, description: String = "", date: String, startTime: String, endTime: String) {
        self.id = UUID()
        self.title = title
        self.description = description
        self.date = date
        self.startTime = startTime
        self.endTime = endTime
    }
}
