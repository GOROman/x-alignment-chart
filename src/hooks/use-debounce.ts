/**
 * デバウンス処理用カスタムフック
 * 
 * 連続して発生するイベントの処理を遅延させ、
 * 最後のイベントが発生してから一定時間後に処理を実行します。
 * 例えば、リアルタイム検索やウィンドウリサイズの処理などに使用します。
 */

import { useEffect, useRef } from 'react';

// 任意の引数を受け取る関数型
type AnyFunction = (...args: any[]) => any;

/**
 * デバウンス処理を行うフック関数
 * 
 * @param callback - デバウンスさせたいコールバック関数
 * @param delay - デバウンスの遅延時間（ミリ秒）
 * @returns デバウンス処理が適用された新しい関数
 */
export function useDebounce<T extends AnyFunction>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    // コールバック関数を保持する参照
    const callbackRef = useRef<T>(callback);
    // タイマーを保持する参照
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // コールバックが変更されたときに参照を更新
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // コンポーネントのアンマウント時にタイマーをクリア
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // デバウンスされた関数を返却
    return (...args: Parameters<T>) => {
        // 既存のタイマーがあればクリア
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 新しいタイマーを設定
        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    };
} 