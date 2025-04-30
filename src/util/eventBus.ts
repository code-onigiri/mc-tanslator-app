// filepath: /home/codeonigiri/source/mc-translator-app/src/util/eventBus.ts
// イベントバス - コンポーネント間通信のためのシンプルな実装
type EventHandler = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventHandler[]>;

  constructor() {
    this.events = new Map();
  }

  // イベントリスナーを登録する
  on(event: string, callback: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }

  // 一度だけ実行されるイベントリスナーを登録する
  once(event: string, callback: EventHandler): void {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }

  // イベントリスナーを削除する
  off(event: string, callback?: EventHandler): void {
    if (!callback) {
      this.events.delete(event);
    } else {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.events.delete(event);
        }
      }
    }
  }

  // イベントを発火する
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...args);
      });
    }
  }
}

// シングルトンインスタンスをエクスポート
export const eventBus = new EventBus();

// イベント名の定数
export const REPLACE_EVENTS = {
  SKIP_CURRENT: 'replace:skip-current',
  REPLACE_CURRENT: 'replace:replace-current',
  CANCEL_REPLACE_MODE: 'replace:cancel-mode',
};