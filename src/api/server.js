import fs from 'fs';
import path from 'path';
import getDepartments from "./getDepartments.js";
import getCategories from "./getCategories.js";
import getProducts from "./getProducts.js";

const main = async () => {
    const baseDir = path.join(process.cwd(), 'data');
    const departmentFile = path.join(baseDir, 'departments.json');
    const categoryFile = path.join(baseDir, 'categories.json');
    const productsFile = path.join(baseDir, 'products.json');
    const url = 'https://www.sitemercado.com.br/superavanzi/taruma-loja-vila-das-arvores-vila-das-arvores-avenida-dos-lirios/departamentos';

    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }

    // Read department data
    let departments;
    try {
        departments = JSON.parse(fs.readFileSync(departmentFile, 'utf8'));
        if (departments.length === 0) {
            throw new Error('Departments file is empty');
        }
    } catch (error) {
        console.log('Creating departments file...');
        departments = await getDepartments(url);
        fs.writeFileSync(departmentFile, JSON.stringify(departments, null, 2));
    }

    // Read categories data
    let categories;
    try {
        categories = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
        if (categories.length === 0) {
            throw new Error('Departments file is empty');
        }
    } catch (error) {
        categories = [];
        console.log('Creating categories file...');
        for (const department of departments) {
            categories = [...categories, ...await getCategories(department)];
            fs.writeFileSync(categoryFile, JSON.stringify(categories, null, 2));
        }
    }

    // Read products data
    let products = {};
    try {
        products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        if (products.length === 0) {
            throw new Error('Products file is empty');
        } else {
            for (const category of categories) {
                const categoryName = category.split('/').pop();
                if (fs.existsSync(productsFile)) {
                    products = fs.readFileSync(productsFile, 'utf8');
                    if (products.length !== 0) {
                        if (JSON.parse(products)[categoryName] == null) {
                            products = {
                                ...JSON.parse(products),
                                [categoryName]: await getProducts(category),
                            }
                            fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
                        }
                    } else {
                        products = {
                            [categoryName]: await getProducts(category),
                        }
                        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
                    }
                }
            }
        }
    } catch (error) {
        console.log('Creating products file...');
        for (const category of categories) {
            const categoryName = category.split('/').pop();
            if (fs.existsSync(productsFile)) {
                products = fs.readFileSync(productsFile, 'utf8');
                if (products.length !== 0) {
                    products = {
                        ...JSON.parse(products),
                        [categoryName]: await getProducts(category),
                    }
                } else {
                    products = {
                        [categoryName]: await getProducts(category),
                    }
                }
            }
            fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
        }
    }
};

main().catch(console.error);