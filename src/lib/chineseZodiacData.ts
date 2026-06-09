
export interface ChineseSign {
    name: string;
    icon: string;
    personality: string;
    strengths: string[];
    weaknesses: string[];
    elementInfo: string;
    compatibility: string[];
}

export const CHINESE_NEW_YEAR_DATES: Record<number, string> = {
    1924: "1924-02-05", 1925: "1925-01-24", 1926: "1926-02-13", 1927: "1927-02-02", 1928: "1928-01-23", 1929: "1929-02-10",
    1930: "1930-01-30", 1931: "1931-02-17", 1932: "1932-02-06", 1933: "1933-01-26", 1934: "1934-02-14", 1935: "1935-02-04",
    1936: "1936-01-24", 1937: "1937-02-11", 1938: "1938-01-31", 1939: "1939-02-19", 1940: "1940-02-08", 1941: "1941-01-27",
    1942: "1942-02-15", 1943: "1943-02-05", 1944: "1944-01-25", 1945: "1945-02-13", 1946: "1946-02-02", 1947: "1947-01-22",
    1948: "1948-02-10", 1949: "1949-01-29", 1950: "1950-02-17", 1951: "1951-02-06", 1952: "1952-01-27", 1953: "1953-02-14",
    1954: "1954-02-03", 1955: "1955-01-24", 1956: "1956-02-12", 1957: "1957-01-31", 1958: "1958-02-18", 1959: "1959-02-08",
    1960: "1960-01-28", 1961: "1961-02-15", 1962: "1962-02-05", 1963: "1963-01-25", 1964: "1964-02-13", 1965: "1965-02-02",
    1966: "1966-01-21", 1967: "1967-02-09", 1968: "1968-01-30", 1969: "1969-02-17", 1970: "1970-02-06", 1971: "1971-01-27",
    1972: "1972-02-15", 1973: "1973-02-03", 1974: "1974-01-23", 1975: "1975-02-11", 1976: "1976-01-31", 1977: "1977-02-18",
    1978: "1978-02-07", 1979: "1979-01-28", 1980: "1980-02-16", 1981: "1981-02-05", 1982: "1982-01-25", 1983: "1983-02-13",
    1984: "1984-02-02", 1985: "1985-02-20", 1986: "1986-02-09", 1987: "1987-01-29", 1988: "1988-02-17", 1989: "1989-02-06",
    1990: "1990-01-27", 1991: "1991-02-15", 1992: "1992-02-04", 1993: "1993-01-23", 1994: "1994-02-10", 1995: "1995-01-31",
    1996: "1996-02-19", 1997: "1997-02-07", 1998: "1998-01-28", 1999: "1999-02-16", 2000: "2000-02-05", 2001: "2001-01-24",
    2002: "2002-02-12", 2003: "2003-02-01", 2004: "2004-01-22", 2005: "2005-02-09", 2006: "2006-01-29", 2007: "2007-02-18",
    2008: "2008-02-07", 2009: "2009-01-26", 2010: "2010-02-14", 2011: "2011-02-03", 2012: "2012-01-23", 2013: "2013-02-10",
    2014: "2014-01-31", 2015: "2015-02-19", 2016: "2016-02-08", 2017: "2017-01-28", 2018: "2018-02-16", 2019: "2019-02-05",
    2020: "2020-01-25", 2021: "2021-02-12", 2022: "2022-02-01", 2023: "2023-01-22", 2024: "2024-02-10", 2025: "2025-01-29",
    2026: "2026-02-17", 2027: "2027-02-06", 2028: "2028-01-26", 2029: "2029-02-13", 2030: "2030-02-03", 2031: "2031-01-23"
};

export const CHINESE_ANIMALS = [
    "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
];

export const CHINESE_ZODIAC_DATA: Record<string, ChineseSign> = {
    "Rat": {
        name: "Rat",
        icon: "🐀",
        personality: "Resourceful, versatile, and kind, people born under the Year of the Rat are quick-witted and intelligent. They are masters of adaptation and can find opportunity in any situation. Their charm and sharp observation skills make them excellent leaders in business and social circles.",
        strengths: ["Intelligent", "Resourceful", "Adaptable", "Charming"],
        weaknesses: ["Greedy", "Timid", "Secretive", "Stubborn"],
        elementInfo: "The Rat is associated with the element Water and represents wisdom and prosperity.",
        compatibility: ["Dragon", "Monkey", "Ox"]
    },
    "Ox": {
        name: "Ox",
        icon: "🐂",
        personality: "Diligence, dependability, strength, and determination are the key traits of the Ox. They are honest people with a strong sense of patriotism and ideals for life. Oxen are known for their patience and desire to make progress through consistent effort rather than luck.",
        strengths: ["Reliable", "Patient", "Methodical", "Strong-willed"],
        weaknesses: ["Stubborn", "Narrow-minded", "Poor communication", "Inflexibile"],
        elementInfo: "The Ox belongs to the Earth element and signifies stability, hard work, and endurance.",
        compatibility: ["Rat", "Snake", "Rooster"]
    },
    "Tiger": {
        name: "Tiger",
        icon: "🐅",
        personality: "Brave, competitive, and unpredictable, Tigers are the symbols of power and authority. They are natural leaders who command respect. Tigers are adventurers who aren't afraid to take risks to achieve their goals, though their impulsive nature can sometimes lead to trouble.",
        strengths: ["Brave", "Confident", "Charismatic", "Magnetic"],
        weaknesses: ["Impulsive", "Irritable", "Rebellious", "Over-indulgent"],
        elementInfo: "The Tiger is linked to the Wood element, representing growth, courage, and vitality.",
        compatibility: ["Horse", "Dog", "Pig"]
    },
    "Rabbit": {
        name: "Rabbit",
        icon: "🐇",
        personality: "Gentle, quiet, and elegant, Rabbits represent hope and life. They are artistic and have a good sense of beauty. Rabbits are peace-seekers who avoid conflict at all costs. Their cautious and sensitive nature makes them excellent diplomats and advisors.",
        strengths: ["Elegant", "Kind", "Patient", "Responsible"],
        weaknesses: ["Hesitantly", "Conservative", "Shy", "Easily discouraged"],
        elementInfo: "The Rabbit is associated with the Wood element and symbolizes creativity and compassion.",
        compatibility: ["Goat", "Dog", "Pig"]
    },
    "Dragon": {
        name: "Dragon",
        icon: "🐉",
        personality: "The Dragon is the most powerful and auspicious sign in Chinese culture. Dragons are multi-talented, energetic, and gifted. They are natural born leaders who possess a high level of self-confidence and an indomitable spirit. They are often the center of attention wherever they go.",
        strengths: ["Powerful", "Energetic", "Ambitious", "Self-assured"],
        weaknesses: ["Arrogant", "Impatience", "Overconfident", "Demanding"],
        elementInfo: "The Dragon is associated with the Earth element and represents authority and transformation.",
        compatibility: ["Rat", "Monkey", "Rooster"]
    },
    "Snake": {
        name: "Snake",
        icon: "🐍",
        personality: "Snakes are mysterious, intelligent, and wise. They are the most intuitive sign and tend to follow their gut feeling. Snakes are sophisticated and like the finer things in life. They prefer to work alone and value their privacy above all else.",
        strengths: ["Wise", "Intuitive", "Calm", "Sophisticated"],
        weaknesses: ["Jealous", "Suspicious", "Cold", "Lazy"],
        elementInfo: "The Snake belongs to the Fire element, symbolizing intellect, passion, and elegance.",
        compatibility: ["Ox", "Rooster", "Monkey"]
    },
    "Horse": {
        name: "Horse",
        icon: "🐎",
        personality: "Animated, active, and energetic, Horses love to be in a crowd. They are pathfinders who seek freedom and independent life. Horses are incredibly hard-working and have a good sense of humor, making them very popular among their peers.",
        strengths: ["Energetic", "Independent", "Optimistic", "Popular"],
        weaknesses: ["Impatience", "Self-centered", "Short-tempered", "Unstable"],
        elementInfo: "The Horse is linked to the Fire element and represents speed, freedom, and spirit.",
        compatibility: ["Tiger", "Goat", "Dog"]
    },
    "Goat": {
        name: "Goat",
        icon: "🐐",
        personality: "Gentle, mild-mannered, and stable, Goats have a strong sense of kindness and justice. They are creative and have an inner resilience that surprises many. Goats prefer a quiet and predictable life and are true caregivers to their loved ones.",
        strengths: ["Creative", "Gentle", "Resilient", "Kind-hearted"],
        weaknesses: ["Indecisive", "Timid", "Worry-prone", "Pessimistic"],
        elementInfo: "The Goat is associated with the Earth element and symbolizes peace, art, and harmony.",
        compatibility: ["Rabbit", "Horse", "Pig"]
    },
    "Monkey": {
        name: "Monkey",
        icon: "🐒",
        personality: "Magnetic, mischievous, and incredibly smart, Monkeys are the ultimate problem solvers. They are curious about everything and have a trick for every situation. Their wit and playful nature make them the life of any party, though they can sometimes be perceived as opportunists.",
        strengths: ["Intelligent", "Witty", "Innovative", "Enthusiastic"],
        weaknesses: ["Selfish", "Arrogant", "Deceptive", "Restless"],
        elementInfo: "The Monkey is linked to the Metal element and represents cleverness and agility.",
        compatibility: ["Rat", "Dragon", "Snake"]
    },
    "Rooster": {
        name: "Rooster",
        icon: "🐓",
        personality: "Observant, hardworking, and courageous, Roosters are the most confident sign. They are proud of themselves and enjoy being the center of attention. Roosters are known for their loyalty and honesty, always speaking their mind directly and clearly.",
        strengths: ["Hardworking", "Confident", "Loyal", "Honest"],
        weaknesses: ["Vain", "Critical", "Self-centered", "Short-tempered"],
        elementInfo: "The Rooster belongs to the Metal element, symbolizing precision, justice, and clarity.",
        compatibility: ["Ox", "Dragon", "Snake"]
    },
    "Dog": {
        name: "Dog",
        icon: "🐕",
        personality: "Loyal, honest, and kind, Dogs are the truest friends. They have a strong sense of responsibility and will do anything for the person they think is most important. Dogs are cautious by nature and value justice and fairness above all else.",
        strengths: ["Loyal", "Honest", "Trustworthy", "Protective"],
        weaknesses: ["Stubborn", "Emotional", "Critical", "Anxious"],
        elementInfo: "The Dog is associated with the Earth element and represents duty, loyalty, and protection.",
        compatibility: ["Tiger", "Rabbit", "Horse"]
    },
    "Pig": {
        name: "Pig",
        icon: "🐖",
        personality: "Compassionate, generous, and diligent, Pigs are the most easy-going sign. They are great at concentrating on their goals and achieving them through hard work. Pigs are true hedonists who enjoy the pleasures of life and are always ready to help others.",
        strengths: ["Generous", "Compassionate", "Diligent", "Gentle"],
        weaknesses: ["Gullible", "Naive", "Short-tempered", "Lazy"],
        elementInfo: "The Pig is linked to the Water element and symbolizes wealth, luck, and abundance.",
        compatibility: ["Tiger", "Rabbit", "Goat"]
    }
};

export const getChineseZodiac = (dateString: string) => {
    const birthDate = new Date(dateString);
    const year = birthDate.getFullYear();
    
    // Check if birthday falls before the Chinese New Year for that year
    const cnyDateStr = CHINESE_NEW_YEAR_DATES[year];
    let zodiacYear = year;
    
    if (cnyDateStr) {
        const cnyDate = new Date(cnyDateStr);
        if (birthDate < cnyDate) {
            zodiacYear = year - 1;
        }
    }
    
    // 1924 was a Year of the Rat (index 0)
    const index = (zodiacYear - 1924) % 12;
    const normalizedIndex = index < 0 ? index + 12 : index;
    const animalName = CHINESE_ANIMALS[normalizedIndex];
    
    // Element Calculation
    const elements = ["Metal", "Metal", "Water", "Water", "Wood", "Wood", "Fire", "Fire", "Earth", "Earth"];
    const element = elements[zodiacYear % 10];
    
    return {
        ...CHINESE_ZODIAC_DATA[animalName],
        element,
        zodiacYear
    };
};
