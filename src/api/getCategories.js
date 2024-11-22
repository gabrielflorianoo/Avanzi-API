// Importa o módulo Puppeteer
import { launch } from 'puppeteer';

// Função assíncrona para fazer a raspagem
export default async function getCategories(url) {
    // Lança o browser
    const browser = await launch({
        headless: true, // Executa em modo headless (sem abrir janela do browser)
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necessários para execução em Docker
    });

    try {
        // Cria uma nova página
        const page = await browser.newPage();

        // Navega até o site
        await page.goto(url);

        // Espera por um elemento específico (ajuste o seletor conforme necessário)
        await page.waitForSelector('.title-link-department');

        const hrefs = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('.title-link-department').forEach((element) => {
                const href = element.getAttribute('href');
                if (href) {
                    links.push('https://www.sitemercado.com.br' + href);
                }
            });
            return links;
        })

        return hrefs;
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await browser.close();
    }
}
