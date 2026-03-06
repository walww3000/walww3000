import UIKit

class MainViewController: UIViewController {

    private let calendarView: UICalendarView = {
        let cv = UICalendarView()
        cv.calendar = Calendar(identifier: .gregorian)
        cv.locale = Locale(identifier: "zh_CN")
        cv.translatesAutoresizingMaskIntoConstraints = false
        return cv
    }()

    private let dateLabel: UILabel = {
        let label = UILabel()
        label.font = .boldSystemFont(ofSize: 16)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private let addButton: UIButton = {
        let button = UIButton(type: .system)
        let config = UIImage.SymbolConfiguration(pointSize: 24, weight: .medium)
        button.setImage(UIImage(systemName: "plus.circle.fill", withConfiguration: config), for: .normal)
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()

    private let emptyLabel: UILabel = {
        let label = UILabel()
        label.text = "暂无事件"
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        label.font = .systemFont(ofSize: 15)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private let tableView: UITableView = {
        let tv = UITableView()
        tv.separatorStyle = .none
        tv.backgroundColor = .clear
        tv.translatesAutoresizingMaskIntoConstraints = false
        return tv
    }()

    private var selectedDate: String = ""
    private var displayEvents: [CalendarEvent] = []
    private let dateFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        return df
    }()
    private let displayFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "yyyy年M月d日"
        return df
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "日历事件"
        view.backgroundColor = .systemBackground
        setupUI()
        selectToday()
    }

    private func setupUI() {
        let selection = UICalendarSelectionSingleDate(delegate: self)
        calendarView.selectionBehavior = selection

        tableView.dataSource = self
        tableView.delegate = self
        tableView.register(EventCell.self, forCellReuseIdentifier: EventCell.reuseIdentifier)

        let headerStack = UIStackView(arrangedSubviews: [dateLabel, addButton])
        headerStack.axis = .horizontal
        headerStack.alignment = .center
        headerStack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(calendarView)
        view.addSubview(headerStack)
        view.addSubview(emptyLabel)
        view.addSubview(tableView)

        NSLayoutConstraint.activate([
            calendarView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            calendarView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 8),
            calendarView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -8),

            headerStack.topAnchor.constraint(equalTo: calendarView.bottomAnchor, constant: 8),
            headerStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            headerStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),

            addButton.widthAnchor.constraint(equalToConstant: 44),
            addButton.heightAnchor.constraint(equalToConstant: 44),

            emptyLabel.topAnchor.constraint(equalTo: headerStack.bottomAnchor, constant: 32),
            emptyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            tableView.topAnchor.constraint(equalTo: headerStack.bottomAnchor, constant: 8),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
        ])

        addButton.addTarget(self, action: #selector(addEventTapped), for: .touchUpInside)
    }

    private func selectToday() {
        let today = Date()
        selectedDate = dateFormatter.string(from: today)
        dateLabel.text = displayFormatter.string(from: today)

        let selection = calendarView.selectionBehavior as? UICalendarSelectionSingleDate
        let components = Calendar.current.dateComponents([.year, .month, .day], from: today)
        selection?.setSelected(components, animated: false)

        refreshEvents()
    }

    private func refreshEvents() {
        displayEvents = EventManager.shared.events(for: selectedDate)
        emptyLabel.isHidden = !displayEvents.isEmpty
        tableView.reloadData()
    }

    @objc private func addEventTapped() {
        let addVC = AddEventViewController()
        addVC.selectedDate = selectedDate
        addVC.delegate = self
        let nav = UINavigationController(rootViewController: addVC)
        present(nav, animated: true)
    }
}

// MARK: - UICalendarSelectionSingleDateDelegate
extension MainViewController: UICalendarSelectionSingleDateDelegate {
    func dateSelection(_ selection: UICalendarSelectionSingleDate, didSelectDate dateComponents: DateComponents?) {
        guard let components = dateComponents,
              let date = Calendar.current.date(from: components) else { return }
        selectedDate = dateFormatter.string(from: date)
        dateLabel.text = displayFormatter.string(from: date)
        refreshEvents()
    }
}

// MARK: - UITableViewDataSource & Delegate
extension MainViewController: UITableViewDataSource, UITableViewDelegate {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        displayEvents.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: EventCell.reuseIdentifier, for: indexPath) as! EventCell
        cell.configure(with: displayEvents[indexPath.row])
        cell.delegate = self
        return cell
    }
}

// MARK: - EventCellDelegate
extension MainViewController: EventCellDelegate {
    func eventCellDidTapDelete(_ cell: EventCell) {
        guard let indexPath = tableView.indexPath(for: cell) else { return }
        let event = displayEvents[indexPath.row]
        EventManager.shared.deleteEvent(id: event.id)
        refreshEvents()
    }
}

// MARK: - AddEventDelegate
extension MainViewController: AddEventDelegate {
    func didAddEvent(_ event: CalendarEvent) {
        EventManager.shared.addEvent(event)
        refreshEvents()
    }
}
