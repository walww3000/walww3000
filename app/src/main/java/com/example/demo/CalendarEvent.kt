package com.example.demo

data class CalendarEvent(
    val id: Long = System.currentTimeMillis(),
    val title: String,
    val description: String = "",
    val date: String,       // yyyy-MM-dd
    val startTime: String,  // HH:mm
    val endTime: String     // HH:mm
)
