'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Sparkles, Type, Star, Calendar, Clock,
    Flame, Shield, Zap, Moon, User, MessageCircle,
    Loader2, RefreshCw, AlertTriangle, Check, Info, ExternalLink, 
    History} from 'lucide-react';
import aiAstrologerService from '@/lib/aiAstrologerService';
import { compatibilityStorage } from '@/lib/compatibilityStorage';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { downloadCompatibilityPDF } from '@/lib/compatibilityPdfGenerator';
import PaidPDFButton from '@/components/shared/PaidPDFButton';
import { useTranslation } from '@/context/LanguageContext';

// ─── ZODIAC DATA ────────────────────────────────────────────────────────────
const ZODIAC_SIGNS = [
    { name: 'Aries', sanskritName: 'Mesh', symbol: '♈', element: 'Fire', ruling: 'Mars', dateRange: 'Mar 21 – Apr 19', quality: 'Cardinal' },
    { name: 'Taurus', sanskritName: 'Vrish', symbol: '♉', element: 'Earth', ruling: 'Venus', dateRange: 'Apr 20 – May 20', quality: 'Fixed' },
    { name: 'Gemini', sanskritName: 'Mithun', symbol: '♊', element: 'Air', ruling: 'Mercury', dateRange: 'May 21 – Jun 20', quality: 'Mutable' },
    { name: 'Cancer', sanskritName: 'Kark', symbol: '♋', element: 'Water', ruling: 'Moon', dateRange: 'Jun 21 – Jul 22', quality: 'Cardinal' },
    { name: 'Leo', sanskritName: 'Simha', symbol: '♌', element: 'Fire', ruling: 'Sun', dateRange: 'Jul 23 – Aug 22', quality: 'Fixed' },
    { name: 'Virgo', sanskritName: 'Kanya', symbol: '♍', element: 'Earth', ruling: 'Mercury', dateRange: 'Aug 23 – Sep 22', quality: 'Mutable' },
    { name: 'Libra', sanskritName: 'Tula', symbol: '♎', element: 'Air', ruling: 'Venus', dateRange: 'Sep 23 – Oct 22', quality: 'Cardinal' },
    { name: 'Scorpio', sanskritName: 'Vrischika', symbol: '♏', element: 'Water', ruling: 'Mars', dateRange: 'Oct 23 – Nov 21', quality: 'Fixed' },
    { name: 'Sagittarius', sanskritName: 'Dhanu', symbol: '♐', element: 'Fire', ruling: 'Jupiter', dateRange: 'Nov 22 – Dec 21', quality: 'Mutable' },
    { name: 'Capricorn', sanskritName: 'Makar', symbol: '♑', element: 'Earth', ruling: 'Saturn', dateRange: 'Dec 22 – Jan 19', quality: 'Cardinal' },
    { name: 'Aquarius', sanskritName: 'Kumbh', symbol: '♒', element: 'Air', ruling: 'Saturn', dateRange: 'Jan 20 – Feb 18', quality: 'Fixed' },
    { name: 'Pisces', sanskritName: 'Meen', symbol: '♓', element: 'Water', ruling: 'Jupiter', dateRange: 'Feb 19 – Mar 20', quality: 'Mutable' },
];

const ELEMENT_COLORS: Record<string, string> = {
    Fire: '#ef4444', Earth: '#84cc16', Air: '#3b82f6', Water: '#06b6d4'
};

const COMPAT_MATRIX: number[][] = [
    [78, 42, 83, 47, 93, 53, 68, 50, 95, 40, 82, 57],
    [42, 80, 48, 90, 55, 92, 65, 85, 38, 95, 45, 82],
    [83, 48, 76, 50, 85, 58, 92, 42, 80, 45, 93, 52],
    [47, 90, 50, 78, 48, 82, 52, 92, 45, 80, 42, 95],
    [93, 55, 85, 48, 82, 50, 75, 55, 92, 42, 78, 45],
    [53, 92, 58, 82, 50, 78, 52, 75, 48, 90, 55, 65],
    [68, 65, 92, 52, 75, 52, 72, 60, 78, 55, 90, 48],
    [50, 85, 42, 92, 55, 75, 60, 80, 48, 82, 50, 88],
    [95, 38, 80, 45, 92, 48, 78, 48, 82, 45, 85, 50],
    [40, 95, 45, 80, 42, 90, 55, 82, 45, 78, 50, 75],
    [82, 45, 93, 42, 78, 55, 90, 50, 85, 50, 76, 52],
    [57, 82, 52, 95, 45, 65, 48, 88, 50, 75, 52, 80],
];

// ─── SPECIFIC PAIR INSIGHTS (28 pairs) ──────────────────────────────────────
// Key = "min_idx-max_idx"
const PAIR_INSIGHTS: Record<string, { insight: string; chemistry: string; daily: string }> = {
    // Opposite pairs
    '0-6': { insight: 'The Ram and the Scales — one of astrology\'s most electrifying opposite-sign pairings. Aries charges forward with bold instinct while Libra deliberates with elegant grace. This polarity creates a magnetic push-pull that keeps both constantly alive and engaged.', chemistry: 'Off the charts. Aries\' raw passion ignites Libra\'s romantic nature, and Libra\'s charm softens Aries\' rough edges. This is the couple who turn heads wherever they go — individually stunning, together magnetic.', daily: 'Expect lively debates and passionate reconciliations. Aries decides in a flash; Libra considers every angle. Learning to blend urgency with thoughtful pace creates a beautifully balanced dynamic.' },
    '1-7': { insight: 'Two of the most intensely loyal and stubborn signs facing each other. Taurus seeks earthly comfort and security; Scorpio seeks emotional depth and transformation. This combination creates an unshakeable bond — or an immovable standstill.', chemistry: 'Intensely physical and deeply emotional. Taurus grounds Scorpio\'s intensity while Scorpio draws Taurus into emotional depths they rarely explore. The magnetism is almost gravitational.', daily: 'Both are deeply private and slow to trust, which paradoxically creates a profound safe space. Daily life is structured, sensual, and intensely private — a world built for two.' },
    '2-8': { insight: 'The Twins and the Archer — two freedom-loving, intellectually insatiable signs who recognize each other immediately. Both despise boredom and love adventure, making this a naturally exciting pairing built on friendship and mutual admiration.', chemistry: 'Light, playful, and electric. These two flirt with ideas as much as with each other. The intellectual spark creates a relationship that never grows stale.', daily: 'Life together is one long adventure. Both are adaptable, so routines rarely take hold. The challenge is building enough stability to make the relationship last beyond the excitement.' },
    '3-9': { insight: 'The Crab and the Sea-Goat — the most complementary opposite pair. Cancer provides emotional warmth and nurturing that Capricorn secretly craves; Capricorn provides stability and ambition that Cancer needs to feel safe. Together they build both a home and an empire.', chemistry: 'Deep and growing. This isn\'t explosive chemistry — it deepens steadily over years. Cancer melts Capricorn\'s stoic exterior while Capricorn gives Cancer a structure to pour their love into.', daily: 'One of astrology\'s most functional partnerships. Cancer manages the emotional home while Capricorn handles worldly affairs. They complement each other so naturally that day-to-day life flows with remarkable ease.' },
    '4-10': { insight: 'The Lion and the Water Bearer — a partnership between the individual and the collective. Leo shines with personal magnetism; Aquarius shines with visionary ideas. Both are fixed signs who are fiercely stubborn — and fiercely loyal.', chemistry: 'Fascinating and unpredictable. Leo finds Aquarius\' originality endlessly intriguing; Aquarius is magnetized by Leo\'s warm radiance. They challenge each other in ways no other sign can.', daily: 'Power struggles are common since both are natural leaders. Aquarius needs intellectual freedom; Leo needs personal recognition. Celebrating each other\'s unique genius without competing is the key.' },
    '5-11': { insight: 'The Virgin and the Fish — the healer and the dreamer. Virgo brings precision, practicality, and service; Pisces brings imagination, compassion, and intuition. Each has exactly what the other lacks, creating a beautifully healing union.', chemistry: 'Tender and deeply nurturing. Virgo\'s attentiveness makes Pisces feel truly cared for; Pisces\' unconditional acceptance melts Virgo\'s self-criticism. Together they create a sanctuary.', daily: 'Virgo brings structure to Pisces\' dreamy world; Pisces softens Virgo\'s tendency toward criticism. Daily life is gentle, caring, and surprisingly productive when they combine their strengths.' },
    // Same element — Fire
    '0-4': { insight: 'Two fire signs that instantly recognize each other as equals. Aries brings pioneering energy and spontaneity; Leo brings royal confidence and warmth. Together they are a force of nature — passionate, ambitious, and irresistibly magnetic.', chemistry: 'Explosive and addictive. Both are passionate, dramatic, and romantic in big gestures. This is the couple who could fill an entire love story with just their first month together.', daily: 'Both need to lead, which creates regular power struggles. But the same fire that causes clashes also creates passionate reconciliations. Life together is never quiet — and neither would have it any other way.' },
    '0-8': { insight: 'The Ram and the Archer — two freedom-loving fire signs who inspire the world-changing best in each other. Aries has the initiative; Sagittarius has the philosophy. Together they can move mountains while laughing the entire way.', chemistry: 'Effortlessly fun and naturally hot. These two fall into spontaneous adventures and build on each other\'s enthusiasm in a way that makes ordinary moments feel extraordinary.', daily: 'Independence is essential for both. They thrive as partners who give each other space to grow individually, coming together to share adventures. Commitment comes naturally when it doesn\'t feel like a cage.' },
    '4-8': { insight: 'Two of the most vibrant signs together create a partnership that radiates joy, generosity, and adventure. Both are natural entertainers with a deep love of life. Their shared optimism makes them a couple others genuinely enjoy being around.', chemistry: 'Warm, playful, and deeply romantic. Leo\'s theatrical passion is beautifully matched by Sagittarius\' adventurous spirit. Together they create memories that feel like a highlight reel.', daily: 'Both can be inconsistent with mundane realities. They need to consciously build practical foundations. But the laughter, joy, and warmth they share makes the effort entirely worthwhile.' },
    // Same element — Earth
    '1-5': { insight: 'Two earth signs whose values align with remarkable precision — both prize loyalty, quality, reliability, and building something lasting. Taurus brings sensual devotion; Virgo brings brilliant discernment. Together they build a love that improves every passing year.', chemistry: 'Slow-burning and deeply satisfying. No fireworks — instead, a growing warmth that becomes one of the most physically and emotionally comfortable partnerships in the zodiac.', daily: 'Exceptionally functional. Taurus handles sensory comforts; Virgo handles details and organization. Their home is immaculate, beautifully appointed, and filled with quiet contentment.' },
    '1-9': { insight: 'Two earth signs who understand ambition, loyalty, and the satisfaction of building something that lasts. Taurus wants security and comfort; Capricorn wants achievement and legacy. Together they build both — and neither has to compromise their core values.', chemistry: 'Understated but deeply powerful. The attraction is based on mutual respect and admiration for each other\'s qualities. It grows steadily stronger over time.', daily: 'One of astrology\'s most naturally compatible daily dynamics. Both are reliable, hardworking, and practical. They build shared routines and goals that make life feel stable, meaningful, and progressively more rewarding.' },
    '5-9': { insight: 'Two of the most competent, disciplined, and discerning signs together. Both are highly analytical, deeply responsible, and committed to excellence. They understand each other\'s standards and meet them without being asked.', chemistry: 'Intellectual and quietly passionate. These two fall in love over shared values, deep conversations, and watching each other handle life with exceptional competence.', daily: 'Extraordinarily effective. Together they are a high-functioning team who supports each other\'s ambitions while maintaining a meticulously organized and comfortable home life.' },
    // Same element — Air
    '2-6': { insight: 'Two air signs in perfect intellectual harmony. Gemini brings wit, curiosity, and mental agility; Libra brings charm, grace, and elegant balance. Together they create a relationship that is endlessly stimulating, socially dazzling, and intellectually alive.', chemistry: 'Light, charming, and mentally electric. They fall in love through conversation and stay in love through constant mental stimulation. Their social life is often the envy of every couple they know.', daily: 'Beautiful in theory, occasionally challenging in practice — both can avoid difficult emotional conversations. Building the habit of going deeper makes an already wonderful partnership truly unshakeable.' },
    '2-10': { insight: 'Two visionary air signs who push each other\'s thinking to new heights. Gemini collects ideas; Aquarius synthesizes them into world-changing visions. Together they are the most intellectually innovative pair in the zodiac.', chemistry: 'Uniquely electric. Both find each other endlessly fascinating, which is rare. The mental chemistry appears immediately and only deepens as they discover each other\'s unconventional depths.', daily: 'Conversation is constant, ideas are everywhere, and life together feels like one continuous discovery. The challenge is ensuring emotional needs don\'t get lost in the intellectual whirlwind.' },
    '6-10': { insight: 'Two idealistic air signs who share a vision for a more beautiful, just world. Libra pursues harmony and fairness in personal relationships; Aquarius pursues justice and innovation for humanity. Together their love feels like a shared mission.', chemistry: 'Intellectually magnetic and socially brilliant. These two understand each other with unusual ease, finding a kindred spirit who matches their eloquence and depth of thought.', daily: 'Effortlessly harmonious. Both are socially gifted, thoughtful, and fair-minded. They navigate disagreements with unusual grace and build a partnership as much a friendship as a romance.' },
    // Same element — Water
    '3-7': { insight: 'Two intensely emotional water signs who create a bond of extraordinary depth and loyalty. Cancer nurtures from unconditional love; Scorpio loves with all-consuming intensity. Together they create a sanctuary of total emotional trust.', chemistry: 'Profound and magnetic. Both are highly intuitive and read each other without words. The emotional depth they reach together is rarely touched by any other combination.', daily: 'Deeply private, beautifully intimate, and intensely loyal. Home is their sanctuary and their relationship their most sacred space. Both need to watch for emotional intensity tipping into possessiveness.' },
    '3-11': { insight: 'Two of the most compassionate, intuitive, and romantically gifted signs in the zodiac. Cancer creates a home filled with love and security; Pisces fills it with magic, imagination, and transcendent tenderness. One of astrology\'s most naturally romantic combinations.', chemistry: 'Ethereal and deeply moving. Both are highly sensitive and respond to each other\'s emotional states with extraordinary empathy. The love between them can feel genuinely otherworldly.', daily: 'Beautifully gentle but requires both to build practical foundations together. Left to their own devices, they drift into beautiful dreams that need grounding in real-world structure.' },
    '7-11': { insight: 'Two deeply spiritual water signs who recognize each other at a soul level. Scorpio dives deep to find hidden truths; Pisces dissolves boundaries in search of universal love. Together they reach emotional and spiritual depths that few couples ever access.', chemistry: 'Intensely powerful and almost mystical. This is the combination of profound soul recognition — both feel understood in ways they never have with anyone else.', daily: 'Both need emotional intensity and spiritual connection, which they naturally provide for each other. The challenge is maintaining healthy boundaries so the relationship remains nourishing rather than enmeshing.' },
    // Adjacent/cross-element pairs
    '0-2': { insight: 'Aries\' bold action meets Gemini\'s brilliant mind. Ideas become reality at lightning speed — Gemini provides the concept, Aries provides the courage to execute. Their energy together is infectious and unstoppable.', chemistry: 'Playful, exciting, and mentally stimulating. Both love novelty and bring out each other\'s most adventurous side. The spark is both intellectual and spontaneous.', daily: 'Dynamic and rarely boring. Both are fast-moving and adaptable. The challenge is slowing down enough to deepen the emotional connection beneath the exciting surface.' },
    '1-3': { insight: 'Two of the most naturally domestic and nurturing signs in the zodiac. Taurus builds security; Cancer creates emotional warmth. Together they create astrology\'s most beautiful home — physically comfortable, emotionally safe, and deeply loving.', chemistry: 'Tender, warm, and deeply sensual. Both love physical comfort and emotional intimacy, creating a naturally affectionate bond that feels like coming home.', daily: 'Beautifully harmonious. Both prioritize home, family, and security, making shared life a model of warmth and stability. This partnership often lasts a lifetime.' },
    '4-6': { insight: 'The Lion and the Scales — a glamorous, socially brilliant pairing. Both love beauty, luxury, and being adored. Leo provides the dramatic flair; Libra provides the elegant taste. Together they are the most stylish couple in any room.', chemistry: 'Warm, romantic, and visually stunning. Both are natural performers and aesthetes who enhance each other\'s allure. Their mutual admiration creates a deeply affirming bond.', daily: 'Usually harmonious, as both prioritize beauty, harmony, and social grace. Minor friction arises when Leo\'s ego needs more spotlight than Libra wants to give — but Libra\'s charm usually resolves it effortlessly.' },
    '5-7': { insight: 'Two of the most perceptive and analytical signs in the zodiac who see through pretense immediately. Virgo\'s discernment meets Scorpio\'s depth — together they communicate with unusual honesty and build trust through genuine understanding.', chemistry: 'Slow-building but surprisingly intense. Both take time to trust, which makes their eventual intimacy feel hard-earned and profoundly real.', daily: 'Highly effective together. Virgo\'s precision combines with Scorpio\'s strategic depth to make them a formidably capable couple. Their home is run with quiet excellence.' },
    '6-8': { insight: 'Libra\'s romantic elegance and Sagittarius\' philosophical adventure create a beautiful meeting of heart and mind. Both love beauty, truth, and the finer experiences of life. Their conversations flow effortlessly and their social life is richly fulfilling.', chemistry: 'Light, warm, and romantically generous. Both are naturally affectionate and bring out each other\'s optimism. Dating feels like a beautifully curated adventure.', daily: 'Enjoyable and varied. Both love socializing and experiencing new things. The challenge is building enough depth beneath the beautiful surface to weather difficult seasons.' },
    '7-9': { insight: 'Two of the most ambitious, disciplined, and quietly powerful signs. Scorpio brings emotional depth and strategic brilliance; Capricorn brings structure, resilience, and worldly achievement. Together they are a formidable force — privately devoted, publicly impressive.', chemistry: 'Intense and deeply respectful. Both recognize and respect the other\'s power without feeling threatened. This mutual respect is the foundation of their magnetic attraction.', daily: 'Serious, purposeful, and surprisingly intimate behind closed doors. Both work hard and appreciate a partner who matches their ambition and understands the demands of high achievement.' },
    '8-10': { insight: 'Two visionary free spirits who share a deep love of truth, freedom, and humanity. Sagittarius explores wisdom through experience; Aquarius through revolutionary ideas. Together they are among the most forward-thinking, inspiring couples in the zodiac.', chemistry: 'Electrifying and unique. Both are unconventional and find in each other a rare person who truly understands their need for freedom and love of ideas.', daily: 'Genuinely fun, endlessly interesting, and joyfully unpredictable. Building shared commitments requires conscious effort but the friendship at their foundation makes the relationship naturally resilient.' },
    '9-11': { insight: 'Structure meets soul — Capricorn\'s worldly ambition is beautifully softened by Pisces\' spiritual depth. Capricorn gives Pisces the foundation to make their dreams real; Pisces gives Capricorn a reason to pursue more than just achievement.', chemistry: 'Surprisingly tender. Capricorn\'s stoic exterior melts in Pisces\' compassionate presence. Pisces feels genuinely safe in Capricorn\'s capable arms. The quiet devotion grows beautifully.', daily: 'Complementary in the best way. Capricorn handles the practical world; Pisces handles the emotional and spiritual dimensions. Together they cover every aspect of a full and meaningful life.' },
};

interface CompatResult {
    score: number; sign1: typeof ZODIAC_SIGNS[0]; sign2: typeof ZODIAC_SIGNS[0];
    name1: string; name2: string; level: string; levelColor: string;
    emotional: number; intellectual: number; physical: number; spiritual: number;
    communication: number; romance: number; longTerm: number;
    strengths: string[]; challenges: string[]; advice: string;
    pairInsight: string; chemistry: string; daily: string;
    isSunSign: boolean;
}

function getZodiacFromDate(dateStr: string): number {
    if (!dateStr) return -1;
    const d = new Date(dateStr), m = d.getMonth() + 1, day = d.getDate();
    if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 0;
    if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 1;
    if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 2;
    if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 3;
    if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 4;
    if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 5;
    if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 6;
    if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 7;
    if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 8;
    if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 9;
    if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 10;
    return 11;
}

function getZodiacCompatibility(idx1: number, idx2: number, n1: string, n2: string, compSettings: any, isSunSign = false): CompatResult {
    const s1 = ZODIAC_SIGNS[idx1], s2 = ZODIAC_SIGNS[idx2];
    const rawScore = COMPAT_MATRIX[idx1][idx2];
    const sameEl = s1.element === s2.element;
    const comp = ((s1.element === 'Fire' && s2.element === 'Air') || (s1.element === 'Air' && s2.element === 'Fire') ||
        (s1.element === 'Earth' && s2.element === 'Water') || (s1.element === 'Water' && s2.element === 'Earth'));

    const clamp = (v: number) => Math.max(28, Math.min(98, v));
    
    const pairKey = [Math.min(idx1, idx2), Math.max(idx1, idx2)].join('-');
    const specificPair = PAIR_INSIGHTS[pairKey];
    const ek = [s1.element, s2.element].sort().join('-');

    // --- Admin Overrides Integration ---
    const adminPair = compSettings?.pairInsights?.[pairKey];
    const adminElement = compSettings?.elementInsights?.[ek];
    
    // 1. Overall Score
    const overScore = adminPair?.score || adminElement?.score || rawScore;
    
    // 2. Level & Color (Derived from overall score)
    let level = '', levelColor = '';
    if (overScore >= 90) { level = 'Soulmate Bond'; levelColor = '#15803d'; }
    else if (overScore >= 80) { level = 'Excellent Match'; levelColor = '#16a34a'; }
    else if (overScore >= 70) { level = 'Strong Connection'; levelColor = '#b8962e'; }
    else if (overScore >= 60) { level = 'Good Potential'; levelColor = '#d97706'; }
    else if (overScore >= 50) { level = 'Mixed Energy'; levelColor = '#ea580c'; }
    else { level = 'Challenging Bond'; levelColor = '#dc2626'; }

    // 3. Category Scores
    const adminCategories = adminPair?.categoryScores || adminElement?.categoryScores;
    const emotional = adminCategories?.emotional || clamp(overScore + (sameEl ? 8 : comp ? 5 : -3));
    const intellectual = adminCategories?.intellectual || clamp(overScore + (s1.element === 'Air' || s2.element === 'Air' ? 12 : comp ? 4 : -2));
    const physical = adminCategories?.physical || clamp(overScore + (s1.element === 'Fire' || s2.element === 'Fire' ? 10 : comp ? 5 : -2));
    const spiritual = adminCategories?.spiritual || clamp(overScore + (s1.element === 'Water' || s2.element === 'Water' ? 10 : sameEl ? 4 : -2));
    const communication = adminCategories?.communication || clamp(overScore + (s1.element === 'Air' || s2.element === 'Air' ? 14 : s1.element === 'Earth' && s2.element === 'Earth' ? 5 : -3));
    const romance = adminCategories?.romance || clamp(overScore + ((s1.ruling === 'Venus' || s2.ruling === 'Venus') ? 12 : (s1.element === 'Fire' || s2.element === 'Fire') ? 8 : 0));
    const longTerm = adminCategories?.longTerm || clamp(overScore + ((s1.element === 'Earth' || s2.element === 'Earth') ? 10 : sameEl && s1.element !== 'Fire' ? 6 : -2));


    const elementInsights: Record<string, { insight: string; chemistry: string; daily: string }> = {
        'Fire-Fire': { insight: `Two fire signs sharing ${s1.name} and ${s2.name}\u2019s bold energy create a passionate, high-octane partnership. Both are natural leaders who inspire each other to reach new heights. The key is channelling combined ambition into shared goals.`, chemistry: `Explosive and magnetic. Both are passionate and romantic in big gestures. The physical and emotional spark between you is natural and intense.`, daily: `Dynamic and rarely dull. Power struggles are possible, but the fire that creates clashes also creates passionate reconciliations. Life together is vivid and memorable.` },
        'Earth-Earth': { insight: `Two earth signs — grounded, practical, and genuinely committed. ${s1.name} and ${s2.name} share a deep appreciation for loyalty, stability, and building something lasting together. This is one of astrology\u2019s most reliable pairings.`, chemistry: `Slow-burning and deeply satisfying. The attraction grows steadily from mutual respect and shared values into a deeply comfortable, lasting warmth.`, daily: `Functional, organized, and pleasantly predictable. Both bring reliability and quality to shared life, creating a partnership that strengthens with every passing season.` },
        'Air-Air': { insight: `Two air signs whose minds dance together effortlessly. ${s1.name} and ${s2.name} share a love of ideas, communication, and social connection. Together they are mentally stimulating, socially vibrant, and endlessly interesting to each other.`, chemistry: `Light, charming, and intellectually electric. They fall in love over conversation and stay in love through constant mental stimulation.`, daily: `Lively and socially active. The challenge is building emotional depth beneath the intellectual brilliance to create a relationship that weathers all seasons.` },
        'Water-Water': { insight: `Two water signs in profound emotional resonance. ${s1.name} and ${s2.name} understand each other intuitively — often without words. The emotional depth they reach together is rarely accessed by other pairings.`, chemistry: `Deep, magnetic, and emotionally powerful. Both are highly sensitive and respond to each other with extraordinary empathy and intuitive understanding.`, daily: `Deeply intimate and private. Home is their sanctuary. Both should watch for emotional intensity becoming enmeshing — healthy independence strengthens the bond.` },
        'Fire-Air': { insight: `Fire and Air naturally energize each other. ${s1.name}\u2019s passion and ${s2.name}\u2019s intellect (or vice versa) create a stimulating partnership where ideas become action. This combination produces brilliant, adventurous energy.`, chemistry: `Playful, exciting, and fast-paced. Both bring spontaneity and optimism. The chemistry feels electric and youthful, with a natural enthusiasm for life together.`, daily: `Dynamic and engaging. Air brings ideas; Fire executes them. The challenge is slowing down to build emotional foundations beneath the exciting surface.` },
        'Earth-Water': { insight: `Earth and Water\u2019s most natural pairing in nature — one nurtures the other into growth. ${s1.name} and ${s2.name}\u2019s combination creates a deeply nurturing, emotionally secure, and practically stable partnership.`, chemistry: `Tender, warm, and quietly sensual. Both crave emotional safety, which they provide for each other with remarkable naturalness.`, daily: `Beautifully harmonious. Earth brings practical stability; Water brings emotional richness. Together they cover every dimension of a deeply fulfilling shared life.` },
        'Fire-Earth': { insight: `Fire\u2019s vision meets Earth\u2019s practicality in ${s1.name} and ${s2.name}\u2019s pairing. What one dreams, the other makes real. The dynamic requires patience, but the results can be remarkable.`, chemistry: `Building attraction that grows from fascination. Earth is intrigued by Fire\u2019s passion; Fire is grounded by Earth\u2019s warmth. The chemistry deepens as understanding grows.`, daily: `Fire leads with inspiration; Earth provides the follow-through. This can be a powerfully effective pairing when both appreciate what the other uniquely brings.` },
        'Air-Water': { insight: `Mind meets heart in ${s1.name} and ${s2.name}\u2019s pairing. Air brings logic, wit, and perspective; Water brings emotion, intuition, and depth. Bridging these two worlds creates a profoundly enriching partnership.`, chemistry: `Fascinating and emotionally complex. Air finds Water\u2019s emotional depth intriguing; Water is drawn to Air\u2019s brilliant mind. The attraction spans multiple dimensions.`, daily: `Requires conscious communication. Air needs to express emotions; Water needs to engage with ideas. When both make this effort, the partnership covers remarkable ground.` },
    };

    const elementFallback = elementInsights[ek] || elementInsights['Fire-Air'];
    const pairInsight = adminPair?.insight || adminElement?.insight || specificPair?.insight || elementFallback.insight;
    const chemistry = adminPair?.chemistry || adminElement?.chemistry || specificPair?.chemistry || elementFallback.chemistry;
    const daily = adminPair?.daily || adminElement?.daily || specificPair?.daily || elementFallback.daily;

    const sp: Record<string, string[]> = {
        'Fire-Fire': [
            'Explosive passion and shared high energy',
            'Mutual respect for each other\'s independence',
            'Inspiring each other to reach greater heights',
            'Naturally adventurous and spontaneous dynamic',
            'Deep understanding of each other\'s creative drive'
        ],
        'Fire-Air': [
            'Intellectual stimulation meets bold action',
            'Exceptional communication and natural spark',
            'Shared enthusiasm for social energy and ideas',
            'Air fans the flames of Fire\'s vision',
            'Mutually supportive of individual freedom'
        ],
        'Fire-Earth': [
            'Grounding stability meets creative inspiration',
            'Practical support for ambitious big dreams',
            'Complementary strengths that cover all bases',
            'Earth provides the vessel for Fire\'s energy',
            'Strong foundation build on mutual loyalty'
        ],
        'Fire-Water': [
            'Emotional depth meets raw passion',
            'Transformative and growth-oriented connection',
            'Each brings what the other needs most spiritually',
            'Deeply magnetic push-pull dynamic',
            'Ability to catalyze profound personal change'
        ],
        'Earth-Earth': [
            'Deep stability and unwavering lasting trust',
            'Shared practical values and long-term ambitions',
            'Building a beautifully secure and comfortable home',
            'Exceptionally reliable and grounded partnership',
            'Mutual appreciation for quality and tradition'
        ],
        'Earth-Air': [
            'Balance of practical thought and creative ideas',
            'Intellectual growth through healthy difference',
            'Each broadens the other\'s worldly perspective',
            'Stability meets mental agility and wit',
            'Grounded approach to complex social dynamics'
        ],
        'Earth-Water': [
            'Naturally nurturing and deeply devoted bond',
            'Emotional security meets practical care',
            'Seamless emotional and practical harmony',
            'Water nourishes Earth while Earth provides structure',
            'Exceptional potential for a lifelong partnership'
        ],
        'Water-Water': [
            'Profound emotional resonance and understanding',
            'Deep intuitive and wordless soul connection',
            'Spiritual and emotional bonding at a high level',
            'Total empathy for each other\'s inner world',
            'Creating a private sanctuary of absolute trust'
        ],
        'Water-Air': [
            'Emotional wisdom meets intellectual depth',
            'Creative and meaningful soul-level conversations',
            'Unique perspectives that enrich both lives',
            'Bridge between subconscious and conscious thought',
            'Gentle balance of logic and intuition'
        ],
        'Air-Air': [
            'Constant mental stimulation and shared wit',
            'Shared love of ideas, people, and discovery',
            'Freedom-honouring partnership of true equals',
            'Socially dazzling and intellectually vibrant',
            'Endless topics for deep exploration together'
        ],
    };
    const cp: Record<string, string[]> = {
        'Fire-Fire': [
            'Occasional ego clashes and leadership struggles',
            'Impatience with each other\'s rapid pace',
            'Burning out too quickly without grounding'
        ],
        'Fire-Air': [
            'Inconsistency vs. impulsiveness in planning',
            'Overthinking can sometimes dampen Fire\'s momentum',
            'Scattered focus on too many ideas at once'
        ],
        'Fire-Earth': [
            'Speed vs. caution creates regular friction',
            'Deep-seated stubbornness on both sides',
            'Earth may feel overwhelmed by Fire\'s intensity'
        ],
        'Fire-Water': [
            'Emotional misunderstandings and different needs',
            'Temperature differences in communication styles',
            'Water may feel scalded or Fire may feel extinguished'
        ],
        'Earth-Earth': [
            'Resistance to change and emotional expression',
            'Shared routine can become too rigid or dull',
            'Avoiding difficult emotional conversations'
        ],
        'Earth-Air': [
            'Strict practicality vs. idealistic dreaming',
            'Emotional detachment occasionally felt by Earth',
            'Differing needs for physical vs. mental focus'
        ],
        'Earth-Water': [
            'Over-sensitivity vs. pragmatic detachment',
            'Possessive tendencies appearing on both sides',
            'Resistence to leaving their safe comfort zone'
        ],
        'Water-Water': [
            'Emotional overwhelm without external grounding',
            'Difficulty setting healthy individual boundaries',
            'Floating away in dreams without practical action'
        ],
        'Water-Air': [
            'Rational vs. emotional processing of conflict',
            'Mismatched needs for closeness vs. mental space',
            'Communication gaps between logic and feelings'
        ],
        'Air-Air': [
            'Lack of emotional and practical grounding',
            'Too much intellectual talk and too little depth',
            'Indecisiveness when both avoid making choices'
        ],
    };
    const ap: Record<string, string> = {
        'Fire-Fire': 'Channel your combined fire into shared adventures and creative projects. Let each other lead in different domains — this is how competition becomes collaboration.',
        'Fire-Air': 'Keep the conversations deep and the adventures spontaneous. Ground your exciting ideas in shared experiences that build real emotional roots.',
        'Fire-Earth': 'Patience is the greatest gift you can give each other. The Fire partner brings the vision; the Earth partner makes it real. Trust the process.',
        'Fire-Water': 'Listen deeply before you react. Create emotional safety through consistency and follow-through. Fire warms Water; Water gives Fire its soul.',
        'Earth-Earth': 'Break routine intentionally. Plan adventures and surprises to keep the spark alive within your beautiful stability.',
        'Earth-Air': 'Schedule regular heart-to-heart conversations. Stay genuinely open to each other\'s different ways of seeing the world.',
        'Earth-Water': 'Appreciate the complement you are. Earth makes Water feel safe; Water makes Earth feel alive. Communicate your needs with words, not just actions.',
        'Water-Water': 'Create healthy boundaries and individual practices that keep you each whole. Shared depth is powerful — as long as both individuals remain strong.',
        'Water-Air': 'Bridge heart and mind consciously. Air should express feelings; Water should engage with ideas. This bridge becomes the most profound part of your connection.',
        'Air-Air': 'Ground your ethereal connection with physical activities, practical projects, and shared routines that give the relationship an anchor.',
    };

    const strengths = adminPair?.strengths || adminElement?.strengths || sp[ek] || sp['Fire-Air'];
    const challenges = adminPair?.challenges || adminElement?.challenges || cp[ek] || cp['Fire-Air'];
    const advice = adminPair?.advice || adminElement?.advice || ap[ek] || ap['Fire-Air'];

    return {
        score: overScore, sign1: s1, sign2: s2,
        name1: n1 || 'Person 1', name2: n2 || 'Person 2',
        level, levelColor, isSunSign,
        emotional, intellectual, physical, spiritual, communication, romance, longTerm,
        strengths: sp[ek] || ['Unique dynamic energy', 'Growth through differences', 'Complementary personalities'],
        challenges: cp[ek] || ['Adjusting to different rhythms', 'Communication gap to bridge'],
        advice: ap[ek] || 'Embrace your differences as strengths. Focus on open communication and mutual respect.',
        pairInsight, chemistry, daily,
    };
}

// ─── NAME COMPATIBILITY — CHALDEAN NUMEROLOGY ────────────────────────────────

interface NameResult {
    name1: string; name2: string;
    num1: number; num2: number;
    archetype1: any; archetype2: any;
    rashi1: any; rashi2: any;
    score: number; level: string; levelColor: string;
    heartDesire?: number; relationshipInsight: string; challenge: string;
}



// ─── localStorage ─────────────────────────────────────────────────────────────
const LS_KEY = 'compat_state_v5';
function loadState() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; } }
function saveState(s: any) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { } }

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function CompatibilityToolsPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<'love' | 'name'>('love');
    const [loveInputMode, setLoveInputMode] = useState<'sign' | 'date'>('sign');
    const [name1, setName1] = useState(''); const [name2, setName2] = useState('');
    const [sign1Idx, setSign1Idx] = useState<number | null>(null); const [sign2Idx, setSign2Idx] = useState<number | null>(null);
    const [date1, setDate1] = useState(''); const [date2, setDate2] = useState('');
    const [time1, setTime1] = useState(''); const [time2, setTime2] = useState('');
    const [nameA, setNameA] = useState(''); const [nameB, setNameB] = useState('');
    const [loveResult, setLoveResult] = useState<CompatResult | null>(null);
    const [nameResult, setNameResult] = useState<NameResult | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [aiReport, setAiReport] = useState<any | null>(null);

    // Dynamic settings from API
    const [compSettings, setCompSettings] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Use apiClient to hit the absolute backend URL and avoid JSON syntax errors from HTML responses
                const response = await apiClient.get('/compatibility-settings');
                if (response.data) {
                    setCompSettings(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch compatibility settings:', error);
            }
        };
        fetchSettings();
    }, []);
    const [nameAiReport, setNameAiReport] = useState<any | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isNameAiLoading, setIsNameAiLoading] = useState(false);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        // 1. Initial hydration check
        const isNewQuery = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('new') === 'true';
        const historyKey = sessionStorage.getItem('vaidiktalk_compat_load');

        if (historyKey && historyKey !== 'undefined') {
            // Priority: Load from history (for clicking history items)
            const item = compatibilityStorage.getActiveData(historyKey as 'name' | 'love');

            if (item) {
                setMode(historyKey as 'name' | 'love');
                
                // History item structure: { result: { result, report }, input: { ... }, type }
                if (historyKey === 'name') {
                    const res = item.result?.result || item.result;
                    const repo = item.result?.report || item.report;
                    
                    if (res) setNameResult(res);
                    if (repo) setNameAiReport(repo);
                    
                    // Restore inputs
                    if (item.input) {
                        setNameA(item.input.nameA || '');
                        setNameB(item.input.nameB || '');
                    }
                } else {
                    const res = item.result?.result || item.result;
                    const repo = item.result?.report || item.report;
                    
                    if (res) setLoveResult(res);
                    if (repo) setAiReport(repo);
                    
                    // Restore inputs
                    if (item.input) {
                        setName1(item.input.name1 || '');
                        setName2(item.input.name2 || '');
                        if (item.input.sign1) setSign1Idx(ZODIAC_SIGNS.findIndex(s => s.name === item.input.sign1.name));
                        if (item.input.sign2) setSign2Idx(ZODIAC_SIGNS.findIndex(s => s.name === item.input.sign2.name));
                        if (item.input.date1) setDate1(item.input.date1);
                        if (item.input.date2) setDate2(item.input.date2);
                        if (item.input.loveInputMode) setLoveInputMode(item.input.loveInputMode);
                    }
                }
            }
            sessionStorage.removeItem('vaidiktalk_compat_load');
        } else if (!isNewQuery) {
            // Fallback: Load saved state from localStorage
            const saved = loadState();
            if (saved) {
                if (saved.mode) setMode(saved.mode);
                if (saved.loveInputMode) setLoveInputMode(saved.loveInputMode);
                if (saved.name1) setName1(saved.name1); if (saved.name2) setName2(saved.name2);
                if (saved.sign1Idx != null) setSign1Idx(saved.sign1Idx); if (saved.sign2Idx != null) setSign2Idx(saved.sign2Idx);
                if (saved.date1) setDate1(saved.date1); if (saved.date2) setDate2(saved.date2);
                if (saved.time1) setTime1(saved.time1); if (saved.time2) setTime2(saved.time2);
                if (saved.nameA) setNameA(saved.nameA); if (saved.nameB) setNameB(saved.nameB);
                if (saved.loveResult?.pairInsight) setLoveResult(saved.loveResult);
                if (saved.nameResult?.archetype1) setNameResult(saved.nameResult);
            }
        }
        
        // Finalize mount - use a small timeout to ensure state batching is processed
        setTimeout(() => setMounted(true), 10);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (isFirstLoad.current) { isFirstLoad.current = false; return; }
        saveState({ mode, loveInputMode, name1, name2, sign1Idx, sign2Idx, date1, date2, time1, time2, nameA, nameB, loveResult, nameResult });
    }, [mounted, mode, loveInputMode, name1, name2, sign1Idx, sign2Idx, date1, date2, time1, time2, nameA, nameB, loveResult, nameResult]);

    const handleLoveCalculate = async () => {
        let idx1 = sign1Idx, idx2 = sign2Idx;
        const fromDate = (loveInputMode === 'date');
        if (fromDate) { idx1 = getZodiacFromDate(date1); idx2 = getZodiacFromDate(date2); if (idx1 < 0 || idx2 < 0 || !date1 || !date2) return; }
        else { if (idx1 === null || idx2 === null) return; }

        setCalculating(true);
        setAiReport(null); // Reset previous report

        // 1. Backend Centralized calculation
        let tradResult: any = null;
        try {
            const calcRes = await apiClient.post('/astrology/compatibility-calc', {
                idx1, idx2, mode: loveInputMode, date1, date2, name1, name2
            });
            if (calcRes.data.success) {
                tradResult = calcRes.data.data;
            } else {
                console.error('Calculation failed:', calcRes.data.message);
                setCalculating(false);
                return;
            }
        } catch (err) {
            console.error('API Error during calculation:', err);
            setCalculating(false);
            return;
        }

        // 2. Start AI Fetch in parallel
        setIsAiLoading(true);
        let finalReport = null;
        try {
            const astrologers = await aiAstrologerService.getAllAiAstrologers();
            const selectedAstro = astrologers.find(a =>
                a.specialization?.some(s => s.toLowerCase().includes('love') || s.toLowerCase().includes('relationship'))
            ) || astrologers[0];

            if (selectedAstro) {
                const s1 = ZODIAC_SIGNS[idx1!];
                const s2 = ZODIAC_SIGNS[idx2!];
                // Enhanced query for multi-section report
                const query = `Provide a professional, romantic compatibility report for ${name1 || 'Person 1'} (${s1.name}) and ${name2 || 'Person 2'} (${s2.name}). Compatibility score: ${tradResult.score}%. Focus on their ${tradResult.level} energy.`;

                // Fetch structured JSON report
                finalReport = await aiAstrologerService.getCompatibilityReport(query);

                if (finalReport) {
                    setAiReport(finalReport);
                }
            }
        } catch (error) {
            console.error('Failed to fetch AI report:', error);
        } finally {
            setIsAiLoading(false);
        }

        setLoveResult(tradResult);
        setCalculating(false);
        
        compatibilityStorage.saveHistoryItem('love', 
            { result: tradResult, report: finalReport }, 
            { name1, name2, sign1: ZODIAC_SIGNS[idx1!], sign2: ZODIAC_SIGNS[idx2!] }
        );
    };
    const handleNameCalculate = async () => {
        if (!nameA.trim() || !nameB.trim()) return;
        setCalculating(true);
        setNameAiReport(null);

        let tradResult = null;
        try {
            const calcRes = await apiClient.post('/astrology/name-calc', {
                name1: nameA.trim(),
                name2: nameB.trim()
            });
            if (calcRes.data.success) {
                tradResult = calcRes.data.data;
            } else {
                console.error('Calculation failed:', calcRes.data.message);
                setCalculating(false);
                return;
            }
        } catch (err) {
            console.error('API Error during name calculation:', err);
            setCalculating(false);
            return;
        }

        // 2. Start AI Fetch in parallel
        setIsNameAiLoading(true);
        let finalReport = null;
        try {
            const query = `Provide a numerology compatibility insight for ${nameA} (${tradResult.archetype1.title}, Number ${tradResult.num1}) and ${nameB} (${tradResult.archetype2.title}, Number ${tradResult.num2}). Compatibility score: ${tradResult.score}%.`;
            finalReport = await aiAstrologerService.getNameCompatibilityReport(query);
            if (finalReport) {
                setNameAiReport(finalReport);
            }
        } catch (error) {
            console.error('Failed to fetch name AI report:', error);
        } finally {
            setIsNameAiLoading(false);
        }

        setNameResult(tradResult);
        setCalculating(false);

        compatibilityStorage.saveHistoryItem('name', 
            { result: tradResult, report: finalReport }, 
            { nameA, nameB }
        );
    };
    const resetLove = () => { saveState(null); setSign1Idx(null); setSign2Idx(null); setName1(''); setName2(''); setDate1(''); setDate2(''); setTime1(''); setTime2(''); setLoveResult(null); };
    const resetName = () => { saveState(null); setNameA(''); setNameB(''); setNameResult(null); };

    if (!mounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

    const ScoreRing = ({ score, size = 140, label, color: propColor }: { score: number; size?: number; label?: string; color?: string }) => {
        const r = (size - 16) / 2, c = 2 * Math.PI * r, offset = c - (score / 100) * c;
        const color = propColor || (score >= 85 ? '#15803d' : score >= 70 ? '#b8962e' : score >= 55 ? '#d97706' : '#dc2626');

        // Dynamic font sizes based on ring dimensions
        const scoreFontSize = size < 100 ? 'text-lg' : 'text-3xl';
        const labelFontSize = size < 100 ? 'text-[7px]' : 'text-[10px]';
        const strokeWidth = size < 100 ? 5 : 8;

        return (
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(184,150,46,0.12)" strokeWidth={strokeWidth} />
                    <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span className={`${scoreFontSize} font-bold text-gray-900 leading-none`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}>{score}%</motion.span>
                    {label && <span className={`${labelFontSize} font-bold uppercase tracking-wider text-gray-400 mt-0.5`}>{label}</span>}
                </div>
            </div>
        );
    };

    const MiniBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" style={{ color }} /><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</span></div>
                <span className="text-[12px] font-bold text-gray-800">{value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
            </div>
        </div>
    );

    const SectionSkeleton = ({ lines = 2 }: { lines?: number }) => (
        <div className="space-y-2 animate-pulse">
            {[...Array(lines)].map((_, i) => (
                <div key={i} className={`h-3 bg-[#b8962e]/10 rounded ${i === lines - 1 ? 'w-5/6' : 'w-full'}`}></div>
            ))}
        </div>
    );

    const ZodiacBtn = ({ sign, selected, onClick }: { sign: typeof ZODIAC_SIGNS[0]; selected: boolean; onClick: () => void }) => (
        <button onClick={onClick} className={`zodiac-btn flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${selected ? 'border-[#b8962e]' : 'border-[#e9ddb8] hover:border-[#d6c89a]'}`} style={{ background: selected ? 'rgba(184,150,46,0.08)' : '#fffdf5' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold mb-1" style={{ background: selected ? 'linear-gradient(135deg,rgba(184,150,46,0.18),rgba(184,150,46,0.08))' : 'linear-gradient(135deg,rgba(107,83,53,0.1),rgba(107,83,53,0.05))', color: selected ? '#b8962e' : ELEMENT_COLORS[sign.element], border: selected ? '1.5px solid #b8962e40' : '1px solid rgba(107,83,53,0.12)' }}>
                {sign.symbol}
            </div>
            <span className="text-[10px] font-semibold text-gray-700 leading-tight text-center">{sign.name}</span>
        </button>
    );

    const inputClass = `w-full px-4 py-3 rounded-lg border border-[#d6c89a] bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15 text-[14px] transition-all`;
    const canCalcSign = sign1Idx !== null && sign2Idx !== null;
    const canCalcDate = !!date1 && !!date2;

    return (
        <div className="min-h-screen compat-wrap" style={{ backgroundColor: '#fdf6e3' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
                .compat-wrap*{font-family:'Source Sans 3',sans-serif;}
                .compat-wrap h1,.compat-wrap h2,.compat-wrap .serif{font-family:'Playfair Display',Georgia,serif;}
                .zodiac-btn{transition:all 0.18s;}
                .zodiac-btn:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(184,150,46,0.14);}
            `}} />

            {/* Loading overlay */}
            {calculating && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(253,246,227,0.88)', backdropFilter: 'blur(6px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart style={{ width: 72, height: 72, color: '#fca5a5' }} />
                            <Loader2 style={{ position: 'absolute', width: 28, height: 28, color: '#b8962e', animation: 'spin 1s linear infinite' }} />
                        </div>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8962e' }}>
                            {mode === 'love' ? 'Aligning the Stars...' : 'Analyzing Vibrations...'}
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-10">
                {/* Header */}
                <div className="mb-8 pb-6 border-b border-[#d6c89a]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold"><Sparkles className="w-3.5 h-3.5" /><span className="serif">Cosmic Compatibility Engine</span></div>
                        <button onClick={() => router.push('/compatibility/history')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all w-fit" style={{ background: '#b8962e' }}>
                            <History className="w-4 h-4" /> {t('common.history') || 'View History'}
                        </button>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-3">{t('compatibility.title')}</h1>
                    <p className="text-gray-500 text-[15px] max-w-xl">{t('compatibility.desc')}</p>
                </div>

                {/* Mode Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex p-1 rounded-xl border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.05)' }}>
                        <button onClick={() => setMode('love')} className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'love' ? 'bg-[#b8962e] text-white shadow-sm' : 'text-gray-500 hover:text-[#b8962e]'}`}><Heart className="w-4 h-4" /> {t('nav.compatibility')}</button>
                        <button onClick={() => setMode('name')} className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'name' ? 'bg-[#b8962e] text-white shadow-sm' : 'text-gray-500 hover:text-[#b8962e]'}`}><Type className="w-4 h-4" /> Name Matching</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">

                    {/* ══ LOVE INPUT ══ */}
                    {mode === 'love' && !loveResult && (
                        <motion.div key="love-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="text-center mb-6">
                                <h2 className="serif text-2xl font-semibold text-gray-900 mb-1">Select Your Zodiac Signs</h2>
                                <p className="text-gray-500 text-sm">Choose your sign and your partner's sign for instant compatibility results.</p>
                            </div>
                            <div className="flex justify-center mb-8">
                                <div className="inline-flex p-1 rounded-xl border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                    <button onClick={() => setLoveInputMode('sign')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${loveInputMode === 'sign' ? 'bg-[#2d1a6e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}><Star className="w-3.5 h-3.5" /> {t('compatibility.by_sign')}</button>
                                    <button onClick={() => setLoveInputMode('date')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${loveInputMode === 'date' ? 'bg-[#2d1a6e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}><Calendar className="w-3.5 h-3.5" /> {t('compatibility.by_date')}</button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {loveInputMode === 'sign' && (
                                    <motion.div key="by-sign" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {[{ label: 'Your Sign', name: name1, setName: setName1, ph: 'Your name (optional)', idx: sign1Idx, setIdx: setSign1Idx }, { label: "Partner's Sign", name: name2, setName: setName2, ph: "Partner's name (optional)", idx: sign2Idx, setIdx: setSign2Idx }].map((p, pi) => (
                                                <div key={pi} className="rounded-xl border border-[#d6c89a] p-5" style={{ background: '#fffdf5' }}>
                                                    <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: '#2d1a6e' }}><User className="w-4 h-4" /></div><span className="text-[14px] font-bold text-gray-800">{p.label}</span></div>
                                                    <input type="text" value={p.name} onChange={e => p.setName(e.target.value)} placeholder={p.ph} className={`${inputClass} mb-4`} />
                                                    <div className="grid grid-cols-4 gap-2">{ZODIAC_SIGNS.map((z, i) => (<ZodiacBtn key={z.name} sign={z} selected={p.idx === i} onClick={() => p.setIdx(i)} />))}</div>
                                                    {p.idx !== null && (<div className="mt-3 text-center text-[12px] text-gray-400">{ZODIAC_SIGNS[p.idx].symbol} {ZODIAC_SIGNS[p.idx].name} · {ZODIAC_SIGNS[p.idx].dateRange}</div>)}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                {loveInputMode === 'date' && (
                                    <motion.div key="by-date" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        {/* Sun sign note */}
                                        <div className="flex items-start gap-2.5 p-4 rounded-xl border border-blue-200 mb-6" style={{ background: 'rgba(59,130,246,0.04)' }}>
                                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[12px] font-semibold text-blue-700 mb-0.5">Sun Sign Compatibility</p>
                                                <p className="text-[12px] text-blue-600">Birth date will detect your <strong>Sun sign (Rashi)</strong>. For full Vedic compatibility using Moon sign, Nakshatras & Guna Milan (36 points), use our <a href="/horoscope-matching" className="underline font-semibold">Horoscope Matching</a> feature.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {[{ label: 'Your Birth Date', name: name1, setName: setName1, ph: 'Your name (optional)', date: date1, setDate: setDate1, time: time1, setTime: setTime1 }, { label: "Partner's Birth Date", name: name2, setName: setName2, ph: "Partner's name (optional)", date: date2, setDate: setDate2, time: time2, setTime: setTime2 }].map((p, pi) => {
                                                const di = p.date ? getZodiacFromDate(p.date) : -1;
                                                return (
                                                    <div key={pi} className="rounded-xl border border-[#d6c89a] p-5 space-y-4" style={{ background: '#fffdf5' }}>
                                                        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: '#2d1a6e' }}><User className="w-4 h-4" /></div><span className="text-[14px] font-bold text-gray-800">{p.label}</span></div>
                                                        <div><label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label><input type="text" value={p.name} onChange={e => p.setName(e.target.value)} placeholder={p.ph} className={inputClass} /></div>
                                                        <div><label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date of Birth</label><input type="date" value={p.date} onChange={e => p.setDate(e.target.value)} className={inputClass} /></div>
                                                        <div><label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Time <span className="text-gray-400 normal-case font-normal">(optional)</span></label><input type="time" value={p.time} onChange={e => p.setTime(e.target.value)} className={inputClass} /></div>
                                                        {di >= 0 && (<div className="flex items-center gap-2 p-3 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.05)' }}><span className="text-xl" style={{ color: ELEMENT_COLORS[ZODIAC_SIGNS[di].element] }}>{ZODIAC_SIGNS[di].symbol}</span><div><p className="text-[12px] font-bold text-gray-800">{ZODIAC_SIGNS[di].name}</p><p className="text-[11px] text-gray-400">{ZODIAC_SIGNS[di].element} Sign · {ZODIAC_SIGNS[di].ruling}</p></div></div>)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-center mt-8">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLoveCalculate} disabled={(loveInputMode === 'sign' ? !canCalcSign : !canCalcDate) || calculating} className="flex items-center gap-3 px-10 py-4 rounded-xl text-[15px] font-semibold text-white disabled:opacity-40 w-full max-w-md justify-center" style={{ background: 'linear-gradient(135deg,#b8962e 0%,#a07c1e 100%)', boxShadow: '0 8px 24px rgba(184,150,46,0.25)' }}>
                                    <Heart className="w-5 h-5" /> {t('compatibility.check_button')}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'love' && loveResult && (
                        <motion.div key="love-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                            {/* Try Another Pair at the top */}
                            <div className="flex justify-between items-center mb-6">
                                <button onClick={resetLove} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d6c89a] text-[12px] font-semibold text-[#b8962e] hover:bg-[#f5e9c8] transition-all">
                                    <RefreshCw className="w-3.5 h-3.5" /> {t('common.try_another')}
                                </button>
                                
                                <PaidPDFButton 
                                    toolKey="compatibility"
                                    reportName={`Love Compatibility - ${loveResult.name1} & ${loveResult.name2}`}
                                    downloadFn={async () => {
                                        await downloadCompatibilityPDF({ type: 'love', loveResult, aiReport });
                                    }}
                                />
                            </div>

                            {/* Sun sign note if from birth date */}
                            {loveResult.isSunSign && (
                                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-200 mb-6" style={{ background: 'rgba(59,130,246,0.04)' }}>
                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <p className="text-[12px] text-blue-700">Showing <strong>Sun Sign</strong> compatibility. For full Vedic Moon sign + Guna Milan analysis, try our <a href="/horoscope-matching" className="underline font-semibold inline-flex items-center gap-0.5">Horoscope Matching <ExternalLink className="w-3 h-3" /></a>.</p>
                                </div>
                            )}

                            {/* Both signs header */}
                            <div className="flex items-center justify-center gap-8 mb-8">
                                {[{ sign: loveResult.sign1, name: loveResult.name1, grad: 'linear-gradient(135deg,#2d1a6e,#4a2fa0)' }, { sign: loveResult.sign2, name: loveResult.name2, grad: 'linear-gradient(135deg,#7c1a4e,#a02f80)' }].map((p, i) => (
                                    <React.Fragment key={i}>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-md relative group" style={{ background: p.grad, color: 'white', border: '2px solid rgba(255,255,255,0.15)' }}>
                                                {p.sign.symbol}
                                                <div className="absolute -bottom-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur shadow-sm border border-[#d6c89a] text-[9px] font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {p.sign.dateRange}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-bold text-gray-800 block">{p.sign.name}</span>
                                                <span className="text-[11px] font-medium text-gray-400 block -mt-0.5">{p.sign.sanskritName}</span>
                                            </div>
                                            {p.name && p.name !== `Person ${i + 1}` && <span className="text-[11px] text-[#b8962e] font-semibold">"{p.name}"</span>}
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${ELEMENT_COLORS[p.sign.element]}12`, color: ELEMENT_COLORS[p.sign.element] }}>{p.sign.element} · {p.sign.quality}</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Ruled by {p.sign.ruling}</span>
                                        </div>
                                        {i === 0 && (<div className="flex flex-col items-center gap-1.5"><div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform rotate-12" style={{ background: loveResult.levelColor }}><Heart className="w-6 h-6 text-white fill-white" /></div><span className="text-[10px] font-black uppercase tracking-widest" style={{ color: loveResult.levelColor }}>Connects</span></div>)}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* Left: Score + Dimensions */}
                                <div className="rounded-xl border border-[#d6c89a] p-5 flex flex-col items-center relative overflow-hidden" style={{ background: '#fffdf5' }}>
                                    <div className="absolute top-0 right-0 p-3 opacity-5"><Heart className="w-24 h-24" style={{ color: loveResult.levelColor }} /></div>
                                    <ScoreRing score={loveResult.score} label={t('compatibility.overall_score')} color={loveResult.levelColor} />
                                    <div className="mt-3 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm" style={{ background: `${loveResult.levelColor}15`, color: loveResult.levelColor, border: `1px solid ${loveResult.levelColor}30` }}>{loveResult.level}</div>
                                    <div className="w-full mt-5 space-y-2.5">
                                        <MiniBar label={t('compatibility.emotional')} value={loveResult.emotional} icon={Heart} color="#ef4444" />
                                        <MiniBar label={t('compatibility.romance')} value={loveResult.romance} icon={Sparkles} color="#ec4899" />
                                        <MiniBar label={t('compatibility.intellectual')} value={loveResult.intellectual} icon={Zap} color="#3b82f6" />
                                        <MiniBar label={t('compatibility.communication')} value={loveResult.communication} icon={MessageCircle} color="#8b5cf6" />
                                        <MiniBar label={t('compatibility.physical')} value={loveResult.physical} icon={Flame} color="#f59e0b" />
                                        <MiniBar label={t('compatibility.long_term')} value={loveResult.longTerm} icon={Star} color="#10b981" />
                                        <MiniBar label={t('compatibility.spiritual')} value={loveResult.spiritual} icon={Moon} color="#6366f1" />
                                    </div>
                                    <div className="w-full mt-5 pt-4 border-t border-[#e9ddb8] grid grid-cols-2 gap-2 text-center">
                                        {[{ sign: loveResult.sign1 }, { sign: loveResult.sign2 }].map((p, i) => (<div key={i}><p className="text-[10px] font-bold uppercase tracking-wider text-[#b8962e]">Ruling</p><p className="text-[13px] font-semibold text-gray-700 mt-0.5">{p.sign.ruling}</p><p className="text-[11px] text-gray-400">{p.sign.name}</p></div>))}
                                    </div>
                                </div>

                                {/* Right: Rich insights */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="rounded-xl border border-[#d6c89a] p-5" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-[#b8962e]" />
                                            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b8962e]">
                                                {isAiLoading ? 'AI Cosmic Analysis...' : `Deep Insight: ${loveResult.sign1.name} + ${loveResult.sign2.name}`}
                                            </p>
                                        </div>
                                        {isAiLoading ? (
                                            <div className="space-y-2 animate-pulse">
                                                <div className="h-3 bg-[#b8962e]/10 rounded w-full"></div>
                                                <div className="h-3 bg-[#b8962e]/10 rounded w-5/6"></div>
                                                <div className="h-3 bg-[#b8962e]/10 rounded w-4/6"></div>
                                            </div>
                                        ) : (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-[14px] text-gray-700 leading-relaxed font-medium"
                                            >
                                                {aiReport?.deepInsight || loveResult.pairInsight}
                                            </motion.p>
                                        )}
                                    </div>
                                    {/* Chemistry */}
                                    <div className="rounded-xl border border-rose-200 p-5" style={{ background: 'rgba(244,63,94,0.03)' }}>
                                        <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-rose-500" /><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-600">Romantic Chemistry</p></div>
                                        <p className="text-[14px] text-gray-700 leading-relaxed">{aiReport?.chemistry || loveResult.chemistry}</p>
                                    </div>
                                    {/* Daily dynamic */}
                                    <div className="rounded-xl border border-[#d6c89a] p-5" style={{ background: '#fffdf5' }}>
                                        <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-amber-500" /><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">Day-to-Day Dynamic</p></div>
                                        <p className="text-[14px] text-gray-700 leading-relaxed">{aiReport?.dynamic || loveResult.daily}</p>
                                    </div>
                                    {/* Strengths + Challenges */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-[#d6c89a] p-4" style={{ background: '#fffdf5' }}>
                                            <div className="flex items-center gap-2 mb-2"><Check className="w-4 h-4 text-emerald-600" /><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">Strengths</p></div>
                                            <div className="space-y-1.5">
                                                {(aiReport?.strengths || loveResult.strengths).map((s: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                                                        <span className="text-[12px] text-gray-700">{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-[#d6c89a] p-4" style={{ background: '#fffdf5' }}>
                                            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-amber-600" /><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">Challenges</p></div>
                                            <div className="space-y-1.5">
                                                {(aiReport?.challenges || loveResult.challenges).map((c: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                                                        <span className="text-[12px] text-gray-700">{c}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Cosmic advice */}
                                    <div className="rounded-xl border border-[#d6c89a] p-4" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                        <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-[#b8962e]" /><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b8962e]">Cosmic Advice</p></div>
                                        <p className="text-[13px] text-gray-700 leading-relaxed">{aiReport?.advice || loveResult.advice}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Horoscope Matching CTA */}
                            <div className="rounded-xl border border-purple-200 p-5 flex items-center justify-between mb-6" style={{ background: 'linear-gradient(135deg,rgba(45,26,110,0.04),rgba(74,47,160,0.06))' }}>
                                <div>
                                    <p className="text-[13px] font-bold text-[#2d1a6e] mb-0.5">Want a deeper Vedic analysis?</p>
                                    <p className="text-[12px] text-gray-500">Get Guna Milan (36 points), Nadi, Bhakoot, Moon sign & full Kundli matching</p>
                                </div>
                                <a href="/horoscope-matching" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white flex-shrink-0 ml-4" style={{ background: '#2d1a6e' }}>
                                    Horoscope Matching <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            <div className="flex justify-center">
                                <button onClick={resetLove} className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#d6c89a] text-[13px] font-semibold text-[#b8962e] hover:bg-[#f5e9c8] transition-all"><RefreshCw className="w-4 h-4" /> Try Another Pair</button>
                            </div>
                        </motion.div>
                    )}

                    {/* ══ NAME INPUT ══ */}
                    {mode === 'name' && !nameResult && (
                        <motion.div key="name-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="max-w-lg mx-auto">
                                <div className="text-center mb-8">
                                    <h2 className="serif text-2xl font-semibold text-gray-900 mb-2">Name Compatibility</h2>
                                    <p className="text-gray-500 text-sm">Enter two names to discover their numerological vibration and compatibility</p>
                                </div>
                                <div className="rounded-xl border border-[#d6c89a] p-6 space-y-5" style={{ background: '#fffdf5' }}>
                                    <div><label className="block text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-2">Your Name</label><input type="text" value={nameA} onChange={e => setNameA(e.target.value)} placeholder="Enter first name..." className="w-full px-4 py-3.5 rounded-lg border border-[#d6c89a] bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15 text-[15px] transition-all" /></div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #d6c89a', background: 'rgba(184,150,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart style={{ width: 16, height: 16, color: '#b8962e' }} /></div></div>
                                    <div><label className="block text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-2">Partner's Name</label><input type="text" value={nameB} onChange={e => setNameB(e.target.value)} placeholder="Enter second name..." className="w-full px-4 py-3.5 rounded-lg border border-[#d6c89a] bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15 text-[15px] transition-all" /></div>
                                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleNameCalculate} disabled={!nameA.trim() || !nameB.trim() || calculating} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-[15px] font-semibold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#b8962e 0%,#a07c1e 100%)', boxShadow: '0 8px 24px rgba(184,150,46,0.25)' }}>
                                        <Sparkles className="w-5 h-5" /> Calculate Compatibility
                                    </motion.button>
                                </div>
                                <div className="mt-6 p-4 rounded-xl border border-dashed border-[#d6c89a] text-center" style={{ background: 'rgba(184,150,46,0.03)' }}>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b8962e] mb-1">Chaldean Numerology</p>
                                    <p className="text-[12px] text-gray-500 leading-relaxed">The ancient Babylonian system used in Vedic tradition. Each letter carries a sacred vibration (1–8, as 9 is divine). We calculate your Name Number, Heart's Desire, and planetary archetype to reveal your unique cosmic compatibility.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ══ NAME RESULT ══ */}
{mode === 'name' && nameResult && (
  <motion.div key="name-result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <div className="w-full bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0e8e8' }}>

      {/* Header strip */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0e8e8' }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#c0392b', margin: 0 }}>
          Chiero / Chaldean Numerology
        </p>
        <div className="flex items-center gap-3">
            <PaidPDFButton 
                toolKey="compatibility"
                reportName={`Name Compatibility - ${nameResult.name1} & ${nameResult.name2}`}
                downloadFn={async () => {
                    await downloadCompatibilityPDF({ type: 'name', nameResult, aiReport: nameAiReport });
                }}
                variant="none"
                size="sm"
                className="text-[#c0392b] hover:opacity-80"
            />
            <button onClick={resetName} className="flex items-center gap-1 text-[11px] font-bold hover:underline" style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw className="w-3 h-3" /> Reset
            </button>
        </div>
      </div>

      {/* Methodology line */}
      <div className="px-6 pt-6 pb-3">
        <p className="text-[14px] leading-relaxed" style={{ color: '#1a1a1a', margin: 0 }}>
          As per Chiero / Chaldean method of numerology,{' '}
          <strong>{nameResult.name1}</strong> ({nameResult.rashi1?.symbol} {nameResult.rashi1?.name}) has Namank{' '}
          <strong style={{ color: '#c0392b' }}>{nameResult.num1}</strong> and{' '}
          <strong>{nameResult.name2}</strong> ({nameResult.rashi2?.symbol} {nameResult.rashi2?.name}) has Namank{' '}
          <strong style={{ color: '#c0392b' }}>{nameResult.num2}</strong>.{' '}
          This shows <strong>{nameResult.level}</strong> compatibility between your cosmic vibrations.
        </p>
      </div>

      {/* Big compatibility line */}
      <div className="flex items-center justify-center gap-3 py-7">
        <span style={{ fontSize: 26 }}>❤️</span>
        <p className="text-[22px] font-bold" style={{ color: '#1a1a1a', margin: 0 }}>
          {nameResult.name1} and {nameResult.name2} are{' '}
          <span style={{ color: '#c0392b' }}>{nameResult.score}% Compatible.</span>
        </p>
      </div>

      {/* Namank & Rashi Details */}
      <div className="flex flex-col gap-3 px-6 pb-6" style={{ borderTop: '1px solid #f0e8e8', paddingTop: '20px' }}>
        <div className="flex items-center justify-between group">
            <a href="#" className="flex items-center gap-3 text-[14px] font-semibold hover:underline" style={{ color: '#c0392b', textDecoration: 'none' }}>
                <span className="flex items-center justify-center w-7 h-7 rounded text-white text-[13px] font-black" style={{ background: '#c0392b' }}>
                    {nameResult.num1}
                </span>
                {nameResult.name1}'s namank ({nameResult.archetype1.title})
            </a>
            <span className="text-[12px] font-bold text-gray-900 uppercase tracking-tighter">
                Rashi: {nameResult.rashi1?.name}
            </span>
        </div>
        <div className="flex items-center justify-between group">
            <a href="#" className="flex items-center gap-3 text-[14px] font-semibold hover:underline" style={{ color: '#c0392b', textDecoration: 'none' }}>
                <span className="flex items-center justify-center w-7 h-7 rounded text-white text-[13px] font-black" style={{ background: '#c0392b' }}>
                    {nameResult.num2}
                </span>
                {nameResult.name2}'s namank ({nameResult.archetype2.title})
            </a>
            <span className="text-[12px] font-bold text-gray-900 uppercase tracking-tighter">
                Rashi: {nameResult.rashi2?.name}
            </span>
        </div>
      </div>

      {/* Cosmic Archetypes Section */}
      <div className="px-6 py-6" style={{ borderTop: '1px solid #f0e8e8', background: 'rgba(184,150,46,0.02)' }}>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-center mb-6" style={{ color: '#b8962e' }}>Cosmic Archetypes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Person 1 */}
          <div className="p-5 rounded-2xl border bg-white" style={{ border: '1px solid #f0e8e8' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{nameResult.name1}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg font-black text-orange-600 border border-orange-100">{nameResult.num1}</div>
              <div>
                <h4 className="text-[15px] font-bold text-gray-900">{nameResult.archetype1.title}</h4>
                <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wider">Ruled by {nameResult.archetype1.planet || 'Calculating...'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b8962e] mb-1.5 flex items-center gap-1.5"><Zap size={12}/> Personality Profile</p>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {nameResult.archetype1.description || `${nameResult.name1} carries the powerful vibration of Number ${nameResult.num1}. This energy gift them with unique strengths and a distinctive approach to life's journey.`}
                </p>
              </div>
              {nameResult.archetype1.inLove && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1.5 flex items-center gap-1.5"><Heart size={12} className="fill-rose-500"/> In Relationships</p>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    "{nameResult.archetype1.inLove}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Person 2 */}
          <div className="p-5 rounded-2xl border bg-white" style={{ border: '1px solid #f0e8e8' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{nameResult.name2}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg font-black text-purple-600 border border-purple-100">{nameResult.num2}</div>
              <div>
                <h4 className="text-[15px] font-bold text-gray-900">{nameResult.archetype2.title}</h4>
                <p className="text-[11px] font-semibold text-purple-500 uppercase tracking-wider">Ruled by {nameResult.archetype2.planet || 'Calculating...'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b8962e] mb-1.5 flex items-center gap-1.5"><Zap size={12}/> Personality Profile</p>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {nameResult.archetype2.description || `${nameResult.name2} carries the powerful vibration of Number ${nameResult.num2}. This energy gift them with unique strengths and a distinctive approach to life's journey.`}
                </p>
              </div>
              {nameResult.archetype2.inLove && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1.5 flex items-center gap-1.5"><Heart size={12} className="fill-rose-500"/> In Relationships</p>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    "{nameResult.archetype2.inLove}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="px-6 py-5" style={{ borderTop: '1px solid #f0e8e8', background: '#f8f8f8' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center mb-3 text-gray-400">Sacred Connection Insight</p>
        <p className="text-[14px] leading-relaxed text-center font-medium px-4" style={{ color: '#1a1a1a', margin: 0 }}>
          {/* Priority: 1. Admin Override, 2. Live AI Report, 3. Hardcoded Professional Default */}
          {compSettings?.numerologyPairInsights?.[`${Math.min(nameResult.num1, nameResult.num2)}-${Math.max(nameResult.num1, nameResult.num2)}`] 
            || nameAiReport?.deepInsight 
            || nameResult.relationshipInsight}
        </p>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button onClick={resetName}
          className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#c0392b' }}>
          Start new comparison
        </button>
      </div>

    </div>
  </motion.div>
)}
                </AnimatePresence>
            </div>
        </div>
    );
}