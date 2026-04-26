import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType, 
  getSessionDoc, 
  getApiKeysDoc, 
  getUserDoc,
  getSTimestamp
} from './firebase';
import { ChatSession } from '../types';

export const syncApiKeys = async (userId: string, keys: string[]) => {
  const path = `users/${userId}/config/apiKeys`;
  try {
    await setDoc(getApiKeysDoc(userId), {
      keys,
      updatedAt: getSTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const loadApiKeys = async (userId: string): Promise<string[]> => {
  const path = `users/${userId}/config/apiKeys`;
  try {
    const snap = await getDoc(getApiKeysDoc(userId));
    if (snap.exists()) {
      return snap.data().keys || [];
    }
    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
};

export const syncSession = async (userId: string, session: ChatSession) => {
  const path = `users/${userId}/sessions/${session.id}`;
  try {
    await setDoc(getSessionDoc(userId, session.id), {
      ...session,
      updatedAt: getSTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteSessionFromCloud = async (userId: string, sessionId: string) => {
  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    await deleteDoc(getSessionDoc(userId, sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToSessions = (userId: string, callback: (sessions: ChatSession[]) => void) => {
  const path = `users/${userId}/sessions`;
  const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const sessions: ChatSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push(doc.data() as ChatSession);
    });
    callback(sessions);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const createUserProfile = async (userId: string, email: string) => {
  const path = `users/${userId}`;
  try {
    await setDoc(getUserDoc(userId), {
      email,
      lastSynced: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
