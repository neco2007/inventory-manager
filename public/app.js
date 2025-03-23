// 編集モーダルを開く
function openEditModal(itemId) {
  const item = inventoryData.find(item => item._id === itemId);
  if (!item) return;
  
  // フォームに値をセット
  document.getElementById('editItemId').value = item._id;
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editUrl').value = item.url;
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editSellPrice').value = item.sellPrice;
  document.getElementById('editCondition').value = item.condition || '新品';
  document.getElementById('editStatus').value = item.status || '待機中';
  
  // NGワード警告表示
  const ngWordWarning = document.getElementById('ngWordWarning');
  if (item.containsNgWord && ngWordWarning) {
    ngWordWarning.style.display = 'block';
    if (item.matchedNgWords && item.matchedNgWords.length > 0) {
      ngWordWarning.innerHTML = `<i class="fas fa-exclamation-triangle"></i> NGワード「${item.matchedNgWords.join('", "')}」が含まれています`;
    }
  } else if (ngWordWarning) {
    ngWordWarning.style.display = 'none';
  }
  
  // モーダルを表示
  editModal.style.display = 'block';
}

// 編集モーダルを閉じる
function closeEditModal() {
  editModal.style.display = 'none';
}

// 商品を更新
async function updateItem(itemId, updatedData) {
  try {
    const response = await fetch(`${API_URL}/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!response.ok) {
      throw new Error('商品の更新に失敗しました');
    }
    
    const result = await response.json();
    
    // 商品データを更新
    const index = inventoryData.findIndex(item => item._id === itemId);
    if (index !== -1) {
      inventoryData[index] = result.item;
      filterItems(); // 表示を更新
    }
    
    // NGワードの警告があれば表示
    if (result.warning) {
      showWarning(result.warning + ' (' + result.matchedNgWords.join(', ') + ')');
    } else {
      showSuccess('商品が更新されました');
    }
    
    return true;
  } catch (error) {
    console.error('商品更新エラー:', error);
    showError(error.message);
    return false;
  }
}

// 商品削除の確認
function confirmDeleteItem(itemId) {
  const item = inventoryData.find(item => item._id === itemId);
  if (!item) return;
  
  if (confirm(`「${shortenText(item.title, 30)}」を削除してもよろしいですか？`)) {
    deleteItem(itemId);
  }
}

// 商品を削除
async function deleteItem(itemId) {
  try {
    const response = await fetch(`${API_URL}/${itemId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('商品の削除に失敗しました');
    }
    
    // 商品データから削除
    inventoryData = inventoryData.filter(item => item._id !== itemId);
    filterItems(); // 表示を更新
    
    showSuccess('商品が削除されました');
  } catch (error) {
    console.error('商品削除エラー:', error);
    showError(error.message);
  }
}

// 選択した商品を削除
function deleteSelectedItems() {
  const selectedCheckboxes = document.querySelectorAll('.select-item:checked');
  if (selectedCheckboxes.length === 0) {
    showError('削除する商品を選択してください');
    return;
  }
  
  if (confirm(`選択した ${selectedCheckboxes.length} 件の商品を削除してもよろしいですか？`)) {
    const deletePromises = [];
    
    selectedCheckboxes.forEach(checkbox => {
      const itemId = checkbox.dataset.id;
      deletePromises.push(deleteItem(itemId));
    });
    
    Promise.all(deletePromises).then(() => {
      selectAllCheckbox.checked = false;
    });
  }
}

// 在庫ファイル作成機能
function createInventoryFile() {
  // 現在のフィルタリング条件を取得
  const selectedItems = filteredData.filter(item => {
    const checkbox = document.querySelector(`.select-item[data-id="${item._id}"]`);
    return checkbox && checkbox.checked;
  });
  
  if (selectedItems.length === 0) {
    showWarning('在庫ファイルを作成する商品を選択してください');
    return;
  }
  
  // 実際の機能は実装されていないので仮の処理
  showSuccess(`${selectedItems.length}件の商品を含む在庫ファイルを作成しました`);
  
  // ここにファイル作成ロジックを実装
}

// タイトルのNGワードチェック
async function checkTitleForNgWords(title) {
  try {
    const response = await fetch('/api/check-ng-words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: title })
    });
    
    if (!response.ok) {
      throw new Error('NGワードチェックに失敗しました');
    }
    
    return await response.json();
  } catch (error) {
    console.error('NGワードチェックエラー:', error);
    return { containsNgWord: false, matchedWords: [] };
  }
}

// イベントリスナーの設定
function setupEventListeners() {
  // 更新ボタン
  if (refreshButton) {
    refreshButton.addEventListener('click', loadInventoryData);
  }
  
  // CSVダウンロードボタン
  if (downloadCsvButton) {
    downloadCsvButton.addEventListener('click', downloadCsv);
  }
  
  // 全選択チェックボックス
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      const checkboxes = document.querySelectorAll('.select-item');
      checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
      });
    });
  }
  
  // ステータスフィルター
  if (statusFilter) {
    statusFilter.addEventListener('change', filterItems);
  }
  
  // NGワードフィルターボタン
  if (ngWordFilterBtn) {
    ngWordFilterBtn.addEventListener('click', toggleNgWordFilter);
  }
  
  // 検索フィルター
  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
  }
  
  // NGワード再チェックボタン
  if (checkNgWordsButton) {
    checkNgWordsButton.addEventListener('click', recheckNgWords);
  }
  
  // 在庫ファイル作成ボタン
  if (createFileButton) {
    createFileButton.addEventListener('click', createInventoryFile);
  }
  
  // 選択削除ボタン
  if (deleteSelectedButton) {
    deleteSelectedButton.addEventListener('click', deleteSelectedItems);
  }
  
  // タイトル入力時のNGワードチェック
  const editTitleInput = document.getElementById('editTitle');
  if (editTitleInput) {
    editTitleInput.addEventListener('input', async () => {
      const title = editTitleInput.value;
      const ngWordWarning = document.getElementById('ngWordWarning');
      
      if (title.length > 2) { // 短すぎる場合はチェックしない
        const result = await checkTitleForNgWords(title);
        
        if (result.containsNgWord && ngWordWarning) {
          ngWordWarning.style.display = 'block';
          ngWordWarning.innerHTML = `<i class="fas fa-exclamation-triangle"></i> NGワード「${result.matchedWords.join('", "')}」が含まれています`;
        } else if (ngWordWarning) {
          ngWordWarning.style.display = 'none';
        }
      }
    });
  }
  
  // 編集フォーム送信
  if (editItemForm) {
    editItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const itemId = document.getElementById('editItemId').value;
      const updatedData = {
        title: document.getElementById('editTitle').value,
        url: document.getElementById('editUrl').value,
        price: parseFloat(document.getElementById('editPrice').value),
        sellPrice: parseFloat(document.getElementById('editSellPrice').value),
        condition: document.getElementById('editCondition').value,
        status: document.getElementById('editStatus').value
      };
      
      updateItem(itemId, updatedData).then(success => {
        if (success) {
          closeEditModal();
        }
      });
    });
  }
  
  // モーダルを閉じるボタン
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeEditModal);
  }
  
  const cancelButton = document.querySelector('.btn.cancel');
  if (cancelButton) {
    cancelButton.addEventListener('click', closeEditModal);
  }
  
  // モーダル外クリックで閉じる
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
  
  // ログアウトボタン
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      if (confirm('ログアウトしてもよろしいですか？')) {
        showSuccess('ログアウトしました');
        // 実際のログアウト処理はここに実装
      }
    });
  }
}

// 初期化
loadInventoryData();// 在庫管理システム - フロントエンドスクリプト

// DOM要素を定義（コードの最初で初期化）
const inventoryTable = document.getElementById('inventoryTable');
const inventoryItems = document.getElementById('inventoryItems');
const loadingIndicator = document.getElementById('loadingIndicator');
const noItemsMessage = document.getElementById('noItemsMessage');
const refreshButton = document.getElementById('refreshButton');
const downloadCsvButton = document.getElementById('downloadCsvButton');
const selectAllCheckbox = document.getElementById('selectAll');
const statusFilter = document.getElementById('statusFilter');
const ngWordFilterBtn = document.getElementById('ngWordFilterBtn');
const searchInput = document.getElementById('searchInput');
const createFileButton = document.getElementById('createFileButton');
const deleteSelectedButton = document.getElementById('deleteSelectedButton');
const checkNgWordsButton = document.getElementById('checkNgWordsButton');
const editModal = document.getElementById('editModal');
const editItemForm = document.getElementById('editItemForm');
const closeModalButton = document.querySelector('.close');

// API URL
const API_URL = '/api/inventory';

// 商品データを格納する配列
let inventoryData = [];
let filteredData = [];

// NGワードフィルター状態
let ngWordFilterActive = false;

// ページの読み込み完了後に実行
document.addEventListener('DOMContentLoaded', () => {
  // 商品データを読み込む
  loadInventoryData();
  
  // イベントリスナーの設定
  setupEventListeners();
});

// 商品データを読み込む
async function loadInventoryData() {
  try {
    showLoading(true);
    
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }
    
    inventoryData = await response.json();
    console.log('取得したデータ:', inventoryData); // データを確認
    filteredData = [...inventoryData];
    
    renderInventoryItems();
    showLoading(false);
    
    console.log('商品データを読み込みました:', inventoryData);
  } catch (error) {
    console.error('商品データの読み込みエラー:', error);
    showError(error.message);
    showLoading(false);
  }
}

// 商品リストを表示
function renderInventoryItems() {
  if (filteredData.length === 0) {
    inventoryTable.style.display = 'none';
    noItemsMessage.style.display = 'block';
    return;
  }
  
  inventoryTable.style.display = 'table';
  noItemsMessage.style.display = 'none';
  
  // テーブルの内容をクリア
  inventoryItems.innerHTML = '';
  
  // 商品データを表示
  filteredData.forEach((item, index) => {
    const row = document.createElement('tr');
    
    // 商品ステータスに応じたクラスを追加
    if (item.status === '処理中') {
      row.classList.add('processing');
    } else if (item.status === '完了') {
      row.classList.add('completed');
    }
    
    // NGワードを含む場合、警告スタイルを適用
    if (item.containsNgWord) {
      row.classList.add('ng-word-warning');
    }
    
    // 日付をフォーマット
    const createdDate = new Date(item.createdAt).toLocaleDateString('ja-JP');
    
    // タイトルの表示（NGワードがある場合は警告アイコンを追加）
    const titleDisplay = item.containsNgWord 
      ? `<span title="NGワード: ${item.matchedNgWords ? item.matchedNgWords.join(', ') : 'NGワード'}">${shortenText(item.title, 30)} ⚠️</span>` 
      : shortenText(item.title, 30);
    
    row.innerHTML = `
      <td><input type="checkbox" class="select-item" data-id="${item._id}"></td>
      <td>${index + 1}</td>
      <td>
        <a href="${item.url}" target="_blank" title="${item.url}">
          ${shortenUrl(item.url)}
        </a>
      </td>
      <td title="${item.title}">${titleDisplay}</td>
      <td>
        <span class="status status-${item.status === '待機中' ? 'pending' : 
                         item.status === '処理中' ? 'processing' : 'completed'}">
          ${item.status}
        </span>
      </td>
      <td>¥${item.price.toLocaleString()}</td>
      <td>¥${item.sellPrice.toLocaleString()}</td>
      <td>${createdDate}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${item._id}" title="編集">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" data-id="${item._id}" title="削除">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    inventoryItems.appendChild(row);
  });
  
  // 編集ボタンのイベントリスナーを設定
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = e.currentTarget.dataset.id;
      openEditModal(itemId);
    });
  });
  
  // 削除ボタンのイベントリスナーを設定
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = e.currentTarget.dataset.id;
      confirmDeleteItem(itemId);
    });
  });
}

// URLを短縮表示
function shortenUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const lastSegment = path.split('/').filter(Boolean).pop();
    return `${urlObj.hostname}/.../${lastSegment}`;
  } catch (error) {
    return url;
  }
}

// テキストを短縮表示
function shortenText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ロード中の表示切替
function showLoading(isLoading) {
  if (loadingIndicator) {
    if (isLoading) {
      loadingIndicator.style.display = 'flex';
      if (inventoryTable) inventoryTable.style.display = 'none';
      if (noItemsMessage) noItemsMessage.style.display = 'none';
    } else {
      loadingIndicator.style.display = 'none';
    }
  }
}

// エラーメッセージ表示
function showError(message) {
  showToast(message, 'error');
}

// 成功メッセージ表示
function showSuccess(message) {
  showToast(message, 'success');
}

// 警告メッセージ表示
function showWarning(message) {
  showToast(message, 'warning');
}

// トースト通知を表示
function showToast(message, type = 'info') {
  // 既存のトーストを削除
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // トースト要素を作成
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // ボディに追加
  document.body.appendChild(toast);
  
  // アニメーションのために少し待つ
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // 自動的に消える
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// 商品フィルタリング
function filterItems() {
  const statusValue = statusFilter.value;
  const searchValue = searchInput.value.toLowerCase();
  
  filteredData = inventoryData.filter(item => {
    // ステータスフィルター
    if (statusValue !== 'all' && item.status !== statusValue) {
      return false;
    }
    
    // NGワードフィルター
    if (ngWordFilterActive && !item.containsNgWord) {
      return false;
    }
    
    // 検索フィルター
    if (searchValue && !item.title.toLowerCase().includes(searchValue)) {
      return false;
    }
    
    return true;
  });
  
  renderInventoryItems();
}

// NGワードフィルターの切り替え
function toggleNgWordFilter() {
  ngWordFilterActive = !ngWordFilterActive;
  
  // ボタンのスタイル更新
  if (ngWordFilterActive) {
    ngWordFilterBtn.classList.add('active');
  } else {
    ngWordFilterBtn.classList.remove('active');
  }
  
  // フィルター適用
  filterItems();
}

// NGワード再チェック
async function recheckNgWords() {
  try {
    showLoading(true);
    
    const response = await fetch('/api/batch-check-ng-words', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('NGワードの再チェックに失敗しました');
    }
    
    const result = await response.json();
    
    // データを再読み込み
    await loadInventoryData();
    
    showSuccess(`NGワードの再チェックが完了しました。${result.updatedItems}件の商品が更新されました。`);
  } catch (error) {
    console.error('NGワード再チェックエラー:', error);
    showError(error.message);
  } finally {
    showLoading(false);
  }
}

// CSVダウンロード
function downloadCsv() {
  if (filteredData.length === 0) {
    showError('ダウンロードするデータがありません');
    return;
  }
  
  // CSVヘッダー
  const headers = [
    'タイトル',
    'URL',
    '仕入価格',
    '販売価格',
    '状態',
    'NGワード',
    'ステータス',
    '登録日'
  ];
  
  // CSVデータの作成
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  filteredData.forEach(item => {
    const createdDate = new Date(item.createdAt).toLocaleDateString('ja-JP');
    const row = [
      `"${item.title.replace(/"/g, '""')}"`, // タイトルにカンマや引用符があっても問題ないように処理
      `"${item.url}"`,
      item.price,
      item.sellPrice,
      item.condition,
      item.containsNgWord ? `"${item.matchedNgWords ? item.matchedNgWords.join(', ') : 'あり'}"` : 'なし',
      item.status,
      createdDate
    ];
    csvRows.push(row.join(','));
  });
  
  // CSVデータをBlobに変換
  const csvData = csvRows.join('\n');
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // ダウンロードリンクを作成
  const link = document.createElement('a');
  const today = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `inventory-${today}.csv`;
  
  // リンクをクリックしてダウンロード開始
  document.body.appendChild(link);
  link.click();
  
  // リンクを削除
  document.body.removeChild(link);
}