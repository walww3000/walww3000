import UIKit

protocol EventCellDelegate: AnyObject {
    func eventCellDidTapDelete(_ cell: EventCell)
}

class EventCell: UITableViewCell {
    static let reuseIdentifier = "EventCell"

    weak var delegate: EventCellDelegate?

    private let colorBar: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor.systemBlue
        view.layer.cornerRadius = 2
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.font = .boldSystemFont(ofSize: 16)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private let timeLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 13)
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private let deleteButton: UIButton = {
        let button = UIButton(type: .system)
        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: .regular)
        button.setImage(UIImage(systemName: "trash", withConfiguration: config), for: .normal)
        button.tintColor = .systemRed
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()

    private let cardView: UIView = {
        let view = UIView()
        view.backgroundColor = .secondarySystemBackground
        view.layer.cornerRadius = 8
        view.layer.shadowColor = UIColor.black.cgColor
        view.layer.shadowOpacity = 0.1
        view.layer.shadowOffset = CGSize(width: 0, height: 1)
        view.layer.shadowRadius = 2
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupUI() {
        selectionStyle = .none
        backgroundColor = .clear
        contentView.addSubview(cardView)
        cardView.addSubview(colorBar)
        cardView.addSubview(titleLabel)
        cardView.addSubview(timeLabel)
        cardView.addSubview(deleteButton)

        NSLayoutConstraint.activate([
            cardView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 4),
            cardView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            cardView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            cardView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -4),

            colorBar.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 12),
            colorBar.centerYAnchor.constraint(equalTo: cardView.centerYAnchor),
            colorBar.widthAnchor.constraint(equalToConstant: 4),
            colorBar.heightAnchor.constraint(equalTo: cardView.heightAnchor, multiplier: 0.6),

            titleLabel.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 12),
            titleLabel.leadingAnchor.constraint(equalTo: colorBar.trailingAnchor, constant: 12),
            titleLabel.trailingAnchor.constraint(equalTo: deleteButton.leadingAnchor, constant: -8),

            timeLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            timeLabel.leadingAnchor.constraint(equalTo: titleLabel.leadingAnchor),
            timeLabel.trailingAnchor.constraint(equalTo: titleLabel.trailingAnchor),
            timeLabel.bottomAnchor.constraint(equalTo: cardView.bottomAnchor, constant: -12),

            deleteButton.centerYAnchor.constraint(equalTo: cardView.centerYAnchor),
            deleteButton.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -12),
            deleteButton.widthAnchor.constraint(equalToConstant: 36),
            deleteButton.heightAnchor.constraint(equalToConstant: 36),
        ])

        deleteButton.addTarget(self, action: #selector(deleteTapped), for: .touchUpInside)
    }

    func configure(with event: CalendarEvent) {
        titleLabel.text = event.title
        timeLabel.text = "\(event.startTime) - \(event.endTime)"
    }

    @objc private func deleteTapped() {
        delegate?.eventCellDidTapDelete(self)
    }
}
