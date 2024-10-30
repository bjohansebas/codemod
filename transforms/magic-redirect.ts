import {
  API,
  FileInfo,
  CallExpression,
  expressionStatement,
  logicalExpression,
  callExpression,
  literal,
  memberExpression,
  identifier,
  ASTPath,
} from "jscodeshift";
import { getParsedFile } from "../utils/parse";

const unifiedMagicString = (path: ASTPath<CallExpression>) => {
  const pathArguments = path.value.arguments;
  if (
    pathArguments.length === 1 &&
    pathArguments[0].type === "StringLiteral" &&
    pathArguments[0].value === "back"
  ) {
    path.value.arguments = [
      logicalExpression(
        "||",
        callExpression(memberExpression(identifier("req"), identifier("get")), [
          identifier('"Referrer"'),
        ]),
        literal("/")
      ),
    ];

    return path;
  }
};

export default function transformer(file: FileInfo, _api: API) {
  const parsedFile = getParsedFile(file);

  parsedFile
    .find(CallExpression, {
      callee: {
        property: {
          name: "redirect",
        },
      },
    })
    .map(unifiedMagicString);
  parsedFile
    .find(CallExpression, {
      callee: {
        property: {
          name: "location",
        },
      },
    })
    .map(unifiedMagicString);

  return parsedFile.toSource();
}
