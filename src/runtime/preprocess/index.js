import handleImports from "./handleImports.js";
import removeComments from "./removeComments.js";

const preprocess = (source, directory) => {
	let newSource = removeComments(source);
	newSource = handleImports(newSource, directory);

	return newSource;
};

export default preprocess;
