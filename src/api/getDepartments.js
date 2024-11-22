// Importa o módulo Puppeteer
import { launch } from 'puppeteer';

// Função assíncrona para fazer a raspagem
export default async function getDepartments(url) {
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
        await page.waitForSelector('#category-33');

        // Extrai todos os elementos <a> dentro do caminho especificado
        const hrefs = await page.evaluate(() => {
            const categoryLinks = [];

            document.querySelectorAll('li[id^="category-"]').forEach((category) => {
                const firstLink = category.querySelector('ul li a[href]');
                if (firstLink && firstLink.href) {
                    categoryLinks.push(firstLink.href);
                }
            });

            return categoryLinks;
        });

        return hrefs;
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await browser.close();
    }
}