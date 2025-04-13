<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'

// 商品一覧を格納するref
const products = ref([])

onMounted(async () => {
  // CSVファイルを読み込み
  const response = await fetch('/aiueo.csv')
  const csvText = await response.text()

  // PapaParseでCSV解析
  Papa.parse(csvText, {
    header: true,
    complete: (results) => {
      products.value = results.data.map(item => ({
        name: item.商品名,
        price: Number(item.価格),
        stock: Number(item.在庫)
      }))
    }
  })
})
</script>

<template>
  <div class="p-8 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">商品一覧（CSVから読み込み）</h1>

    <ul v-if="products.length">
      <li v-for="(item, index) in products" :key="index" class="mb-2">
        <div class="border p-4 rounded shadow">
          <p class="font-semibold">{{ item.name }}</p>
          <p>価格：¥{{ item.price }}</p>
          <p>在庫：{{ item.stock }}</p>
        </div>
      </li>
    </ul>

    <p v-else class="text-gray-500">商品データを読み込み中…</p>
  </div>
</template>
