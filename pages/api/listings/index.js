// pages/api/listings/index.js
import initializeFirebaseAdmin from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONSリクエスト（プリフライトリクエスト）への対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = initializeFirebaseAdmin();
    const listingsCollection = db.collection('listingCandidates');

    if (req.method === 'GET') {
      // 出品候補商品の一覧を取得
      const snapshot = await listingsCollection.orderBy('createdAt', 'desc').get();
      const listings = [];
      
      snapshot.forEach(doc => {
        listings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return res.status(200).json({ success: true, data: listings });
    }

    if (req.method === 'POST') {
      // APIキーの認証（簡易的な例）
      const apiKey = req.headers['x-api-key'];
      if (!apiKey || apiKey !== process.env.EXTENSION_API_KEY) {
        return res.status(401).json({ success: false, message: '認証に失敗しました' });
      }

      // 新しい出品候補商品を追加
      const newListing = {
        ...req.body,
        status: 'pending', // 初期ステータス
        createdAt: new Date().toISOString(),
        ngWordCheck: {
          passed: true,
          flaggedWords: []
        }
      };
      
      // NGワードチェック（管理サイト側の追加チェック）
      const ngWordsSnapshot = await db.collection('settings').doc('ngWords').get();
      const ngWords = ngWordsSnapshot.exists ? ngWordsSnapshot.data().words || [] : [];
      
      // 商品名と説明文からNGワードをチェック
      const itemName = newListing.cleanedTitle || '';
      const description = newListing.description || '';
      const combinedText = `${itemName} ${description}`.toLowerCase();
      
      const flaggedWords = ngWords.filter(word => 
        combinedText.includes(word.toLowerCase())
      );
      
      if (flaggedWords.length > 0) {
        newListing.ngWordCheck = {
          passed: false,
          flaggedWords
        };
      }
      
      // Firestoreに保存
      const docRef = await listingsCollection.add(newListing);
      
      return res.status(201).json({ 
        success: true, 
        data: {
          id: docRef.id,
          ...newListing
        }
      });
    }

    // サポートされていないメソッド
    return res.status(405).json({ success: false, message: 'メソッドが許可されていません' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}