// pages/api/listings/[id].js
import initializeFirebaseAdmin from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONSリクエスト（プリフライトリクエスト）への対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ success: false, message: '無効なIDです' });
  }

  try {
    const db = initializeFirebaseAdmin();
    const docRef = db.collection('listingCandidates').doc(id);
    
    // ドキュメントの存在確認
    const docSnapshot = await docRef.get();
    
    if (!docSnapshot.exists) {
      return res.status(404).json({ success: false, message: '商品が見つかりません' });
    }

    if (req.method === 'GET') {
      // 特定の出品候補を取得
      return res.status(200).json({ 
        success: true, 
        data: {
          id: docSnapshot.id,
          ...docSnapshot.data()
        }
      });
    }

    // APIキーの認証
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.EXTENSION_API_KEY) {
      return res.status(401).json({ success: false, message: '認証に失敗しました' });
    }

    if (req.method === 'PUT') {
      // 出品候補の状態を更新
      const updateData = req.body;
      
      // 更新時刻を記録
      updateData.updatedAt = new Date().toISOString();
      
      await docRef.update(updateData);
      
      // 更新後のデータを取得
      const updatedDoc = await docRef.get();
      
      return res.status(200).json({ 
        success: true, 
        message: '更新しました', 
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    }

    if (req.method === 'DELETE') {
      // 出品候補を削除
      await docRef.delete();
      
      return res.status(200).json({ 
        success: true, 
        message: '削除しました',
        data: { id }
      });
    }

    // サポートされていないメソッド
    return res.status(405).json({ success: false, message: 'メソッドが許可されていません' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}