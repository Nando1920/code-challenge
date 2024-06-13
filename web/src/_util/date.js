export function isDatePast(date) {
	const dueDate = new Date(date);
	if (dueDate.getTime() < new Date().getTime()) {
		return true;
	}
	return false;
}
export function isDueToday(date) {
	const dueDate = new Date(date);
	if (dueDate.toLocaleDateString() === new Date().toLocaleDateString()) {
		return true;
	}

	return false;
}
