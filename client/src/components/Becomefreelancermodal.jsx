import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { becomeFreelancerThunk, resetFreelancerSuccess, resetFreelancerError } from "../features/Freelancer/freelancerSlice"

// ── Also update auth user isFreelancer flag in Redux ──────
// Import your auth slice's updateUser action if you have one
// import { updateUser } from "../features/auth/authSlice"

const CATEGORIES = [
    "Web Development", "UI/UX Design", "Backend Dev", "Mobile Dev",
    "Data Science", "Full Stack", "WordPress", "Graphic Design",
    "Content Writing", "APPS DEVELOPER", "AI - ML DEVELOPER",
]

const SKILLS_LIST = [
    "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express",
    "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Python", "Django",
    "Flask", "PHP", "Laravel", "Flutter", "React Native", "Swift",
    "Kotlin", "Figma", "Adobe XD", "Tailwind CSS", "TypeScript",
    "GraphQL", "REST API", "Docker", "AWS", "WordPress", "Shopify",
]

// ═══════════════════════════════════════════════════════════
const BecomeFreelancerModal = ({ onClose, onSuccess }) => {
    
    const dispatch = useDispatch()
    const { freelancerLoading, freelancerSuccess, freelancerError, freelancerErrorMessage } =
        useSelector(state => state.freelancer)

    const [step, setStep] = useState(1)   // 1 = info, 2 = skills, 3 = success

    const [form, setForm] = useState({
        description: "",
        skills: [],        // array of selected skill strings
        category: "",
        experience: "",
    })

    const [errors, setErrors] = useState({})

    // ── Handle success from Redux ──
    useEffect(() => {
        if (freelancerSuccess && step === 1) {
            // Not from this modal — ignore
        }
    }, [])

    useEffect(() => {
        if (freelancerError && freelancerErrorMessage) {
            toast.error(freelancerErrorMessage)
            dispatch(resetFreelancerError())
        }
    }, [freelancerError, freelancerErrorMessage])

    // ── Toggle skill ──
    const toggleSkill = skill => {
        setForm(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }))
        setErrors(prev => ({ ...prev, skills: "" }))
    }

    // ── Validate step 1 ──
    const validateStep1 = () => {
        const errs = {}
        if (!form.description.trim()) {
            errs.description = "Description is required"
        } else if (form.description.trim().length < 20) {
            errs.description = "Description must be at least 20 characters"
        }
        if (!form.category) errs.category = "Please select a category"
        if (!form.experience || Number(form.experience) < 0) {
            errs.experience = "Please enter valid years of experience"
        }
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    // ── Validate step 2 ──
    const validateStep2 = () => {
        if (form.skills.length === 0) {
            setErrors({ skills: "Please select at least one skill" })
            return false
        }
        return true
    }

    // ── Submit ──
    const handleSubmit = async () => {
        if (!validateStep2()) return

        const payload = {
            description: form.description.trim(),
            skills: form.skills.join(", "),   // backend expects string
            category: form.category,
            experience: Number(form.experience),
        }

        try {
            await dispatch(becomeFreelancerThunk(payload)).unwrap()
            toast.success("🎉 Freelancer profile created successfully!")
            setStep(3)                    // show success step
            dispatch(resetFreelancerSuccess())
            if (onSuccess) onSuccess()   // notify parent to update UI
        } catch (err) {
            toast.error(typeof err === "string" ? err : err?.message || "Something went wrong")
        }
    }

    return (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>

            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "modalIn .3s cubic-bezier(.34,1.56,.64,1) both" }}>

                <style>{`
                    @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
                    @keyframes successPop { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
                    .success-pop { animation: successPop .5s cubic-bezier(.34,1.56,.64,1) both }
                `}</style>

                {/* ── Progress bar ── */}
                {step < 3 && (
                    <div className="h-1 bg-gray-100">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                            style={{ width: step === 1 ? "50%" : "100%" }} />
                    </div>
                )}

                {/* ── STEP 3: SUCCESS ── */}
                {step === 3 && (
                    <div className="px-8 py-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 success-pop">
                            🎉
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 mb-2">You're a Freelancer!</h2>
                        <p className="text-zinc-500 text-sm mb-6">Your profile is live. Clients can now find and hire you.</p>
                        <div className="flex flex-col gap-2">
                            {[
                                "✓ Profile visible to all clients",
                                "✓ You can now bid on projects",
                                "✓ Portfolio showcase unlocked",
                                "✓ Freelancer badge on your profile",
                            ].map(item => (
                                <div key={item} className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2 font-semibold">
                                    {item}
                                </div>
                            ))}
                        </div>
                        <button onClick={onClose}
                            className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm rounded-xl hover:opacity-90 transition cursor-pointer border-none">
                            Go to My Profile ↗
                        </button>
                    </div>
                )}

                {/* ── STEP 1: INFO ── */}
                {step === 1 && (
                    <>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 relative overflow-hidden">
                            <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-8 -right-6 pointer-events-none" />
                            <button onClick={onClose}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer border-none">
                                ✕
                            </button>
                            <div className="text-2xl mb-1">✦</div>
                            <h2 className="text-white font-black text-xl leading-tight">Become a Freelancer</h2>
                            <p className="text-blue-100 text-xs mt-1">Step 1 of 2 — Your profile info</p>
                        </div>

                        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2">
                                    Category <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button key={cat}
                                            onClick={() => { setForm(p => ({ ...p, category: cat })); setErrors(p => ({ ...p, category: "" })) }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                                                ${form.category === cat
                                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-md"
                                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                                                }`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                {errors.category && <p className="text-xs text-rose-600 mt-1 font-medium">⚠ {errors.category}</p>}
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2">
                                    Years of Experience <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number" min="0" max="50"
                                    value={form.experience}
                                    onChange={e => { setForm(p => ({ ...p, experience: e.target.value })); setErrors(p => ({ ...p, experience: "" })) }}
                                    placeholder="e.g. 3"
                                    className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm text-zinc-800 outline-none transition-all
                                        ${errors.experience ? "border-rose-400 focus:border-rose-400" : "border-gray-200 focus:border-blue-400"}`}
                                />
                                {errors.experience && <p className="text-xs text-rose-600 mt-1 font-medium">⚠ {errors.experience}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2">
                                    About You <span className="text-rose-500">*</span>
                                    <span className="ml-2 text-zinc-400 normal-case font-normal">(min 20 chars)</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, description: "" })) }}
                                    placeholder="Describe your expertise, what you do best, and what kind of projects you love..."
                                    className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm text-zinc-800 outline-none transition-all resize-none
                                        ${errors.description ? "border-rose-400 focus:border-rose-400" : "border-gray-200 focus:border-blue-400"}`}
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.description
                                        ? <p className="text-xs text-rose-600 font-medium">⚠ {errors.description}</p>
                                        : <span />
                                    }
                                    <span className={`text-xs ml-auto ${form.description.length < 20 ? "text-rose-400" : "text-emerald-500"}`}>
                                        {form.description.length}/20 min
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-5 pt-2 flex gap-3">
                            <button onClick={onClose}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition cursor-pointer border-none">
                                Cancel
                            </button>
                            <button onClick={() => { if (validateStep1()) setStep(2) }}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm rounded-xl hover:opacity-90 transition cursor-pointer border-none">
                                Next — Select Skills →
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP 2: SKILLS ── */}
                {step === 2 && (
                    <>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 relative overflow-hidden">
                            <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-8 -right-6 pointer-events-none" />
                            <button onClick={onClose}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer border-none">
                                ✕
                            </button>
                            <button onClick={() => setStep(1)}
                                className="absolute top-3 left-4 text-white/70 hover:text-white text-xs font-bold transition cursor-pointer border-none bg-transparent">
                                ← Back
                            </button>
                            <div className="text-2xl mb-1">🛠</div>
                            <h2 className="text-white font-black text-xl leading-tight">Select Your Skills</h2>
                            <p className="text-blue-100 text-xs mt-1">Step 2 of 2 — Choose all that apply</p>
                        </div>

                        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
                            {/* Selected count */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-zinc-500 font-medium">Select all that apply</p>
                                {form.skills.length > 0 && (
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                        {form.skills.length} selected ✓
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {SKILLS_LIST.map(skill => (
                                    <button key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                                            ${form.skills.includes(skill)
                                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-md"
                                                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                            }`}>
                                        {form.skills.includes(skill) ? "✓ " : ""}{skill}
                                    </button>
                                ))}
                            </div>

                            {errors.skills && (
                                <p className="text-xs text-rose-600 mt-3 font-medium">⚠ {errors.skills}</p>
                            )}

                            {/* Summary */}
                            {form.skills.length > 0 && (
                                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                    <p className="text-xs font-bold text-blue-600 mb-1.5">Your selected skills:</p>
                                    <p className="text-xs text-blue-700">{form.skills.join(" · ")}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-5 pt-2 flex gap-3">
                            <button onClick={() => setStep(1)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition cursor-pointer border-none">
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={freelancerLoading}
                                className={`flex-1 py-3 text-white font-bold text-sm rounded-xl transition border-none flex items-center justify-center gap-2
                                    ${freelancerLoading
                                        ? "bg-blue-300 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 cursor-pointer"
                                    }`}>
                                {freelancerLoading
                                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Activating...</>
                                    : "✦ Activate Now"
                                }
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default BecomeFreelancerModal