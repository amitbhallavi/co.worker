const getId = (value) => {
    if (!value) return null
    return value._id || value
}

export const emitProjectStatusUpdate = (project, extra = {}) => {
    if (!global.io || !project) return

    const data = typeof project.toObject === "function" ? project.toObject() : project
    const clientId = getId(data.user)
    const freelancerUserId = getId(data.freelancer?.user)

    const payload = {
        projectId: String(data._id),
        status: data.status,
        project: data,
        ...extra,
    }

    if (clientId) {
        global.io.to(`user_${clientId}`).emit("status_update", payload)
    }

    if (freelancerUserId) {
        global.io.to(`user_${freelancerUserId}`).emit("status_update", payload)
    }
}
