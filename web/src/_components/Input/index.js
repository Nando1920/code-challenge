import { useState, useRef } from 'react';
import css from './style.module.scss';
import cls from '../../_util/cls';

export default function Input ({
	onFocusChange = () => {},
	onSubmit = () => {},
}) {
	const [hasFocus, _setHasFocus] = useState(false);
	const dateRef = useRef(null);
	const [openCal, _setOpenCal] = useState(true);
	const [dueDate, _setDueDate] = useState(null);


	const setHasFocus = v => {
		_setHasFocus(v);
		onFocusChange(v);
	};

	const onFocus = () => setHasFocus(true)
		, onBlur = e => setHasFocus(e.target.value.trim() !== '');

	const onInput = e => {
		const el = e.target;
		el.style.height = '';
		el.style.height = el.scrollHeight + 'px';
	};

	const onKeyPress = async e => {
		if (e.key !== 'Enter')
			return;

		e.preventDefault();
		await onSubmit(e.target.value, dueDate);
		e.target.value = '';
		_setDueDate(null)
		onInput(e);
		e.target.blur();
	};

	const onPaste = e => {
		e.preventDefault();
		e.target.value = (e.clipboardData || window.clipboardData)
			.getData('text')
			.replace(/\s+/g, ' ');
		onInput(e);
	};

	const setDate = (date) => _setDueDate(date !== ''? date : null)

	return (
		<div className={cls(css.wrap, {
			[css.focus]: hasFocus,
		})}>
			<textarea
				rows={1}
				className={css.input}
				onInput={onInput}
				placeholder="What's your task?"
				onFocus={onFocus}
				onBlur={onBlur}
				onKeyPress={onKeyPress}
				onPaste={onPaste}
			/>
			<div className={css.iconContainer}>
				
				<div onClick={()=>{ 
					_setHasFocus(true);
					if (openCal) {
						dateRef.current?.focus();
						dateRef.current?.showPicker();
					}
					_setOpenCal(!openCal);}} 
					
					className={cls(css.icon, {[css.iconFocus]: hasFocus,})}
				>
					<div className={cls(css.iconImg, {[css.iconImgFocus]: hasFocus,})}/>
				</div>
				
				
				<input
					ref={dateRef}
					type="datetime-local"
					style={{
					position: 'absolute',
					top: '100%',
					left: 0,
					height: 0,
					opacity: 0,
					}}
					onChange={(e) => {
						setDate(e.target.value)
					}}
					onBlur={(e) => {
						_setOpenCal(true)
						setDate(e.target.value)
					}}
				/>
			</div>
		</div>
	);
}
