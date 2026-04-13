import React, { useEffect, useState } from 'react';
import { MapPin, MessageCircle, Heart, Share2, Mail, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFreelancer } from '../features/Freelancer/freelancerSlice';
import { Link, useParams } from 'react-router-dom';
import LoaderGradient from '../components/LoaderGradient';

// ✅ SAFE HELPER (MAIN FIX)
const getSkillsArray = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "string") return skills.split(',').map(s => s.trim());
    return [];
};

const FreelancerProfile = () => {
    const [isSaved, setIsSaved] = useState(false);

    const { freelancer, freelancerLoading, freelancerError, freelancerErrorMessage } =
        useSelector(state => state.freelancer);

    const { id } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if (id) dispatch(getFreelancer(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (freelancerError && freelancerErrorMessage) {
            toast.error(freelancerErrorMessage);
        }
    }, [freelancerError, freelancerErrorMessage]);

    if (freelancerLoading) return <LoaderGradient />;

    // ✅ SAFE DATA
    const profile = freelancer?.profile || {};
    const user = profile?.user || {};

    // ✅ FIXED (IMPORTANT)
    const works = Array.isArray(freelancer?.previousWorks)
        ? freelancer.previousWorks
        : [];

    const skills = getSkillsArray(profile?.skills);

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* PROFILE */}
                <div className="bg-white rounded-xl shadow p-6 flex gap-6 flex-wrap">

                    <div>
                        {user?.profilePic ? (
                            <img src={user.profilePic} className="w-24 h-24 rounded-full" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                                {user?.name?.[0] || 'F'}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{user?.name || 'Freelancer'}</h1>
                        <p className="text-blue-500">{profile?.category}</p>

                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-2"><Mail size={14} /> {user?.email}</p>
                            <p className="flex items-center gap-2"><Phone size={14} /> {user?.phone}</p>
                            <p className="flex items-center gap-2"><MapPin size={14} /> {user?.location || 'India'}</p>
                        </div>

                        <p className="mt-3 text-gray-500">
                            {profile?.description || 'No description'}
                        </p>

                        {/* BUTTONS */}
                        <div className="flex gap-2 mt-4">

                            <Link
                                to={`/chat/${user?._id}`}
                                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                <MessageCircle size={16} /> Contact
                            </Link>

                            <button
                                onClick={() => setIsSaved(!isSaved)}
                                className="border px-4 py-2 rounded"
                            >
                                {isSaved ? 'Saved' : 'Save'}
                            </button>

                            <Link
                                to={`/share/${user?._id}`}
                                className="border px-4 py-2 rounded flex items-center gap-2"
                            >
                                <Share2 size={16} /> Share
                            </Link>
                        </div>
                    </div>
                </div>

                {/* SKILLS */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-3">Skills</h2>

                    <div className="flex flex-wrap gap-2">
                        {skills.map((sk, i) => (
                            <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                {sk}
                            </span>
                        ))}

                        {skills.length === 0 && (
                            <span className="text-gray-400">No skills</span>
                        )}
                    </div>
                </div>

                {/* PORTFOLIO */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-3">Portfolio</h2>

                    {works.length === 0 ? (
                        <p className="text-gray-400">No projects</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {works.map((p) => (
                                <div key={p._id} className="border rounded-lg overflow-hidden">

                                    {p.projectImage && (
                                        <img src={p.projectImage} className="w-full h-40 object-cover" />
                                    )}

                                    <div className="p-3">
                                        <p className="text-sm text-gray-600">
                                            {p.projectDescription}
                                        </p>

                                        {p.projectLink && (
                                            <a
                                                href={p.projectLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 text-sm"
                                            >
                                                View Project
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default FreelancerProfile;