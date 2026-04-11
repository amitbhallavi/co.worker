import { X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { grantCredits } from '../features/admin/adminSlice'

const UpdateCreditsModal = ({ currentUser, handleModal }) => {

    const [credits, setCredits] = useState(0)


    const dispatch = useDispatch()


    const handleSubmit = (e) => {
        e.preventDefault()

        dispatch(grantCredits({ _id: currentUser._id, credits: credits }))

        handleModal()

    }




    return (
        <>
            <div className="fixed inset-0  bg-opacity-5 backdrop-blur-xs  bg-opacity-50 flex items-center justify-center z-50 p-4">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 relative">
                    <button
                        onClick={handleModal}
                        className="absolute right-6 top-6 text-gray-400 hover:text-gray-600  cursor-pointer "
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Update User Credits
                        </h2>
                        <p className="text-gray-500">
                            Adjust the credit balance for this user.
                        </p>
                    </div>

                    <div className="space-y-6">


                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                User Name
                            </label>
                            <div className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                            >
                                {currentUser?.name}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Current Credits
                            </label>
                            <input
                                type="text"
                                value={currentUser?.credits}
                                disabled
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                            >

                            </input>

                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                New Credits
                            </label>
                            <input
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                type="number"
                                placeholder="Enter amount"
                                required
                                className="w-full px-4 py-3 border-2 border-green-500 rounded-lg focus:outline-none focus:border-green-600 transition-colors"
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                type="button"
                                onClick={handleModal}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 cursor-pointer  "
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"

                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700   cursor-pointer  "
                            > Submit
                            </button>


                        </div>


                    </div>
                </form>
            </div>
            );






        </>
    )
}

export default UpdateCreditsModal
