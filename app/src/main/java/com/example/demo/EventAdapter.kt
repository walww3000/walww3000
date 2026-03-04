package com.example.demo

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView

class EventAdapter(
    private val onDelete: (CalendarEvent) -> Unit
) : ListAdapter<CalendarEvent, EventAdapter.EventViewHolder>(EventDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): EventViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_event, parent, false)
        return EventViewHolder(view)
    }

    override fun onBindViewHolder(holder: EventViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class EventViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle: TextView = itemView.findViewById(R.id.tvEventTitle)
        private val tvTime: TextView = itemView.findViewById(R.id.tvEventTime)
        private val btnDelete: ImageButton = itemView.findViewById(R.id.btnDelete)

        fun bind(event: CalendarEvent) {
            tvTitle.text = event.title
            tvTime.text = "${event.startTime} - ${event.endTime}"
            btnDelete.setOnClickListener { onDelete(event) }
        }
    }

    class EventDiffCallback : DiffUtil.ItemCallback<CalendarEvent>() {
        override fun areItemsTheSame(oldItem: CalendarEvent, newItem: CalendarEvent) =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: CalendarEvent, newItem: CalendarEvent) =
            oldItem == newItem
    }
}
