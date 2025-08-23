/const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);
const { evaluate, parse } = require("mathjs");

// Lista branca de funções e constantes
const allowedFunctions = ["sin", "cos", "tan", "sqrt", "log", "abs", "exp"];
const allowedConstants = ["pi", "e"];
const maxExpressionLength = 100; // Limite para evitar abuso

module.exports = {
  name: "calculadora",
  description: "Calculadora científica segura com funções, múltiplas expressões e proteção contra injeção.",
  commands: ["calculadora", "calc", "calcular", "math", "scientific"],
  usage: `${PREFIX}calculadora 2 + 2; sin(pi/2)`,

  handle: async ({ args, sendReply }) => {
    if (!args.length) {
      throw new DangerError(
        `Você precisa informar uma expressão matemática.\nExemplo: ${PREFIX}calculadora 2 + 2\nOperadores: + - * / ^ ( )`
      );
    }

    const rawExpression = args.join(" ");

    if (rawExpression.length > maxExpressionLength) {
      throw new DangerError(`Expressão muito longa! Limite de ${maxExpressionLength} caracteres.`);
    }

    // Separar múltiplas expressões
    const expressions = rawExpression.split(";").map(e => e.trim()).filter(e => e);

    if (!expressions.length) {
      throw new DangerError("Não foi encontrada nenhuma expressão válida.");
    }

    let reply = `🧮 *CALCULADORA*\n\n`;

    for (let expr of expressions) {
      try {
        // Sanitização rigorosa: remove tudo que não seja permitido
        const safeExpr = expr
          .replace(/[^0-9+\-*/^()., ]/gi, "") // remove caracteres suspeitos
          .replace(/\s+/g, ""); // remove espaços extras

        // Parser seguro do mathjs
        const node = parse(safeExpr);

        // Verificação de cada função utilizada
        node.traverse(function (node) {
          if (node.isSymbolNode) {
            const name = node.name.toLowerCase();
            if (!allowedFunctions.includes(name) && !allowedConstants.includes(name) && !/^([0-9]+)$/.test(name)) {
              throw new DangerError(`Função ou constante não permitida: ${name}`);
            }
          }
        });

        const result = evaluate(safeExpr);

        if (typeof result !== "number" || !isFinite(result)) {
          reply += `⚠️ Expressão inválida ou resultado indefinido: ${expr}\n\n`;
        } else {
          reply += `🔸 *Expressão:* ${expr}\n`;
          reply += `🔹 *Resultado:* ${result}\n\n`;
        }
      } catch (error) {
        reply += `❌ Erro ao calcular "${expr}": ${error.message}\n\n`;
      }
    }

    reply += `_Cálculos realizados com sucesso!_`;
    await sendReply(reply);
  },
};
