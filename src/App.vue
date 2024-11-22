<script setup>
import { ref } from "vue";
import productsJson from "./api/data/products.json";

const products = ref([]);
const filteredProducts = ref([]);

const formatPrice = (price) => {
    const match = price.match(/(\d+(?:,\d+)?)/);
    return match ? `${parseFloat(match[1].replace(",", "."))}` : `${parseFloat(price)}`;
};

for (const product in productsJson) {
    for (const item in productsJson[product]) {
        const formattedItem = {
            produto: productsJson[product][item].produto,
            preco: formatPrice(productsJson[product][item].preco),
        };
        console.log(formattedItem);
        products.value.push(formattedItem);
    }
}

if (localStorage.getItem("products") === null) {
    localStorage.setItem("products", JSON.stringify(products.value));
}

const filterProducts = () => {
    const searchTerm = document.querySelector("input").value.toLowerCase();
    if (searchTerm.length >= 3) {
        filteredProducts.value = products.value.filter((product) =>
            product.produto.toLowerCase().includes(searchTerm)
        );
        localStorage.setItem(
            "filteredProducts",
            JSON.stringify(filteredProducts.value)
        );
    } else {
        filteredProducts = [];
    }
};
</script>

<template>
    <input
        type="text"
        v-model="searchTerm"
        placeholder="Search products..."
        @input="filterProducts"
    />
    <div v-if="filteredProducts.length === 0" class="product-grid">
        <div v-for="product in products" class="card">
            <h3>{{ product.produto }}</h3>
            <p>R$ {{ product.preco }}</p>
            <button @click="() => console.log(product.preco)">
                Learn More
            </button>
        </div>
    </div>
    <div v-else class="product-grid">
        <div v-for="product in filteredProducts" class="card">
            <h3>{{ product.produto }}</h3>
            <p>{{ product.preco }}</p>
            <button @click="() => console.log(product.preco)">
                Learn More
            </button>
        </div>
    </div>
</template>

<style scoped>
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
