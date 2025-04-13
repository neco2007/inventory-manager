<script setup>
import { ref } from 'vue'
import Papa from 'papaparse'

// 商品一覧
const csvProducts = ref([])

// ファイルアップロードハンドラー
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  Papa.parse(file, {
    header: true,
    complete: (results) => {
      const parsed = results.data.map(item => ({
        name: item.name || item.商品名,
        price: Number(item.price || item.価格),
        stock: Number(item.stock || item.在庫)
      }))
      csvProducts.value = parsed
    }
  })
}
</script>

<template>
  <div>
    <h1>CSVの商品一覧</h1>
    <input type="file" @change="handleFileUpload" accept=".csv" />
    
    <ul v-if="csvProducts.length">
      <li v-for="(product, index) in csvProducts" :key="index">
        {{ product.name }} - ¥{{ product.price }}（在庫: {{ product.stock }}）
      </li>
    </ul>
    
    <p v-else>商品がありません。CSVファイルをアップロードしてください。</p>
  </div>
</template>
