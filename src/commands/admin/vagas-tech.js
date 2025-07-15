/**
 * Comando: vagas-tech
 * 
 * Este comando busca vagas de tecnologia a partir de palavras-chave como "python", "nodejs", "java", etc.
 * Ele realiza scraping de sites como:
 * - LinkedIn (Brasil)
 * - Workana (freelancer remoto)
 * - Freelancer.com (freelancer remoto)
 * - 99Freelas (remoto e freelance)
 * 
 * Para cada vaga encontrada, o bot retorna:
 * - Modalidade (Remoto, Híbrido, Presencial, ou estimado pelo site)
 * - Tecnologias (extraídas do texto da vaga)
 * - Salário (se estiver explícito)
 * - Link direto para a vaga
 * 
 * Uso:
 *    {prefix}vagas-tech <palavra-chave>
 * Exemplo:
 *    !vagas-tech react
 * 
 * @author braga2311
 */

const { PREFIX } = require(`${BASE_DIR}/config`);
const puppeteer = require("puppeteer");

module.exports = {
  name: "vagas-tech",
  description: "Busca vagas de tecnologia no LinkedIn e sites de freelancer.",
  commands: ["vagas-tech", "vagas-linkd"],
  usage: `${PREFIX}vagas-tech <tecnologia>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendMessage }) => {
    if (!args.length) {
      await sendMessage(`❌ Use: ${PREFIX}vagas-tech <tecnologia>\nEx: ${PREFIX}vagas-tech python`);
      return;
    }

    const keyword = args.join(" ");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    const scroll = async (page, times = 3) => {
      for (let i = 0; i < times; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await delay(800);
      }
    };

    const clean = (text) => text?.replace(/\s+/g, " ").trim() || "-";

    const extractJobs = (arr, limit = 5) => arr.slice(0, limit).map((job, i) =>
      `🔹 *${job.title}*\n📍 ${job.modalidade} | 💻 ${job.site}\n💼 ${job.company}\n💲 ${job.salario || "-"}\n🧪 ${job.tecnologias || "-"}\n🔗 ${job.link}`
    ).join("\n\n");

    async function getLinkedIn() {
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=Brasil`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await scroll(page, 3);

      return await page.$$eval(".jobs-search-results__list-item", items =>
        items.slice(0, 6).map(el => {
          const title = el.querySelector(".job-card-list__title")?.innerText;
          const company = el.querySelector(".job-card-container__company-name")?.innerText;
          const location = el.querySelector(".job-card-container__metadata-item")?.innerText || "";
          const modalidade = location.match(/Remoto|Híbrido|Presencial/i)?.[0] || location;
          const link = el.querySelector("a.job-card-list__title")?.href;

          return {
            site: "LinkedIn",
            title: title || "-",
            company: company || "-",
            modalidade,
            salario: "-",
            tecnologias: keyword,
            link
          };
        })
      );
    }

    async function getWorkana() {
      const url = `https://www.workana.com/jobs?category=it-programming&language=pt&query=${encodeURIComponent(keyword)}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await scroll(page, 2);

      return await page.$$eval(".project-item", items =>
        items.slice(0, 5).map(el => {
          const title = el.querySelector(".project-title")?.innerText;
          const desc = el.querySelector(".project-description")?.innerText || "";
          const link = el.querySelector("a.project-title")?.href;

          return {
            site: "Workana",
            title: clean(title),
            company: "-",
            modalidade: "Remoto",
            salario: desc.includes("R$") ? desc.match(/R\$\s?\d+[.,]?\d*/)?.[0] : "-",
            tecnologias: keyword,
            link
          };
        })
      );
    }

    async function getFreelancer() {
      const url = `https://www.freelancer.com/jobs/${encodeURIComponent(keyword)}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await scroll(page, 2);

      return await page.$$eval(".JobSearchCard-item", items =>
        items.slice(0, 5).map(el => {
          const title = el.querySelector(".JobSearchCard-primary-heading-link")?.innerText;
          const desc = el.querySelector(".JobSearchCard-primary-description")?.innerText;
          const link = el.querySelector("a.JobSearchCard-primary-heading-link")?.href;

          return {
            site: "Freelancer",
            title: clean(title),
            company: "-",
            modalidade: "Remoto",
            salario: desc.includes("$") ? desc.match(/\$\s?\d+/)?.[0] : "-",
            tecnologias: keyword,
            link
          };
        })
      );
    }

    async function get99Freelas() {
      const url = `https://www.99freelas.com.br/projects?search=${encodeURIComponent(keyword)}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await scroll(page, 2);

      return await page.$$eval(".project-box", items =>
        items.slice(0, 5).map(el => {
          const title = el.querySelector(".project-box-title")?.innerText;
          const desc = el.querySelector(".project-box-description")?.innerText;
          const link = el.querySelector("a")?.href;

          return {
            site: "99Freelas",
            title: clean(title),
            company: "-",
            modalidade: "Remoto",
            salario: desc.includes("R$") ? desc.match(/R\$\s?\d+[.,]?\d*/) || "-" : "-",
            tecnologias: keyword,
            link
          };
        })
      );
    }

    let allJobs = [];

    try {
      const [linkedin, workana, freelancer, freelas] = await Promise.all([
        getLinkedIn(),
        getWorkana(),
        getFreelancer(),
        get99Freelas()
      ]);

      allJobs = [...linkedin, ...workana, ...freelancer, ...freelas];
    } catch (err) {
      await sendMessage("❌ Erro ao buscar vagas. Tente novamente mais tarde.");
      console.error("Erro scraping:", err);
    }

    await browser.close();

    if (!allJobs.length) {
      await sendMessage(`❌ Nenhuma vaga encontrada para "${keyword}".`);
      return;
    }

    const resposta = `🎯 *Vagas para:* _${keyword}_\n\n${extractJobs(allJobs, 10)}`;
    await sendMessage(resposta);
  },
};
