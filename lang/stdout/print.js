import format from "./format";
import deBrujinFlatten from "./deBrujinFlatten";
import isChurchNumeral from "util/isChurchNumeral";

export default (node, env, useColor = true) => {
	let result = format(node, [], useColor);
	if (env[deBrujinFlatten(node)]) {
		result += ` ≡ ${env[deBrujinFlatten(node)].join(" ≡ ")}`;
	}
	if (isChurchNumeral(node).isNumeral) {
		result += ` ≡ ${isChurchNumeral(node).numeral}`;
	}
	return result;
};
