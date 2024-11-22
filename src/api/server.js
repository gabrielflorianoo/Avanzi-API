import fs from 'fs/promises';
import path from 'path';
import getDepartments from "./getDepartments.js";
import getCategories from "./getCategories.js";
import getProducts from "./getProducts.js";
import { createLogger } from 'logger'; // Assuming we have a logger module

// Creates an logger to dump information into a file with timestamps
const logger = createLogger('logger.txt');

/**
 * Creates a directory if it does not exist. If it does exist, does nothing.
 * @param {string} dirPath - The path to the directory to create.
 * @returns {Promise<void>} - A promise that resolves when the directory is created.
 */
async function createDirectoryIfNotExists(dirPath) {
    try {
        // Try to access the directory to see if it already exists
        await fs.access(dirPath, fs.constants.F_OK);
    } catch {
        // If the directory does not exist, create it
        await fs.mkdir(dirPath);
        // Log the creation of the directory
        logger.info(`Created directory: ${dirPath}`);
    }
}

/**
 * Reads a JSON file and parses its content.
 * @param {string} filePath - The path to the JSON file to read.
 * @returns {Promise<Object>} - A promise that resolves with the parsed JSON data.
 */
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Writes data to a JSON file.
 * @param {string} filePath - The path to the JSON file to write.
 * @param {Object} data - The data to write to the file.
 * @returns {Promise<void>} - A promise that resolves when the file is written.
 */
async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.info(`Wrote data to file: ${filePath}`);
    } catch (error) {
        logger.error(`Error writing file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Ensures that a data file exists at the given path.
 * If the file doesn't exist, creates it with the initial data.
 *
 * @param {string} filePath - The path to the data file.
 * @param {object} initialData - The initial data to be written to the file if it doesn't exist.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If there's an issue accessing or creating the file.
 */
async function ensureDataFileExists(filePath, initialData) {
    try {
        await fs.access(filePath, fs.constants.F_OK);
    } catch {
        await writeJsonFile(filePath, initialData);
    }
}

/**
 * Updates or creates category data based on the given categories.
 *
 * @param {Array<string>} categories - An array of category paths.
 * @param {string} categoryFile - The path to the file where category data will be stored.
 * @returns {object} The updated or newly created category data.
 * @throws {Error} If there's an issue reading or writing the JSON file.
 */
async function updateOrCreateCategoryData(categories, categoryFile) {
    const existingData = await readJsonFile(categoryFile);

    if (existingData && Object.keys(existingData).length > 0) {
        logger.info('Updating existing category data');
        return existingData;
    }

    logger.info('Creating new category data');
    const updatedData = {};

    for (const category of categories) {
        const categoryName = category.split('/').pop();
        if (!updatedData[categoryName]) {
            updatedData[categoryName] = await getProducts(category);
        }
    }

    await writeJsonFile(categoryFile, updatedData);
    return updatedData;
}

async function main() {
    const baseDir = path.join(process.cwd(), 'data');
    const departmentFile = path.join(baseDir, 'departments.json');
    const categoryFile = path.join(baseDir, 'categories.json');
    const productsFile = path.join(baseDir, 'products.json');
    const url = 'https://www.sitemercado.com.br/superavanzi/taruma-loja-vila-das-arvores-vila-das-arvores-avenida-dos-lirios/departamentos';

    await createDirectoryIfNotExists(baseDir);

    let departments;
    try {
        departments = await readJsonFile(departmentFile);
        if (departments.length === 0) {
            throw new Error('Departments file is empty');
        }
    } catch (error) {
        logger.info('Creating departments file...');
        departments = await getDepartments(url);
        await writeJsonFile(departmentFile, departments);
    }

    let categories;
    try {
        categories = await readJsonFile(categoryFile);
        if (categories.length === 0) {
            throw new Error('Categories file is empty');
        }
    } catch (error) {
        logger.info('Creating categories file...');
        categories = await getCategories(departments);
        categories = await updateOrCreateCategoryData(categories, categoryFile);
    }

    let products = {};
    try {
        products = await readJsonFile(productsFile);
        if (Object.keys(products).length === 0) {
            throw new Error('Products file is empty');
        } else {
            for (const category of categories) {
                const categoryName = category.split('/').pop();
                if (!products[categoryName]) {
                    products[categoryName] = await getProducts(category);
                    console.log("Writing category: ", categoryName, " to file...");
                    await writeJsonFile(productsFile, products);
                }
            }
        }
    } catch (error) {
        logger.info('Creating products file...');
        for (const category of categories) {
            const categoryName = category.split('/').pop();
            if (!products[categoryName]) {
                products[categoryName] = await getProducts(category);
            }
        }
        await writeJsonFile(productsFile, products);
    }

    logger.info('Data collection completed successfully');
}

main()
    .then(() => logger.info('Script execution completed'))
    .catch((error) => logger.error('Script execution failed:', error));