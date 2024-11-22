import { launch } from 'puppeteer';

export default async function getProducts(url) {
    const browser = await launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto(url);

        // Wait for the main content container to load
        await page.waitForSelector('div.products-holder.products-view-body');

        // Function to scroll down and wait for new elements
        async function scrollAndWait() {
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            // Wait for new elements to appear
            await new Promise(function (resolve) {
                setTimeout(resolve, 250);
            });
        }

        let lastCount = 0;
        let hasMoreProducts = true;

        while (hasMoreProducts) {
            await scrollAndWait();

            const newProducts = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.list-product-link')).map(el => ({
                    produto: el.querySelector('div h3 a')?.textContent,
                    preco: el.querySelector('.area-preco div')?.innerText || null
                }));
            });

            const currentCount = newProducts.length;

            if (currentCount === lastCount) {
                hasMoreProducts = false;
            } else {
                lastCount = currentCount;
            }
        }

        // Get all products one last time
        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.list-product-link')).map(el => ({
                produto: el.querySelector('div h3 a')?.textContent || null,
                preco: el.querySelector('.area-preco div')?.innerText || null
            })).filter((e) => e.produto && e.preco);
        });

        return products;
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await browser.close();
    }
}
