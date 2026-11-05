const ensureStorageApi = (key: 'localStorage' | 'sessionStorage') => {
  const target = globalThis[key] as Storage | undefined;
  if (
    target &&
    typeof target.getItem === 'function' &&
    typeof target.setItem === 'function' &&
    typeof target.removeItem === 'function' &&
    typeof target.clear === 'function'
  ) {
    return;
  }

  const store = new Map<string, string>();
  const storageShim: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(itemKey: string) {
      return store.has(itemKey) ? store.get(itemKey)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(itemKey: string) {
      store.delete(itemKey);
    },
    setItem(itemKey: string, value: string) {
      store.set(itemKey, String(value));
    },
  };

  Object.defineProperty(globalThis, key, {
    value: storageShim,
    configurable: true,
    writable: true,
  });
};

ensureStorageApi('localStorage');
ensureStorageApi('sessionStorage');
