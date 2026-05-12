export const emitAdminDataChanged = (type, payload = {}) => {
  if (!global.io) return

  global.io.to("admin_dashboard").emit("admin_data_changed", {
    type,
    timestamp: new Date().toISOString(),
    ...payload,
  })
}
