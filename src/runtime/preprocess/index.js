import handleImports from "./handleImports.js";
import removeComments from "./removeComments.js";

const preprocess = (source) => {
	let newSource = removeComments(source);
	newSource = handleImports(newSource);

	return newSource;
};

export default preprocess;
