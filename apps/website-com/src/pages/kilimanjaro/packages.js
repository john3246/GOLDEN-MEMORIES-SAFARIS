import { galleryPhoto, assignUniqueCovers } from '../../media/gallery.js';

const climbIncluded = [
  'Mountain huts or camping equipment as per the route (tent, mattress, mess table and chairs)',
  'All transportation, including airport pickup and drop-off',
  'All park entrance fees, rescue fees, 18% VAT, and government taxes',
  'Professional English-speaking mountain guide, chef, and porterage',
  'Meals according to the itinerary and mineral water on all days',
  'All mentioned activities',
];

const climbExcluded = [
  'International and internal flights',
  'Personal items (souvenirs, travel insurance, visa fees)',
  'Tips for the mountain crew (recommended amount depends on group size)',
  'Sleeping bag (rental available on request)',
  'Personal Kilimanjaro trekking equipment (rental available on request)',
];

function trek(item) {
  return {
    style: 'mountain',
    activity: 'Kilimanjaro trekking',
    places: 'Kilimanjaro',
    currency: 'USD',
    minimum_people: 2,
    featured: false,
    included: climbIncluded,
    excluded: climbExcluded,
    ...item,
  };
}

function day(label, title, body, extra = {}) {
  return {
    day: label,
    title,
    body,
    stay: extra.stay || 'Mountain camp or hut',
    meals: extra.meals || 'Breakfast, lunch and dinner',
    viewing: extra.viewing || extra.walk || 'On foot with mountain crew',
    transport: extra.transport || 'On foot with mountain crew',
    image: extra.image || galleryPhoto('kilimanjaro', 0),
  };
}

export const kilimanjaroTreks = [
  trek({
    slug: '6-day-mount-kilimanjaro-climbing-adventure-via-marangu-route',
    title: '6 Day Mount Kilimanjaro Climbing Adventure via Marangu Route',
    duration: '6 Days / 5 Nights',
    image: galleryPhoto('kilimanjaro', 0),
    featured: true,
    price_from: 1910,
    route: 'Marangu',
    overview:
      'The Marangu Route, famously known as the “Coca-Cola Route,” is the only Kilimanjaro trail with hut accommodation. This six-day itinerary allows better acclimatization than the five-day version and a steadier pace through rainforest, moorland, and alpine desert to Uhuru Peak.',
    highlights: ['Hut overnight', 'Mandara, Horombo, Kibo', 'Uhuru Peak attempt', 'Guided crew from Moshi or Arusha'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Arrive at Kilimanjaro International Airport and transfer to Moshi. Evening briefing with your climbing team and overnight at the hotel.', {
        stay: 'Hotel in Moshi or Arusha',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 1', 'Moshi to Marangu Gate – Mandara Hut', 'Drive to Marangu Gate for registration, then trek through tropical rainforest to Mandara Hut (2,743 m). Walking time 4–5 hours.', {
        stay: 'Mandara Hut',
        walk: '4–5 hours · rainforest',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 2', 'Mandara Hut to Horombo Hut', 'The trail leaves the forest for heather and moorland, with views of Mawenzi and Kibo, arriving at Horombo Hut (3,720 m). Walking time 6–8 hours.', {
        stay: 'Horombo Hut',
        walk: '6–8 hours · moorland',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 3', 'Horombo Hut to Kibo Hut', 'A key acclimatization stage into alpine desert, finishing at Kibo Hut (4,703 m) to rest and prepare for summit night. Walking time 6–8 hours.', {
        stay: 'Kibo Hut',
        walk: '6–8 hours · alpine desert',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 4', 'Uhuru Peak and descent to Horombo', 'Midnight start for Gilman’s Point and Uhuru Peak (5,895 m). After sunrise at the roof of Africa, descend to Horombo Hut. Walking time 10–14 hours.', {
        stay: 'Horombo Hut',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 5', 'Horombo Hut to Marangu Gate – Moshi', 'Final descent through rainforest to Marangu Gate for your summit certificate, then transfer to Moshi for a celebratory dinner.', {
        stay: 'Hotel in Moshi',
        meals: 'Breakfast, lunch and special dinner',
        walk: '6–8 hours · rainforest',
        image: galleryPhoto('kilimanjaro', 6),
      }),
    ],
  }),
  trek({
    slug: '5-day-mount-kilimanjaro-climb-via-umbwe-route',
    title: '5 Day Mount Kilimanjaro Climb via Umbwe Route',
    duration: '5 Days / 4 Nights',
    image: galleryPhoto('kilimanjaro', 1),
    price_from: 2141,
    route: 'Umbwe',
    overview:
      'The Umbwe Route is the steepest and most direct path to Uhuru Peak, for experienced and fit trekkers. Limited acclimatization time means a lower summit success rate than longer itineraries; a six-day Umbwe climb is safer if you can spare the extra night.',
    highlights: ['Steep rainforest start', 'Barranco Wall', 'Quieter trail', 'Direct summit profile'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Airport transfer to Arusha or Moshi, briefing, gear check, and overnight before the climb.', {
        stay: 'Hotel in Arusha or Moshi',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Umbwe Gate to Umbwe Cave Camp', 'Steep rainforest ascent on a quiet trail to Umbwe Cave Camp. Walking time 5–7 hours.', {
        stay: 'Umbwe Cave Camp',
        walk: '5–7 hours · rainforest',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 2', 'Umbwe Cave Camp to Barranco Camp', 'Ridge walking into heather and moorland, finishing below the Barranco Wall. Walking time 5–6 hours.', {
        stay: 'Barranco Camp',
        walk: '5–6 hours · moorland',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 3', 'Barranco Camp to Barafu Camp', 'Scramble the Barranco Wall, then continue through alpine desert to Barafu, the summit base. Walking time 5–8 hours.', {
        stay: 'Barafu Camp',
        walk: '5–8 hours · alpine desert',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 4', 'Summit night and descent to Mweka Camp', 'Midnight start to Stella Point and Uhuru Peak, then a long descent to Mweka Camp. Walking time 10–14 hours.', {
        stay: 'Mweka Camp',
        meals: 'Breakfast, lunch and special dinner',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 5', 'Mweka Camp to Mweka Gate', 'Forest descent to Mweka Gate for your certificate, then transfer to Moshi or Arusha.', {
        stay: 'Hotel in Arusha or Moshi',
        meals: 'Breakfast and lunch',
        walk: '3–4 hours · rainforest',
        image: galleryPhoto('kilimanjaro', 6),
      }),
    ],
  }),
  trek({
    slug: '7-day-mount-kilimanjaro-climbing-adventure-via-lemosho-route',
    title: '7 Day Mount Kilimanjaro Climbing Adventure via Lemosho Route',
    duration: '7 Days / 6 Nights',
    image: galleryPhoto('kilimanjaro', 2),
    price_from: 2787,
    route: 'Lemosho',
    overview:
      'Lemosho is one of the most scenic and least crowded ways to climb Kilimanjaro, starting on the western side through rainforest and the Shira Plateau. Seven days suits fit trekkers with limited time; eight days is the usual recommendation for acclimatization.',
    highlights: ['Western rainforest start', 'Shira Plateau', 'Barranco Wall', 'Strong scenery, fewer crowds'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Transfer to Arusha, briefing, and overnight before Lemosho Gate.', {
        stay: 'Hotel in Arusha',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Lemosho Gate to Big Tree Camp', 'Drive to the western gate and trek through rainforest to Big Tree Camp (Mti Mkubwa).', {
        stay: 'Big Tree Camp',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 2', 'Big Tree Camp to Shira 2 Camp', 'Ascend onto the Shira Plateau with lunch at Shira 1, overnight at Shira 2.', {
        stay: 'Shira 2 Camp',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 3', 'Shira 2 to Barranco via Lava Tower', 'Climb high to Lava Tower, then sleep lower at Barranco Camp.', {
        stay: 'Barranco Camp',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 4', 'Barranco Camp to Karanga Camp', 'Barranco Wall scramble and a shorter acclimatization afternoon at Karanga.', {
        stay: 'Karanga Camp',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 5', 'Karanga Camp to Barafu Camp', 'Short, steep pull to the high camp before summit night.', {
        stay: 'Barafu Camp',
        image: galleryPhoto('kilimanjaro', 6),
      }),
      day('Day 6', 'Uhuru Peak and descent to Mweka Camp', 'Midnight ascent to Uhuru Peak, then down to Mweka Camp.', {
        stay: 'Mweka Camp',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 7),
      }),
      day('Day 7', 'Mweka Gate and return to Arusha', 'Forest descent, summit certificate, and transfer to Arusha.', {
        stay: 'Hotel in Arusha',
        meals: 'Breakfast, lunch and special dinner',
        image: galleryPhoto('kilimanjaro', 8),
      }),
    ],
  }),
  trek({
    slug: '6-day-mount-kilimanjaro-climbing-via-machame-route',
    title: '6 Day Mount Kilimanjaro Climbing Adventure via Machame Route',
    duration: '6 Days / 5 Nights',
    image: galleryPhoto('kilimanjaro', 3),
    price_from: 2484,
    route: 'Machame',
    overview:
      'The Machame (“Whiskey”) Route is one of the most popular and scenic trails on Kilimanjaro. This six-day version is for fit trekkers with limited time; the seven-day itinerary is the usual recommendation for acclimatization and summit success.',
    highlights: ['Rainforest to alpine desert', 'Shira Plateau', 'Barranco Wall', 'Barafu summit night'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Transfer to Moshi, briefing, and overnight before Machame Gate.', {
        stay: 'Hotel in Moshi',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Machame Gate to Machame Camp', 'Rainforest trek from Machame Gate to Machame Camp (2,850 m). Walking time 5–7 hours.', {
        stay: 'Machame Camp',
        walk: '5–7 hours · rainforest',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 2', 'Machame Camp to Shira Camp', 'Leave the forest for heather and moorland on the Shira Plateau. Walking time 4–6 hours.', {
        stay: 'Shira Camp',
        walk: '4–6 hours · moorland',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 3', 'Shira Camp to Barranco via Lava Tower', 'Climb high to Lava Tower (4,630 m), then sleep lower at Barranco. Walking time 7–8 hours.', {
        stay: 'Barranco Camp',
        walk: '7–8 hours · alpine desert',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 4', 'Barranco Camp to Barafu Camp', 'Barranco Wall, then on to Barafu for summit night. Walking time 5–8 hours.', {
        stay: 'Barafu Camp',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 5', 'Uhuru Peak and descent to Mweka Camp', 'Midnight start to Uhuru Peak, then a long descent to Mweka Camp.', {
        stay: 'Mweka Camp',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 6),
      }),
      day('Day 6', 'Mweka Gate and return', 'Forest descent to Mweka Gate, certificate, and transfer to Moshi or Arusha.', {
        stay: 'Hotel in Moshi or Arusha',
        meals: 'Breakfast, lunch and special dinner',
        walk: '3–4 hours · rainforest',
        image: galleryPhoto('kilimanjaro', 7),
      }),
    ],
  }),
  trek({
    slug: '7-day-mount-kilimanjaro-climbing-adventure-via-machame-route',
    title: '7 Day Mount Kilimanjaro Climbing Adventure via Machame Route',
    duration: '7 Days / 6 Nights',
    image: galleryPhoto('kilimanjaro', 4),
    featured: true,
    price_from: 2762,
    route: 'Machame',
    overview:
      'This seven-day Machame itinerary is the most recommended whiskey-route profile: rainforest, moorland, alpine desert, and an extra Karanga night for acclimatization before Barafu and Uhuru Peak.',
    highlights: ['Karanga acclimatization night', 'Barranco Wall', 'Shira Plateau', 'Higher summit success than 6 days'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Transfer to Arusha, briefing, and overnight before Machame Gate.', {
        stay: 'Hotel in Arusha',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Machame Gate to Machame Camp', 'Drive from Arusha to Machame Gate and trek through rainforest to Machame Camp.', {
        stay: 'Machame Camp',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 2', 'Machame Camp to Shira Camp', 'Onto the Shira Plateau with wide mountain views.', {
        stay: 'Shira Camp',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 3', 'Shira Camp to Barranco via Lava Tower', 'Climb high, sleep low: Lava Tower then Barranco Camp.', {
        stay: 'Barranco Camp',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 4', 'Barranco Camp to Karanga Camp', 'Barranco Wall and a shorter afternoon at Karanga for acclimatization.', {
        stay: 'Karanga Camp',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 5', 'Karanga Camp to Barafu Camp', 'Move to the high camp and prepare for midnight summit.', {
        stay: 'Barafu Camp',
        image: galleryPhoto('kilimanjaro', 6),
      }),
      day('Day 6', 'Uhuru Peak and descent to Mweka Camp', 'Summit night to Uhuru Peak, then descend to Mweka Camp.', {
        stay: 'Mweka Camp',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 7),
      }),
      day('Day 7', 'Mweka Gate and return to Arusha', 'Forest descent, certificate, and celebratory dinner in Arusha.', {
        stay: 'Hotel in Arusha',
        meals: 'Breakfast, lunch and special dinner',
        image: galleryPhoto('kilimanjaro', 8),
      }),
    ],
  }),
  trek({
    slug: '6-day-mount-kilimanjaro-climbing-adventure-via-umbwe-route',
    title: '6 Day Mount Kilimanjaro Climbing Adventure via Umbwe Route',
    duration: '6 Days / 5 Nights',
    image: galleryPhoto('kilimanjaro', 5),
    price_from: 2484,
    route: 'Umbwe',
    overview:
      'Six-day Umbwe is the standard steep western approach: rainforest to Barranco, then the Machame trail via Karanga and Barafu to Uhuru Peak. Better acclimatization than the five-day Umbwe, still a demanding and quiet route.',
    highlights: ['Remote rainforest start', 'Joins Machame at Barranco', 'Karanga night', 'Fewer crowds'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Transfer to Arusha, briefing, and overnight.', {
        stay: 'Hotel in Arusha',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Umbwe Gate to Umbwe Cave Camp', 'Steep, quiet rainforest climb to Umbwe Cave Camp.', {
        stay: 'Umbwe Cave Camp',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 2', 'Umbwe Cave Camp to Barranco Camp', 'Ridges and volcanic rock to Barranco, joining the Machame trail.', {
        stay: 'Barranco Camp',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 3', 'Barranco Camp to Karanga Camp', 'Barranco Wall and a first acclimatization afternoon at Karanga.', {
        stay: 'Karanga Camp',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 4', 'Karanga Camp to Barafu Camp', 'Short move to the summit base for an early night.', {
        stay: 'Barafu Camp',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 5', 'Uhuru Peak and descent to Mweka Camp', 'Midnight ascent to Uhuru Peak, then down to Mweka Camp.', {
        stay: 'Mweka Camp',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 6),
      }),
      day('Day 6', 'Mweka Gate and return to Arusha', 'Forest descent, certificate, and transfer to Arusha.', {
        stay: 'Hotel in Arusha',
        meals: 'Breakfast and lunch',
        image: galleryPhoto('kilimanjaro', 7),
      }),
    ],
  }),
  trek({
    slug: '7-day-mount-kilimanjaro-climbing-adventure-via-rongai-route',
    title: '7 Day Mount Kilimanjaro Climbing Adventure via Rongai Route',
    duration: '7 Days / 6 Nights',
    image: galleryPhoto('kilimanjaro', 6),
    price_from: 2762,
    route: 'Rongai',
    overview:
      'Rongai approaches Kilimanjaro from the north near the Kenyan border — drier, quieter, and a steadier climb than the southern routes. You finish at Marangu Gate after Uhuru Peak.',
    highlights: ['Northern approach', 'Fewer crowds', 'Mawenzi views', 'Good wet-season choice'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Transfer to Moshi, briefing, and overnight at the base of the mountain.', {
        stay: 'Hotel in Moshi',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Rongai Gate to Simba Camp', 'Drive to Rongai Gate and begin the northern trail to Simba Camp.', {
        stay: 'Simba Camp',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 2', 'Simba Camp to Second Cave Camp', 'Open, drier slopes with views across the northern plains.', {
        stay: 'Second Cave Camp',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 3', 'Second Cave Camp to Kikelewa Camp', 'Moorland walking toward the eastern flanks of Kibo.', {
        stay: 'Kikelewa Camp',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 4', 'Kikelewa Camp to Mawenzi Tarn Camp', 'High camp beneath Mawenzi Peak for acclimatization.', {
        stay: 'Mawenzi Tarn Camp',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 5', 'Mawenzi Tarn Camp to Kibo Hut', 'Cross the saddle between Mawenzi and Kibo to the summit hut.', {
        stay: 'Kibo Hut',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 6', 'Uhuru Peak and descent to Horombo Hut', 'Midnight start to Uhuru Peak, then down to Horombo Hut.', {
        stay: 'Horombo Hut',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 7),
      }),
      day('Day 7', 'Horombo Hut to Marangu Gate', 'Descend to Marangu Gate for your certificate and return to Moshi.', {
        stay: 'Hotel in Moshi',
        meals: 'Breakfast, lunch and special dinner',
        image: galleryPhoto('kilimanjaro', 8),
      }),
    ],
  }),
  trek({
    slug: '9-day-mount-kilimanjaro-trekking-adventure-via-northern-circuit-route',
    title: '9 Day Mount Kilimanjaro Trekking Adventure via Northern Circuit Route',
    duration: '9 Days / 8 Nights',
    image: galleryPhoto('kilimanjaro', 7),
    price_from: 3452,
    route: 'Northern Circuit',
    overview:
      'The Northern Circuit is the longest and most scenic Kilimanjaro route, with the best acclimatization profile. You start on Lemosho, circle the quiet northern slopes, summit via Gilman’s Point, and descend the Mweka Route.',
    highlights: ['Highest summit success', 'Remote northern slopes', 'Full circuit of the mountain', 'Nine days on the trail'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Transfer to Arusha, briefing, and overnight.', {
        stay: 'Hotel in Arusha',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Lemosho Gate to Big Tree Camp', 'Londorossi registration, then rainforest to Mti Mkubwa.', {
        stay: 'Big Tree Camp',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 2', 'Big Tree Camp to Shira 1 Camp', 'Heather and moorland onto the Shira Plateau.', {
        stay: 'Shira 1 Camp',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 3', 'Shira 1 Camp to Moir Hut', 'Turn north across the plateau to secluded Moir Hut.', {
        stay: 'Moir Hut',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 4', 'Moir Hut to Buffalo Camp', 'Remote northern slopes with wide Kenyan-plain views.', {
        stay: 'Buffalo Camp',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 5', 'Buffalo Camp to Third Cave Camp', 'Quiet high-alpine walking toward the saddle.', {
        stay: 'Third Cave Camp',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 6', 'Third Cave Camp to Kibo Hut', 'Cross the alpine desert saddle to Kibo Hut.', {
        stay: 'Kibo Hut',
        image: galleryPhoto('kilimanjaro', 6),
      }),
      day('Day 7', 'Uhuru Peak and descent to Barafu Camp', 'Gilman’s Point, Stella Point, Uhuru Peak, then down to Barafu.', {
        stay: 'Barafu Camp',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 8),
      }),
      day('Day 8', 'Barafu Camp to Mweka Camp', 'Descend into montane forest for the last night on the mountain.', {
        stay: 'Mweka Camp',
        image: galleryPhoto('kilimanjaro', 9),
      }),
      day('Day 9', 'Mweka Gate and return to Arusha', 'Final rainforest walk, summit certificate, and transfer to Arusha.', {
        stay: 'Hotel in Arusha',
        meals: 'Breakfast, lunch and special dinner',
        image: galleryPhoto('kilimanjaro', 10),
      }),
    ],
  }),
  trek({
    slug: '8-day-mount-kilimanjaro-trekking-adventure-via-lemosho-route',
    title: '8 Day Mount Kilimanjaro Trekking Adventure via Lemosho Route',
    duration: '8 Days / 7 Nights',
    image: galleryPhoto('kilimanjaro', 8),
    featured: true,
    price_from: 3136,
    route: 'Lemosho',
    overview:
      'Eight-day Lemosho is the classic western approach: rainforest, Shira 1 and Shira 2, Lava Tower, Barranco, Karanga, Barafu, and Uhuru Peak. Extra nights on the plateau give strong acclimatization and a quieter start than Machame.',
    highlights: ['Shira 1 and Shira 2', 'Excellent acclimatization', 'Barranco Wall', 'Western wilderness start'],
    days: [
      day('Day 0', 'Arrival in Tanzania', 'Transfer to Arusha, briefing, and overnight.', {
        stay: 'Hotel in Arusha',
        meals: 'Dinner',
        image: galleryPhoto('kilimanjaro', 0),
      }),
      day('Day 1', 'Lemosho Gate to Big Tree Camp', 'Rainforest trek to Mti Mkubwa after Londorossi registration.', {
        stay: 'Big Tree Camp',
        image: galleryPhoto('kilimanjaro', 1),
      }),
      day('Day 2', 'Big Tree Camp to Shira 1 Camp', 'Onto the Shira Plateau for the first high camp.', {
        stay: 'Shira 1 Camp',
        image: galleryPhoto('kilimanjaro', 2),
      }),
      day('Day 3', 'Shira 1 Camp to Shira 2 Camp', 'A shorter plateau day to settle into the altitude.', {
        stay: 'Shira 2 Camp',
        image: galleryPhoto('kilimanjaro', 3),
      }),
      day('Day 4', 'Shira 2 to Barranco via Lava Tower', 'Climb high to Lava Tower, sleep lower at Barranco.', {
        stay: 'Barranco Camp',
        image: galleryPhoto('kilimanjaro', 4),
      }),
      day('Day 5', 'Barranco Camp to Karanga Camp', 'Barranco Wall and Karanga for further acclimatization.', {
        stay: 'Karanga Camp',
        image: galleryPhoto('kilimanjaro', 5),
      }),
      day('Day 6', 'Karanga Camp to Barafu Camp', 'Move to the summit base and rest before midnight.', {
        stay: 'Barafu Camp',
        image: galleryPhoto('kilimanjaro', 6),
      }),
      day('Day 7', 'Uhuru Peak and descent to Mweka Camp', 'Summit night to Uhuru Peak, then down to Mweka Camp.', {
        stay: 'Mweka Camp',
        walk: '10–14 hours · summit',
        image: galleryPhoto('kilimanjaro', 7),
      }),
      day('Day 8', 'Mweka Gate and return to Arusha', 'Forest descent, certificate, and farewell dinner in Arusha.', {
        stay: 'Hotel in Arusha',
        meals: 'Breakfast, lunch and special dinner',
        image: galleryPhoto('kilimanjaro', 9),
      }),
    ],
  }),
];

assignUniqueCovers(kilimanjaroTreks);
