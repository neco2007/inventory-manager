// lib/firebase-admin.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// サーバーサイドでのみ実行される初期化処理
const initializeFirebaseAdmin = () => {
  const apps = getApps();
  
  if (!apps.length) {
    // 環境変数から取得した認証情報でFirebase Adminを初期化
    // 本番環境では環境変数を使用すべき
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "kanrigamen-32823",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || undefined,
      }),
    });
  }

  return getFirestore();
};

export default initializeFirebaseAdmin;