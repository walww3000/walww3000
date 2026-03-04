import UIKit

protocol AddEventDelegate: AnyObject {
    func didAddEvent(_ event: CalendarEvent)
}

class AddEventViewController: UIViewController {

    weak var delegate: AddEventDelegate?
    var selectedDate: String = ""

    private let titleField: UITextField = {
        let field = UITextField()
        field.placeholder = "事件名称"
        field.borderStyle = .roundedRect
        field.translatesAutoresizingMaskIntoConstraints = false
        return field
    }()

    private let startTimeButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("开始时间", for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 15)
        button.layer.borderWidth = 1
        button.layer.borderColor = UIColor.systemGray4.cgColor
        button.layer.cornerRadius = 6
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()

    private let endTimeButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("结束时间", for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 15)
        button.layer.borderWidth = 1
        button.layer.borderColor = UIColor.systemGray4.cgColor
        button.layer.cornerRadius = 6
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()

    private let descriptionField: UITextView = {
        let tv = UITextView()
        tv.font = .systemFont(ofSize: 15)
        tv.layer.borderWidth = 1
        tv.layer.borderColor = UIColor.systemGray4.cgColor
        tv.layer.cornerRadius = 6
        tv.translatesAutoresizingMaskIntoConstraints = false
        return tv
    }()

    private let descriptionPlaceholder: UILabel = {
        let label = UILabel()
        label.text = "描述（可选）"
        label.font = .systemFont(ofSize: 15)
        label.textColor = .placeholderText
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private var startTime: String?
    private var endTime: String?

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    private func setupUI() {
        title = "添加事件"
        view.backgroundColor = .systemBackground

        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "取消", style: .plain, target: self, action: #selector(cancelTapped))
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "保存", style: .done, target: self, action: #selector(saveTapped))

        let timeStack = UIStackView(arrangedSubviews: [startTimeButton, endTimeButton])
        timeStack.axis = .horizontal
        timeStack.spacing = 8
        timeStack.distribution = .fillEqually
        timeStack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(titleField)
        view.addSubview(timeStack)
        view.addSubview(descriptionField)
        descriptionField.addSubview(descriptionPlaceholder)

        NSLayoutConstraint.activate([
            titleField.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            titleField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            titleField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            titleField.heightAnchor.constraint(equalToConstant: 44),

            timeStack.topAnchor.constraint(equalTo: titleField.bottomAnchor, constant: 16),
            timeStack.leadingAnchor.constraint(equalTo: titleField.leadingAnchor),
            timeStack.trailingAnchor.constraint(equalTo: titleField.trailingAnchor),
            timeStack.heightAnchor.constraint(equalToConstant: 44),

            descriptionField.topAnchor.constraint(equalTo: timeStack.bottomAnchor, constant: 16),
            descriptionField.leadingAnchor.constraint(equalTo: titleField.leadingAnchor),
            descriptionField.trailingAnchor.constraint(equalTo: titleField.trailingAnchor),
            descriptionField.heightAnchor.constraint(equalToConstant: 100),

            descriptionPlaceholder.topAnchor.constraint(equalTo: descriptionField.topAnchor, constant: 8),
            descriptionPlaceholder.leadingAnchor.constraint(equalTo: descriptionField.leadingAnchor, constant: 5),
        ])

        startTimeButton.addTarget(self, action: #selector(pickStartTime), for: .touchUpInside)
        endTimeButton.addTarget(self, action: #selector(pickEndTime), for: .touchUpInside)
        descriptionField.delegate = self
    }

    @objc private func pickStartTime() {
        showTimePicker { [weak self] time in
            self?.startTime = time
            self?.startTimeButton.setTitle(time, for: .normal)
        }
    }

    @objc private func pickEndTime() {
        showTimePicker { [weak self] time in
            self?.endTime = time
            self?.endTimeButton.setTitle(time, for: .normal)
        }
    }

    private func showTimePicker(completion: @escaping (String) -> Void) {
        let alert = UIAlertController(title: "选择时间", message: nil, preferredStyle: .actionSheet)

        let datePicker = UIDatePicker()
        datePicker.datePickerMode = .time
        datePicker.preferredDatePickerStyle = .wheels
        datePicker.locale = Locale(identifier: "zh_CN")

        alert.view.addSubview(datePicker)
        datePicker.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            datePicker.leadingAnchor.constraint(equalTo: alert.view.leadingAnchor),
            datePicker.trailingAnchor.constraint(equalTo: alert.view.trailingAnchor),
            datePicker.topAnchor.constraint(equalTo: alert.view.topAnchor, constant: 50),
            datePicker.heightAnchor.constraint(equalToConstant: 200),
        ])

        let height = NSLayoutConstraint(item: alert.view!, attribute: .height, relatedBy: .equal,
                                         toItem: nil, attribute: .notAnAttribute, multiplier: 1,
                                         constant: 330)
        alert.view.addConstraint(height)

        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            let formatter = DateFormatter()
            formatter.dateFormat = "HH:mm"
            completion(formatter.string(from: datePicker.date))
        })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))

        present(alert, animated: true)
    }

    @objc private func cancelTapped() {
        dismiss(animated: true)
    }

    @objc private func saveTapped() {
        guard let title = titleField.text, !title.isEmpty else {
            showAlert("请输入事件名称")
            return
        }
        guard let start = startTime else {
            showAlert("请选择开始时间")
            return
        }
        guard let end = endTime else {
            showAlert("请选择结束时间")
            return
        }

        let event = CalendarEvent(
            title: title,
            description: descriptionField.text ?? "",
            date: selectedDate,
            startTime: start,
            endTime: end
        )

        delegate?.didAddEvent(event)
        dismiss(animated: true)
    }

    private func showAlert(_ message: String) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "好", style: .default))
        present(alert, animated: true)
    }
}

extension AddEventViewController: UITextViewDelegate {
    func textViewDidChange(_ textView: UITextView) {
        descriptionPlaceholder.isHidden = !textView.text.isEmpty
    }
}
