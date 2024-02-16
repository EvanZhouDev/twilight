const removeEmptyLines = (rawSource) => {
	return rawSource
		.split("\n")
		.filter((x) => x !== "")
		.map((x) => x.trim())
		.join("\n");
};

const removeComments = (rawSource) => {
	return rawSource.replaceAll(/\#.*/g, "");
};

export default (rawSource) => {
	const source = removeComments(rawSource);
	return removeEmptyLines(source);
};
