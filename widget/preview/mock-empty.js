/* Both reports empty, rejecting the way Creator actually does. */
window.ZOHO = {
  CREATOR: {
    DATA: {
      getRecords: () => Promise.reject({ code: 9280, message: "No records found" }),
      updateRecordById: () => Promise.resolve({ code: 3000, data: { ID: "1" } }),
      addRecords: () => Promise.resolve({ code: 3000, data: { ID: "1" } }),
      invokeCustomApi: () => Promise.resolve({ code: 3000, result: { ok: true, sectionCount: 0 } }),
    },
    UTIL: { getInitParams: () => Promise.resolve({}) },
  },
};
