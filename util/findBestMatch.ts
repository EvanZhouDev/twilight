import levenshtein from "fast-levenshtein";

export default (
	name: string,
	potential: string[],
	threshold = 5
): string | null => {
	let mostSimilarTerm = null;
	let minDistance = threshold;
	for (const term of potential) {
		const distance = levenshtein.get(name, term);
		if (distance < minDistance) {
			minDistance = distance;
			mostSimilarTerm = term;
		}
	}
	return mostSimilarTerm;
};
