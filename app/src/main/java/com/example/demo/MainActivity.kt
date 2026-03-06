package com.example.demo

import android.app.TimePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.CalendarView
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.textfield.TextInputEditText
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val displayDateFormat = SimpleDateFormat("yyyy年M月d日", Locale.CHINA)

    private val allEvents = mutableListOf<CalendarEvent>()
    private lateinit var adapter: EventAdapter
    private lateinit var tvSelectedDate: TextView
    private lateinit var tvNoEvents: TextView
    private var selectedDate: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val calendarView = findViewById<CalendarView>(R.id.calendarView)
        tvSelectedDate = findViewById(R.id.tvSelectedDate)
        tvNoEvents = findViewById(R.id.tvNoEvents)
        val rvEvents = findViewById<RecyclerView>(R.id.rvEvents)
        val fabAdd = findViewById<FloatingActionButton>(R.id.fabAddEvent)

        // Init with today
        val today = Calendar.getInstance()
        selectedDate = dateFormat.format(today.time)
        tvSelectedDate.text = displayDateFormat.format(today.time)

        adapter = EventAdapter { event -> deleteEvent(event) }
        rvEvents.layoutManager = LinearLayoutManager(this)
        rvEvents.adapter = adapter

        calendarView.setOnDateChangeListener { _, year, month, dayOfMonth ->
            val cal = Calendar.getInstance().apply { set(year, month, dayOfMonth) }
            selectedDate = dateFormat.format(cal.time)
            tvSelectedDate.text = displayDateFormat.format(cal.time)
            refreshEvents()
        }

        fabAdd.setOnClickListener { showAddEventDialog() }

        refreshEvents()
    }

    private fun refreshEvents() {
        val filtered = allEvents
            .filter { it.date == selectedDate }
            .sortedBy { it.startTime }
        adapter.submitList(filtered)
        tvNoEvents.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun deleteEvent(event: CalendarEvent) {
        allEvents.removeAll { it.id == event.id }
        refreshEvents()
    }

    private fun showAddEventDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_event, null)
        val etTitle = dialogView.findViewById<TextInputEditText>(R.id.etEventTitle)
        val etStartTime = dialogView.findViewById<TextInputEditText>(R.id.etStartTime)
        val etEndTime = dialogView.findViewById<TextInputEditText>(R.id.etEndTime)
        val etDescription = dialogView.findViewById<TextInputEditText>(R.id.etEventDescription)

        etStartTime.setOnClickListener { pickTime(etStartTime) }
        etEndTime.setOnClickListener { pickTime(etEndTime) }

        AlertDialog.Builder(this)
            .setTitle(R.string.add_event)
            .setView(dialogView)
            .setPositiveButton(R.string.save) { _, _ ->
                val title = etTitle.text?.toString()?.trim() ?: ""
                val start = etStartTime.text?.toString()?.trim() ?: ""
                val end = etEndTime.text?.toString()?.trim() ?: ""
                val desc = etDescription.text?.toString()?.trim() ?: ""
                if (title.isNotEmpty() && start.isNotEmpty() && end.isNotEmpty()) {
                    allEvents.add(
                        CalendarEvent(
                            title = title,
                            description = desc,
                            date = selectedDate,
                            startTime = start,
                            endTime = end
                        )
                    )
                    refreshEvents()
                }
            }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun pickTime(target: TextInputEditText) {
        val cal = Calendar.getInstance()
        TimePickerDialog(this, { _, hour, minute ->
            target.setText(String.format(Locale.getDefault(), "%02d:%02d", hour, minute))
        }, cal.get(Calendar.HOUR_OF_DAY), cal.get(Calendar.MINUTE), true).show()
    }
}
