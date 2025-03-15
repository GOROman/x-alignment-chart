/**
 * IndexedDBを使用したローカルストレージ管理モジュール
 * 
 * このモジュールは、ユーザーの配置情報をブラウザのIndexedDBに保存し、
 * ページの再読み込み後も状態を維持できるようにします。
 */

import { AlignmentAnalysis } from "@/app/actions/analyze-tweets";
import { Placement } from "@/app/page";
import { logger } from "./logger";

/**
 * IndexedDBに保存されるユーザー配置情報のインターフェース
 * 
 * @property id - ユニークな配置ID
 * @property src - ユーザーのアバター画像URL
 * @property position - チャート上の位置情報
 * @property username - ユーザー名（オプション）
 * @property analysis - アラインメント分析結果（オプション）
 * @property isAiPlaced - AIによる配置かどうか（オプション）
 * @property timestamp - 配置のタイムスタンプ（ISO形式）
 */
export interface StoredPlacement {
    id: string;
    src: string;
    position: {
        x: number;
        y: number;
    };
    username?: string;
    analysis?: AlignmentAnalysis;
    isAiPlaced?: boolean;
    timestamp?: string; // ISO string
}

// IndexedDBの設定値
const DB_NAME = 'alignment-chart-db';
const DB_VERSION = 1;
const USERS_STORE = 'users';

/**
 * IndexedDBの状態管理用インターフェース
 * 
 * @property db - IndexedDBの接続インスタンス
 * @property isInitializing - 初期化中かどうかのフラグ
 * @property onInitialize - 初期化完了時に実行されるコールバック関数の配列
 */
interface IndexedDBInstance {
    db: IDBDatabase | null;
    isInitializing: boolean;
    onInitialize: Array<() => void>;
}

// IndexedDBのグローバルインスタンス
const indexedDB: IndexedDBInstance = {
    db: null,
    isInitializing: false,
    onInitialize: [],
};

/**
 * IndexedDBを初期化する関数
 * 
 * 以下の処理を行います：
 * 1. 既に初期化済みの場合は何もしない
 * 2. 初期化中の場合はコールバックを登録
 * 3. 新規初期化の場合はデータベースを作成し、ストアを設定
 * 
 * @returns 初期化の完了を示すPromise
 */
export function initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (indexedDB.db) {
            resolve();
            return;
        }

        if (indexedDB.isInitializing) {
            indexedDB.onInitialize.push(() => resolve());
            return;
        }

        indexedDB.isInitializing = true;

        if (!window.indexedDB) {
            console.error("Your browser doesn't support IndexedDB");
            indexedDB.isInitializing = false;
            reject(new Error("IndexedDB not supported"));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
            indexedDB.isInitializing = false;
            reject(new Error("Failed to open IndexedDB"));
        };

        request.onsuccess = (event) => {
            indexedDB.db = (event.target as IDBOpenDBRequest).result;
            indexedDB.isInitializing = false;

            indexedDB.onInitialize.forEach(callback => callback());
            indexedDB.onInitialize = [];

            resolve();
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(USERS_STORE)) {
                db.createObjectStore(USERS_STORE, { keyPath: 'id' });
            }
        };
    });
}

/**
 * ユーザーの配置情報をIndexedDBにキャッシュする
 * 
 * 既存のキャッシュをクリアし、新しい配置情報を保存します。
 * 各配置にはタイムスタンプが付与されます。
 * 
 * @param placements - キャッシュする配置情報の配列
 */
export async function cachePlacementsLocally(placements: Placement[]): Promise<void> {
    const stored_placements: StoredPlacement[] = placements.map((item) => ({
        id: item.id,
        src: item.src,
        position: item.position,
        username: item.username,
        analysis: item.analysis,
        isAiPlaced: item.isAiPlaced,
        timestamp: item.timestamp?.toISOString(),
    }));

    logger.debug("Saving users to IndexedDB", stored_placements);
    await initIndexedDB();

    if (!indexedDB.db) {
        throw new Error("IndexedDB not initialized");
    }

    return new Promise((resolve, reject) => {
        const transaction = indexedDB.db!.transaction([USERS_STORE], 'readwrite');
        const store = transaction.objectStore(USERS_STORE);

        // 既存のキャッシュをクリア
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            let remaining = placements.length;

            if (placements.length === 0) {
                resolve();
                return;
            }

            // 各配置を順番に保存
            stored_placements.forEach(placement => {
                const stored_placement: StoredPlacement = {
                    ...placement,
                    timestamp: placement.timestamp || new Date().toISOString()
                };

                const request = store.add(stored_placement);

                request.onsuccess = () => {
                    remaining--;
                    if (remaining === 0) {
                        resolve();
                    }
                };

                request.onerror = (event) => {
                    logger.error("Error adding placement to IndexedDB:", event);
                    reject(new Error("Failed to add placement to IndexedDB"));
                };
            });
        };

        clearRequest.onerror = (event) => {
            logger.error("Error clearing IndexedDB store:", event);
            reject(new Error("Failed to clear IndexedDB store"));
        };

        transaction.onerror = (event) => {
            logger.error("Transaction error:", event);
            reject(new Error("IndexedDB transaction failed"));
        };
    });
}

/**
 * 指定されたIDの配置情報をキャッシュから削除する
 * 
 * @param id - 削除する配置のID
 */
export async function removeCachedPlacement(id: string): Promise<void> {
    await initIndexedDB();
    if (!indexedDB.db) throw new Error("IndexedDB not initialized");

    return new Promise((resolve, reject) => {
        const transaction = indexedDB.db!.transaction([USERS_STORE], 'readwrite');
        const store = transaction.objectStore(USERS_STORE);

        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error("Error deleting user from IndexedDB:", event);
            reject(new Error("Failed to delete user from IndexedDB"));
        };
    });
}

/**
 * キャッシュされているすべての配置情報を読み込む
 * 
 * @returns キャッシュされている配置情報の配列
 */
export async function loadCachedPlacements(): Promise<StoredPlacement[]> {
    await initIndexedDB();
    if (!indexedDB.db) return [];

    return new Promise((resolve, reject) => {
        const transaction = indexedDB.db!.transaction([USERS_STORE], 'readonly');
        const store = transaction.objectStore(USERS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            const placements = request.result as StoredPlacement[];
            resolve(placements);
        };

        request.onerror = (event) => {
            console.error("Error loading users from IndexedDB:", event);
            reject(new Error("Failed to load users from IndexedDB"));
        };
    });
}

/**
 * ローカルキャッシュを完全にクリアする
 * 
 * すべての配置情報をIndexedDBから削除します。
 */
export async function clearLocalCache(): Promise<void> {
    await initIndexedDB();
    if (!indexedDB.db) return;

    return new Promise((resolve, reject) => {
        const transaction = indexedDB.db!.transaction([USERS_STORE], 'readwrite');
        const store = transaction.objectStore(USERS_STORE);
        const request = store.clear();

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error("Error clearing IndexedDB:", event);
            reject(new Error("Failed to clear IndexedDB"));
        };
    });
}
