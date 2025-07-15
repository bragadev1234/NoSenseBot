const { PREFIX } = require(`${BASE_DIR}/config`);
const puppeteer = require("puppeteer");

const VALID_TECHS = ["python", "nodejs", "js", "c++", "c#", "java", "react", "angular"];

const SITES = {
  linkedin: async (page, keyword) => {
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=Brasil`;
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(r => setTimeout(r, 1000));
    const vagas = await page.$$eval(".jobs-search-results__list-item", nodes =>
      nodes.slice(0, 5).map(n => {
        const title = n.querySelector(".job-card-list__title")?.innerText.trim() || "";
        const company = n.querySelector(".job-card-container__company-name")?.innerText.trim() || "";
        const locRaw = n.querySelector(".job-card-container__metadata-item")?.innerText.trim() || "";
        const modalidad = locRaw.match(/Remoto|Híbrido|Presencial/i)?.[0] || locRaw;
        const link = n.querySelector("a.job-card-list__title")?.href || "";
        return { site: "LinkedIn", title, company, modalidad, link };
      })
    );
    return vagas;
  },

  workana: async (page, keyword) => {
    const url = `https://www.workana.com/jobs?category=it-programming&language=pt&query=${encodeURIComponent(keyword)}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    const vagas = await page.$$eval(".project-item", nodes =>
      nodes.slice(0, 5).map(n => {
        const title = n.querySelector(".project-title")?.innerText.trim() || "";
        const desc = n.querySelector(".project-description")?.innerText.trim() || "";
        const link = n.querySelector("a.project-title")?.href || "";
        return { site: "Workana", title, company: "-", modalidad: "Remoto", link, desc };
      })
    );
    return vagas;
  },

  freelancer: async (page, keyword) => {
    const url = `https://www.freelancer.com/jobs/${encodeURIComponent(keyword)}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    const vagas = await page.$$eval(".JobSearchCard-item", nodes =>
      nodes.slice(0, 5).map(n => {
        const title = n.querySelector(".JobSearchCard-primary-heading-link")?.innerText.trim() || "";
        const desc = n.querySelector(".JobSearchCard-primary-description")?.innerText.trim() || "";
        const link = n.querySelector("a.JobSearchCard-primary-heading-link")?.href || "";
        return { site: "Freelancer", title, company: "-", modalidad: "Remoto", link, desc };
      })
    );
    return vagas;
  },

  "99freelas": async (page, keyword) => {
    const url = `https://www.99freelas.com.br/projects?search=${encodeURIComponent(keyword)}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    const vagas = await page.$$eval(".project-box", nodes =>
      nodes.slice(0, 5).map(n => {
        const title = n.querySelector(".project-box-title")?.innerText.trim() || "";
        const desc = n.querySelector(".project-box-description")?.innerText.trim() || "";
        const link = n.querySelector("a")?.href || "";
        return { site: "99Freelas", title, company: "-", modalidad: "Remoto", link, desc };
      })
    );
    return vagas;
  }
};

module.exports = {
  name: "vagas-tech",
  description: "Busca vagas de tecnologia em LinkedIn e sites de freelancer",
  commands: ["vagas-tech", "vagas-linkd"],
  usage: `${PREFIX}vagas-tech <tecnologia>`,
  handle: async ({ args, sendMessage }) => {
    const keyword = args.join(" ").trim().toLowerCase();
    if (!VALID_TECHS.includes(keyword)) {
      return sendMessage(`❌ Tecnologia inválida. Use uma dessas: ${VALID_TECHS.join(", ")}`);
    }

    await sendMessage(`🔍 Buscando vagas de *${keyword}* em múltiplos sites...`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let allJobs = [];

    for (const [site, fn] of Object.entries(SITES)) {
      try {
        const jobs = await fn(page, keyword);
        allJobs = allJobs.concat(jobs);
      } catch (e) {
        console.error(`Erro ao buscar em ${site}:`, e);
      }
    }

    await browser.close();

    if (!allJobs.length) {
      return sendMessage("⚠️ Nenhuma vaga encontrada.");
    }

    const resposta = allJobs.map(job => `
🌐 *${job.site}*  
📌 *${job.title}*  
📍 ${job.modalidad || "Não informado"}  
🔗 ${job.link}
${job.desc ? `📝 ${job.desc.slice(0, 150)}...` : ""}
    `.trim()).join("\n\n");

    await sendMessage(`📄 *Resumo das vagas de "${keyword}":*\n\n${resposta}`);
  },
};
