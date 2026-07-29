export interface ExperienceDetailContent {
  slug: string;
  title: string;
  tagline: string;
  heroImage: string;
  intro: string;
  sections: { heading: string; body: string; image?: string; imageAlt?: string }[];
  highlights: string[];
  gallery: string[];
  meta: { duration?: string; bestFor?: string; region?: string };
}

export const EXPERIENCE_DETAILS: Record<string, ExperienceDetailContent> = {
  'day-escape': {
    slug: 'day-escape',
    title: 'Escape for a Day',
    tagline: 'Picnic under open skies',
    heroImage:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&h=1080&fit=crop',
    intro:
      'Step away from the city for a single day of fresh air, open fields, and slow conversation. Our day-escape format is built for families, couples, and small groups who want the feeling of a farm holiday without an overnight stay.',
    sections: [
      {
        heading: 'What your day looks like',
        body:
          'Arrive mid-morning for tea under the trees, explore walking paths between plots, and settle in for a picnic lunch with seasonal produce from the estate. Afternoons are unscheduled—read, sketch, play games on the lawn, or join an optional short walk with a host.',
        image:
          'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=800&fit=crop',
        imageAlt: 'Open fields and picnic setting',
      },
      {
        heading: 'Who it suits best',
        body:
          'Ideal if you are new to farm stays, travelling with young children, or pairing a countryside break with errands in the NCR. We keep group sizes modest so the land stays calm and everyone has space to breathe.',
        image:
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop',
        imageAlt: 'Friends relaxing outdoors',
      },
    ],
    highlights: [
      'Picnic setup with seasonal snacks (menu varies by harvest)',
      'Shaded seating and drinking water stations',
      'Easy half-day or full-day formats',
      'Photography-friendly landscapes',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&fit=crop',
      'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&fit=crop',
      'https://images.unsplash.com/photo-1498579687545-d5a4fffb08b7?w=800&fit=crop',
    ],
    meta: { duration: 'Half or full day', bestFor: 'Families & first-time visitors', region: 'NCR fringe' },
  },
  'camps-in-the-estate': {
    slug: 'camps-in-the-estate',
    title: 'Camps in the Estate',
    tagline: 'Come together, live the outdoors',
    heroImage:
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1920&h=1080&fit=crop',
    intro:
      'Evening light, a shared fire circle, and tents pitched where you can still hear crickets—our estate camps are about gathering your people in a setting that feels wild but is thoughtfully hosted.',
    sections: [
      {
        heading: 'Camp life, gently guided',
        body:
          'We provide marked pitches, shared wash facilities, and a central fire area. Hosts introduce you to the land at sunset, and mornings start with chai before optional farm walks. It is camping with guardrails: safe, social, and rooted in place.',
        image:
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&h=800&fit=crop',
        imageAlt: 'Camping at dusk',
      },
      {
        heading: 'Bring your circle',
        body:
          'Popular for birthdays, reunions, and team offsites. You can book adjacent pitches so your group stays together. We recommend two nights to settle into the rhythm of the estate.',
        image:
          'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&h=800&fit=crop',
        imageAlt: 'Group around campfire',
      },
    ],
    highlights: [
      'Designated camping zones with host support',
      'Shared amenities and evening fire circle',
      'Optional farm walk and breakfast add-ons',
      'Stargazing-friendly clearings',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1533874635197-064095a3e929?w=800&fit=crop',
      'https://images.unsplash.com/photo-1601134467661-3d7753f63add?w=800&fit=crop',
      'https://images.unsplash.com/photo-1525811902-2347d1d4e0d0?w=800&fit=crop',
    ],
    meta: { duration: '1–3 nights', bestFor: 'Groups & celebrations', region: 'Estate grounds' },
  },
  'make-your-home': {
    slug: 'make-your-home',
    title: 'Make Your Home',
    tagline: 'Shared spaces. Shared growth. Shared living.',
    heroImage:
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&h=1080&fit=crop',
    intro:
      'Longer stays for people who want to live alongside the farm—not just visit. Shared kitchens, community meals, and quiet corners for remote work come together in a rhythm shaped by seasons and neighbours.',
    sections: [
      {
        heading: 'Slow living, on purpose',
        body:
          'Residents split time between their own rooms and shared indoor–outdoor spaces. You might join a harvest morning, help label jars for the farm shop, or simply keep a steady remote-work routine with better lunches than the city offers.',
        image:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
        imageAlt: 'Comfortable shared living space',
      },
      {
        heading: 'Growth in community',
        body:
          'We curate small cohorts so the community stays manageable. Expect house norms around noise, shared chores, and respectful use of common resources—simple rules that keep everyone comfortable for weeks or months at a time.',
        image:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
        imageAlt: 'Shared dining and workspace',
      },
    ],
    highlights: [
      'Weekly community meals and optional skill shares',
      'Work-friendly Wi-Fi in designated zones',
      'Access to walking trails and produce counters',
      'Flexible stay lengths (subject to availability)',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&fit=crop',
    ],
    meta: { duration: 'Weekly to monthly', bestFor: 'Remote workers & slow travellers', region: 'Campus-style farm stay' },
  },
  'spiritual-getaways': {
    slug: 'spiritual-getaways',
    title: 'Scenic Farm Days to Spiritual Getaways',
    tagline: 'Haridwar & Rishikesh await',
    heroImage:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop',
    intro:
      'Pair peaceful days on the farm with short journeys toward the Ganga basin. This path is for guests who want green landscapes first, then optional dips into the spiritual geography of Haridwar and Rishikesh—without rushing either world.',
    sections: [
      {
        heading: 'Farm first, pilgrimage when you are ready',
        body:
          'We anchor you with unhurried mornings on the land: yoga on the lawn, journaling by the pond, and simple vegetarian meals. When you choose to travel toward Haridwar or Rishikesh, we help with sensible day-trip planning from the estate.',
        image:
          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=800&fit=crop',
        imageAlt: 'Quiet riverside and hills',
      },
      {
        heading: 'Respectful, low-footprint visits',
        body:
          'We encourage small groups, modest packing, and awareness of local customs near sacred sites. Our hosts can suggest timings for aarti, gentler walking routes, and where to pause for rest between farm life and riverside bustle.',
        image:
          'https://images.unsplash.com/photo-1580584126903-c17d41830450?w=1200&h=800&fit=crop',
        imageAlt: 'Temple steps and morning light',
      },
    ],
    highlights: [
      'Curated farm-base + optional Ganga-region day trips',
      'Vegetarian-forward meals aligned with many ashram norms',
      'Hosts familiar with respectful travel in pilgrimage towns',
      'Seasonal river and weather advisories',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&fit=crop',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&fit=crop',
    ],
    meta: { duration: '3–7 nights suggested', bestFor: 'Reflective travellers', region: 'Farm base + Haridwar / Rishikesh' },
  },
};
