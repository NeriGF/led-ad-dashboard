// led_ad_dashboard/src/pages/index.tsx

import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function Home() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [file, setFile] = useState(null);
  const [textAd, setTextAd] = useState('');

  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) setUser(currentUser);
    else setUser(null);
  });

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const uploadAd = async () => {
    if (file) {
      const storageReference = storageRef(storage, `ads/${file.name}`);
      await uploadBytes(storageReference, file);
      const url = await getDownloadURL(storageReference);
      await addDoc(collection(db, 'ads'), { type: 'image', url });
    } else if (textAd) {
      await addDoc(collection(db, 'ads'), { type: 'text', content: textAd });
    }
    alert('Ad uploaded!');
  };

  const fetchAds = async () => {
    const q = query(collection(db, 'ads'));
    const snapshot = await getDocs(q);
    setAds(snapshot.docs.map((doc) => doc.data()));
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {!user ? (
        <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded">
          Sign in with Google
        </button>
      ) : (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={logout} className="text-red-600">Sign out</button>

          <h2 className="text-xl mt-4">Upload Ad</h2>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <input
            type="text"
            placeholder="Or enter text ad"
            value={textAd}
            onChange={(e) => setTextAd(e.target.value)}
            className="border p-2 mt-2 w-full"
          />
          <button
            onClick={uploadAd}
            className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
          >
            Upload
          </button>

          <h2 className="text-xl mt-6">View Ads</h2>
          <button
            onClick={fetchAds}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            Fetch Ads
          </button>
          <ul className="mt-4">
            {ads.map((ad, i) => (
              <li key={i} className="mb-2">
                {ad.type === 'text' ? (
                  <p>{ad.content}</p>
                ) : (
                  <img src={ad.url} alt="ad" className="max-w-xs" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
