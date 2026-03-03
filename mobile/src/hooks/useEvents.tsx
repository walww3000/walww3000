import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  dateKey: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string;
  note: string;
}

interface EventsContextType {
  events: Record<string, CalendarEvent[]>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (dateKey: string, eventId: string) => void;
  getEventsForDate: (dateKey: string) => CalendarEvent[];
  hasEvents: (dateKey: string) => boolean;
}

const EventsContext = createContext<EventsContextType | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newEvent: CalendarEvent = { ...event, id };

    setEvents((prev) => ({
      ...prev,
      [event.dateKey]: [...(prev[event.dateKey] || []), newEvent],
    }));
  }, []);

  const deleteEvent = useCallback((dateKey: string, eventId: string) => {
    setEvents((prev) => {
      const dayEvents = (prev[dateKey] || []).filter((e) => e.id !== eventId);
      const next = { ...prev };
      if (dayEvents.length === 0) {
        delete next[dateKey];
      } else {
        next[dateKey] = dayEvents;
      }
      return next;
    });
  }, []);

  const getEventsForDate = useCallback(
    (dateKey: string) => {
      return (events[dateKey] || []).sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
    },
    [events],
  );

  const hasEvents = useCallback(
    (dateKey: string) => {
      return (events[dateKey] || []).length > 0;
    },
    [events],
  );

  return (
    <EventsContext.Provider
      value={{ events, addEvent, deleteEvent, getEventsForDate, hasEvents }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
