import stdlib from "../stdlib.js";
import fs from 'fs';
import run from "../index.js";

let handleImports = (source) => {
    let env = {
        dynamic: {

        },
        static: {

        }
    }

    while (true) {
        let line = source.split("\n")[0];
        if (line.trim() === "" || line.trim().split(" ")[0] === "import") {
            for (let importFile of line.split(" ").slice(1)) {
                if (importFile.split(".").at(-1) === "twl") {
                    if (fs.existsSync(importFile)) {
                        try {
                            const fileContent = fs.readFileSync(importFile, 'utf8');
                            let newenv = run(fileContent);
                            env.static = {
                                ...env.static,
                                ...newenv.static
                            }
                            env.dynamic = {
                                ...env.dynamic,
                                ...newenv.dynamic
                            }
                        } catch (error) {
                            throw new Error(`Error reading file: ${error.message}`);
                        }
                    } else {
                        throw new Error(`File not found: ${importFile}`);
                    }
                } else {
                    if (stdlib.dynamic[importFile]) {
                        for (const [key, value] of Object.entries(stdlib.dynamic[importFile])) {
                            env.dynamic[key] = value;
                        }
                    } else if (stdlib.static[importFile]) {
                        for (const [key, value] of Object.entries(stdlib.static[importFile])) {
                            env.static[key] = value;
                        }
                    } else {
                        throw new Error(`No import ${importFile} found in standard library.`)
                    }
                }
            }
            source = source.split("\n").slice(1).join("\n")
        } else {
            break;
        }
    }

    return [source, env]
}

export default handleImports;