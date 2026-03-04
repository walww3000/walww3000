package com.example.demo

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class CalendarEventTest {

    @Test
    fun createEvent() {
        val event = CalendarEvent(
            id = 1L,
            title = "Meeting",
            description = "Team sync",
            date = "2026-03-04",
            startTime = "09:00",
            endTime = "10:00"
        )
        assertEquals("Meeting", event.title)
        assertEquals("2026-03-04", event.date)
        assertEquals("09:00", event.startTime)
        assertEquals("10:00", event.endTime)
    }

    @Test
    fun eventsWithDifferentIdsAreNotEqual() {
        val e1 = CalendarEvent(id = 1L, title = "A", date = "2026-01-01", startTime = "08:00", endTime = "09:00")
        val e2 = CalendarEvent(id = 2L, title = "A", date = "2026-01-01", startTime = "08:00", endTime = "09:00")
        assertNotEquals(e1, e2)
    }
}
