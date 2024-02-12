const ErrorType = {
	UNEXPECTED_TOKEN: "unexpectedToken",
};

const generateError = (errorType, line, character) => {
	return JSON.stringify({
		type: errorType,
		line,
		character,
	});
};

const parseError = (error) => {
	return JSON.parse(error);
};

export { generateError, parseError, ErrorType };

// TODO: GENERATE error: take an error type (enum), and error parameters, and creates a single string
// TODO: PARSE error: takes the stringified error, and creates back a json with all error data

// This way, we can still use native JS error (so that tests work), but when we are runnign in REPL or file-execution mode, we can use catch() to catch the error, and then parse the error to log with a custom logger.
