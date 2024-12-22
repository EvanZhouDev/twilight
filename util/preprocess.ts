export default (raw: string) => {
	const source = raw.replaceAll(/\#.*/g, ""); // Remove comments
	return source.trim();
};
