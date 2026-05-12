import mongoose from "mongoose"

const platformSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "Platform is under maintenance. Please try again later." },
    },
    registrations: {
      enabled: { type: Boolean, default: true },
    },
    bidSystem: {
      enabled: { type: Boolean, default: true },
    },
    paymentGateway: {
      enabled: { type: Boolean, default: true },
    },
    fraudDetection: {
      enabled: { type: Boolean, default: true },
      sensitivity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    },
    customMessage: {
      type: String,
      default: null,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

// Ensure only one document exists
platformSettingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne()
  if (!settings) {
    settings = new this({})
    await settings.save()
  }
  return settings
}

const PlatformSettings = mongoose.model("PlatformSettings", platformSettingsSchema)

export default PlatformSettings
