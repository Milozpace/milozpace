export type ReleaseFinding = { file: string; reason: string };

const forbidden: Array<{ reason: string; expression: RegExp }> = [
  { reason: "production service reference", expression: new RegExp("cloud" + "base|tencent" + "cloud|edge" + "one", "i") },
  { reason: "absolute Windows user path", expression: /[A-Z]:\\Users\\/i },
  { reason: "private credential variable", expression: new RegExp("BOKU_" + "OWNER_|SECRET_" + "KEY|PRIVATE_" + "KEY", "i") },
  { reason: "embedded private key", expression: new RegExp("BEGIN " + "(?:RSA |EC |OPENSSH )?PRIVATE KEY", "i") },
  { reason: "production domain", expression: new RegExp("miloz" + "pace\\.com", "i") },
];

export function scanForbiddenText(_file: string, text: string): string[] {
  return forbidden.filter(({ expression }) => expression.test(text)).map(({ reason }) => reason);
}
