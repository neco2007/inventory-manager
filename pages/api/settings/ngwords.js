// pages/api/settings/ngwords.js
import initializeFirebaseAdmin from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONSリクエスト（プリフライトリクエスト）への対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = initializeFirebaseAdmin();
    const ngWordsDocRef = db.collection('settings').doc('ngWords');

    if (req.method === 'GET') {
      // NGワードリストを取得
      const docSnapshot = await ngWordsDocRef.get();
      
      if (!docSnapshot.exists) {
        return res.status(200).json({ success: true, data: { words: [] } });
      }
      
      return res.status(200).json({ 
        success: true, 
        data: docSnapshot.data() 
      });
    }

    // 以下はAPIキー認証が必要
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ success: false, message: '認証に失敗しました' });
    }

    if (req.method === 'POST') {
      // 新しいNGワードを追加
      const { word } = req.body;
      
      if (!word || typeof word !== 'string') {
        return res.status(400).json({ success: false, message: '無効なNGワードです' });
      }
      
      // ドキュメントが存在するか確認
      const docSnapshot = await ngWordsDocRef.get();
      
      if (!docSnapshot.exists) {
        // ドキュメントが存在しない場合は新規作成
        await ngWordsDocRef.set({ words: [word], updatedAt: new Date().toISOString() });
      } else {
        // 既存のワードリストに追加
        const currentData = docSnapshot.data();
        const words = currentData.words || [];
        
        // 重複チェック
        if (!words.includes(word)) {
          words.push(word);
          await ngWordsDocRef.update({ 
            words, 
            updatedAt: new Date().toISOString() 
          });
        }
      }
      
      // 更新後のデータを取得
      const updatedDoc = await ngWordsDocRef.get();
      
      return res.status(200).json({ 
        success: true, 
        message: 'NGワードを追加しました', 
        data: updatedDoc.data() 
      });
    }

    if (req.method === 'PUT') {
      // NGワードリスト全体を更新
      const { words } = req.body;
      
      if (!Array.isArray(words)) {
        return res.status(400).json({ success: false, message: '無効なNGワードリストです' });
      }
      
      // 重複を除去
      const uniqueWords = [...new Set(words)];
      
      await ngWordsDocRef.set({ 
        words: uniqueWords, 
        updatedAt: new Date().toISOString() 
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'NGワードリストを更新しました', 
        data: { words: uniqueWords } 
      });
    }

    // サポートされていないメソッド
    return res.status(405).json({ success: false, message: 'メソッドが許可されていません' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}