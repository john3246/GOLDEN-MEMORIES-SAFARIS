import { media as GM } from '../home/content.js';

function article({ slug, topic, date, title, excerpt, image, sections }) {
  const paragraphs = sections.map((item) => item.text).filter(Boolean);
  const blocks = [];
  sections.forEach((item, index) => {
    if (item.heading) {
      blocks.push({ id: `h_${index + 1}`, type: 'heading', text: item.heading, url: '', alt: '' });
    }
    if (item.quote) {
      blocks.push({ id: `q_${index + 1}`, type: 'quote', text: item.quote, url: '', alt: '' });
    }
    if (item.text) {
      blocks.push({ id: `p_${index + 1}`, type: 'paragraph', text: item.text, url: '', alt: '' });
    }
  });
  return { slug, topic, date, title, excerpt, image, paragraphs, blocks };
}

/**
 * Original GMS journal on Kilimanjaro, parks, and the coast.
 * Topics overlap common Tanzania climbing questions; wording and photos are Golden Memories.
 */
export const zaraInspiredJournalArticles = [
  article({
    slug: 'kilimanjaro-beginners-guide',
    topic: 'climbing',
    date: '18 September 2026',
    title: 'A beginner’s guide to climbing Kilimanjaro with Golden Memories',
    excerpt: 'What the mountain actually is, how many days you need, and how we run a climb from Arusha.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'It is a trek, not a technical climb',
        text: 'Uhuru Peak sits at 5,895 metres. You walk there. There are no ropes on the standard routes we run. The work is altitude, cold summit night, and enough days to let your body catch up. If you can hike all day with a daypack, you are in the right conversation.',
      },
      {
        heading: 'Start in Arusha or Moshi',
        text: 'Most of our climbers land at Kilimanjaro International Airport, sleep in Arusha or Moshi, and meet the crew for a kit check the afternoon before the gate. We do not put you on the trail the hour you land. A rest night is part of the itinerary.',
      },
      {
        heading: 'Choose days before you choose a famous name',
        quote: 'An extra night on the mountain is worth more than a shorter “easy” route.',
        text: 'Marangu has huts. Machame and Lemosho are camping. Rongai comes in from the north. Umbwe is steep. Northern Circuit is the long western loop. We match route to your dates, knees, and appetite for crowds — then we add a day if the calendar is tight.',
      },
      {
        heading: 'What success actually means',
        text: 'Summiting matters. Coming down healthy matters more. We brief you on turning around, we walk pole pole, and we keep the group honest about how people feel. Write to us with the month you can travel; we will send a route and a day count, not a slogan.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-altitude-sickness',
    topic: 'climbing',
    date: '18 September 2026',
    title: 'Altitude on Kilimanjaro: what we watch for',
    excerpt: 'Headache, sleep, and why extra days beat a heroic six-day dash.',
    image: GM.machame,
    sections: [
      {
        heading: 'Why the air feels thin',
        text: 'Above 3,000 metres your body is doing more work for less oxygen. Kilimanjaro asks you to sleep high for several nights and then go higher still on summit night. That is why people who are fit at sea level still feel rough at Barafu.',
      },
      {
        heading: 'The signs we take seriously',
        text: 'A mild headache that eases with water and a slow pace is common. Worsening headache, vomiting, confusion, or a cough that will not settle is not “pushing through.” Guides carry protocols for descent. Diamox is a conversation with your own doctor before you fly, not a pill we hand out on the trail.',
      },
      {
        heading: 'How the itinerary helps',
        text: 'Climb high, sleep lower where the route allows — Lava Tower then Barranco is the classic example. Seven or eight days beat five or six for most first-timers. We would rather you reach Stella Point feeling well than race a hut schedule.',
      },
      {
        heading: 'Insurance and honesty',
        text: 'Your policy must cover trekking to 6,000 metres and helicopter evacuation. Tell us about heart, lung, or previous altitude trouble when you book. We plan around it or we say the mountain is not the right trip this year.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-success-rates-by-route',
    topic: 'climbing',
    date: '18 September 2026',
    title: 'Kilimanjaro success rates: what the route and the days really change',
    excerpt: 'Longer western starts do better than short hut dashes. We still do not sell a percentage as a promise.',
    image: GM.machame,
    sections: [
      {
        heading: 'Park numbers are averages, not your night',
        text: 'Published success rates mix operators, seasons, and people who turned around for weather or health. Use them as a warning against short itineraries, not as a guarantee printed on your invoice.',
      },
      {
        heading: 'What we see on the ground',
        text: 'Five-day Marangu is the steepest statistical lesson: huts feel comfortable, acclimatisation is poor, and many guests stop short of Uhuru. Six-day Machame is popular and harder on the legs. Seven-day Machame or eight-day Lemosho is where more of our groups arrive at the crater rim in decent shape. Nine-day Northern Circuit is the slowest western loop we run.',
      },
      {
        heading: 'The variables you control',
        text: 'Sleep, water, a slow first two days, and telling the guide the truth. Fitness helps the walking; it does not cancel altitude. We staff climbs so nobody is dragged to a summit they should not be on.',
      },
      {
        heading: 'How we quote a route',
        text: 'We start with how many days you have, then name the trail. If you only have five days, we will talk about whether to wait for a longer window rather than force Marangu.',
      },
    ],
  }),
  article({
    slug: 'is-climbing-kilimanjaro-safe',
    topic: 'climbing',
    date: '17 September 2026',
    title: 'Is climbing Kilimanjaro safe?',
    excerpt: 'Licensed crew, paced days, and the risks we will not dress up as adventure copy.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'What “safe” means on this mountain',
        text: 'Kilimanjaro is a well-travelled trek with park rangers, established camps, and a rescue culture. It is still high altitude. People get altitude illness, cold injuries, and the odd fall on scree. We treat those as planning problems, not as marketing.',
      },
      {
        heading: 'How we run a climb',
        text: 'Your guide is licensed. Porters are within park weight rules. We brief summit night, check kit, and carry a medical kit and oxygen as backup, not as a substitute for turning around. Daily health checks are part of the morning, not an optional chat.',
      },
      {
        heading: 'Your part',
        text: 'Honest medical forms, insurance that actually covers the height, broken-in boots, and the willingness to descend. The mountain will still be there. A rushed ego summit is how trips go wrong.',
      },
      {
        heading: 'Talk to us before you book',
        text: 'If you have questions about age, asthma, or a previous trek that went badly, write them down. We would rather adjust the route than surprise you at Machame Gate.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-weather-and-climate-zones',
    topic: 'climbing',
    date: '17 September 2026',
    title: 'Kilimanjaro weather and the five climate zones',
    excerpt: 'Rainforest mud, alpine desert wind, and a summit night that is winter in any month.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'You walk through seasons in a week',
        text: 'The lower trail is farm and forest: humid, muddy in the rains, colobus if you look up. Moorland brings giant groundsels and a colder night. Alpine desert is dust, sun, and wind. The crater rim and Uhuru Peak are arctic — whatever month you chose in Arusha.',
      },
      {
        heading: 'When the mountain is driest',
        text: 'January to early March and June to October are the windows most climbers pick. April, May, and November bring more rain on the forest belt. Trails still go; you just need waterproofs and patience. December is busy and can be warm lower down.',
      },
      {
        heading: 'Pack for the summit, not the gate',
        text: 'A rain shell, insulating layers, and gloves earn their weight even on a “dry” week. We send a list and check it the night before. Hiring a missing down jacket in Moshi is easier than freezing at Stella Point.',
      },
      {
        heading: 'Pairing a climb with safari',
        text: 'June to October lines up with classic northern game viewing. If you want both, we put a hotel night between descent and the first 4x4. Share dates and we will say trek first or safari first.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-elevation-gain',
    topic: 'climbing',
    date: '16 September 2026',
    title: 'Kilimanjaro elevation gain: how high you actually walk',
    excerpt: 'Gate heights differ. The last 1,200 metres on summit night is what people remember.',
    image: GM.machame,
    sections: [
      {
        heading: 'The peak does not change; the start does',
        text: 'Uhuru Peak is 5,895 metres. Marangu Gate sits lower in the forest than Rongai’s northern start. Lemosho begins around 2,100 metres. Machame and Umbwe are in the same ballpark as each other, with a long first day into camp. The extra metres are in the profile, not on a single signboard.',
      },
      {
        heading: 'Summit night is the real gain',
        text: 'From Barafu or Kibo you climb through the dark, often more than 1,000 vertical metres before sunrise, then descend the same day. That is why we talk about sleep and calories as much as about “fitness.”',
      },
      {
        heading: 'Why more days flatten the graph',
        text: 'A longer route spreads the same mountain over extra camps. Your body sees height in smaller bites. That is the point of Lemosho and the Northern Circuit, not scenery alone.',
      },
      {
        heading: 'What we put on the itinerary',
        text: 'Each day note lists camp altitude and an honest walking time. Read those before you obsess over total kilometres. Tired legs at 4,600 metres are a different problem from tired legs at 1,800.',
      },
    ],
  }),
  article({
    slug: 'climbing-kilimanjaro-lemosho',
    topic: 'climbing',
    date: '16 September 2026',
    title: 'The Lemosho route: our usual recommendation for a first camping climb',
    excerpt: 'A quieter western forest, Shira Plateau, then the southern circuit toward Barranco and Barafu.',
    image: GM.machame,
    sections: [
      {
        heading: 'How the week is shaped',
        text: 'You start at Londorossi / Lemosho Gate, camp in the forest, and walk onto the Shira Plateau. Later you join the southern trail toward Lava Tower, Barranco, Karanga, Barafu, and the summit, descending via Mweka. Seven or eight days is the version we prefer.',
      },
      {
        heading: 'Why guests like it',
        text: 'The first days are less crowded than Machame Gate. The plateau is open and photogenic. You still get Barranco Wall and a proper acclimatisation bump at Lava Tower. It is camping throughout — if you want huts, that is Marangu.',
      },
      {
        heading: 'What it asks of you',
        text: 'Longer vehicle transfer to the western gate. More days, so a higher park-fee total. A duffel within the porter weight limit. We brief all of that before you pay a deposit.',
      },
      {
        heading: 'Lemosho or Northern Circuit',
        text: 'If you have nine days and want the quietest western loop, we talk Northern Circuit. If you have seven or eight, Lemosho is the climb we draw most often for first-time campers.',
      },
    ],
  }),
  article({
    slug: 'barranco-wall-kilimanjaro',
    topic: 'climbing',
    date: '15 September 2026',
    title: 'Barranco Wall: steep, busy, and not a rock climb',
    excerpt: 'Hands on the rock, a scramble in a line, and why we still sleep below it.',
    image: GM.machame,
    sections: [
      {
        heading: 'What you are looking at',
        text: 'After Barranco Camp the trail goes up a steep face of rock and path known as the Breakfast Wall. You use your hands in places. There is a drop if you leave the line. It is a scramble, not a technical pitch, and thousands of trekkers do it every season.',
      },
      {
        heading: 'How we take it',
        text: 'Early start, one person in front who knows the holds, no racing, and a pause if a descending group needs the same rock. Poles go on your pack. If you dislike exposure, say so — we still use this trail on Machame and Lemosho because the camp below is the right height to sleep.',
      },
      {
        heading: 'After the wall',
        text: 'You are not finished. Karanga and Barafu still sit above you. The wall is a morning, not the summit. Eat, drink, and keep the afternoon slow.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-summit-night',
    topic: 'climbing',
    date: '15 September 2026',
    title: 'Summit night on Kilimanjaro: Uhuru Peak in the dark',
    excerpt: 'Headlamps, a very slow pace, sunrise on the crater, and a long way down the same day.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'The clock',
        text: 'We wake around midnight. Layers go on in the tent. You walk in a line toward Stella Point on the crater rim, then along to Uhuru Peak if the group is well. Sunrise is the photograph; the work is the hours before it.',
      },
      {
        heading: 'How it feels',
        quote: 'Pole pole is not a slogan on summit night. It is the only pace that works.',
        text: 'It is cold, windy, and mentally narrow. Talking drops. Guides watch the back of the line. If someone needs to stop for good, we stop for good. Reaching Stella Point is already a high mountain morning.',
      },
      {
        heading: 'The descent is part of the day',
        text: 'You do not nap on the summit. You go down to Barafu, rest briefly, then continue toward a lower camp. Knees take the bill. Trekking poles earn their keep here more than on the way up.',
      },
      {
        heading: 'What we tell families',
        text: 'Celebrate in Moshi or Arusha with a shower and a real bed. Save the safari or the beach for the next morning at the earliest.',
      },
    ],
  }),
  article({
    slug: 'how-long-to-climb-kilimanjaro',
    topic: 'climbing',
    date: '14 September 2026',
    title: 'How long does it take to climb Kilimanjaro?',
    excerpt: 'Five days is possible. Seven or eight is what we recommend for most first summits.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'The honest range',
        text: 'Park itineraries run from five days on Marangu to nine on the Northern Circuit. Walking hours per day are usually five to seven, except summit day, which can be twelve to sixteen with the descent.',
      },
      {
        heading: 'What we book',
        text: 'Six-day Machame only when you are already a strong hiker and understand the trade. Seven-day Machame or eight-day Lemosho for most of our private climbs. Marangu at six days if you specifically want huts — not five.',
      },
      {
        heading: 'Add the town nights',
        text: 'Count a night before the gate and a night after the descent. A “seven-day climb” is not seven nights from your international flight. We write the full calendar so your employer and your safari dates are not a surprise.',
      },
    ],
  }),
  article({
    slug: 'how-hard-is-kilimanjaro',
    topic: 'climbing',
    date: '14 September 2026',
    title: 'How hard is Kilimanjaro, really?',
    excerpt: 'Long days at altitude. No technical climbing. The difficulty is patience and summit night.',
    image: GM.machame,
    sections: [
      {
        heading: 'Harder than a weekend hike',
        text: 'You walk for a week with a daypack, sleep in a tent or hut, and finish with a night march in the cold. There is no glacier travel on the routes we operate. People who train on hills with a pack do better than people who only run on flat pavement.',
      },
      {
        heading: 'Easier than the famous death-zone peaks',
        text: 'Kilimanjaro is not K2 and it is not Everest. Comparing them is how internet lists waste your week. The risk here is altitude illness and exhaustion, managed with days, guides, and the decision to go down.',
      },
      {
        heading: 'Who struggles',
        text: 'Guests who rush the first forest day, skip water, or treat the mountain like a race. We set a pace that looks too slow at 2,000 metres and looks wise at 5,000.',
      },
      {
        heading: 'Train anyway',
        text: 'Eight to twelve weeks of walking uphill, back-to-back long days at the weekend, and time in the boots you will wear. We send a simple plan when you book.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-training-plan',
    topic: 'climbing',
    date: '13 September 2026',
    title: 'How we ask you to train for Kilimanjaro',
    excerpt: 'Hills, a loaded pack, back-to-back days — not a last-minute gym burst.',
    image: GM.materuni,
    sections: [
      {
        heading: 'Twelve weeks is kinder than four',
        text: 'Build walking time first, then add a pack, then add weekend back-to-backs so your legs know what two long days feel like. Stairs and local hills count. A single spinning class does not.',
      },
      {
        heading: 'What to carry',
        text: 'Train in the boots and daypack you will use. Porters take the duffel; you still carry water, layers, and camera. Practice eating and drinking while you walk. Summit night is a bad time to discover your bottle freezes or your hip belt rubs.',
      },
      {
        heading: 'Strength that helps',
        text: 'Simple squats, step-ups, and core work support the descent. We are not turning you into a climber. We are keeping your knees in the conversation on the way down from Stella Point.',
      },
      {
        heading: 'Rest is training',
        text: 'Arrive in Tanzania tired from over-training and you have already spent the climb. Taper the last week. Sleep. Then we walk slowly together.',
      },
    ],
  }),
  article({
    slug: 'things-to-know-before-kilimanjaro',
    topic: 'climbing',
    date: '13 September 2026',
    title: 'Before you climb: the briefing we wish everyone read',
    excerpt: 'Toilets, tipping, park rules, and the small facts that make a week on the mountain smoother.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'Paperwork and shots',
        text: 'Passport, visa, insurance to 6,000 metres, and yellow fever only if your routing requires it. We are not a clinic. Start the medical and visa work early in high season.',
      },
      {
        heading: 'The crew around you',
        text: 'A climb is a team: guide, assistant, cook, porters. Park rules set porter loads. Tipping is customary; we give a suggested range in the joining notes so you are not guessing at Mweka Gate.',
      },
      {
        heading: 'Camp life',
        text: 'Toilets are basic. Washing is a bowl. Charging is limited. Bring a headlamp, wet wipes, and a sense of humour. The dining tent is where the day is planned and where we notice if you have gone quiet.',
      },
      {
        heading: 'Leave no trace',
        text: 'Nothing extra stays on the mountain. We pack rubbish out. That is not a slogan for a brochure; it is how we want to find the trail next month.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-food-on-the-mountain',
    topic: 'climbing',
    date: '12 September 2026',
    title: 'What you eat on a Kilimanjaro climb',
    excerpt: 'Carbs, soup, and the appetite that disappears at 4,500 metres.',
    image: GM.materuni,
    sections: [
      {
        heading: 'The job of the cook',
        text: 'Our kitchen crew feeds you three meals and snacks you can actually eat at altitude: porridge, eggs, pasta, rice, soup, fruit when it survives the pack. Spicy experiments wait for Arusha. You need calories more than a tasting menu.',
      },
      {
        heading: 'When food gets difficult',
        text: 'Appetite drops as you go higher. We still ask you to eat. Ginger tea, biscuits, and a smaller plate beat skipping dinner. Tell us allergies and vegetarian needs when you book, not at Shira Camp.',
      },
      {
        heading: 'Water',
        text: 'Boiled and treated water is the default. You carry bottles or a bladder in the daypack. Dehydration looks like altitude. We nag you about both.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-group-or-private-climb',
    topic: 'climbing',
    date: '12 September 2026',
    title: 'Group climb or private climb: how we decide',
    excerpt: 'Shared dates keep the cost down. A private crew lets you set the pace and the extra night.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'Joining a group',
        text: 'Fixed departures put you with other trekkers on the same route. You share tents, meals, and the morning start. It works when you are flexible about company and you accept the group’s slowest comfortable pace — which is usually the right pace anyway.',
      },
      {
        heading: 'Going private',
        text: 'Families, couples, and anyone with a medical or timing constraint book their own crew. You still follow park rules. You do not wait for strangers at Barranco, and you can add a day without a committee.',
      },
      {
        heading: 'What does not change',
        text: 'Safety briefings, porter treatment, and the right to turn around. We will not run a private climb that skips acclimatisation to save a park fee.',
      },
    ],
  }),
  article({
    slug: 'can-children-climb-kilimanjaro',
    topic: 'climbing',
    date: '11 September 2026',
    title: 'Can children climb Kilimanjaro?',
    excerpt: 'Park age rules, honest fitness, and why a safari is often the better family chapter.',
    image: GM.machame,
    sections: [
      {
        heading: 'The park has a minimum age',
        text: 'Kilimanjaro National Park sets a lower age limit for climbers. We follow it. Teenagers who already hike and sleep in tents can be excellent on a longer route. Younger children belong on a safari or a day on Meru’s lower trails, not on Barafu at midnight.',
      },
      {
        heading: 'What we ask parents',
        text: 'Recent hill walks together, a child who will say when they feel ill, and an adult willing to descend without a debate. Summit photos are not worth a scared night at 4,600 metres.',
      },
      {
        heading: 'A better family week',
        text: 'Many of our families climb with the adults only, while younger ones stay with a relative in Arusha — or everyone safaris together. We will say which option fits your ages rather than selling a cute story.',
      },
    ],
  }),
  article({
    slug: 'how-to-get-to-kilimanjaro',
    topic: 'climbing',
    date: '11 September 2026',
    title: 'How to get to Kilimanjaro: airport, Arusha, and Moshi',
    excerpt: 'JRO is the usual door. We meet you, we do not leave you to guess the transfer.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'Kilimanjaro International Airport',
        text: 'JRO sits between Arusha and Moshi. Most of our climbers fly in here. We collect you, confirm the hotel, and leave the mountain briefing for when you have slept. Evening arrivals still get a driver holding your name.',
      },
      {
        heading: 'Arusha or Moshi',
        text: 'Arusha is our home and the better hub if a safari follows the climb. Moshi is closer to some trailheads and has a mountain-town feel. We pick the base from your itinerary, not from a slogan.',
      },
      {
        heading: 'Other doors',
        text: 'Dar es Salaam or Nairobi connections work with an extra flight or a long road. We would rather you overnight than drive through the night before a gate morning. Zanzibar is a finish line, not a start, unless you are only going to the beach.',
      },
      {
        heading: 'Send the flight',
        text: 'Once you have ticket numbers, we lock the transfer. Visa-on-arrival queues happen; we wait. Keep our emergency number on paper as well as on a phone.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-cost-what-you-pay-for',
    topic: 'climbing',
    date: '10 September 2026',
    title: 'What a Kilimanjaro climb actually costs',
    excerpt: 'Park fees, crew wages, food, and why a suspiciously cheap quote is a warning.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'The big lines',
        text: 'Park and rescue fees, hut or camping fees, the crew, food, transport to the gate, and your town hotel. More days mean more park fees. That is not padding; that is the authority’s tariff.',
      },
      {
        heading: 'What sits outside the quote',
        text: 'International flights, visa, insurance, personal kit, tips, and drinks in town. Hire of a sleeping bag or down jacket if you did not bring one. We list these so the first invoice is not a fiction.',
      },
      {
        heading: 'Cheap climbs',
        text: 'Someone is unpaid, underfed, or carrying too much. We will not match a number that cannot cover a legal crew. Ask what the porter load is and whether the quote includes all park fees for the days on the paper.',
      },
      {
        heading: 'Ask us for the days you have',
        text: 'A seven-day Lemosho for two people is a different letter from a join-group Machame. Send month and party size; we will price that trip.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-travel-insurance',
    topic: 'climbing',
    date: '10 September 2026',
    title: 'Insurance for a Kilimanjaro trek',
    excerpt: 'It must say 6,000 metres. Mountain rescue is not a lodge extra.',
    image: GM.machame,
    sections: [
      {
        heading: 'Read the altitude line',
        text: 'Many travel policies stop at 2,500 or 4,000 metres. Kilimanjaro is higher. If the certificate does not state trekking to 6,000 metres, it is not useful on summit night.',
      },
      {
        heading: 'Evacuation',
        text: 'Helicopter and ground evacuation need to be in the document. We can help with the practical side on the mountain; we cannot invent cover you did not buy.',
      },
      {
        heading: 'Send us a copy',
        text: 'We keep policy numbers with the climb file. That is boring paperwork until the day it is not. Do it before you fly.',
      },
    ],
  }),
  article({
    slug: 'mount-kilimanjaro-facts',
    topic: 'climbing',
    date: '9 September 2026',
    title: 'Kilimanjaro facts that actually affect your climb',
    excerpt: 'Three cones, a free-standing mountain, and a name with more than one story.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'Where it stands',
        text: 'Kilimanjaro rises from the plains of northern Tanzania, near the Kenyan border, inland from the Indian Ocean. You see it from the right weather window on the road to Arusha. It is not in a Himalayan chain; it is a volcano that stands alone.',
      },
      {
        heading: 'Kibo, Mawenzi, Shira',
        text: 'The mountain has three cones. Uhuru Peak is on Kibo, the highest. Mawenzi is jagged and technical; we do not take trekking clients there. Shira is the oldest, collapsed plateau you cross on western routes.',
      },
      {
        heading: 'Still a volcano, long asleep',
        text: 'Kibo is dormant, not a daily eruption story. You climb ash and rock, not lava flows. The glaciers have shrunk in living memory; that is climate, and it is visible from the crater rim.',
      },
      {
        heading: 'The name',
        text: 'You will hear more than one explanation for “Kilimanjaro.” What matters on the trail is the greeting your crew uses and the mountain they know by camps and weather, not a classroom debate. We will still tell the stories around the table in Arusha if you ask.',
      },
    ],
  }),
  article({
    slug: 'where-is-mount-kilimanjaro',
    topic: 'climbing',
    date: '9 September 2026',
    title: 'Where is Mount Kilimanjaro?',
    excerpt: 'Northern Tanzania, a drive from our Arusha office, and an airport named after the peak.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'On the map',
        text: 'The mountain sits in Kilimanjaro National Park in north-east Tanzania. Moshi is the nearest large town. Arusha, where we are based, is a couple of hours’ drive and the usual jump-off for a safari after you come down.',
      },
      {
        heading: 'Not a border crossing on foot',
        text: 'The peak is in Tanzania. You do not walk into Kenya on a standard trek. Your visa is Tanzanian. Keep that simple when friends ask if you “climbed Kenya.”',
      },
      {
        heading: 'Seeing it without climbing',
        text: 'Clear mornings from the road, from Arusha National Park, or from the right lodge verandah. A climb is optional. Plenty of our safari guests photograph the mountain and never put on crampon-free boots.',
      },
    ],
  }),
  article({
    slug: 'mount-meru-climb',
    topic: 'climbing',
    date: '8 September 2026',
    title: 'Mount Meru: the other peak we climb from Arusha',
    excerpt: 'A sharp crater, wildlife on the lower trail, and a serious trek in its own right.',
    image: GM.meru,
    sections: [
      {
        heading: 'Why Meru',
        text: 'Meru stands inside Arusha National Park. Giraffe and buffalo can be on the forest track. The crater rim is steep and exposed. Four days is a common itinerary. It is not a warm-up stroll, even if the summit is lower than Kilimanjaro.',
      },
      {
        heading: 'As acclimatisation',
        text: 'Some climbers do Meru before Kilimanjaro to give the body a look at altitude. It works when you have the extra week and the knees for two descents. It is a poor idea if you are already squeezed for days.',
      },
      {
        heading: 'As the only mountain',
        text: 'Guests who want a trek without Kilimanjaro crowds often stop here. We still brief altitude, boots, and a midnight-ish summit push. Ask us for the current park rules and hut nights.',
      },
    ],
  }),
  article({
    slug: 'kilimanjaro-vs-everest-base-camp',
    topic: 'climbing',
    date: '8 September 2026',
    title: 'Kilimanjaro or Everest Base Camp: the comparison trekkers actually need',
    excerpt: 'One is a summit of Africa. The other is a high valley in Nepal. Different jobs, different weeks.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'Height is not the whole story',
        text: 'Uhuru Peak is higher than Everest Base Camp. You also sleep higher, faster, on Kilimanjaro. EBC is a longer walk in a different culture, with teahouses and a slower height gain for many itineraries. Neither is “easier” in the way listicles mean.',
      },
      {
        heading: 'What you come home with',
        text: 'Kilimanjaro is a named summit day. EBC is a viewpoint under a bigger mountain you do not stand on. If you want a peak photograph, you are on our mountain. If you want Nepal, that is another ticket.',
      },
      {
        heading: 'We only run Tanzania',
        text: 'We will help you prepare for Kilimanjaro. We will not pretend to operate in the Khumbu. Use this page to decide which holiday you are buying, then train for that one.',
      },
    ],
  }),
  article({
    slug: 'what-kilimanjaro-is-famous-for',
    topic: 'climbing',
    date: '7 September 2026',
    title: 'What Kilimanjaro is famous for',
    excerpt: 'The roof of Africa, a walkable summit, and the glacier remnants on Kibo’s crater.',
    image: GM.kilimanjaro,
    sections: [
      {
        heading: 'The highest free-standing mountain',
        text: 'People come because it is Africa’s high point and because a fit walker can stand on it without becoming a mountaineer. That combination is rare. It is also why the trail is busy in good weather.',
      },
      {
        heading: 'The view from the plains',
        text: 'Snow on an equatorial skyline is the postcard from safari country. On a clear day it still stops conversations on the road from the airport. Climbing it is optional; living under it is our ordinary.',
      },
      {
        heading: 'The human mountain',
        text: 'Porters, guides, and park staff make the week possible. A famous peak that treats crew badly is not a climb we want our name on. Ask how we staff a route before you compare prices.',
      },
    ],
  }),
  article({
    slug: 'serengeti-national-park-famous-for',
    topic: 'wildlife',
    date: '7 September 2026',
    title: 'What the Serengeti is famous for',
    excerpt: 'Migration, kopjes, and a park so large that camp location is the itinerary.',
    image: GM.northern,
    sections: [
      {
        heading: 'The herds',
        text: 'The Serengeti–Mara ecosystem holds the wildebeest migration. That is the headline, and it is only one season’s chapter. Resident lion, leopard, elephant, and the open grassland are the rest of the year.',
      },
      {
        heading: 'Scale',
        text: 'This is not a small reserve you “do” in an afternoon. South, centre, west, and north behave like different parks. We book the sector that matches your month, then stay long enough to use the morning light twice.',
      },
      {
        heading: 'Kopjes and granite',
        text: 'Those rock islands are cat country and the silhouette everyone knows from documentaries. A good guide treats them as territories, not as a checklist stop.',
      },
      {
        heading: 'How we use the fame',
        text: 'We still add Ngorongoro or Tarangire when the itinerary has room. The Serengeti is the centre of gravity, not the only stamp in the permit book.',
      },
    ],
  }),
  article({
    slug: 'tanzania-safari-parks-guide',
    topic: 'safari',
    date: '6 September 2026',
    title: 'Tanzania’s safari parks, mapped from Arusha',
    excerpt: 'A working order of the northern circuit, then the south if you have the days.',
    image: GM.safariPackages,
    sections: [
      {
        heading: 'The north we drive most',
        text: 'Tarangire for elephant and baobab in the dry months. Lake Manyara for a shorter forest-and-lake day. Ngorongoro crater for density. Serengeti for space. Arusha National Park if you have a spare afternoon after the airport.',
      },
      {
        heading: 'The south',
        text: 'Nyerere for rivers and wild dog. Ruaha for lion and baobab wilderness. These usually mean flying from Dar or a longer plan. They reward guests who have already seen the crater or who want fewer vehicles.',
      },
      {
        heading: 'Start with nights, not names',
        text: 'Four days cannot hold every park on this page. Tell us the month and we will cut the list until the trip breathes.',
      },
    ],
  }),
  article({
    slug: 'best-time-to-visit-serengeti',
    topic: 'safari',
    date: '6 September 2026',
    title: 'Best time to visit the Serengeti',
    excerpt: 'Calving in the south, crossings in the north, and a dry-season middle that is simply good safari.',
    image: GM.migration,
    sections: [
      {
        heading: 'Match the sector to the month',
        text: 'December to March is southern plains and calving. June through October is when we talk about the north and the Mara River. Central Seronera has cats all year and is the compromise when your leave will not move.',
      },
      {
        heading: 'Green months',
        text: 'April and May are quieter, wetter, and beautiful if you accept mud and the odd closed camp. Birding is excellent. We only sell it when the lodges we trust stay open.',
      },
      {
        heading: 'There is no empty Serengeti',
        text: 'If you miss a crossing you have not missed the park. We will be blunt about what your dates can show, then book the nights accordingly.',
      },
    ],
  }),
  article({
    slug: 'places-to-visit-in-tanzania',
    topic: 'about-tanzania',
    date: '5 September 2026',
    title: 'Places in Tanzania we actually send people',
    excerpt: 'Parks, mountain, island, and the town we start from — a short list with reasons.',
    image: GM.hero,
    sections: [
      {
        heading: 'If you have one week',
        text: 'Arusha, Tarangire, Serengeti, Ngorongoro. That is the spine. Adding Zanzibar in the same week usually means dropping a park or flying a leg.',
      },
      {
        heading: 'If you have two',
        text: 'The northern spine plus a beach, or a northern week plus Ruaha, or Kilimanjaro plus a short safari. We would rather two good chapters than five rushed stamps.',
      },
      {
        heading: 'If the mountain is the point',
        text: 'Moshi or Arusha, a proper climb, a rest night, then either crater country or the coast. Do not land and walk the same day.',
      },
      {
        heading: 'Ask us to cut',
        text: 'Mafia, Pemba, and Lake Eyasi are real places. They are not automatic. Tell us what you want to feel when you go home, and we will pick three names, not twelve.',
      },
    ],
  }),
  article({
    slug: 'how-to-choose-a-tanzania-safari',
    topic: 'safari',
    date: '5 September 2026',
    title: 'How to choose a Tanzania safari package',
    excerpt: 'Private or join, camping or lodge, driving or flying — four questions we ask before we quote.',
    image: GM.tarangire,
    sections: [
      {
        heading: 'Who is in the vehicle',
        text: 'A couple, a family, or a solo traveller who will share. That decides private versus join-safari more than any brochure heading. Photographers and small children almost always want the private car.',
      },
      {
        heading: 'How you like to sleep',
        text: 'Canvas close to the grass, or a lodge with a proper shower after the crater. Mixed itineraries are normal. “Luxury” should mean location and guiding, not only a brand name.',
      },
      {
        heading: 'How you move',
        text: 'The northern circuit is built for a 4x4. We fly when the camp is far north or when a road would steal a game-drive morning. Bag weight follows the aircraft, not your hard suitcase.',
      },
      {
        heading: 'What the month is doing',
        text: 'Migration, green season, or a simple dry-season loop. We will not sell you a river-crossing camp in February. Send dates first; the package shape comes second.',
      },
    ],
  }),
  article({
    slug: 'why-tanzania-safari',
    topic: 'safari',
    date: '4 September 2026',
    title: 'Why we still think Tanzania belongs on a first Africa list',
    excerpt: 'A crater, a grassland the size of a country, a mountain, and a beach — in one visa.',
    image: GM.ngorongoro,
    sections: [
      {
        heading: 'The combination is rare',
        text: 'You can game-drive, stand on Africa’s highest peak, and swim in the Indian Ocean without changing country. That is the practical magic. Logistics still take planning; they do not take three embassies.',
      },
      {
        heading: 'The wildlife is not a rumour',
        text: 'Ngorongoro’s density, Tarangire’s elephants, Serengeti’s cats, and a migration that still moves. We do not promise a leopard. We do put you in habitat where looking is reasonable.',
      },
      {
        heading: 'You are booking people',
        text: 'A locally owned Arusha company means the guide who collects you is not a last-minute subcontract. That is why guests write to us a second time. Start with the month you can travel.',
      },
    ],
  }),
  article({
    slug: 'tanzania-in-december',
    topic: 'about-tanzania',
    date: '4 September 2026',
    title: 'Tanzania in December: short rains, calving, and holiday crowds',
    excerpt: 'Green grass in the south, a busy airport, and how we still build a good week.',
    image: GM.migration,
    sections: [
      {
        heading: 'Weather',
        text: 'Short rains often show up in November and can linger. Afternoons may storm. Mornings can be clear and hot. The coast is humid. Kilimanjaro is still cold at night. Pack a shell, not a single linen shirt.',
      },
      {
        heading: 'Wildlife',
        text: 'Wildebeest are typically using the southern Serengeti and Ndutu. It is a strong month for calving if the grass is right. The crater is open. Some remote camps that closed in April are long since back.',
      },
      {
        heading: 'The calendar',
        text: 'Christmas and New Year fill lodges. Book beds early or be willing to change camps. We would rather shift a night than put you on a mattress in a corridor.',
      },
    ],
  }),
  article({
    slug: 'best-time-zanzibar',
    topic: 'islands',
    date: '3 September 2026',
    title: 'Best time to visit Zanzibar after a safari',
    excerpt: 'Dry, hot, and humid in different months — plus the tide question most guests forget.',
    image: GM.zanzibarBeach,
    sections: [
      {
        heading: 'The months people prefer',
        text: 'June to October is drier and easier for beach days after the northern circuit. January and February are warm and popular. Long rains around March to May mean more showers; some hotels drop rates and the island is quieter.',
      },
      {
        heading: 'Safari plus island',
        text: 'If the Serengeti is the point, pick the wildlife month first, then take whatever beach weather comes with it. Two or three nights still feel like a holiday. Five is a rest. We fly you from Arusha or Kilimanjaro rather than driving to the coast.',
      },
      {
        heading: 'Tides and wind',
        text: 'East-coast swimming depends on the tide. North-west beaches are more forgiving. Kitesurfers often want the east in the windier months. Tell us if you need to float at noon or if a long low-tide walk is fine.',
      },
    ],
  }),
  article({
    slug: 'best-time-tanzania-and-zanzibar',
    topic: 'about-tanzania',
    date: '3 September 2026',
    title: 'Best time for Tanzania and Zanzibar in one trip',
    excerpt: 'Pick the safari season, then give the island enough nights that the dust can leave.',
    image: GM.coast,
    sections: [
      {
        heading: 'One calendar, two climates',
        text: 'The northern parks care about rain and grass. Zanzibar cares about rain, humidity, and tide. June to October is the overlap most of our combination trips use. January–February is the other popular window, with calving in the south and a warm sea.',
      },
      {
        heading: 'Order of chapters',
        text: 'Safari or Kilimanjaro first. Island last. A rest night in Arusha if you have come off the mountain. We do not book a 5 a.m. game drive the morning after Uhuru.',
      },
      {
        heading: 'If your leave is fixed to April',
        text: 'Write anyway. We may shorten the north, use lodges that stay open, and still put you on a quiet beach. We will not pretend it is August.',
      },
    ],
  }),
  article({
    slug: 'zanzibar-sea-turtles',
    topic: 'islands',
    date: '2 September 2026',
    title: 'Sea turtles in Zanzibar: how we do the water ethically',
    excerpt: 'Snorkel, keep your distance, and skip the circus that treats wild animals as props.',
    image: GM.zanzibarBeach,
    sections: [
      {
        heading: 'Where you might see them',
        text: 'Reefs off Unguja, conservation projects that brief you properly, and — if we send you further — Mafia’s marine park. Encounters are wild. We do not guarantee a turtle on a Tuesday.',
      },
      {
        heading: 'How to behave',
        text: 'No grabbing, no riding, no crowding a nesting beach at night without a licensed guide. If a boat operator treats the animal as a photo booth, we leave. That is the brief we give guests and the standard we book to.',
      },
      {
        heading: 'Prison Island and farms',
        text: 'Giant tortoises on Changuu are a different, managed visit. Fine as a Stone Town add-on. They are not sea turtles. We keep the two stories separate so the marketing does not blur.',
      },
    ],
  }),
  article({
    slug: 'swahili-greetings-for-safari',
    topic: 'about-tanzania',
    date: '2 September 2026',
    title: 'Swahili on safari: greetings that actually get used',
    excerpt: 'Mambo, asante, pole pole — enough to be polite without performing a phrasebook.',
    image: GM.cultureTeam,
    sections: [
      {
        heading: 'Start here',
        text: 'Habibari or mambo for hello, poa or nzuri for a reply, asante for thank you, karibu when someone welcomes you, lala salama at night. Pole pole — slowly — is the mountain and the vehicle. Your guide will smile if you try and will not exam you if you forget.',
      },
      {
        heading: 'Hakuna matata',
        text: 'The phrase is real Swahili for “no trouble.” It is also a film souvenir. Use it lightly. Asante sana will take you further in a market than a Disney quote.',
      },
      {
        heading: 'English still works',
        text: 'Lodges and our crew work in English. Swahili is respect, not a barrier you must clear before you book. Learn five words; spend the rest of the energy looking out of the window.',
      },
    ],
  }),
  article({
    slug: 'where-is-tanzania',
    topic: 'about-tanzania',
    date: '1 September 2026',
    title: 'Where is Tanzania?',
    excerpt: 'East Africa, Indian Ocean, and the neighbours that shape how you fly in.',
    image: GM.savanna,
    sections: [
      {
        heading: 'On the continent',
        text: 'Tanzania sits on the east coast of Africa, south of Kenya, with the Indian Ocean to the east. Uganda, Rwanda, Burundi, Zambia, Malawi, and Mozambique share other borders. The equator is just north of us; we are a southern-hemisphere country with tropical seasons, not European ones.',
      },
      {
        heading: 'How that affects your ticket',
        text: 'Long-haul flights often land at Kilimanjaro (JRO), Dar es Salaam, or via Nairobi. Safari guests heading to our office usually want JRO. Zanzibar has its own airport for the beach chapter.',
      },
      {
        heading: 'One country, several trips',
        text: 'Mainland parks, the mountain, and the islands are all Tanzania. You do not need a second visa for Zanzibar. You do need a plan so you are not crossing the same road three times.',
      },
    ],
  }),
  article({
    slug: 'language-spoken-in-tanzania',
    topic: 'about-tanzania',
    date: '1 September 2026',
    title: 'What language is spoken in Tanzania?',
    excerpt: 'Swahili first, English in tourism, and more than a hundred other languages at home.',
    image: GM.cultureTeam,
    sections: [
      {
        heading: 'National and working languages',
        text: 'Kiswahili is the national language. English is widely used in safari lodges, climbing briefings, and government paperwork you will see as a visitor. You can complete a Golden Memories trip in English.',
      },
      {
        heading: 'What you hear on the road',
        text: 'Guides may switch to Swahili with gate staff and crew. That is normal. A few greetings from you are welcome. We are not going to pretend you need fluency to enjoy a game drive.',
      },
      {
        heading: 'Other tongues',
        text: 'Tanzania has many community languages. Maasai conversations on the crater highlands are not a show for the vehicle; ask before you photograph, and let your guide interpret if a visit is part of the day.',
      },
    ],
  }),
  article({
    slug: 'family-tanzania-safari-adventures',
    topic: 'safari',
    date: '31 August 2026',
    title: 'Family safari days that still feel like a holiday',
    excerpt: 'Short drives, a swim, a cultural hour, and one crater descent — not a hero schedule.',
    image: GM.ngorongoroTourists,
    sections: [
      {
        heading: 'Build the day around energy, not gates',
        text: 'A private vehicle means biscuit stops and a midday rest. Tarangire elephants hold children’s attention. The crater is one full day, not two. Serengeti nights come when the ages can handle the road or we fly a leg.',
      },
      {
        heading: 'Beyond the 4x4',
        text: 'A hotel pool in Arusha, a guided walk where it is allowed and safe, a coffee farm on a transfer day, or a beach at the end. We skip long lectures. We do not skip sunhats.',
      },
      {
        heading: 'Ages and park rules',
        text: 'Some camps set minimum ages. We check before we quote. If Kilimanjaro is only for the adults, we say so and plan the rest of the family accordingly.',
      },
    ],
  }),
];
