<script>
import Papa from 'papaparse'

export default {
  data() {
    return {
      csvProducts: []  // CSVから読み込んだ商品
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          this.csvProducts = results.data.map(item => ({
            name: item.name || item.商品名,
            price: Number(item.price || item.価格),
            stock: Number(item.stock || item.在庫)
          }))
        }
      })
    }
  }
}
</script>
<template>
  <div>
    <h2>CSVから商品を読み込む</h2>
    <input type="file" @change="handleFileUpload" accept=".csv" />

    <ul>
      <li v-for="(product, index) in csvProducts" :key="index">
        {{ product.name }} - ¥{{ product.price }}（在庫: {{ product.stock }}）
      </li>
    </ul>
  </div>
</template>
