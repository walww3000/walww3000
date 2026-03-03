package com.calendar.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.EditText;
import android.widget.GridView;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public class MainActivity extends Activity {

    private TextView tvMonthYear;
    private TextView tvToday;
    private GridView gridCalendar;
    private LinearLayout eventContainer;

    private Calendar currentCalendar;
    private int selectedDay = -1;
    private CalendarAdapter adapter;
    private SharedPreferences prefs;

    private static final String PREFS_NAME = "calendar_events";
    private static final String[] WEEK_DAYS = {"日", "一", "二", "三", "四", "五", "六"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        currentCalendar = Calendar.getInstance();

        tvMonthYear = (TextView) findViewById(R.id.tv_month_year);
        tvToday = (TextView) findViewById(R.id.tv_today);
        gridCalendar = (GridView) findViewById(R.id.grid_calendar);
        eventContainer = (LinearLayout) findViewById(R.id.event_container);

        ImageButton btnPrev = (ImageButton) findViewById(R.id.btn_prev);
        ImageButton btnNext = (ImageButton) findViewById(R.id.btn_next);
        TextView btnAddEvent = (TextView) findViewById(R.id.btn_add_event);

        btnPrev.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                currentCalendar.add(Calendar.MONTH, -1);
                selectedDay = -1;
                updateCalendar();
            }
        });

        btnNext.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                currentCalendar.add(Calendar.MONTH, 1);
                selectedDay = -1;
                updateCalendar();
            }
        });

        tvToday.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                currentCalendar = Calendar.getInstance();
                selectedDay = currentCalendar.get(Calendar.DAY_OF_MONTH);
                updateCalendar();
            }
        });

        btnAddEvent.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (selectedDay == -1) {
                    Toast.makeText(MainActivity.this, "请先选择一个日期", Toast.LENGTH_SHORT).show();
                    return;
                }
                showAddEventDialog();
            }
        });

        gridCalendar.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                int day = adapter.getDayAt(position);
                if (day > 0) {
                    selectedDay = day;
                    adapter.notifyDataSetChanged();
                    showEventsForDay();
                }
            }
        });

        selectedDay = currentCalendar.get(Calendar.DAY_OF_MONTH);
        updateCalendar();
    }

    private void updateCalendar() {
        int year = currentCalendar.get(Calendar.YEAR);
        int month = currentCalendar.get(Calendar.MONTH);

        tvMonthYear.setText(String.format(Locale.CHINA, "%d年%d月", year, month + 1));

        adapter = new CalendarAdapter(year, month);
        gridCalendar.setAdapter(adapter);

        showEventsForDay();
    }

    private String getEventKey(int year, int month, int day) {
        return String.format(Locale.CHINA, "%d-%02d-%02d", year, month + 1, day);
    }

    private void showAddEventDialog() {
        int year = currentCalendar.get(Calendar.YEAR);
        int month = currentCalendar.get(Calendar.MONTH);
        String dateStr = String.format(Locale.CHINA, "%d年%d月%d日", year, month + 1, selectedDay);

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 24, 48, 0);

        TextView label = new TextView(this);
        label.setText("日期：" + dateStr);
        label.setTextSize(14);
        label.setTextColor(Color.parseColor("#666666"));
        layout.addView(label);

        final EditText input = new EditText(this);
        input.setHint("输入事件内容...");
        input.setTextSize(16);
        input.setPadding(0, 24, 0, 0);
        layout.addView(input);

        new AlertDialog.Builder(this)
                .setTitle("添加事件")
                .setView(layout)
                .setPositiveButton("保存", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        String text = input.getText().toString().trim();
                        if (!TextUtils.isEmpty(text)) {
                            saveEvent(text);
                            adapter.notifyDataSetChanged();
                            showEventsForDay();
                            Toast.makeText(MainActivity.this, "事件已保存", Toast.LENGTH_SHORT).show();
                        }
                    }
                })
                .setNegativeButton("取消", null)
                .show();
    }

    private void saveEvent(String text) {
        String key = getEventKey(
                currentCalendar.get(Calendar.YEAR),
                currentCalendar.get(Calendar.MONTH),
                selectedDay
        );
        Set<String> events = new HashSet<String>(prefs.getStringSet(key, new HashSet<String>()));
        events.add(text);
        prefs.edit().putStringSet(key, events).apply();
    }

    private void deleteEvent(String text) {
        String key = getEventKey(
                currentCalendar.get(Calendar.YEAR),
                currentCalendar.get(Calendar.MONTH),
                selectedDay
        );
        Set<String> events = new HashSet<String>(prefs.getStringSet(key, new HashSet<String>()));
        events.remove(text);
        if (events.isEmpty()) {
            prefs.edit().remove(key).apply();
        } else {
            prefs.edit().putStringSet(key, events).apply();
        }
    }

    private boolean hasEvents(int year, int month, int day) {
        String key = getEventKey(year, month, day);
        Set<String> events = prefs.getStringSet(key, null);
        return events != null && !events.isEmpty();
    }

    private void showEventsForDay() {
        eventContainer.removeAllViews();

        if (selectedDay == -1) {
            TextView hint = new TextView(this);
            hint.setText("请选择日期查看事件");
            hint.setTextSize(14);
            hint.setTextColor(Color.parseColor("#999999"));
            hint.setGravity(Gravity.CENTER);
            hint.setPadding(0, 32, 0, 0);
            eventContainer.addView(hint);
            return;
        }

        int year = currentCalendar.get(Calendar.YEAR);
        int month = currentCalendar.get(Calendar.MONTH);
        String key = getEventKey(year, month, selectedDay);
        Set<String> events = prefs.getStringSet(key, new HashSet<String>());

        String dateStr = String.format(Locale.CHINA, "%d月%d日 事件", month + 1, selectedDay);
        TextView dateLabel = new TextView(this);
        dateLabel.setText(dateStr);
        dateLabel.setTextSize(16);
        dateLabel.setTypeface(null, Typeface.BOLD);
        dateLabel.setTextColor(Color.parseColor("#333333"));
        dateLabel.setPadding(0, 0, 0, 16);
        eventContainer.addView(dateLabel);

        if (events.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("暂无事件，点击 + 添加");
            empty.setTextSize(14);
            empty.setTextColor(Color.parseColor("#999999"));
            empty.setPadding(0, 16, 0, 0);
            eventContainer.addView(empty);
        } else {
            for (final String event : events) {
                LinearLayout row = new LinearLayout(this);
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setGravity(Gravity.CENTER_VERTICAL);
                row.setPadding(16, 12, 16, 12);
                row.setBackgroundColor(Color.parseColor("#F0F4FF"));

                LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                );
                rowParams.setMargins(0, 8, 0, 8);
                row.setLayoutParams(rowParams);

                View dot = new View(this);
                LinearLayout.LayoutParams dotParams = new LinearLayout.LayoutParams(12, 12);
                dotParams.setMargins(0, 0, 16, 0);
                dot.setLayoutParams(dotParams);
                dot.setBackgroundColor(Color.parseColor("#4A90D9"));
                row.addView(dot);

                TextView tv = new TextView(this);
                tv.setText(event);
                tv.setTextSize(14);
                tv.setTextColor(Color.parseColor("#333333"));
                LinearLayout.LayoutParams tvParams = new LinearLayout.LayoutParams(
                        0, LinearLayout.LayoutParams.WRAP_CONTENT, 1
                );
                tv.setLayoutParams(tvParams);
                row.addView(tv);

                TextView deleteBtn = new TextView(this);
                deleteBtn.setText("删除");
                deleteBtn.setTextSize(12);
                deleteBtn.setTextColor(Color.parseColor("#FF4444"));
                deleteBtn.setPadding(16, 8, 16, 8);
                deleteBtn.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        new AlertDialog.Builder(MainActivity.this)
                                .setTitle("删除事件")
                                .setMessage("确定删除「" + event + "」？")
                                .setPositiveButton("删除", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface d, int w) {
                                        deleteEvent(event);
                                        adapter.notifyDataSetChanged();
                                        showEventsForDay();
                                    }
                                })
                                .setNegativeButton("取消", null)
                                .show();
                    }
                });
                row.addView(deleteBtn);

                eventContainer.addView(row);
            }
        }
    }

    private class CalendarAdapter extends BaseAdapter {
        private final List<Integer> days = new ArrayList<Integer>();
        private final int year;
        private final int month;
        private final int todayYear;
        private final int todayMonth;
        private final int todayDay;

        CalendarAdapter(int year, int month) {
            this.year = year;
            this.month = month;

            Calendar today = Calendar.getInstance();
            todayYear = today.get(Calendar.YEAR);
            todayMonth = today.get(Calendar.MONTH);
            todayDay = today.get(Calendar.DAY_OF_MONTH);

            for (int i = 0; i < 7; i++) {
                days.add(-1 - i);
            }

            Calendar cal = Calendar.getInstance();
            cal.set(year, month, 1);
            int firstDayOfWeek = cal.get(Calendar.DAY_OF_WEEK) - 1;
            int daysInMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH);

            for (int i = 0; i < firstDayOfWeek; i++) {
                days.add(0);
            }

            for (int i = 1; i <= daysInMonth; i++) {
                days.add(i);
            }

            while (days.size() % 7 != 0) {
                days.add(0);
            }
        }

        int getDayAt(int position) {
            if (position < 0 || position >= days.size()) return 0;
            return days.get(position);
        }

        @Override
        public int getCount() {
            return days.size();
        }

        @Override
        public Object getItem(int position) {
            return days.get(position);
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            TextView tv = new TextView(MainActivity.this);
            tv.setGravity(Gravity.CENTER);
            tv.setTextSize(15);

            int cellSize = parent.getWidth() / 7;
            tv.setMinHeight(cellSize > 0 ? (int) (cellSize * 0.9) : 100);

            int day = days.get(position);

            if (day < 0) {
                int idx = -(day + 1);
                tv.setText(WEEK_DAYS[idx]);
                tv.setTextColor(idx == 0 || idx == 6 ?
                        Color.parseColor("#FF6B6B") : Color.parseColor("#666666"));
                tv.setTypeface(null, Typeface.BOLD);
                tv.setTextSize(13);
            } else if (day == 0) {
                tv.setText("");
            } else {
                tv.setText(String.valueOf(day));

                boolean isToday = year == todayYear && month == todayMonth && day == todayDay;
                boolean isSelected = day == selectedDay;
                boolean hasEvent = hasEvents(year, month, day);

                Calendar cal = Calendar.getInstance();
                cal.set(year, month, day);
                int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
                boolean isWeekend = dayOfWeek == Calendar.SUNDAY || dayOfWeek == Calendar.SATURDAY;

                if (isSelected) {
                    tv.setBackgroundColor(Color.parseColor("#4A90D9"));
                    tv.setTextColor(Color.WHITE);
                    tv.setTypeface(null, Typeface.BOLD);
                } else if (isToday) {
                    tv.setBackgroundColor(Color.parseColor("#E8F0FE"));
                    tv.setTextColor(Color.parseColor("#4A90D9"));
                    tv.setTypeface(null, Typeface.BOLD);
                } else if (isWeekend) {
                    tv.setTextColor(Color.parseColor("#FF6B6B"));
                } else {
                    tv.setTextColor(Color.parseColor("#333333"));
                }

                if (hasEvent && !isSelected) {
                    String text = String.valueOf(day) + "\n·";
                    tv.setText(text);
                    tv.setLineSpacing(-8, 1);
                }
            }

            return tv;
        }
    }
}
