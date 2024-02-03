import handleImports from "./handleImports.js";
import removeComments from "./removeComments.js";

let preprocess = (source) => {
    source = removeComments(source)
    source = handleImports(source)

    return source;
}

export default preprocess;