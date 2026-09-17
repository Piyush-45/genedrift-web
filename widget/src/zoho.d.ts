type ZohoResponse<T> = { code: number; data: T; message?: string; record_cursor?: string };
type ZohoCustomApiResponse = { code: number; result?: unknown; data?: unknown; message?: string };
type ZohoConfig = Record<string, unknown>;

interface ZohoCreatorSdk {
  DATA: {
    getRecords(config: ZohoConfig): Promise<ZohoResponse<Record<string, unknown>[]>>;
    updateRecordById(config: ZohoConfig): Promise<ZohoResponse<{ ID: string }>>;
    addRecords(config: ZohoConfig): Promise<ZohoResponse<{ ID: string }>>;
    invokeCustomApi(config: ZohoConfig): Promise<ZohoCustomApiResponse>;
  };
  UTIL: { getInitParams(): Promise<Record<string, unknown>> };
}

interface Window {
  ZOHO?: { CREATOR?: ZohoCreatorSdk };
}
