export const CHARACTERS = [
  // Start (Intro)
  {
    id: 'panni',
    name: 'Panni',
    name_en: 'Panni',
    image: 'Panni.webp',
    species: 'Közönséges ürge',
    species_en: 'European ground squirrel',
    storyId: 0,
    description: 'A történet bátor és kíváncsi főhőse, aki elindul, hogy megmentse a kiszáradó Homokhátságot.',
    description_en: 'The brave and curious protagonist of our story, setting out to save the drying Homokhátság region.'
  },
  {
    id: 'szilvia',
    name: 'Szilvia',
    name_en: 'Szilvia',
    image: 'Szilvia.webp',
    species: 'Szalakóta',
    species_en: 'European roller',
    storyId: 0,
    description: 'Panni hűséges barátja, aki a magasból figyeli a tájat és éles látásával segíti a csapatot.',
    description_en: "Panni's loyal friend who watches the landscape from above and helps the team with her sharp eyesight."
  },
  {
    id: 'tanarur',
    name: 'Túzok tanár úr',
    name_en: 'Mr. Great Bustard',
    image: 'Túzok tanár úr.webp',
    species: 'Túzok',
    species_en: 'Great bustard',
    storyId: 0,
    description: 'Bölcs mentor és tanító, aki ismeri a puszta minden titkát és türelmével vezeti a fiatalokat.',
    description_en: 'A wise mentor and teacher who knows all the secrets of the puszta and guides the youth with patience.'
  },

  // Story 1 (Loc-11: Nagyszéksós-tó)
  {
    id: 'berci',
    name: 'Berci',
    name_en: 'Berci',
    image: 'Berci.webp',
    species: 'Házibivaly',
    species_en: 'Water buffalo',
    storyId: 1,
    description: 'A szikes tavak jámbor óriása, akinek hatalmas ereje elengedhetetlen a vizes élőhelyek megnyitásához.',
    description_en: 'The gentle giant of the salt lakes, whose massive strength is essential for opening up wetland habitats.'
  },
  {
    id: 'guli',
    name: 'Guli',
    name_en: 'Guli',
    image: 'Guli.webp',
    species: 'Gulipán',
    species_en: 'Pied avocet',
    storyId: 1,
    description: 'A vizek kecses táncosa, aki a gulipánok seregével segít tisztán tartani a táplálkozóhelyeket.',
    description_en: 'The graceful dancer of the waters, helping to keep feeding sites clean with his army of avocets.'
  },
  {
    id: 'pille',
    name: 'Pille',
    name_en: 'Pille',
    image: 'Pille.webp',
    species: 'Széki lile',
    species_en: 'Kentish plover',
    storyId: 1,
    description: 'A puszta apró és fürge őrzője, aki szorgalmával és éberségével vigyáz a fészkek biztonságára.',
    description_en: 'The tiny and nimble guardian of the puszta, watching over the safety of nests with diligence and alertness.'
  },

  // Story 2 (Loc-13: Ragadozók és rágcsálók / Roni & Csúszka)
  {
    id: 'roni',
    name: 'Roni',
    name_en: 'Roni',
    image: 'Roni.webp',
    species: 'Parlagi sas',
    species_en: 'Eastern imperial eagle',
    storyId: 2,
    description: 'Az egek büszke ura, aki a mérgezésből felgyógyulva újra a puszta felett őrködik.',
    description_en: 'The proud lord of the skies, guarding the puszta again after recovering from poisoning.'
  },
  {
    id: 'csuszka',
    name: 'Csúszka',
    name_en: 'Csúszka',
    image: 'Csúszka.webp',
    species: 'Rákosi vipera',
    species_en: 'Hungarian meadow viper',
    storyId: 2,
    description: 'Óvatos rejtőzködő és ritka kincs, aki a gyep megújulásával végre biztonságos otthonra lel.',
    description_en: 'A cautious hider and rare treasure, finally finding a safe home as the meadows are restored.'
  },
  {
    id: 'bolyhos',
    name: 'Bolyhos',
    name_en: 'Bolyhos',
    image: 'Bolyhos.webp',
    species: 'Komondor',
    species_en: 'Komondor',
    storyId: 2,
    externalLink: 'https://hu.wikipedia.org/wiki/Komondor_(kutyafajta)',
    description: 'A puszta hűséges őrzője, egy hatalmas komondor, aki méltóságteljes nyugalmával vigyázza a környék rendjét.',
    description_en: 'A loyal guardian of the puszta, a massive Komondor dog watching over the order with dignified calm.'
  },

  // Story 3 (Loc-16: Vizes élőhelyek / Kelemen, Zekő & Teknős apó)
  {
    id: 'kelemen',
    name: 'Kelemen',
    name_en: 'Kelemen',
    image: 'Kelemen.webp',
    species: 'Fehér gólya',
    species_en: 'White stork',
    storyId: 3,
    description: 'A fészkek hűséges őrzője, aki a vizek visszatértével végre bőségben nevelheti fiókáit.',
    description_en: 'The faithful guardian of nests, finally able to raise his chicks in abundance now that the waters have returned.'
  },
  {
    id: 'zeko',
    name: 'Zekő',
    name_en: 'Zekő',
    image: 'Zekő.webp',
    species: 'Vöröshasú unka',
    species_en: 'European fire-bellied toad',
    storyId: 3,
    description: 'A mocsár harsány hangú lakója, akinek kórusa a vizes élőhelyek megújulását hirdeti.',
    description_en: 'A loud-voiced inhabitant of the marsh, whose chorus announces the renewal of the wetlands.'
  },
  {
    id: 'teknos',
    name: 'Teknős apó',
    name_en: 'Old Turtle',
    image: 'Teknős apó.webp',
    species: 'Mocsári teknős',
    species_en: 'European pond turtle',
    storyId: 3,
    description: 'A vizek higadt veteránja, aki évtizedek óta figyeli a Homokhátság változásait.',
    description_en: 'A calm veteran of the waters, who has been watching the changes of the Homokhátság for decades.'
  }
];
