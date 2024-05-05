export interface StorageRepository {
  getItem(key: string): string | null;
  removeItem(key: string): boolean;
  setItem(ket: string, value: string): boolean;
};
