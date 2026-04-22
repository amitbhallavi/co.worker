const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js"

let razorpayLoaderPromise = null

const getExistingCheckoutScript = () => {
    return document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`)
}

const createLoadError = () => {
    return new Error("Payment gateway could not load. Please disable ad blockers and try again.")
}

const resolveRazorpayInstance = (resolve, reject) => {
    if (window.Razorpay) {
        resolve(window.Razorpay)
        return
    }

    razorpayLoaderPromise = null
    reject(createLoadError())
}

export const loadRazorpayCheckout = () => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Payment gateway is only available in the browser."))
    }

    if (window.Razorpay) {
        return Promise.resolve(window.Razorpay)
    }

    if (razorpayLoaderPromise) {
        return razorpayLoaderPromise
    }

    razorpayLoaderPromise = new Promise((resolve, reject) => {
        const existingScript = getExistingCheckoutScript()

        const handleLoad = () => resolveRazorpayInstance(resolve, reject)
        const handleError = () => {
            razorpayLoaderPromise = null
            reject(createLoadError())
        }

        if (existingScript) {
            existingScript.addEventListener("load", handleLoad, { once: true })
            existingScript.addEventListener("error", handleError, { once: true })
            return
        }

        const script = document.createElement("script")
        script.src = RAZORPAY_CHECKOUT_URL
        script.async = true
        script.defer = true
        script.onload = handleLoad
        script.onerror = handleError
        document.body.appendChild(script)
    })

    return razorpayLoaderPromise
}

export default loadRazorpayCheckout
