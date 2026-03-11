import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    image: string;
    bio?: string;
    socials?: {
        github?: string;
        linkedin?: string;
        email?: string;
    };
}

const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: 'Vaidehi Pathak',
        role: 'Team Lead (3rd Year)',
        image: '/src/assets/team/vaidehi.jpg',
        socials: {
            github: 'https://github.com/vaidehipathak',
            linkedin: 'https://www.linkedin.com/in/vaidehi-pathak-b6610a28b/',
            email: 'vaidehi.17814@sakec.ac.in',
        },
    },
    {
        id: 2,
        name: 'Om Mehta',
        role: 'Developer (2nd Year)',
        image: '/src/assets/team/om.png',
        socials: {
            github: 'https://github.com/Om-Mehta-143',
            linkedin: 'https://linkedin.com/in/om-vivek-mehta',
            email: 'om.mehta24@sakec.ac.in',
        },
    },
    {
        id: 3,
        name: 'Neel Pasad',
        role: 'Developer (2nd Year)',
        image: '/src/assets/team/neel_v2.png',
        socials: {
            github: 'https://github.com/neel-pasad',
            linkedin: 'https://www.linkedin.com/in/neel-pasad22',
            email: 'neel.pasad24@sakec.ac.in',
        },
    },
    {
        id: 4,
        name: 'Swayam Poojari',
        role: 'Developer (3rd Year)',
        image: '/src/assets/team/swayam.jpg',
        socials: {
            github: 'https://github.com/Swayam-2006',
            linkedin: 'https://www.linkedin.com/in/swayam-poojari-6828b027a',
            email: 'swayam.17955@sakec.ac.in',
        },
    },
    {
        id: 5,
        name: 'Jay Gurav',
        role: 'Developer (3rd Year)',
        image: '/src/assets/team/jay.jpg',
        socials: {
            github: 'https://github.com/JayG1711',
            linkedin: 'https://www.linkedin.com/in/jay-gurav/',
            email: 'jaygurav2004@gmail.com',
        },
    },
    {
        id: 6,
        name: 'Purva Nalawade',
        role: 'Developer (3rd Year)',
        image: '/src/assets/team/purva.jpg',
        socials: {
            github: 'https://github.com/Nalawade-Purva',
            linkedin: 'https://www.linkedin.com/in/purva-nalawade-532921315',
            email: 'purva.17737@sakec.ac.in',
        },
    },
];

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        Meet The Team
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        The brilliant minds behind the AI Awareness Platform. Dedicated to making the digital world safer and more informed.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex flex-col items-center group"
                        >
                            {/* Circular Image Container */}
                            <div className="relative w-48 h-48 mb-6">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center space-y-3 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md w-full max-w-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mt-1">
                                        {member.role}
                                    </p>
                                </div>

                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                                    Passionate about building secure and scalable AI solutions.
                                </p>

                                {/* Social Icons */}
                                <div className="flex justify-center gap-4 pt-2">
                                    {member.socials?.github && (
                                        <a
                                            href={member.socials.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            <Github size={18} />
                                        </a>
                                    )}
                                    {member.socials?.linkedin && (
                                        <a
                                            href={member.socials.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                    {member.socials?.email && (
                                        <a
                                            href={`mailto:${member.socials.email}`}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Mail size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
