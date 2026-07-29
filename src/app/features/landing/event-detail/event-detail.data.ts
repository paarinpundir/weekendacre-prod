export interface EventDetailContent {
  slug: string;
  title: string;
  description: string;
  theme?: string;
  heroImage: string;
  intro: string;
  sections: { heading: string; body: string; image?: string; imageAlt?: string }[];
  highlights: string[];
  gallery: string[];
  meta: { when?: string; format?: string; audience?: string };
}

export const EVENT_DETAILS: Record<string, EventDetailContent> = {
  'soulful-study-music': {
    slug: 'soulful-study-music',
    title: 'Soulful Study & Music',
    description: 'Safe in the fields — soulful music + farm-fresh salads',
    theme: 'An evening of soul & nature',
    heroImage:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop',
    intro:
      'An open-air evening where acoustic sets, gentle lighting, and farm-grown salads come together. We keep the crowd intimate so you can hear the music, taste the harvest, and still feel the quiet of the fields around you.',
    sections: [
      {
        heading: 'The evening flow',
        body:
          'Doors open at golden hour for a walking loop through the plots. Dinner is served as shared platters under a canopy, followed by one or two acoustic sets and space to linger by the fire or stargaze before a soft close.',
        image:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=800&fit=crop',
        imageAlt: 'Acoustic performance outdoors',
      },
      {
        heading: 'What we serve',
        body:
          'Menus shift with the season: leafy bowls, grilled vegetables, and breads from a local bakery. We label allergens clearly and offer a non-alcoholic bar. Dress is casual; bring a light layer for after sunset.',
        image:
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=800&fit=crop',
        imageAlt: 'Fresh farm-style food',
      },
    ],
    highlights: ['Live Music', 'Farm Fresh Food', 'Peaceful Environment'],
    gallery: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba362b36?w=800&fit=crop',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&fit=crop',
    ],
    meta: { when: 'Seasonal dates', format: 'Evening (4–5 hours)', audience: 'All ages welcome' },
  },
  'dive-summer-vibes': {
    slug: 'dive-summer-vibes',
    title: 'Dive Into Summer Vibes',
    description: 'A futuristic farm filled with summer splashes',
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    intro:
      'When the heat peaks, we lean into it: melon tastings, shade sails over the lawn, and splash-friendly corners for kids. It is part festival, part farm day—designed so families can cool down without leaving the land.',
    sections: [
      {
        heading: 'Summer on the estate',
        body:
          'Expect hydration stations, mist fans near seating, and guided “orchard walks” to see what is ripening. Afternoons include optional games on the grass and a simple ice-and-fruit bar for anyone who needs a reset.',
        image:
          'https://images.unsplash.com/photo-1592592879590-fe22a75242c2?w=1200&h=800&fit=crop',
        imageAlt: 'Summer fruit and outdoor shade',
      },
      {
        heading: 'Mango & muskmelon',
        body:
          'When our partner growers have surplus, we spotlight mangoes and muskmelon in salads, coolers, and a small tasting table. Availability depends on the week—check the schedule when tickets go live.',
        image:
          'https://images.unsplash.com/photo-1605027990121-c9e289a2a01f?w=1200&h=800&fit=crop',
        imageAlt: 'Tropical fruit display',
      },
    ],
    highlights: ['Mango & Muskmelon Magic', 'Summer Activities', 'Fresh Produce'],
    gallery: [
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&fit=crop',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&fit=crop',
    ],
    meta: { when: 'Peak summer weekends', format: 'Day program', audience: 'Families & friends' },
  },
  'youth-on-farm': {
    slug: 'youth-on-farm',
    title: 'Youth-On-Farm',
    description: "Standouts code smart amid nature's quiet",
    theme: 'Tech + Nature Retreat',
    heroImage:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop',
    intro:
      'A long weekend for students and early-career builders who want deep work blocks, mentor circles, and real breaks outdoors. We cap attendance so every cohort can actually talk—and the Wi-Fi holds where it matters.',
    sections: [
      {
        heading: 'Rhythm of the retreat',
        body:
          'Mornings: focused sprints with optional accountability pairs. Midday: farm walk or nap block. Evenings: lightning talks, board games, or quiet reading on the veranda. Phones stay on silent in shared indoor spaces.',
        image:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop',
        imageAlt: 'Team collaboration',
      },
      {
        heading: 'Nature as reset',
        body:
          'We route walking paths away from work zones so you can clear your head between sessions. Optional sunrise yoga and a short “digital sunset” hour help the group settle into a healthier pace by day three.',
        image:
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
        imageAlt: 'Forest path',
      },
    ],
    highlights: ['Coding Sessions', 'Nature Immersion', 'Networking'],
    gallery: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&fit=crop',
    ],
    meta: { when: 'Long weekends', format: 'Residential (3 days)', audience: 'Students & early-career' },
  },
};
