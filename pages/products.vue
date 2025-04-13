<script setup>
import { ref } from 'vue'
import Papa from 'papaparse'
import { addProduct } from '@/firebase/product'

const csvProducts = ref([])

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      const parsed = results.data.map(item => ({
        name: item.name || item.商品名,
        price: Number(item.price || item.価格),
        stock: Number(item.stock || item.在庫)
      }))

      csvProducts.value = parsed

      // Firebaseに登録
      for (const product of parsed) {
        if (product.name) {
          await addProduct(product)
        }
      }

      alert('Firebaseに追加しました！')
    }
  })
}
</script>

<template>
  <div>
    <h2>CSVから商品を読み込んでFirebaseに追加</h2>
    <input type="file" @change="handleFileUpload" accept=".csv" />
    <ul>
      <li v-for="(product, index) in csvProducts" :key="index">
        {{ product.name }} - ¥{{ product.price }}（在庫: {{ product.stock }}）
      </li>
    </ul>
  </div>
</template>
