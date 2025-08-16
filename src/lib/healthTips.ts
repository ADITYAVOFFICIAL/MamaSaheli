export type Trimester = "Pre-conception" | "First" | "Second" | "Third" | "Fourth Trimester" | "Post-term" | "N/A" | "Error";

export interface HealthTip {
    id: string;
    title: string;
    description: string;
    category: 'Nutrition' | 'Exercise' | 'Symptoms' | 'Preparation' | 'Wellbeing' | 'Provider' | 'General';
    weeks?: { start: number; end: number };
}

const healthTipsData: Map<Trimester, HealthTip[]> = new Map([
    ["Pre-conception", [
        { id: 'pc-folic-acid', title: "Start Folic Acid", description: "Begin taking a daily prenatal vitamin with at least 400-800mcg of folic acid. This is crucial for preventing neural tube defects in the earliest stages of development.", category: 'Nutrition' },
        { id: 'pc-lifestyle', title: "Review Your Lifestyle", description: "Focus on a balanced diet, aim for a healthy weight, engage in regular moderate exercise, and ensure adequate sleep. Reducing stress now can set a positive tone for pregnancy.", category: 'Wellbeing' },
        { id: 'pc-checkup', title: "Schedule a Pre-conception Check-up", description: "Discuss your medical history, current medications, and any vaccinations you might need with your healthcare provider to ensure you're ready for a healthy pregnancy.", category: 'Provider' },
        { id: 'pc-substances', title: "Avoid Harmful Substances", description: "Cease smoking, alcohol consumption, and recreational drug use as they can impact fertility and fetal health. Discuss all medications with your doctor.", category: 'General' },
        { id: 'pc-genetics', title: "Consider Genetic Counseling", description: "If you have a family history of genetic disorders, consider discussing genetic carrier screening with your provider to understand potential risks.", category: 'Provider' },
    ]],

    ["First", [
        { id: 't1w4-confirm', title: "Confirm Your Pregnancy", description: "A home pregnancy test is a good start, but schedule an appointment with your healthcare provider to confirm the pregnancy and establish a timeline.", category: 'Provider', weeks: { start: 4, end: 6 } },
        { id: 't1w6-nausea-management', title: "Manage Morning Sickness", description: "Eat small, frequent meals of bland foods like crackers or toast. Ginger tea, vitamin B6, and acupressure wristbands can also provide relief. Stay hydrated by sipping fluids throughout the day.", category: 'Symptoms', weeks: { start: 6, end: 12 } },
        { id: 't1w7-mood-swings', title: "Navigate Emotional Changes", description: "Hormonal shifts can cause mood swings. Be patient with yourself. Ensure you're getting enough rest, eating well, and talking about your feelings with your partner or a friend.", category: 'Wellbeing' },
        { id: 't1w8-first-prenatal-visit', title: "Prepare for Your First Visit", description: "Your first major check-up is usually around 8-10 weeks. Write down questions about your health, symptoms, and what to expect in the coming months.", category: 'Provider', weeks: { start: 7, end: 10 } },
        { id: 't1w10-combat-fatigue', title: "Combat Extreme Fatigue", description: "Your body is working hard to grow the placenta. Listen to your body and prioritize rest. Short naps can be very beneficial. Light exercise, like a short walk, can sometimes boost energy.", category: 'Symptoms', weeks: { start: 5, end: 13 } },
        { id: 't1-hydration-is-key', title: "Stay Hydrated", description: "Aim for 8-10 glasses of water daily. Hydration is essential for forming the amniotic fluid, producing extra blood volume, and flushing out waste.", category: 'Nutrition' },
        { id: 't1-food-safety', title: "Practice Food Safety", description: "Avoid raw/undercooked meats, eggs, high-mercury fish (like swordfish), unpasteurized dairy products, and deli meats unless heated until steaming to prevent harmful infections.", category: 'Nutrition' },
        { id: 't1-gentle-movement', title: "Embrace Gentle Movement", description: "If you feel up to it and your provider approves, gentle exercises like walking, swimming, or prenatal yoga can help with energy levels and mood.", category: 'Exercise' },
        { id: 't1-dental-health', title: "Don't Forget Dental Health", description: "Pregnancy hormones can affect your gums. It's safe and recommended to have a dental check-up, but be sure to inform your dentist that you are pregnant.", category: 'Provider' },
    ]],

    ["Second", [
        { id: 't2w16-feeling-movement', title: "Feeling Baby's First Movements?", description: "Between weeks 16-25, you may start to feel 'quickening'—the baby's first flutters. It can feel like gas bubbles initially. Pay attention to these gentle sensations.", category: 'Symptoms', weeks: { start: 16, end: 25 } },
        { id: 't2w18-anatomy-scan', title: "The Anatomy Scan", description: "This detailed ultrasound, usually around 18-22 weeks, checks your baby's physical development, confirms the due date, and may reveal the baby's sex if you choose to find out.", category: 'Provider', weeks: { start: 18, end: 22 } },
        { id: 't2w24-glucose-screening', title: "Prepare for Glucose Screening", description: "Between 24-28 weeks, you'll likely have a test for gestational diabetes. Follow your provider's instructions regarding fasting or what to eat beforehand.", category: 'Provider', weeks: { start: 24, end: 28 } },
        { id: 't2-energy-boost', title: "Enjoy the Second Trimester Energy", description: "Many women feel their best during this time as nausea and fatigue often subside. It's a great time for planning, gentle exercise, and preparing for the baby.", category: 'Wellbeing' },
        { id: 't2-iron-and-calcium', title: "Focus on Iron and Calcium", description: "Your need for these nutrients increases now. Include iron-rich foods like lean meats and lentils, and calcium sources like dairy, fortified milks, and leafy greens.", category: 'Nutrition' },
        { id: 't2-kegels', title: "Strengthen Your Pelvic Floor", description: "Start practicing Kegel exercises daily. Strengthening these muscles supports your bladder, uterus, and bowels, and aids in postpartum recovery.", category: 'Exercise' },
        { id: 't2-comfortable-sleep', title: "Sleep Comfortably", description: "As your bump grows, sleeping on your side (preferably the left) with pillows for support between your knees and under your belly can improve comfort and circulation.", category: 'Wellbeing' },
        { id: 't2-maternity-leave', title: "Plan for Maternity Leave", description: "Start researching your company's policies and discussing your plans with your employer. Knowing your options reduces stress later on.", category: 'Preparation' },
    ]],

    ["Third", [
        { id: 't3w28-kick-counts', title: "Monitor Fetal Movement Daily", description: "Your provider will likely advise you to start 'kick counts' around week 28. Pick a time when your baby is usually active and track how long it takes to feel 10 movements.", category: 'Symptoms', weeks: { start: 28, end: 42 } },
        { id: 't3w32-braxton-hicks', title: "Recognize Braxton Hicks", description: "You may notice irregular, 'practice' contractions. They are usually not painful and stop when you change position. Learn to distinguish them from true labor contractions.", category: 'Symptoms', weeks: { start: 30, end: 40 } },
        { id: 't3w35-birth-plan', title: "Finalize Your Birth Plan", description: "Discuss your preferences for labor and delivery with your provider and partner. Remember to be flexible, as plans can change.", category: 'Preparation', weeks: { start: 34, end: 38 } },
        { id: 't3w36-pack-hospital-bag', title: "Pack Your Hospital Bag", description: "Have your bag ready with essentials for you, your partner, and the baby. Include documents, comfortable clothes, toiletries, and a going-home outfit for the baby.", category: 'Preparation', weeks: { start: 36, end: 40 } },
        { id: 't3-prioritize-rest', title: "Prioritize Rest and Comfort", description: "Fatigue often returns. Listen to your body and rest whenever you can. Use pillows to support your body while sleeping to alleviate discomfort.", category: 'Wellbeing' },
        { id: 't3-nutrient-dense-meals', title: "Eat Small, Nutrient-Dense Meals", description: "Your stomach has less room, so eating smaller, more frequent meals can help with heartburn and keep your energy levels stable for the final weeks of growth.", category: 'Nutrition' },
        { id: 't3-learn-labor-signs', title: "Learn the Signs of Labor", description: "Familiarize yourself with the early signs of labor: losing your mucus plug, water breaking (a gush or trickle), and regular, progressively stronger contractions.", category: 'Preparation' },
        { id: 't3-nesting-instinct', title: "Embrace the Nesting Instinct", description: "Many experience a burst of energy to clean and organize before the baby arrives. It's a natural instinct, but be careful not to overexert yourself.", category: 'Wellbeing' },
    ]],

    ["Post-term", [
        { id: 'pt-increased-monitoring', title: "Expect Increased Monitoring", description: "Your provider will monitor you and the baby more closely with non-stress tests or ultrasounds to ensure the placenta is still functioning well and the baby is healthy.", category: 'Provider' },
        { id: 'pt-discuss-induction', title: "Discuss Labor Induction", description: "Stay in close communication with your provider about the pros and cons of inducing labor if it doesn't start on its own. Understand the methods and timeline.", category: 'Provider' },
        { id: 'pt-continue-kick-counts', title: "Vigilant Kick Counting", description: "Continue to monitor your baby's movements very carefully. Report any significant changes to your provider immediately, as this is a key indicator of well-being.", category: 'Symptoms' },
        { id: 'pt-rest-and-wait', title: "Rest, Relax, and Wait", description: "The final days can be challenging. Try to rest, stay hydrated, and engage in relaxing activities. Your baby will arrive soon!", category: 'Wellbeing' },
    ]],

    ["Fourth Trimester", [
        { id: 'p-rest-and-recover', title: "Prioritize Rest and Recovery", description: "The first few weeks are for healing. Sleep when the baby sleeps, limit visitors, and accept help with meals and chores to allow your body to recover.", category: 'Wellbeing' },
        { id: 'p-postpartum-nutrition', title: "Nourish Your Body", description: "Focus on nutrient-dense foods to support healing and milk production if you're breastfeeding. Stay well-hydrated, especially if nursing.", category: 'Nutrition' },
        { id: 'p-baby-blues-vs-ppd', title: "Monitor Your Mental Health", description: "It's common to feel emotional ('baby blues'). However, if feelings of sadness or anxiety are severe or last longer than two weeks, contact your provider. Postpartum depression is treatable.", category: 'Wellbeing' },
        { id: 'p-feeding-support', title: "Seek Feeding Support", description: "Whether breastfeeding or formula feeding, challenges can arise. Don't hesitate to contact a lactation consultant or your pediatrician for guidance and support.", category: 'Provider' },
        { id: 'p-pelvic-floor-care', title: "Gentle Pelvic Floor Care", description: "After getting clearance from your provider, begin gentle pelvic floor exercises (Kegels) to help with recovery and prevent long-term issues.", category: 'Exercise' },
    ]],

    ["N/A", [
        { id: 'na-update-profile', title: "Update Your Profile", description: "Add your estimated due date or current week of pregnancy to your profile to receive personalized tips and track your journey.", category: 'General' },
        { id: 'na-general-wellness', title: "Focus on General Wellness", description: "Regardless of your stage, focus on overall health: eat nutritious foods, stay hydrated, get adequate rest, and consult your provider for personalized advice.", category: 'General' },
    ]],
    ["Error", [
        { id: 'err-consult-provider', title: "Consult Your Provider", description: "There was an issue calculating your pregnancy stage. Please consult your healthcare provider for personalized advice and information.", category: 'Provider' },
        { id: 'err-general-health', title: "General Health Tips", description: "While your stage is being determined, focus on a balanced diet, staying hydrated, and getting plenty of rest. Avoid any new strenuous activities without medical advice.", category: 'General' },
    ]],
]);

export const defaultHealthTip: HealthTip = {
    id: 'default-consult-provider',
    title: "Consult Your Healthcare Provider",
    description: "Always consult your healthcare provider for personalized advice specific to your health and pregnancy. This information is for general purposes only.",
    category: 'Provider',
};

export const selectHealthTip = (trimester: Trimester, week: number = 0): HealthTip => {
    const potentialTips = healthTipsData.get(trimester) ?? healthTipsData.get("N/A") ?? [];

    if (potentialTips.length === 0) {
        return defaultHealthTip;
    }

    const weekSpecificTips = potentialTips.filter(tip =>
        tip.weeks && week >= tip.weeks.start && week <= tip.weeks.end
    );

    if (weekSpecificTips.length > 0) {
        const randomIndex = Math.floor(Math.random() * weekSpecificTips.length);
        return weekSpecificTips[randomIndex];
    }

    const generalTrimesterTips = potentialTips.filter(tip => !tip.weeks);

    if (generalTrimesterTips.length > 0) {
        const randomIndex = Math.floor(Math.random() * generalTrimesterTips.length);
        return generalTrimesterTips[randomIndex];
    }

    const fallbackTips = healthTipsData.get("N/A") ?? [];
    if (fallbackTips.length > 0) {
        return fallbackTips[0];
    }

    return defaultHealthTip;
};