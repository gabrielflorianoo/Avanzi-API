<script setup>
import { ref } from "vue";
import productsJson from "./api/data/products.json";

const products = ref([]);
const searchTerm = ref('');

const formatPrice = (price) => {
    const match = price.match(/(\d+(?:,\d+)?)/);
    return match
        ? `${parseFloat(match[1].replace(",", "."))}`
        : `${parseFloat(price)}`;
};

if (localStorage.getItem("products") === null) {
    for (const product in productsJson) {
        for (const item in productsJson[product]) {
            const formattedItem = {
                produto: productsJson[product][item].produto,
                preco: formatPrice(productsJson[product][item].preco),
            };
            products.value.push(formattedItem);
        }
    }

    localStorage.setItem("products", JSON.stringify(products.value));
} else {
    products.value = JSON.parse(localStorage.getItem("products"));
}
</script>

<template>
    <input
        type="text"
        v-model="searchTerm"
        placeholder="Search products..."
    />
    <div class="product-grid">
        <div v-if="searchTerm.length >= 3" v-for="product in products.filter((product) => product.produto.toLowerCase().includes(searchTerm.toLowerCase()))" class="card">
            <h3>{{ product.produto }}</h3>
            <p>R$ {{ product.preco }}</p>
            <button @click="() => console.log(product.preco)">
                Learn More
            </button>
        </div>
        <div v-else v-for="product in products" class="card">
            <h3>{{ product.produto }}</h3>
            <p>R$ {{ product.preco }}</p>
            <button @click="() => console.log(product.preco)">
                Learn More
            </button>
        </div>
    </div>
</template>

<style scoped>
input {
    margin-bottom: 1rem;
    width: 80%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
}

.product-grid {
    gap: 2rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}

.card {
    display: grid;
    padding: 16px;
    max-width: 300px;
    min-height: 15rem;
    border-radius: 8px;
    background-color: #f8f9fa;
    justify-content: space-around;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
    margin-top: 0;
    color: #2c3e50;
}

p {
    display: flex;
    color: #34495e;
    line-height: 1.5;
}

button {
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 4px;
    background-color: #3498db;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #2980b9;
}
</style>
