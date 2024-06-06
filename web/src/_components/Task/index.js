import css from './style.module.scss';
import cls from '../../_util/cls';
import { motion } from 'framer-motion';
import {isDatePast,isDueToday} from '../../_util/date';


export default function Task ({
	complete,
	text,
	dueDate,
	onChange,
	...props
}) {
	//just in case 
	// const upcoming = "2024-06-07T20:11",
	// 	soon = "2024-06-06T20:11",
	// 	over = "2024-06-05T20:11";

	const _onChange = e => onChange(!!e.target.checked),
		overdue= isDatePast("2024-06-05T20:11"),
		dueToday= isDueToday("2024-06-05T20:11");

	console.log({overdue,dueToday})

	return (
		<motion.label
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={cls(css.task, {
				[css.checked]: complete,
			})}
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
				<span className={cls(css.dateText,{[css.overdue]:overdue,},{[css.upcoming]:!dueToday&&!overdue},{[css.soon]:dueToday})}>{"due"}</span>
			</div>
		</motion.label>
	);
}
