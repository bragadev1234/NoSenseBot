const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);
const { evaluate } = require("mathjs");

module.exports = {
  name: "calculadora",
  description: "Faz cálculos matemáticos, incluindo funções científicas.",
  commands: ["calculadora", "calc", "calcular", "math", "scientific"],
  usage: `${PREFIX}calculadora 2 + 2; sin(pi/2)`,

  handle: async ({ args, sendReply }) => {
    if (!args.length) {
      throw new DangerError(
        `Você precisa informar uma expressão matemática.\n\nExemplo: ${PREFIX}calculadora 2 + 2\nOperadores: + - * / ^ ( )`
      );
    }

    const rawExpression = args.join(" ");

    try {
      // Separar múltiplas expressões com ";"
      const expressions = rawExpression
        .split(";")
        .map(e => e.trim())
        .filter(e => e);

      if (!expressions.length) {
        throw new DangerError("Nenhuma expressão matemática encontrada.");
      }

      let reply = `🧮 *CALCULADORA AVANÇADA*\n\n`;

      for (let expr of expressions) {
        // Limpar caracteres inválidos
        const safeExpr = expr.replace(/[^0-9+\-*/^()., eEpiabsqrtlogsinctanexp]/gi, "");

        let result;
        try {
          result = evaluate(safeExpr);
        } catch {
          reply += `⚠️ Expressão inválida: ${expr}\n\n`;
          continue;
        }

        if (typeof result === "number" && isFinite(result)) {
          reply += `🔸 *Expressão:* ${expr}\n`;
          reply += `🔹 *Resultado:* ${result}\n\n`;
        } else {
          reply += `⚠️ Resultado indefinido: ${expr}\n\n`;
        }
      }

      reply += `_Cálculos finalizados_`;
      await sendReply(reply);

    } catch {
      throw new DangerError(
        "Erro ao calcular. Use apenas números, operadores + - * / ^, funções (sin, cos, tan, sqrt, log, abs, exp) e constantes (pi, e)."
      );
    }
  },
};
