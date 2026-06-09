export interface Festival {
    id: string;
    slug: string;
    name: string;
    date: string; // ISO format or YYYY-MM-DD
    endDate?: string;
    tithi?: string;
    month?: string; // Hindu month
    deity: string;
    description: string;
    rituals: string[];
    muhurat: string;
    color: string; // Hex code for UI representation
    image?: string; // Cover image URL
    isMajor: boolean;
}

export const MOCK_FESTIVALS: Festival[] = [
    {
        id: "f1",
        slug: "maha-shivaratri-2026",
        name: "Maha Shivaratri",
        date: "2026-02-14",
        tithi: "Chaturdashi",
        month: "Phalguna",
        deity: "Lord Shiva",
        description: "The Great Night of Shiva, marking the convergence of Shiva and Shakti. Devotees perform night-long vigils and fasting.",
        rituals: ["Strict fasting", "Offering Bael leaves to the Lingam", "Night-long Jagaran (vigil)", "Chanting Om Namah Shivaya"],
        muhurat: "Nishita Kaal Puja: 12:09 AM to 01:00 AM",
        color: "#1e3a8a", // Indigo/Blue
        isMajor: true
    },
    {
        id: "f2",
        slug: "holi-2026",
        name: "Holi",
        date: "2026-03-03",
        tithi: "Purnima",
        month: "Phalguna",
        deity: "Lord Krishna / Holika",
        description: "The Festival of Colors, celebrating the eternal and divine love of Radha Krishna, and the triumph of good over evil.",
        rituals: ["Holika Dahan on the previous night", "Playing with colors (Gulal)", "Distributing sweets like Gujiya"],
        muhurat: "Holika Dahan: 06:14 PM to 08:39 PM (March 2)",
        color: "#e11d48", // Rose/Pink
        isMajor: true
    },
    {
        id: "f3",
        slug: "chaitra-navratri-2026",
        name: "Chaitra Navratri",
        date: "2026-03-19",
        endDate: "2026-03-27",
        tithi: "Pratipada to Navami",
        month: "Chaitra",
        deity: "Goddess Durga",
        description: "Nine days dedicated to the worship of the nine divine forms of Goddess Durga, marking the Hindu New Year in many regions.",
        rituals: ["Ghatasthapana", "Nine days of fasting", "Kanya Pujan on Ashtami/Navami"],
        muhurat: "Ghatasthapana: 06:26 AM to 10:48 AM",
        color: "#ea580c", // Orange
        isMajor: true
    },
    {
        id: "f4",
        slug: "rama-navami-2026",
        name: "Rama Navami",
        date: "2026-03-27",
        tithi: "Navami",
        month: "Chaitra",
        deity: "Lord Rama",
        description: "Celebrates the birth of Lord Rama, the seventh avatar of Lord Vishnu, born in Ayodhya.",
        rituals: ["Reading Ramayana", "Offering Panakam and Neer Mor", "Rath Yatras"],
        muhurat: "Madhyahna Muhurat: 11:12 AM to 01:40 PM",
        color: "#fbbf24", // Yellow/Gold
        isMajor: true
    },
    {
        id: "f5",
        slug: "raksha-bandhan-2026",
        name: "Raksha Bandhan",
        date: "2026-08-28",
        tithi: "Purnima",
        month: "Shravana",
        deity: "None",
        description: "A festival celebrating the bond of protection, love, and care between brothers and sisters.",
        rituals: ["Tying the Rakhi", "Aarti", "Exchanging gifts and sweets"],
        muhurat: "Aparahna Time: 01:42 PM to 04:18 PM",
        color: "#f43f5e", // Rose
        isMajor: false
    },
    {
        id: "f6",
        slug: "krishna-janmashtami-2026",
        name: "Janmashtami",
        date: "2026-09-04",
        tithi: "Ashtami",
        month: "Bhadrapada",
        deity: "Lord Krishna",
        description: "The celebration of the birth of Lord Krishna, the eighth avatar of Vishnu.",
        rituals: ["Midnight birth celebrations", "Fasting until midnight", "Dahi Handi on the next day"],
        muhurat: "Nishita Puja Time: 11:58 PM to 12:44 AM",
        color: "#3b82f6", // Blue
        isMajor: true
    },
    {
        id: "f7",
        slug: "diwali-2026",
        name: "Diwali",
        date: "2026-11-08",
        tithi: "Amavasya",
        month: "Kartika",
        deity: "Goddess Lakshmi / Lord Ganesha",
        description: "The Festival of Lights, signifying the victory of light over darkness, knowledge over ignorance, and good over evil.",
        rituals: ["Lighting Diyas", "Lakshmi Puja", "Distributing sweets and gifts", "Fireworks"],
        muhurat: "Lakshmi Puja Time: 05:32 PM to 07:28 PM",
        color: "#ca8a04", // Gold
        isMajor: true
    }
];
