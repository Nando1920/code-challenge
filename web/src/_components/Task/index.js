import css from "./style.module.scss";
import cls from "../../_util/cls";
import { motion } from "framer-motion";
import { isDatePast, isDueToday } from "../../_util/date";
import { formatRelative } from "date-fns";

export default function Task({
	complete,
	text,
	dueDate,
	isDragged,
	setIsDragged,
	onChange,
	...props
}) {
	const overdue = isDatePast(dueDate),
		dueToday = isDueToday(dueDate);

	const _onChange = (e) => {
		onChange(!!e.target.checked);
	};

	const handleClick = (e) => {
		if (isDragged) {
			e.preventDefault();
			setIsDragged(false);
		}
	};

	return (
		<motion.label
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={cls(css.task, {
				[css.checked]: complete,
			})}
			onClick={handleClick}
			{...props}
		>
			<input
				type="checkbox"
				onChange={_onChange}
				defaultChecked={complete}
			/>
			<span className={css.check} />
			<div className={css.textContainer}>
				<span className={css.text}>{text}</span>
				{!complete && dueDate && (
					<span
						className={cls(
							css.dateText,
							{ [css.overdue]: overdue },
							{ [css.upcoming]: !dueToday && !overdue },
							{ [css.soon]: dueToday && !overdue }
						)}
					>
						{formatRelative(new Date(dueDate), new Date())}
					</span>
				)}
			</div>
		</motion.label>
	);
}
