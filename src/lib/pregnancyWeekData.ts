// src/data/pregnancyData.ts
export interface PregnancyWeekInfo {
  week: number;
  trimester: 1 | 2 | 3;
  comparison: {
    name: string;
    indianName?: string;
  };
  lengthCm: string;
  lengthMeasurementType: 'crown-rump' | 'head-heel';
  weightGrams: string;
  imageUrl: string;
  babyDevelopment: string;
  momTip: string;
}

export const pregnancyWeekData: PregnancyWeekInfo[] = [
  {
    week: 4,
    trimester: 1,
    comparison: { name: 'Poppy Seed', indianName: 'Khas Khas' },
    lengthCm: '1 mm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '< 1 g',
    imageUrl: '/infographics/week-4.png',
    babyDevelopment: "Your little one is a tiny ball of cells called a blastocyst, embedding into your uterine lining. The inner cells will become the embryo, while the outer cells form the placenta.",
    momTip: "It's very early days! Focus on taking your prenatal vitamins, especially folic acid. A simple, comforting dal-rice meal can be gentle on your stomach."
  },
  {
    week: 5,
    trimester: 1,
    comparison: { name: 'Apple Seed', indianName: 'Seb ka Beej' },
    lengthCm: '3 mm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '< 1 g',
    imageUrl: '/infographics/week-5.png',
    babyDevelopment: "A tiny heart tube has formed and begins to beat. The brain, spinal cord, and major organs are starting to take shape from distinct cell layers.",
    momTip: "You might be feeling extra tired. Listen to your body and rest. A warm cup of ginger tea (adrak chai) can help with early waves of nausea."
  },
  {
    week: 6,
    trimester: 1,
    comparison: { name: 'Sweet Pea', indianName: 'Meetha Matar' },
    lengthCm: '6 mm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '< 1 g',
    imageUrl: '/infographics/week-6.png',
    babyDevelopment: "Facial features are beginning to form, with dark spots where eyes will be and openings for nostrils. Tiny buds that will grow into arms and legs are visible.",
    momTip: "Morning sickness might be kicking in. Try eating small, frequent meals. Many find that sniffing a lemon or eating dry toast can help settle the stomach."
  },
  {
    week: 7,
    trimester: 1,
    comparison: { name: 'Chickpea', indianName: 'Chana' },
    lengthCm: '1.3 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '1 g',
    imageUrl: '/infographics/week-7.png',
    babyDevelopment: "Your baby is developing distinct, webbed fingers and toes. Their brain is growing rapidly, with about 100 new brain cells forming every minute!",
    momTip: "Food cravings or aversions might start now. Don't worry if you can't stomach your usual roti-sabzi. Try simple, cooling foods like curd rice or khichdi."
  },
  {
    week: 8,
    trimester: 1,
    comparison: { name: 'Kidney Bean', indianName: 'Rajma' },
    lengthCm: '1.6 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '1 g',
    imageUrl: '/infographics/week-8.png',
    babyDevelopment: "The baby is constantly moving, though you can't feel it yet. Eyelids, lips, and the tip of the nose are becoming more defined.",
    momTip: "Your sense of smell might be heightened. Avoid strong smells that trigger nausea. Light, fresh scents like mint or lemon can be calming."
  },
  {
    week: 9,
    trimester: 1,
    comparison: { name: 'Grape', indianName: 'Angoor' },
    lengthCm: '2.3 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '2 g',
    imageUrl: '/infographics/week-9.png',
    babyDevelopment: "The embryo is now officially a fetus! All essential organs have formed and are starting to function. Tiny tooth buds are appearing in the gums.",
    momTip: "Sucking on a piece of amla (Indian gooseberry) or ginger can help with nausea. Stay hydrated with small sips of water, coconut water, or weak tea."
  },
  {
    week: 10,
    trimester: 1,
    comparison: { name: 'Strawberry', indianName: 'Strawberry' },
    lengthCm: '3.1 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '4 g',
    imageUrl: '/infographics/week-10.png',
    babyDevelopment: "The webbing between fingers and toes is disappearing, and fingernails are beginning to form. Your baby can now bend their tiny limbs.",
    momTip: "Your clothes might start feeling snug. It's a good time to look for comfortable maternity wear, like kurtas or dresses made from breathable cotton."
  },
  {
    week: 11,
    trimester: 1,
    comparison: { name: 'Lime', indianName: 'Nimbu' },
    lengthCm: '4.1 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '7 g',
    imageUrl: '/infographics/week-11.png',
    babyDevelopment: "The baby is busy kicking and stretching in their amniotic sac. Their diaphragm is forming, and they might even get the hiccups!",
    momTip: "Keep up with your calcium intake for your baby's growing bones. Dairy products like paneer, curd, and lassi are excellent sources."
  },
  {
    week: 12,
    trimester: 1,
    comparison: { name: 'Plum', indianName: 'Aloo Bukhara' },
    lengthCm: '5.4 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '14 g',
    imageUrl: '/infographics/week-12.png',
    babyDevelopment: "Your baby's reflexes are developing; they will curl their fingers and toes if prodded. Their intestines are moving from the umbilical cord into their abdomen.",
    momTip: "Headaches can be common. Instead of reaching for medication, try resting in a dark room or applying a cool compress. Check with your doctor for safe options."
  },
  {
    week: 13,
    trimester: 1,
    comparison: { name: 'Peach', indianName: 'Aadu' },
    lengthCm: '7.4 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '23 g',
    imageUrl: '/infographics/week-13.png',
    babyDevelopment: "Welcome to the second trimester! Your baby's unique fingerprints are now in place. They can move their arms and legs, and might be able to put a thumb in their mouth.",
    momTip: "Many women find their energy returns now! It's a good time to start gentle exercises like walking or prenatal yoga. Stay hydrated with nimbu pani or chaas (buttermilk)."
  },
  {
    week: 14,
    trimester: 2,
    comparison: { name: 'Lemon', indianName: 'Nimbu' },
    lengthCm: '8.7 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '43 g',
    imageUrl: '/infographics/week-14.png',
    babyDevelopment: "The baby can now squint, frown, and make other facial expressions. Fine, downy hair called lanugo is starting to cover their body for warmth.",
    momTip: "As your belly grows, you might experience round ligament pain. Move slowly and avoid sudden movements. A gentle belly massage with coconut oil can be soothing."
  },
  {
    week: 15,
    trimester: 2,
    comparison: { name: 'Apple', indianName: 'Seb' },
    lengthCm: '10.1 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '70 g',
    imageUrl: '/infographics/week-15.png',
    babyDevelopment: "Their skeleton is hardening from rubbery cartilage to bone, a process called ossification. They can sense light through their fused eyelids.",
    momTip: "Your appetite may increase. Focus on nutritious meals. A balanced Indian thali with dal, sabzi, roti, rice, and salad is a perfect choice."
  },
  {
    week: 16,
    trimester: 2,
    comparison: { name: 'Sweet Lime', indianName: 'Mosambi' },
    lengthCm: '11.6 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '100 g',
    imageUrl: '/infographics/week-16.png',
    babyDevelopment: "Your baby's nervous system is maturing. They can hear your voice and heartbeat now, so talk and sing to them! Their eyes can make small side-to-side movements.",
    momTip: "You might feel the first flutters of movement (quickening) soon! It's an exciting milestone. Share this special moment with your partner and family."
  },
  {
    week: 17,
    trimester: 2,
    comparison: { name: 'Pear', indianName: 'Nashpati' },
    lengthCm: '13 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '140 g',
    imageUrl: '/infographics/week-17.png',
    babyDevelopment: "The baby is practicing swallowing by gulping amniotic fluid, which is great for their digestive system. Their little heart is pumping about 24 litres of blood a day.",
    momTip: "Leg cramps, especially at night, can be an issue. Ensure you're getting enough potassium from foods like bananas and coconut water. Gentle stretching before bed helps."
  },
  {
    week: 18,
    trimester: 2,
    comparison: { name: 'Sweet Potato', indianName: 'Shakarkandi' },
    lengthCm: '14.2 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '190 g',
    imageUrl: '/infographics/week-18.png',
    babyDevelopment: "The nervous system is maturing rapidly. Nerves are being coated in myelin, a protective sheath that speeds up messages between nerve cells.",
    momTip: "Feeling dizzy sometimes? It could be due to low blood pressure. Get up slowly from sitting or lying down. A handful of nuts or a piece of fruit can help stabilize blood sugar."
  },
  {
    week: 19,
    trimester: 2,
    comparison: { name: 'Mango', indianName: 'Aam' },
    lengthCm: '15.3 cm',
    lengthMeasurementType: 'crown-rump',
    weightGrams: '240 g',
    imageUrl: '/infographics/week-19.png',
    babyDevelopment: "A waxy, cheese-like coating called vernix caseosa is forming on your baby's skin. It protects them from the amniotic fluid and helps regulate temperature.",
    momTip: "Skin pigmentation changes, like a dark line on your belly (linea nigra), are common. They are caused by hormones and usually fade after delivery. Keep your skin moisturized."
  },
  {
    week: 20,
    trimester: 2,
    comparison: { name: 'Banana', indianName: 'Kela' },
    lengthCm: '25.6 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '300 g',
    imageUrl: '/infographics/week-20.png',
    babyDevelopment: "You're halfway there! Your baby is swallowing more and producing meconium, their first bowel movement. If you're having a girl, her uterus is already formed.",
    momTip: "The anomaly scan (level II ultrasound) is usually done around this time. It's a detailed check of your baby's development. Many families see this as a time for celebration."
  },
  {
    week: 21,
    trimester: 2,
    comparison: { name: 'Carrot', indianName: 'Gajar' },
    lengthCm: '26.7 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '360 g',
    imageUrl: '/infographics/week-21.png',
    babyDevelopment: "Your baby's movements are becoming more coordinated. Their taste buds are developing, and they can taste the flavours from the food you eat that pass into the amniotic fluid.",
    momTip: "Enjoy a varied diet! Eating different spices and flavours can introduce your baby to them early on. Think of it as their first taste of home-cooked Indian food."
  },
  {
    week: 22,
    trimester: 2,
    comparison: { name: 'Papaya', indianName: 'Papita' },
    lengthCm: '27.8 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '430 g',
    imageUrl: '/infographics/week-22.png',
    babyDevelopment: "The baby's lips, eyelids, and eyebrows are becoming more distinct. Their eyes have formed, but the irises still lack pigment.",
    momTip: "Swollen ankles and feet can be common. Try to elevate your feet when possible and wear comfortable footwear. Avoid standing for very long periods."
  },
  {
    week: 23,
    trimester: 2,
    comparison: { name: 'Grapefruit', indianName: 'Chakotra' },
    lengthCm: '29 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '500 g',
    imageUrl: '/infographics/week-23.png',
    babyDevelopment: "The baby's hearing is now well-developed, and they can be startled by loud noises from the outside world, like a pressure cooker whistle or a car horn.",
    momTip: "Your growing belly might cause some backache. Try to maintain good posture. A gentle massage with warm sesame oil (til ka tel) can be very soothing."
  },
  {
    week: 24,
    trimester: 2,
    comparison: { name: 'Muskmelon', indianName: 'Kharbuja' },
    lengthCm: '30 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '600 g',
    imageUrl: '/infographics/week-24.png',
    babyDevelopment: "The lungs are developing branches of the respiratory 'tree' and cells that produce surfactant, a substance that will help them breathe after birth.",
    momTip: "Stay hydrated! Drinking enough water is crucial and can help prevent common issues like constipation and urinary tract infections. Aim for 8-10 glasses a day."
  },
  {
    week: 25,
    trimester: 2,
    comparison: { name: 'Cauliflower', indianName: 'Phool Gobhi' },
    lengthCm: '34.6 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '660 g',
    imageUrl: '/infographics/week-25.png',
    babyDevelopment: "The baby's skin is becoming more opaque as fat deposits form underneath. Their nostrils, which were previously plugged, are now opening up.",
    momTip: "You might be tested for gestational diabetes around now. It's a routine screening. Following a healthy diet with whole grains and vegetables can help manage blood sugar levels."
  },
  {
    week: 26,
    trimester: 2,
    comparison: { name: 'Cabbage', indianName: 'Patta Gobhi' },
    lengthCm: '35.6 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '760 g',
    imageUrl: '/infographics/week-26.png',
    babyDevelopment: "Their eyes are beginning to open and can detect light and shadow. They are inhaling and exhaling small amounts of amniotic fluid, practicing for breathing.",
    momTip: "Heartburn can be a challenge. Eat smaller meals and avoid lying down immediately after eating. A glass of cold milk or some fennel seeds (saunf) can provide relief."
  },
  {
    week: 27,
    trimester: 3,
    comparison: { name: 'Cucumber', indianName: 'Kheera' },
    lengthCm: '36.6 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '875 g',
    imageUrl: '/infographics/week-27.png',
    babyDevelopment: "Welcome to the final trimester! Your baby's brain is very active. They may have hiccups, which you might feel as rhythmic, gentle twitches in your belly.",
    momTip: "As you enter the third trimester, ensure you're getting enough iron from foods like spinach (palak), lentils (dal), and beetroot (chukandar) to prevent anemia."
  },
  {
    week: 28,
    trimester: 3,
    comparison: { name: 'Eggplant', indianName: 'Baingan' },
    lengthCm: '37.6 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '1 kg',
    imageUrl: '/infographics/week-28.png',
    babyDevelopment: "They can blink, and their eyelashes have formed. With their developing sight, they may turn towards a bright light shone on your abdomen.",
    momTip: "It's a good time to start learning about labour and breastfeeding. Talk to your mother, aunts, or friends who have been through it. Their wisdom can be invaluable."
  },
  {
    week: 29,
    trimester: 3,
    comparison: { name: 'Butternut Squash', indianName: 'Vilayati Kaddu' },
    lengthCm: '38.6 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '1.15 kg',
    imageUrl: '/infographics/week-29.png',
    babyDevelopment: "The baby's brain is developing rapidly, creating billions of neurons and controlling functions like rhythmic breathing and body temperature.",
    momTip: "Your baby's kicks are getting stronger! Try to track their movements for an hour each day. It's a great way to bond and ensure they are active."
  },
{
    week: 30,
    trimester: 3,
    comparison: { name: 'Jackfruit', indianName: 'Kathal' },
    lengthCm: '39.9 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '1.3 kg',
    imageUrl: '/infographics/week-30.png',
    babyDevelopment: "Their bone marrow has now taken over from the liver and spleen in producing red blood cells, a crucial step for life outside the womb.",
    momTip: "Sleep can become difficult. Try sleeping on your left side with pillows supporting your back and between your knees for better blood flow and comfort."
  },
  {
    week: 31,
    trimester: 3,
    comparison: { name: 'Coconut', indianName: 'Nariyal' },
    lengthCm: '41.1 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '1.5 kg',
    imageUrl: '/infographics/week-31.png',
    babyDevelopment: "The baby is gaining weight rapidly, adding layers of fat that will help regulate body temperature after birth. All five senses are now functional.",
    momTip: "This is a good time to think about your birth plan. In India, family plays a big role, so discuss your wishes with your partner and mother or mother-in-law."
  },
  {
    week: 32,
    trimester: 3,
    comparison: { name: 'Bottle Gourd', indianName: 'Lauki' },
    lengthCm: '42.4 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '1.7 kg',
    imageUrl: '/infographics/week-32.png',
    babyDevelopment: "The baby's toenails are now fully formed. The lanugo (fine body hair) that covered their body is starting to fall off, though some may remain at birth.",
    momTip: "You might experience Braxton Hicks contractions. They are your body's way of practicing for labour. Stay hydrated and change positions to ease them."
  },
  {
    week: 33,
    trimester: 3,
    comparison: { name: 'Pineapple', indianName: 'Ananas' },
    lengthCm: '43.7 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '1.9 kg',
    imageUrl: '/infographics/week-33.png',
    babyDevelopment: "The baby's bones are hardening, but the skull remains soft and flexible, with gaps called fontanelles, to allow for an easier passage through the birth canal.",
    momTip: "Shortness of breath is common as your uterus presses on your diaphragm. Practice deep breathing exercises (pranayama) to improve your lung capacity."
  },
  {
    week: 34,
    trimester: 3,
    comparison: { name: 'Large Muskmelon', indianName: 'Bada Kharbuja' },
    lengthCm: '45 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '2.1 kg',
    imageUrl: '/infographics/week-34.png',
    babyDevelopment: "Your baby's lungs are maturing rapidly, producing surfactant to help them breathe. The protective vernix coating on their skin is getting thicker.",
    momTip: "Pack your hospital bag! Include comfortable clothes, essentials for the baby, and some homemade snacks like panjiri or laddoos for energy post-delivery."
  },
  {
    week: 35,
    trimester: 3,
    comparison: { name: 'Ash Gourd', indianName: 'Petha' },
    lengthCm: '46.2 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '2.4 kg',
    imageUrl: '/infographics/week-35.png',
    babyDevelopment: "The baby is getting plump, and their movements may feel more restricted as they run out of space. You might feel more rolling motions than sharp kicks.",
    momTip: "You'll be visiting your doctor more frequently now. Don't hesitate to ask any last-minute questions you have about labour, delivery, or newborn care."
  },
  {
    week: 36,
    trimester: 3,
    comparison: { name: 'Bunch of Spinach', indianName: 'Palak' },
    lengthCm: '47.4 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '2.6 kg',
    imageUrl: '/infographics/week-36.png',
    babyDevelopment: "The baby is likely in a head-down position, preparing for birth. This is called 'engaging' or 'lightening' and can happen anytime now.",
    momTip: "Rest, rest, rest! Conserve your energy for the big day. A traditional Indian 'godh bharai' or baby shower is often celebrated around this time to bless the mother and baby."
  },
  {
    week: 37,
    trimester: 3,
    comparison: { name: 'Radish', indianName: 'Mooli' },
    lengthCm: '48.6 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '2.9 kg',
    imageUrl: '/infographics/week-37.png',
    babyDevelopment: "Your baby is now considered 'early term'. They are practicing breathing, sucking, and swallowing. Most of the fine lanugo hair has disappeared.",
    momTip: "Look for signs of 'lightening,' where the baby drops lower into your pelvis. This might make breathing easier but increase pressure on your bladder. Frequent urination is normal."
  },
  {
    week: 38,
    trimester: 3,
    comparison: { name: 'Leek', indianName: 'Leek' },
    lengthCm: '49.8 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '3.1 kg',
    imageUrl: '/infographics/week-38.png',
    babyDevelopment: "The baby has a firm grasp, and their organs are fully mature and ready for life outside the womb. Their brain and lungs will continue to develop even after birth.",
    momTip: "You might notice a discharge known as the 'mucus plug'. This is a sign that your cervix is preparing for labour, which could be hours, days, or even a week away."
  },
  {
    week: 39,
    trimester: 3,
    comparison: { name: 'Watermelon', indianName: 'Tarbooz' },
    lengthCm: '50.7 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '3.3 kg',
    imageUrl: '/infographics/week-39.png',
    babyDevelopment: "Your baby is now 'full term' and fully prepared for life outside. Their brain is still developing rapidly and will continue to do so throughout childhood.",
    momTip: "Stay active with gentle walks. Many Indian families have traditions or 'pujas' around this time for a safe delivery. Embrace the support from your loved ones."
  },
  {
    week: 40,
    trimester: 3,
    comparison: { name: 'Pumpkin', indianName: 'Kaddu' },
    lengthCm: '51.2 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '3.5 kg',
    imageUrl: '/infographics/week-40.png',
    babyDevelopment: "Your due date is here! But don't worry, only about 5% of babies are born on their exact due date. Your baby is cozy and just putting on the finishing touches.",
    momTip: "Patience is key! Try natural ways to induce labour if you're comfortable, like walking. Enjoy these last few days of pregnancy. Soon, you will be holding your baby."
  },
  {
    week: 41,
    trimester: 3,
    comparison: { name: 'Large Pumpkin', indianName: 'Bada Kaddu' },
    lengthCm: '51.7 cm',
    lengthMeasurementType: 'head-heel',
    weightGrams: '3.6 kg',
    imageUrl: '/infographics/week-41.png',
    babyDevelopment: "Your baby is now 'late term'. They are still growing, and their hair and nails might be quite long at birth. Your doctor is monitoring you both closely.",
    momTip: "Your doctor will be discussing options like induction if labour doesn't start soon. Trust their guidance and focus on the exciting meeting that's just around the corner."
  },
];