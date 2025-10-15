import { writeFileSync } from 'fs';
import { join } from 'path';
import { parseTranslationObject, type Translation } from "$i18n";
import { difference } from "es-toolkit";

interface ParsedArgs {
  trans: string[];
  main: string;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<ParsedArgs> = {};

  args.forEach(arg => {
    if (arg.startsWith("--trans=")) {
      const value = arg.split("=")[1];
      parsed.trans = value.split(",").map(s => s.trim()).filter(Boolean);
    }
    // else if (arg.startsWith("--main=")) {
    //   const value = arg.split("=")[1];
    //   parsed.main = value.trim();
    // }
  });

  if (!parsed.trans || parsed.trans.length === 0) {
    throw new Error("Missing or invalid --trans argument. Example: --trans=en,vi,ko");
  }

  // if (!parsed.main) {
  //   throw new Error("Missing or invalid --main argument. Example: --main=en");
  // }

  return parsed as ParsedArgs;
}

const main = async () => {
  try {
    const { trans } = parseArgs();

    const translations = await Promise.all<{ name: string, trans: Translation }>(
      trans.map(name => new Promise((resolve, reject) => {
        import(`./${name}`)
          .then(raw => resolve({ name, trans: parseTranslationObject(raw.default, {}) }))
          .catch(err => {
            throw new Error(err);
          });
      })));

    let hasError = false;

    translations.forEach((tran) => {
      console.info(`Checking translation ${tran.name}...`);

      const remains = translations.filter(item => item.name !== tran.name);

      for (const key of Object.keys(tran.trans)) {
        const tranObj = tran.trans[key];

        remains.forEach(innerTran => {
          if (!innerTran.trans[key]) {
            console.error(`tran file "${innerTran.name}" does not have key "${key}"`);
            hasError = true;
            return;
          } else {
            const innerTranObj = innerTran.trans[key];

            if (!innerTranObj.args && !tranObj.args) return;

            if (tranObj.args && !innerTranObj.args) {
              console.error(`tran file: "${innerTran.name}", key: "${key}" missing arguments`);
              hasError = true;
            } else if (!tranObj.args && innerTranObj.args) {
              console.error(`tran file "${tran.name}", key: "${key}" missing arguments`);
              hasError = true;
            } else {
              const tranObjArgs = [...tranObj.args!];
              const innerTranObjArgs = [...innerTranObj.args!];
              const diff1 = difference(tranObjArgs, innerTranObjArgs);
              const diff2 = difference(innerTranObjArgs, tranObjArgs);

              if (diff1.length) {
                console.error(`tran file "${innerTran.name}", key: "${key}" missing arguments "${diff1.toString()}"`);
                hasError = true;
              }
              if (diff2.length) {
                console.error(`tran file "${tran.name}", key: "${key}" missing arguments "${diff2.toString()}"`);
                hasError = true;
              }
            }
          }
        })
      }
    });

    if (hasError) return;

    console.info('writing to file...');

    // gen file
    const typeName = 'TranslationKey';
    const unionType = Object.keys(translations[0].trans).map(v => `| '${v}'`).join('\n');
    const fileContent = `export type ${typeName} = \n${unionType};\n`;

    const outputPath = join(__dirname, 'types.ts');

    // Write to file
    writeFileSync(outputPath, fileContent, 'utf8');

  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();

// Run the parser and display results


