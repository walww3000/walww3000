import Foundation

class EventManager {
    static let shared = EventManager()

    private(set) var events: [CalendarEvent] = []

    private init() {}

    func addEvent(_ event: CalendarEvent) {
        events.append(event)
    }

    func deleteEvent(id: UUID) {
        events.removeAll { $0.id == id }
    }

    func events(for date: String) -> [CalendarEvent] {
        events
            .filter { $0.date == date }
            .sorted { $0.startTime < $1.startTime }
    }
}
