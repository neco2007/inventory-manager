/// 必要なライブラリのインポート
import Papa from 'papaparse'
import { ref, onMounted } from 'vue'

const products = ref([])  // 商品データを格納する変数

// コンポーネントがマウントされたときに実行される処理
onMounted(() => {
  // aiueo.csv を public フォルダから取得
  fetch('/aiueo.csv')
    .then(response => response.text())  // テキストデータとして読み込む
    .then(csvData => {
      // PapaParse を使って CSV を解析
      Papa.parse(csvData, {
        header: true,         // CSV のヘッダーをデータとして使用
        skipEmptyLines: true, // 空行をスキップ
        complete: (results) => {
          products.value = results.data  // 解析したデータを products に格納
        }
      })
    })
})

