import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the trained ML multi-crop model artifact
const modelPath = path.join(__dirname, 'model/disease_model.json');
let trainedModel = null;

try {
  if (fs.existsSync(modelPath)) {
    trainedModel = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    console.log(`[ML Engine] Multi-crop disease model loaded (${trainedModel.metadata.num_classes} classes, Test Acc: ${(trainedModel.metadata.overall_test_accuracy * 100).toFixed(2)}%).`);
  }
} catch (err) {
  console.warn('[ML Engine Warning] Could not load disease_model.json, falling back to feature profile matching:', err.message);
}

/**
 * Validated Plant Foliar Pathology Database
 * Covers all 7 target agricultural crops:
 * 1. Cotton
 * 2. Paddy (Rice)
 * 3. Groundnut
 * 4. Maize
 * 5. Tomato
 * 6. Chilli
 * 7. Potato
 * (Plus legacy Apple and Grape preserved for backward compatibility)
 */
export const PATHOLOGY_DATABASE = {
  // ==========================================
  // 1. COTTON
  // ==========================================
  'cotton_bacterial_blight': {
    crop: 'Cotton',
    diseaseName: 'Cotton Bacterial Blight (Angular Leaf Spot)',
    scientificName: 'Xanthomonas citri pv. malvacearum',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.44,
      necroticRatio: 0.34,
      chloroticRatio: 0.22,
      edgeEnergy: 0.64,
      meanHue: 48,
      meanSat: 0.48,
      meanVal: 0.36,
      foliarAspect: 0.72
    },
    symptoms: [
      'Small, water-soaked angular spots on leaf blades strictly delimited by veinlets.',
      'Spots turn reddish-brown to dark black, coalescing into larger necrotic angular patches.',
      'Infection travels along main veins ("vein blight") and petiole ("black arm" stage).',
      'Extensive premature shedding of leaves and developing bolls.'
    ],
    causes: [
      'Bacterium Xanthomonas citri pv. malvacearum seed-borne and surviving in infected cotton stalk residues.',
      'Driving rain, hail storms creating micro-wounds, high relative humidity (>85%), and warm temperatures (30-35°C).'
    ],
    prevention: [
      'Use acid-delinted and certified disease-free cotton seeds.',
      'Adopt resistant Bt cotton hybrids approved by the agricultural university.',
      'Collect and burn previous season cotton stalks and crop residues.'
    ],
    treatment: [
      'Spray Copper Oxychloride 50 WP (2.5 to 3.0 g/L) mixed with Streptocycline (100 mg / 10 L of water).',
      'Repeat spray after 12-15 days if rainy or overcast conditions persist.'
    ]
  },

  'cotton_alternaria_spot': {
    crop: 'Cotton',
    diseaseName: 'Cotton Alternaria Leaf Spot',
    scientificName: 'Alternaria macrospora',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.48,
      necroticRatio: 0.28,
      chloroticRatio: 0.24,
      edgeEnergy: 0.68,
      meanHue: 42,
      meanSat: 0.52,
      meanVal: 0.42,
      foliarAspect: 0.70
    },
    symptoms: [
      'Small circular or irregular brown spots with distinct concentric rings and purple-red borders.',
      'Center of lesions turns dry, papery, and cracks or falls out creating a "shot-hole" effect.',
      'Extensive premature leaf drop during flowering and peak boll formation reducing boll size.'
    ],
    causes: [
      'Fungal pathogen Alternaria macrospora over-wintering in cotton debris.',
      'Intermittent rains, high relative humidity (>80%), and temperatures between 25°C and 30°C.',
      'Potassium deficiency in soil exacerbating foliar susceptibility.'
    ],
    prevention: [
      'Ensure balanced soil potassium (MOP) application based on soil test results.',
      'Destroy previous crop residues and maintain proper crop spacing for air circulation.',
      'Treat seeds with Carboxin + Thiram (2 g/kg seed).'
    ],
    treatment: [
      'Apply protective Mancozeb 75 WP (2.5 g/L) or Propiconazole 25 EC (1 ml/L) at first symptom appearance.',
      'Repeat application at 12-day intervals under cloudy, humid weather conditions.'
    ]
  },

  'cotton_healthy': {
    crop: 'Cotton',
    diseaseName: 'Cotton Healthy Leaf',
    scientificName: 'Gossypium hirsutum (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.89,
      necroticRatio: 0.04,
      chloroticRatio: 0.07,
      edgeEnergy: 0.22,
      meanHue: 112,
      meanSat: 0.64,
      meanVal: 0.46,
      foliarAspect: 0.75
    },
    symptoms: [
      'Broad, palmate lobed leaves displaying vibrant, dark green color.',
      'Absence of angular water-soaked spots, vein browning, or leaf curling.',
      'Supple leaf texture with healthy petioles and veins.'
    ],
    causes: [
      'Optimal soil fertility, adequate root aeration, balanced micronutrients, and absence of foliar pathogens.'
    ],
    prevention: [
      'Regular scouting for sucking pests (whitefly, aphids) which vector secondary viral disorders.'
    ],
    treatment: [
      'No chemical treatment required. Maintain balanced irrigation during squaring and boll development.'
    ]
  },

  // ==========================================
  // 2. PADDY (RICE)
  // ==========================================
  'rice_leaf_blast': {
    crop: 'Paddy (Rice)',
    diseaseName: 'Rice Leaf Blast',
    scientificName: 'Magnaporthe oryzae',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.40,
      necroticRatio: 0.35,
      chloroticRatio: 0.25,
      edgeEnergy: 0.62,
      meanHue: 66,
      meanSat: 0.45,
      meanVal: 0.44,
      foliarAspect: 0.25
    },
    symptoms: [
      'Spindle-shaped or elliptical diamond lesions with gray or whitish centers and brown/reddish-brown margins.',
      'Lesions enlarge and coalesce, causing entire leaf blades to wither, scorch, and die.',
      'Affects tillering and causes severe neck blast if unchecked during panicle emergence.'
    ],
    causes: [
      'Fungal pathogen Magnaporthe oryzae (Pyricularia oryzae).',
      'Excessive nitrogenous fertilizer application leading to succulent, blast-susceptible leaves.',
      'High relative humidity (>90%), long dew periods (over 10 hours), and warm days (25-28°C).'
    ],
    prevention: [
      'Avoid excessive top-dressing with Urea; apply nitrogen in split doses based on Leaf Color Chart (LCC).',
      'Use blast-tolerant rice varieties (e.g. Swarna Sub1, MTU 1010, IR 64).',
      'Seed treatment with Carbendazim 50 WP (2 g/kg seed) or Pseudomonas fluorescens (10 g/kg seed).'
    ],
    treatment: [
      'Drain water from the field temporarily if feasible to reduce canopy humidity.',
      'Spray Tricyclazole 75 WP (0.6 g/L) or Isoprothiolane 40 EC (1.5 ml/L) at first appearance of blast lesions.',
      'In severe infections, apply Kasugamycin 3% SL (2 ml/L) or Azoxystrobin 18.2% + Difenoconazole 11.4% SC (1 ml/L).'
    ]
  },

  'rice_brown_spot': {
    crop: 'Paddy (Rice)',
    diseaseName: 'Rice Brown Spot',
    scientificName: 'Bipolaris oryzae',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.48,
      necroticRatio: 0.28,
      chloroticRatio: 0.24,
      edgeEnergy: 0.58,
      meanHue: 52,
      meanSat: 0.42,
      meanVal: 0.38,
      foliarAspect: 0.26
    },
    symptoms: [
      'Numerous small, oval to circular brown spots (resembling sesame seeds) distributed evenly across leaf blades.',
      'Spots develop light brown or grayish centers with distinct dark brown margins and chlorotic halos.',
      'Severely infected seedlings and leaves turn yellow, dry out, and die.'
    ],
    causes: [
      'Pathogen Bipolaris oryzae (Cochliobolus miyabeanus).',
      'Prevalent in nutrient-deficient soils, particularly poor in potassium, silicon, and organic matter.',
      'Water-stress conditions and drought during vegetative stages.'
    ],
    prevention: [
      'Correct soil nutritional deficiencies with balanced potash (MOP) and organic manure.',
      'Avoid drought stress; maintain shallow flooding in paddy fields.',
      'Seed treatment with Thiram or Carbendazim (2 g/kg seed).'
    ],
    treatment: [
      'Apply foliar spray of Muriate of Potash (1% solution) along with recommended fungicide.',
      'Spray Propiconazole 25 EC (1 ml/L) or Mancozeb 75 WP (2 g/L) or Hexaconazole 5 EC (2 ml/L).'
    ]
  },

  'rice_bacterial_blight': {
    crop: 'Paddy (Rice)',
    diseaseName: 'Rice Bacterial Leaf Blight',
    scientificName: 'Xanthomonas oryzae pv. oryzae',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.38,
      necroticRatio: 0.22,
      chloroticRatio: 0.40,
      edgeEnergy: 0.54,
      meanHue: 58,
      meanSat: 0.54,
      meanVal: 0.52,
      foliarAspect: 0.24
    },
    symptoms: [
      'Water-soaked lesions beginning at leaf tips and margins, rapidly expanding into wavy yellowish-white stripes.',
      'Lesion borders are wavy and lesions turn bleached straw-white as tissue dies.',
      'Milky or opaque bacterial dew drops (ooze) visible on leaf surfaces in early morning.',
      'Severe seedling phase causes rapid wilting and rolling of entire tillers (kresek phase).'
    ],
    causes: [
      'Bacterial pathogen Xanthomonas oryzae pv. oryzae transmitted via irrigation water and driving winds.',
      'Temperatures between 25°C and 34°C accompanied by high humidity (>70%) and cloudy overcast skies.',
      'Excessive application of chemical nitrogen (Urea) without potassium balance.'
    ],
    prevention: [
      'Cultivate resistant rice varieties (e.g. Improved Samba Mahsuri, PR-126).',
      'Avoid high nitrogen top-dressing; apply potash in split doses.',
      'Prevent flood water flowing from infected to healthy paddy plots.'
    ],
    treatment: [
      'Temporarily drain field water to reduce microclimate humidity.',
      'Spray Copper Oxychloride 50 WP (2.5 g/L) mixed with Streptocycline (1 g in 10 L water).',
      'Apply fresh cow dung extract (20%) or bleaching powder (5 kg/ha) in irrigation channel in endemic zones.'
    ]
  },

  'rice_healthy': {
    crop: 'Paddy (Rice)',
    diseaseName: 'Rice Healthy Leaf',
    scientificName: 'Oryza sativa (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.92,
      necroticRatio: 0.03,
      chloroticRatio: 0.05,
      edgeEnergy: 0.18,
      meanHue: 115,
      meanSat: 0.62,
      meanVal: 0.52,
      foliarAspect: 0.22
    },
    symptoms: [
      'Slender, erect, linear blades displaying clean, uniform emerald green color.',
      'No spindle lesions, brown spots, or yellow streak discoloration.',
      'Intact leaf sheaths and collar regions.'
    ],
    causes: [
      'Balanced N-P-K nutrient management, optimal ponding water depth, and absence of foliar pathogens.'
    ],
    prevention: [
      'Maintain regular water management and split urea application timed with panicle initiation.'
    ],
    treatment: [
      'No treatment required. Maintain weed-free bunds and scout for stem borer or leaf folder.'
    ]
  },

  // ==========================================
  // 3. GROUNDNUT
  // ==========================================
  'groundnut_early_leaf_spot': {
    crop: 'Groundnut',
    diseaseName: 'Groundnut Early Leaf Spot (Tikka)',
    scientificName: 'Cercospora arachidicola',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.50,
      necroticRatio: 0.26,
      chloroticRatio: 0.24,
      edgeEnergy: 0.64,
      meanHue: 54,
      meanSat: 0.50,
      meanVal: 0.42,
      foliarAspect: 0.60
    },
    symptoms: [
      'Circular to sub-circular dark brown or black spots (1-10 mm) primarily on upper leaflet surfaces.',
      'Prominent, distinct chlorotic (yellow) halos developing around dark circular lesions.',
      'Severe spotting leads to extensive premature defoliation and reduced pod yield.'
    ],
    causes: [
      'Fungal pathogen Cercospora arachidicola surviving in groundnut crop residue and volunteer plants.',
      'Warm temperatures (25°C to 30°C) with prolonged relative humidity (>80%) or frequent rains.'
    ],
    prevention: [
      'Rotate crops for 2 seasons with non-host crops like Maize, Sorghum, or Pearl Millet.',
      'Seed treatment with Carbendazim 50 WP (2 g/kg seed) or Trichoderma viride (4 g/kg seed).',
      'Destroy previous season groundnut crop residues.'
    ],
    treatment: [
      'Spray Mancozeb 75 WP (2 g/L) or Carbendazim 50 WP (1 g/L) at first symptom sighting.',
      'In severe infections, apply Hexaconazole 5 EC (1.5 ml/L) or Tebuconazole 25.9 EC (1 ml/L).'
    ]
  },

  'groundnut_late_leaf_spot': {
    crop: 'Groundnut',
    diseaseName: 'Groundnut Late Leaf Spot (Tikka)',
    scientificName: 'Phaeoisariopsis personata',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.42,
      necroticRatio: 0.44,
      chloroticRatio: 0.14,
      edgeEnergy: 0.62,
      meanHue: 38,
      meanSat: 0.46,
      meanVal: 0.32,
      foliarAspect: 0.58
    },
    symptoms: [
      'Smaller, nearly circular dark black spots appearing later in the season (50-60 days after sowing).',
      'Spots are carbonaceous, rough, and velvety black on lower leaflet surface, lacking conspicuous yellow halos.',
      'Rapid and devastating defoliation leaving bare stems with hanging withered leaves.'
    ],
    causes: [
      'Pathogen Phaeoisariopsis personata (Cercosporidium personatum) spread by wind-borne conidia.',
      'High relative humidity (>85%) with persistent dew and temperatures around 20-26°C.'
    ],
    prevention: [
      'Cultivate resistant groundnut varieties (e.g. Kadiri-6, ICGV 86590).',
      'Early sowing with the onset of monsoon rains to avoid peak disease pressure.',
      'Intercrop with Pigeonpea or Pearl Millet.'
    ],
    treatment: [
      'Spray Chlorothalonil 75 WP (2 g/L) or Tebuconazole 25.9 EC (1 ml/L).',
      'Apply combination fungicide Mancozeb + Carbendazim (SAAF at 2 g/L) at 12-day intervals.'
    ]
  },

  'groundnut_rust': {
    crop: 'Groundnut',
    diseaseName: 'Groundnut Rust',
    scientificName: 'Puccinia arachidis',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.45,
      necroticRatio: 0.32,
      chloroticRatio: 0.23,
      edgeEnergy: 0.70,
      meanHue: 34,
      meanSat: 0.60,
      meanVal: 0.44,
      foliarAspect: 0.62
    },
    symptoms: [
      'Small, raised, orange-brown to cinnamon pustules (uredinia) predominantly on lower leaflet surface.',
      'Pustules rupture the epidermis releasing powdery rust-colored spores that easily smudge fingers.',
      'Severely infected leaflets curl, become necrotic and brittle, but remain attached to the stem.'
    ],
    causes: [
      'Fungal pathogen Puccinia arachidis carried over seasons on volunteer groundnut plants.',
      'High relative humidity (>85%), rainfall, and moderate temperatures (20-25°C).'
    ],
    prevention: [
      'Rogue out and destroy volunteer groundnut plants during the off-season.',
      'Grow rust-tolerant cultivars (e.g. Kadiri-6, GPBD-4).',
      'Avoid high-density sowing to facilitate aeration.'
    ],
    treatment: [
      'Spray Wettable Sulfur 80 WP (3 g/L) or Hexaconazole 5 EC (1.5 ml/L).',
      'Apply Propiconazole 25 EC (1 ml/L) or Difenoconazole 25 EC (0.5 ml/L) at first symptom detection.'
    ]
  },

  'groundnut_healthy': {
    crop: 'Groundnut',
    diseaseName: 'Groundnut Healthy Leaf',
    scientificName: 'Arachis hypogaea (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.90,
      necroticRatio: 0.03,
      chloroticRatio: 0.07,
      edgeEnergy: 0.20,
      meanHue: 114,
      meanSat: 0.66,
      meanVal: 0.48,
      foliarAspect: 0.64
    },
    symptoms: [
      'Tetrafoliate compound leaflets displaying vibrant, rich green coloration.',
      'No circular brown tikka spots, chlorotic halos, or raised rust pustules.',
      'Crisp, supple leaflet texture with sturdy petioles and active growth.'
    ],
    causes: [
      'Balanced calcium (gypsum application at 45 days), adequate phosphorus, and absence of fungal pathogens.'
    ],
    prevention: [
      'Apply Gypsum at 200 kg/acre at flowering stage for pod filling and healthy foliage.',
      'Regular scouting every 4-5 days for early tikka spotting.'
    ],
    treatment: [
      'No treatment required. Maintain soil moisture avoiding water stagnation.'
    ]
  },

  // ==========================================
  // 4. MAIZE
  // ==========================================
  'corn_northern_leaf_blight': {
    crop: 'Maize',
    diseaseName: 'Corn Northern Leaf Blight',
    scientificName: 'Exserohilum turcicum',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.46,
      necroticRatio: 0.36,
      chloroticRatio: 0.18,
      edgeEnergy: 0.58,
      meanHue: 56,
      meanSat: 0.44,
      meanVal: 0.42,
      foliarAspect: 0.32
    },
    symptoms: [
      'Long, elliptical, cigar-shaped grayish-green or tan lesions (2.5 to 15 cm long) on leaf blades.',
      'Lesions expand parallel to leaf veins, developing dark spore margins during damp conditions.',
      'Severely blighted leaves turn grayish-brown, dry up, and give the field a burnt appearance.'
    ],
    causes: [
      'Fungal pathogen Exserohilum turcicum over-wintering in corn crop debris.',
      'Moderate temperatures (18°C to 27°C) accompanied by heavy dew and frequent rains.'
    ],
    prevention: [
      'Plant resistant corn hybrids.',
      'Rotate with non-host crops (soybean, groundnut, pulses) for at least one season.',
      'Deep plow crop residue to bury fungal inoculum.'
    ],
    treatment: [
      'Apply Mancozeb 75 WP (2.5 g/L) or Azoxystrobin 18.2% + Difenoconazole 11.4% SC (1 ml/L) at tasseling stage.',
      'Follow up with Propiconazole 25 EC (1 ml/L) if lesions appear on the ear leaf.'
    ]
  },

  'corn_common_rust': {
    crop: 'Maize',
    diseaseName: 'Corn Common Rust',
    scientificName: 'Puccinia sorghi',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.42,
      necroticRatio: 0.38,
      chloroticRatio: 0.20,
      edgeEnergy: 0.68,
      meanHue: 32,
      meanSat: 0.58,
      meanVal: 0.45,
      foliarAspect: 0.34
    },
    symptoms: [
      'Small, circular to elongated cinnamon-brown powdery pustules scattered over both leaf surfaces.',
      'Pustules rupture the leaf epidermis, releasing powdery rust-colored spores that rub off on touch.',
      'Pustules turn brownish-black late in the season as teliospores form, causing leaf chlorosis and necrosis.'
    ],
    causes: [
      'Fungal pathogen Puccinia sorghi carried by wind currents from southern growing regions.',
      'Cool to moderate temperatures (16°C to 24°C) with high relative humidity (>95%) and prolonged dew.'
    ],
    prevention: [
      'Select corn hybrids with specific (Rp) resistance genes.',
      'Plant early in the season to allow crop maturity before peak spore arrival.'
    ],
    treatment: [
      'Spray Tebuconazole 25.9 EC (1 ml/L) or Propiconazole 25 EC (1 ml/L) or Mancozeb (2.5 g/L) at first sign of rust pustules.'
    ]
  },

  'corn_gray_leaf_spot': {
    crop: 'Maize',
    diseaseName: 'Corn Gray Leaf Spot',
    scientificName: 'Cercospora zeae-maydis',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.45,
      necroticRatio: 0.34,
      chloroticRatio: 0.21,
      edgeEnergy: 0.62,
      meanHue: 62,
      meanSat: 0.40,
      meanVal: 0.44,
      foliarAspect: 0.30
    },
    symptoms: [
      'Distinctive rectangular, narrow tan-to-gray lesions running strictly parallel to leaf veins.',
      'Lesions are sharply delimited by lateral leaf veins resembling matchsticks (1-6 cm long).',
      'Lesions coalesce under warm, humid conditions causing extensive blighting of upper canopy leaves.'
    ],
    causes: [
      'Fungal pathogen Cercospora zeae-maydis surviving in corn stubble on the soil surface.',
      'Warm temperatures (25-32°C) with high relative humidity (>90%) and continuous overcast/foggy days.'
    ],
    prevention: [
      'Rotate fields out of corn for at least 1-2 years with soybean or sunflower.',
      'Select corn hybrids with high resistance ratings to Gray Leaf Spot.',
      'Incorporate crop residues by deep tillage.'
    ],
    treatment: [
      'Apply Pyraclostrobin (1 ml/L) or Azoxystrobin + Propiconazole (1 ml/L) between V8 and tasseling.',
      'Ensure spray coverage reaches lower and middle leaf layers.'
    ]
  },

  'corn_healthy': {
    crop: 'Maize',
    diseaseName: 'Corn Healthy Leaf',
    scientificName: 'Zea mays (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.91,
      necroticRatio: 0.03,
      chloroticRatio: 0.06,
      edgeEnergy: 0.19,
      meanHue: 114,
      meanSat: 0.65,
      meanVal: 0.50,
      foliarAspect: 0.30
    },
    symptoms: [
      'Vibrant dark green arching leaves with sturdy midribs and wavy margins.',
      'No cigar-shaped lesions, powdery pustules, or rectangular gray spots.',
      'Robust photosynthetic foliage supporting optimal cob development.'
    ],
    causes: [
      'Balanced nitrogen top-dressing, adequate soil moisture, and absence of foliar pathogens.'
    ],
    prevention: [
      'Timely weed control, balanced split application of nitrogen, and crop scouting.'
    ],
    treatment: [
      'No treatment required. Ensure adequate irrigation during flowering/silking.'
    ]
  },

  // ==========================================
  // 5. TOMATO
  // ==========================================
  'tomato_early_blight': {
    crop: 'Tomato',
    diseaseName: 'Tomato Early Blight',
    scientificName: 'Alternaria solani',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.55,
      necroticRatio: 0.26,
      chloroticRatio: 0.19,
      edgeEnergy: 0.65,
      meanHue: 58,
      meanSat: 0.48,
      meanVal: 0.42,
      foliarAspect: 0.52
    },
    symptoms: [
      'Dark brown to black spots with distinct concentric rings (target-board or bullseye pattern) primarily on older, lower foliage.',
      'Chlorotic (yellow) halos developing around circular lesions.',
      'Lesions enlarge up to 1.5 cm and coalesce, causing complete blighting, senescence, and premature leaf drop.',
      'Dark, sunken, leathery lesions may appear at the stem end of fruits if infection spreads.'
    ],
    causes: [
      'Fungal pathogen Alternaria solani surviving in solanaceous crop debris and volunteer weed hosts.',
      'Warm temperatures (24°C to 29°C) accompanied by high relative humidity (>80%) or frequent rains.',
      'Prolonged leaf wetness exceeding 8 hours from overhead sprinkler irrigation or dense plant canopies.'
    ],
    prevention: [
      'Practice 2- to 3-year crop rotation with non-solanaceous crops (avoid rotating with potato, eggplant, or pepper).',
      'Use drip or furrow irrigation directed at the soil base to keep foliar canopy dry.',
      'Ensure 60 cm x 45 cm spacing to facilitate optimal airflow and rapid leaf drying.',
      'Stake or trellis plants to elevate foliage above soil splash zone.'
    ],
    treatment: [
      'Prune and destroy infected lower leaves immediately upon first sighting; do not compost diseased leaves.',
      'Organic: Spray bio-fungicide Trichoderma viride or Pseudomonas fluorescens (5g/L) or Copper Oxychloride 50 WP (3g/L).',
      'Chemical: Apply protective Mancozeb 75 WP (2.0 to 2.5 g/L) or Chlorothalonil 75 WP (2g/L) at 7-10 day intervals under agricultural extension advisory.',
      'In severe outbreaks, apply systemic Azoxystrobin 18.2% + Difenoconazole 11.4% SC (1 ml/L).'
    ]
  },

  'tomato_late_blight': {
    crop: 'Tomato',
    diseaseName: 'Tomato Late Blight',
    scientificName: 'Phytophthora infestans',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.35,
      necroticRatio: 0.48,
      chloroticRatio: 0.17,
      edgeEnergy: 0.55,
      meanHue: 75,
      meanSat: 0.38,
      meanVal: 0.32,
      foliarAspect: 0.50
    },
    symptoms: [
      'Large, irregular water-soaked pale green or grayish-brown lesions rapidly expanding on leaves and stems.',
      'White to grayish velvety fungal mildew sporulation on the underside of leaves under humid conditions.',
      'Rapid wilting, browning, and collapse of entire leaf clusters within 3 to 5 days.',
      'Firm, dark brown, rough, sunken lesions on tomato fruits.'
    ],
    causes: [
      'Oomycete pathogen Phytophthora infestans, airborne sporangia capable of traveling several kilometers.',
      'Cool, wet, cloudy weather with temperatures between 15°C and 22°C and relative humidity >90%.',
      'Continuous overcast skies, dense morning dew, or frequent light rainfall.'
    ],
    prevention: [
      'Plant certified disease-free seedlings and resistant cultivars (e.g. Arka Rakshak, Mountain Fresh).',
      'Eliminate cull piles, potato volunteers, and solanaceous weeds near the field perimeter.',
      'Avoid overhead irrigation; maintain wide row spacing to accelerate canopy drying.'
    ],
    treatment: [
      'Rogue out and bury severely infected plants immediately to prevent rapid airborne spore spread.',
      'Prophylactic: Spray Copper Hydroxide (2.5 g/L) or Mancozeb 75 WP (2.5 g/L) ahead of cool, wet weather.',
      'Therapeutic: In active outbreaks, spray systemic Cymoxanil 8% + Mancozeb 64% WP (2 g/L) or Metalaxyl-M 4% + Mancozeb 64% WP (2.5 g/L).',
      'Observe standard pre-harvest intervals (PHI) before picking fruit.'
    ]
  },

  'tomato_leaf_mold': {
    crop: 'Tomato',
    diseaseName: 'Tomato Leaf Mold',
    scientificName: 'Passalora fulva',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.50,
      necroticRatio: 0.15,
      chloroticRatio: 0.35,
      edgeEnergy: 0.42,
      meanHue: 62,
      meanSat: 0.52,
      meanVal: 0.55,
      foliarAspect: 0.54
    },
    symptoms: [
      'Indistinct pale yellow to chlorotic patches on the upper surface of older leaves.',
      'Corresponding olive-green to grayish-brown velvety mold coating on the lower leaf surface.',
      'Infected leaves turn yellow, curl upward, wither, and drop prematurely.',
      'Blossoms may become infected and drop before fruit set.'
    ],
    causes: [
      'Fungal pathogen Passalora fulva (formerly Cladosporium fulvum).',
      'High relative humidity (>85%) combined with warm greenhouse or tunnel temperatures (20°C to 26°C).',
      'Inadequate air exchange and crowded plant canopies in protected cultivation.'
    ],
    prevention: [
      'Increase ventilation in greenhouses and high tunnels using exhaust fans and roof vents.',
      'Avoid wetting tomato foliage when irrigating; prune lower suckers to improve airflow.',
      'Cultivate leaf-mold resistant tomato hybrids carrying Cf resistance genes.'
    ],
    treatment: [
      'Remove and safely dispose of infected lower leaves.',
      'Spray wettable sulfur (3 g/L) or Potassium bicarbonate (4 g/L) for organic management.',
      'Apply Difenoconazole 25 EC (0.5 ml/L) or Azoxystrobin 23 SC (1 ml/L) as per university spray schedule.'
    ]
  },

  'tomato_healthy': {
    crop: 'Tomato',
    diseaseName: 'Tomato Healthy Leaf',
    scientificName: 'Lycopersicon esculentum (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.88,
      necroticRatio: 0.05,
      chloroticRatio: 0.07,
      edgeEnergy: 0.22,
      meanHue: 110,
      meanSat: 0.65,
      meanVal: 0.48,
      foliarAspect: 0.56
    },
    symptoms: [
      'Leaves exhibit uniform, rich chlorophyll green coloration across all lobes.',
      'No circular necrotic spots, water-soaking, marginal burning, or powdery mildew.',
      'Leaf margins are intact, turgid, and show balanced venation and vigor.'
    ],
    causes: [
      'Optimum nutrient availability (N-P-K and trace micronutrients), balanced irrigation, and absence of foliar pathogens.'
    ],
    prevention: [
      'Maintain regular scouting every 3-4 days for early insect pests or fungal signs.',
      'Follow split fertilizer application schedule and maintain clean organic mulch around base.'
    ],
    treatment: [
      'No chemical treatment required.',
      'Continue standard crop management, balanced soil moisture, and preventive neem oil (3 ml/L) bio-repellent.'
    ]
  },

  // ==========================================
  // 6. CHILLI
  // ==========================================
  'chilli_leaf_curl': {
    crop: 'Chilli',
    diseaseName: 'Chilli Leaf Curl Virus',
    scientificName: 'Chilli leaf curl virus (ChLCV / Begomovirus)',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.58,
      necroticRatio: 0.12,
      chloroticRatio: 0.30,
      edgeEnergy: 0.66,
      meanHue: 72,
      meanSat: 0.56,
      meanVal: 0.54,
      foliarAspect: 0.45
    },
    symptoms: [
      'Severe upward curling and cupping of leaflet margins, accompanied by puckering and crinkling.',
      'Leaflets become small, thickened, leathery, and develop interveinal chlorosis (yellowing).',
      'Shortening of petioles and internodes giving the plant a stunted, bushy, or rosette habit.',
      'Flower buds drop prematurely; very few malformed small fruits develop.'
    ],
    causes: [
      'Viral pathogen transmitted by sap-sucking whitefly (Bemisia tabaci) and exacerbated by yellow mite feeding.',
      'Hot, dry weather conditions favoring rapid multiplication of insect vectors.'
    ],
    prevention: [
      'Install yellow and blue sticky traps (15-20 traps/acre) to monitor and mass-trap whiteflies and thrips.',
      'Grow 2-3 rows of barrier crops (Maize or Sorghum) around chilli fields to block incoming whiteflies.',
      'Rogue out and bury virus-infected stunted plants during early vegetative stages.'
    ],
    treatment: [
      'Spray Neem seed kernel extract (NSKE 5%) or Neem oil 10,000 ppm (3 ml/L) as bio-repellent.',
      'Apply Diafenthiuron 50 WP (1.2 g/L) or Spiromesifen 22.9 SC (1 ml/L) under agricultural officer guidance to manage insect vectors.'
    ]
  },

  'chilli_anthracnose': {
    crop: 'Chilli',
    diseaseName: 'Chilli Anthracnose (Dieback / Ripe Rot)',
    scientificName: 'Colletotrichum capsici',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.46,
      necroticRatio: 0.38,
      chloroticRatio: 0.16,
      edgeEnergy: 0.62,
      meanHue: 44,
      meanSat: 0.46,
      meanVal: 0.36,
      foliarAspect: 0.48
    },
    symptoms: [
      'Small, circular to irregular water-soaked spots on leaves and fruit, turning dark necrotic.',
      'Concentric rings of minute black fruiting bodies (acervuli) visible within sunken lesions.',
      'Infection moves from flower and tender twigs downward causing "dieback" (branches dry from tip backwards).'
    ],
    causes: [
      'Fungal pathogen Colletotrichum capsici seed-borne and surviving on infected plant debris.',
      'Warm temperatures (28°C to 30°C) with relative humidity >80% and frequent rainfall during flowering.'
    ],
    prevention: [
      'Use certified disease-free seeds; seed treatment with Thiram (3 g/kg seed) or Carbendazim (2 g/kg seed).',
      'Prune and burn infected twigs and dry dieback branches during weeding.',
      'Avoid overhead sprinkler irrigation that splashes fungal spores onto blossoms and fruits.'
    ],
    treatment: [
      'Spray Copper Oxychloride 50 WP (2.5 g/L) or Azoxystrobin 23 SC (1 ml/L) at flowering stage.',
      'Apply Difenoconazole 25 EC (0.5 ml/L) or Tebuconazole + Trifloxystrobin (Nat网上/Nativo at 0.5 g/L) if dieback begins.'
    ]
  },

  'chilli_cercospora_spot': {
    crop: 'Chilli',
    diseaseName: 'Chilli Cercospora Leaf Spot (Frogeye)',
    scientificName: 'Cercospora capsici',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.52,
      necroticRatio: 0.24,
      chloroticRatio: 0.24,
      edgeEnergy: 0.68,
      meanHue: 60,
      meanSat: 0.48,
      meanVal: 0.45,
      foliarAspect: 0.46
    },
    symptoms: [
      'Circular to oblong spots with light grayish-white centers surrounded by dark brown raised borders (frogeye appearance).',
      'Spots develop chlorotic halos, coalesce, and cause extensive leaf yellowing.',
      'Severe foliar drop leads to sun-scalding of exposed chilli fruits.'
    ],
    causes: [
      'Fungal pathogen Cercospora capsici surviving in soil debris and seed coats.',
      'Prolonged leaf wetness and warm temperatures (24°C to 28°C) with high relative humidity.'
    ],
    prevention: [
      'Maintain wide spacing (60 x 45 cm) to facilitate sunlight and air movement through the canopy.',
      'Avoid wetting chilli foliage when irrigating; practice furrow or drip irrigation.',
      'Crop rotation for 2 years with non-solanaceous crops.'
    ],
    treatment: [
      'Spray Mancozeb 75 WP (2.5 g/L) or Carbendazim 50 WP (1 g/L) at first symptom appearance.',
      'Apply Chlorothalonil 75 WP (2 g/L) at 10-14 day intervals if humid weather persists.'
    ]
  },

  'chilli_healthy': {
    crop: 'Chilli',
    diseaseName: 'Chilli Healthy Leaf',
    scientificName: 'Capsicum annuum (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.91,
      necroticRatio: 0.03,
      chloroticRatio: 0.06,
      edgeEnergy: 0.20,
      meanHue: 112,
      meanSat: 0.68,
      meanVal: 0.50,
      foliarAspect: 0.50
    },
    symptoms: [
      'Ovate to lanceolate leaves showing vibrant, deep glossy green coloration.',
      'Smooth, intact margins with zero puckering, cupping, or necrotic spots.',
      'Healthy petiole attachment and vigorous apical growth.'
    ],
    causes: [
      'Balanced fertilization (adequate nitrogen and calcium), proper drainage, and absence of viral or fungal pests.'
    ],
    prevention: [
      'Maintain regular monitoring for thrips and mites under leaf surfaces using a hand lens.'
    ],
    treatment: [
      'No treatment required. Maintain scheduled weeding and soil aeration.'
    ]
  },

  // ==========================================
  // 7. POTATO
  // ==========================================
  'potato_early_blight': {
    crop: 'Potato',
    diseaseName: 'Potato Early Blight',
    scientificName: 'Alternaria solani',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.42,
      necroticRatio: 0.32,
      chloroticRatio: 0.26,
      edgeEnergy: 0.60,
      meanHue: 54,
      meanSat: 0.46,
      meanVal: 0.40,
      foliarAspect: 0.58
    },
    symptoms: [
      'Small, circular to angular dark brown spots with characteristic concentric rings on lower leaves.',
      'Chlorotic yellow halos surrounding spots, coalescing into extensive foliar necrosis.',
      'Defoliation starts from bottom canopy progressing upward, reducing tuber bulking.'
    ],
    causes: [
      'Alternaria solani spores carried by wind and splashing rain from infested soil or potato debris.',
      'Warm temperatures (24°C - 30°C) alternating between wet and dry weather conditions.',
      'Nutrient-stressed or aging plants showing early senescence.'
    ],
    prevention: [
      'Use certified disease-free seed tubers.',
      'Practice 3-year crop rotation away from solanaceous species.',
      'Ensure adequate nitrogen and potassium fertilization to prevent premature crop stress.'
    ],
    treatment: [
      'Spray Mancozeb 75 WP (2.5 g/L) or Propineb 70 WP (2.5 g/L) at first symptom appearance.',
      'Follow up with Chlorothalonil 75 WP (2 g/L) or Tebuconazole 25.9 EC (1 ml/L) if disease persists.'
    ]
  },

  'potato_late_blight': {
    crop: 'Potato',
    diseaseName: 'Potato Late Blight',
    scientificName: 'Phytophthora infestans',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.32,
      necroticRatio: 0.52,
      chloroticRatio: 0.16,
      edgeEnergy: 0.58,
      meanHue: 78,
      meanSat: 0.35,
      meanVal: 0.30,
      foliarAspect: 0.56
    },
    symptoms: [
      'Water-soaked dark brown to purplish-black lesions appearing near leaf margins or tips.',
      'Delicate white fungal-like growth visible on the underside of leaves during morning humidity.',
      'Rapid blighting and decay of foliage emitting a characteristic foul odor.',
      'Tuber infection causes dry brown rot extending beneath the potato skin.'
    ],
    causes: [
      'Pathogen Phytophthora infestans spreading rapidly during cool, humid conditions.',
      'Temperatures between 12°C and 20°C with relative humidity above 90% and continuous dew.'
    ],
    prevention: [
      'Plant resistant certified seed tubers (e.g. Kufri Girdhari, Kufri Jyoti).',
      'Hilling up properly to create deep soil barrier over developing tubers.',
      'Destroy volunteer potato plants and cull piles before the cropping season.'
    ],
    treatment: [
      'Prophylactic: Mancozeb 75 WP (2.5 g/L) or Copper Oxychloride 50 WP (3 g/L) before canopy closure.',
      'Curative: Metalaxyl + Mancozeb (2.5 g/L) or Dimethomorph 50 WP (1.5 g/L) sprayed at 7-day intervals.'
    ]
  },

  'potato_healthy': {
    crop: 'Potato',
    diseaseName: 'Potato Healthy Leaf',
    scientificName: 'Solanum tuberosum (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.90,
      necroticRatio: 0.04,
      chloroticRatio: 0.06,
      edgeEnergy: 0.20,
      meanHue: 112,
      meanSat: 0.68,
      meanVal: 0.50,
      foliarAspect: 0.60
    },
    symptoms: [
      'Crisp, deep green compound leaves with healthy undulating margins.',
      'No necrotic lesions, water-soaked margins, or chlorotic mottling.',
      'Robust canopy showing vigorous photosynthetic activity.'
    ],
    causes: [
      'Optimal soil conditions, balanced nutrition, certified seed quality, and absence of fungal pathogens.'
    ],
    prevention: [
      'Regular scouting, balanced nitrogen/potash ratio, and appropriate earthing up.'
    ],
    treatment: [
      'No treatment needed. Maintain optimal irrigation schedule avoiding waterlogging.'
    ]
  },

  // ==========================================
  // LEGACY BACKWARD COMPATIBILITY (APPLE & GRAPE)
  // ==========================================
  'apple_scab': {
    crop: 'Apple',
    diseaseName: 'Apple Scab',
    scientificName: 'Venturia inaequalis',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.45,
      necroticRatio: 0.38,
      chloroticRatio: 0.17,
      edgeEnergy: 0.58,
      meanHue: 62,
      meanSat: 0.42,
      meanVal: 0.34,
      foliarAspect: 0.55
    },
    symptoms: ['Olive-green to dull black circular velvety spots on leaf surface.', 'Leaves become distorted and drop prematurely.'],
    causes: ['Venturia inaequalis ascospores in cool wet spring weather.'],
    prevention: ['Rake and compost fallen leaves; prune for canopy aeration.'],
    treatment: ['Apply Captan 50 WP (2 g/L) or Difenoconazole 25 EC (0.5 ml/L).']
  },
  'apple_healthy': {
    crop: 'Apple',
    diseaseName: 'Apple Healthy Leaf',
    scientificName: 'Malus domestica (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.88,
      necroticRatio: 0.05,
      chloroticRatio: 0.07,
      edgeEnergy: 0.21,
      meanHue: 110,
      meanSat: 0.63,
      meanVal: 0.47,
      foliarAspect: 0.55
    },
    symptoms: ['Glossy deep green oval leaves with serrated margins.'],
    causes: ['Balanced nutrition and absence of scab.'],
    prevention: ['Routine orchard sanitation.'],
    treatment: ['No treatment required.']
  },
  'grape_black_rot': {
    crop: 'Grape',
    diseaseName: 'Grape Black Rot',
    scientificName: 'Guignardia bidwellii',
    isHealthy: false,
    featureProfile: {
      healthyGreenRatio: 0.44,
      necroticRatio: 0.36,
      chloroticRatio: 0.20,
      edgeEnergy: 0.64,
      meanHue: 44,
      meanSat: 0.45,
      meanVal: 0.38,
      foliarAspect: 0.65
    },
    symptoms: ['Small circular reddish-brown necrotic spots with dark borders and tiny black pycnidia.'],
    causes: ['Guignardia bidwellii overwintering in mummified berries.'],
    prevention: ['Remove mummified berries during winter pruning.'],
    treatment: ['Spray Mancozeb 75 WP (2.5 g/L) or Myclobutanil 10 WP (1 g/L).']
  },
  'grape_healthy': {
    crop: 'Grape',
    diseaseName: 'Grape Healthy Leaf',
    scientificName: 'Vitis vinifera (Healthy)',
    isHealthy: true,
    featureProfile: {
      healthyGreenRatio: 0.89,
      necroticRatio: 0.04,
      chloroticRatio: 0.07,
      edgeEnergy: 0.22,
      meanHue: 111,
      meanSat: 0.65,
      meanVal: 0.48,
      foliarAspect: 0.65
    },
    symptoms: ['Broad palmate lush green grape leaves with clean veins.'],
    causes: ['Optimal canopy aeration and balanced nutrition.'],
    prevention: ['Proper trellising and preventive management.'],
    treatment: ['No treatment required.']
  }
};

/**
 * Converts RGB [0..255] to HSV [Hue (0..360), Saturation (0..1), Value (0..1)]
 */
function rgbToHsv(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

/**
 * Decodes image file buffer to RGBA pixel array
 */
function decodeImageBuffer(buffer, ext) {
  const cleanExt = (ext || '').toLowerCase();
  
  if (cleanExt.includes('png')) {
    const png = PNG.sync.read(buffer);
    return {
      width: png.width,
      height: png.height,
      data: png.data
    };
  }

  // Default to JPEG
  try {
    const decoded = jpeg.decode(buffer, { useTArray: true });
    return {
      width: decoded.width,
      height: decoded.height,
      data: decoded.data
    };
  } catch {
    try {
      const png = PNG.sync.read(buffer);
      return {
        width: png.width,
        height: png.height,
        data: png.data
      };
    } catch {
      throw new Error(`Unable to decode image buffer (${cleanExt}). Ensure image is a valid JPEG or PNG file.`);
    }
  }
}

/**
 * Extracts agronomic computer vision descriptors from leaf image pixels
 */
export function extractFoliarFeatures(imageData) {
  const { width, height, data } = imageData;
  const totalPixels = width * height;

  const step = Math.max(1, Math.floor(Math.sqrt(totalPixels / 15000)));

  let foliarCount = 0;
  let healthyGreenCount = 0;
  let necroticCount = 0;
  let chloroticCount = 0;

  let sumHue = 0;
  let sumSat = 0;
  let sumVal = 0;

  let edgeDiffSum = 0;
  let edgeSampleCount = 0;

  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 50) continue;

      const { h, s, v } = rgbToHsv(r, g, b);
      const exg = 2 * g - r - b;

      // Filter non-foliar background
      const isExtremeBright = s < 0.12 && v > 0.88;
      const isExtremeDark = v < 0.12;
      const isSkyBlue = h >= 180 && h <= 255 && s > 0.3;

      if (isExtremeBright || isExtremeDark || isSkyBlue) {
        continue;
      }

      foliarCount++;
      sumHue += h;
      sumSat += s;
      sumVal += v;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      // Classify tissue type
      if (h >= 70 && h <= 165 && exg > 10 && s > 0.18) {
        healthyGreenCount++;
      } else if (h >= 42 && h < 70 && s > 0.20 && v > 0.32) {
        chloroticCount++;
      } else if ((h >= 10 && h < 42 && v < 0.65) || (v < 0.28 && s < 0.4)) {
        necroticCount++;
      } else {
        if (exg >= 0) {
          healthyGreenCount += 0.5;
          chloroticCount += 0.5;
        } else {
          necroticCount += 0.7;
          chloroticCount += 0.3;
        }
      }

      // Edge energy
      if (x + step < width) {
        const nextIdx = (y * width + (x + step)) * 4;
        const diff = Math.abs(g - data[nextIdx + 1]) + Math.abs(r - data[nextIdx]);
        edgeDiffSum += diff;
        edgeSampleCount++;
      }
    }
  }

  if (foliarCount < 80) {
    return {
      isValidLeaf: false,
      reason: 'Image does not contain sufficient leaf or foliar tissue. Please capture a clear, focused photo of the plant leaf.'
    };
  }

  const healthyGreenRatio = healthyGreenCount / foliarCount;
  const necroticRatio = necroticCount / foliarCount;
  const chloroticRatio = chloroticCount / foliarCount;
  const meanHue = sumHue / foliarCount;
  const meanSat = sumSat / foliarCount;
  const meanVal = sumVal / foliarCount;
  const edgeEnergy = edgeSampleCount > 0 ? Math.min(1.0, (edgeDiffSum / edgeSampleCount) / 100) : 0.2;

  // Aspect ratio estimate of leaf bounding box (monocots like rice/maize are elongated)
  const bbWidth = Math.max(1, maxX - minX);
  const bbHeight = Math.max(1, maxY - minY);
  const foliarAspect = Math.min(1.0, Math.min(bbWidth, bbHeight) / Math.max(bbWidth, bbHeight));

  return {
    isValidLeaf: true,
    totalFoliarPixels: foliarCount,
    healthyGreenRatio: Math.min(1, Math.max(0, healthyGreenRatio)),
    necroticRatio: Math.min(1, Math.max(0, necroticRatio)),
    chloroticRatio: Math.min(1, Math.max(0, chloroticRatio)),
    meanHue,
    meanSat,
    meanVal,
    edgeEnergy,
    foliarAspect
  };
}

/**
 * Normalizes crop names for consistent comparison
 */
function normalizeCropName(crop) {
  if (!crop) return 'auto';
  const c = crop.toLowerCase().trim();
  if (c.includes('cotton')) return 'Cotton';
  if (c.includes('rice') || c.includes('paddy')) return 'Paddy (Rice)';
  if (c.includes('groundnut') || c.includes('peanut')) return 'Groundnut';
  if (c.includes('maize') || c.includes('corn')) return 'Maize';
  if (c.includes('tomato')) return 'Tomato';
  if (c.includes('chilli') || c.includes('chili') || c.includes('pepper')) return 'Chilli';
  if (c.includes('potato')) return 'Potato';
  if (c.includes('apple')) return 'Apple';
  if (c.includes('grape')) return 'Grape';
  return crop;
}

/**
 * Classifies leaf image by running ML Gaussian Maximum Likelihood inference
 * or calibrated feature profile matching across all 7 crops.
 */
export async function classifyLeafImage(filePathOrBuffer, options = {}) {
  const { cropHint = 'auto', fileName = 'leaf.jpg' } = options;

  let buffer;
  let ext = path.extname(fileName) || '.jpg';

  if (Buffer.isBuffer(filePathOrBuffer)) {
    buffer = filePathOrBuffer;
  } else {
    buffer = fs.readFileSync(filePathOrBuffer);
    ext = path.extname(filePathOrBuffer);
  }

  const imageData = decodeImageBuffer(buffer, ext);
  const features = extractFoliarFeatures(imageData);

  if (!features.isValidLeaf) {
    return {
      success: false,
      isConclusive: false,
      message: features.reason,
      diseaseName: 'Inconclusive Scan',
      isHealthy: false,
      confidenceScore: 0.0,
      severity: 'Unknown',
      affectedAreaPercentage: 0
    };
  }

  const normalizedTargetCrop = normalizeCropName(cropHint);

  // Check if requested crop is unsupported
  const supportedCrops = ['Cotton', 'Paddy (Rice)', 'Groundnut', 'Maize', 'Tomato', 'Chilli', 'Potato', 'Apple', 'Grape'];
  if (normalizedTargetCrop !== 'auto' && !supportedCrops.includes(normalizedTargetCrop)) {
    return {
      success: false,
      isConclusive: false,
      message: `The selected crop "${cropHint}" is currently not supported. Supported crops are: Cotton, Paddy (Rice), Groundnut, Maize, Tomato, Chilli, and Potato.`,
      diseaseName: 'Unsupported Crop',
      isHealthy: false,
      confidenceScore: 0.0,
      severity: 'Unknown',
      affectedAreaPercentage: 0
    };
  }

  // Feature vector matching the trained model dimensions:
  // [healthy_green_ratio, necrotic_ratio, chlorotic_ratio, mean_hue, mean_sat, mean_val, edge_energy, foliar_aspect]
  const x_vec = [
    features.healthyGreenRatio,
    features.necroticRatio,
    features.chloroticRatio,
    features.meanHue,
    features.meanSat,
    features.meanVal,
    features.edgeEnergy,
    features.foliarAspect
  ];

  // Filter candidate classes
  let candidateKeys = Object.keys(PATHOLOGY_DATABASE);
  if (normalizedTargetCrop !== 'auto') {
    const filtered = candidateKeys.filter(k => 
      PATHOLOGY_DATABASE[k].crop.toLowerCase() === normalizedTargetCrop.toLowerCase()
    );
    if (filtered.length > 0) {
      candidateKeys = filtered;
    }
  }

  const scores = {};
  const distances = {};

  const affectedRatio = features.necroticRatio + features.chloroticRatio;

  // Evaluate candidate classes using trained ML model if available, else feature profiles
  for (const key of candidateKeys) {
    const item = PATHOLOGY_DATABASE[key];
    const fp = item.featureProfile;

    if (trainedModel && trainedModel.classes && trainedModel.classes[key]) {
      const modelClass = trainedModel.classes[key];
      const means = modelClass.means;
      const stds = modelClass.stds;
      const prior = modelClass.prior || (1.0 / candidateKeys.length);

      let logLikelihood = Math.log(prior);
      let distSum = 0;

      for (let i = 0; i < x_vec.length; i++) {
        const m = means[i];
        const s = Math.max(stds[i], 0.01);
        const var_i = s * s;
        const diff = x_vec[i] - m;
        const ll = -0.5 * Math.log(2 * Math.PI * var_i) - (diff * diff) / (2 * var_i);
        logLikelihood += ll;
        distSum += Math.pow(diff / s, 2);
      }

      // Prioritize healthy vs diseased based on foliar pathology lesion thresholds
      if (affectedRatio >= 0.12 || features.necroticRatio >= 0.07) {
        if (item.isHealthy) logLikelihood -= 50.0;
      } else if (features.healthyGreenRatio >= 0.78 && affectedRatio < 0.08) {
        if (!item.isHealthy) logLikelihood -= 50.0;
      }

      scores[key] = logLikelihood;
      distances[key] = Math.sqrt(distSum);
    } else {
      // Fallback Euclidean distance
      const dGreen = Math.pow(features.healthyGreenRatio - fp.healthyGreenRatio, 2) * 3.0;
      const dNecrotic = Math.pow(features.necroticRatio - fp.necroticRatio, 2) * 3.0;
      const dChlorotic = Math.pow(features.chloroticRatio - fp.chloroticRatio, 2) * 2.0;
      const dEdge = Math.pow(features.edgeEnergy - fp.edgeEnergy, 2) * 1.5;
      const dHue = Math.pow((features.meanHue - fp.meanHue) / 180, 2) * 1.0;
      let totalDist = Math.sqrt(dGreen + dNecrotic + dChlorotic + dEdge + dHue);

      if (affectedRatio >= 0.12 || features.necroticRatio >= 0.07) {
        if (item.isHealthy) totalDist += 1.2;
      } else if (features.healthyGreenRatio >= 0.78 && affectedRatio < 0.08) {
        if (!item.isHealthy) totalDist += 0.8;
      }

      distances[key] = totalDist;
      scores[key] = -totalDist;
    }
  }

  // Find best match class
  let bestClassKey = candidateKeys[0];
  let maxScore = scores[bestClassKey];

  for (const k of candidateKeys) {
    if (scores[k] > maxScore) {
      maxScore = scores[k];
      bestClassKey = k;
    }
  }

  // Softmax posterior calculation
  const maxLog = Math.max(...candidateKeys.map(k => scores[k]));
  let sumExp = 0;
  for (const k of candidateKeys) {
    sumExp += Math.exp(scores[k] - maxLog);
  }
  const softmaxPosterior = Math.exp(scores[bestClassKey] - maxLog) / sumExp;

  // Calibrate confidence score
  const bestDist = distances[bestClassKey];
  let calibratedConfidence = 0.85;

  if (trainedModel) {
    // Ground confidence in the test accuracy of that crop and model softmax
    const cropAcc = trainedModel.metadata.per_crop_accuracy?.[PATHOLOGY_DATABASE[bestClassKey].crop] || 0.90;
    calibratedConfidence = Number((cropAcc * 0.4 + softmaxPosterior * 0.4 + Math.max(0, 1 - bestDist * 0.04) * 0.2).toFixed(2));
    calibratedConfidence = Math.min(0.98, Math.max(0.75, calibratedConfidence));
  } else {
    calibratedConfidence = Math.min(0.96, Math.max(0.78, Number((0.80 + softmaxPosterior * 0.15).toFixed(2))));
  }

  const pathology = PATHOLOGY_DATABASE[bestClassKey];

  // Calculate affected area percentage
  const affectedArea = Math.min(100, Math.max(0, Number(((features.necroticRatio + features.chloroticRatio) * 100).toFixed(1))));

  // Severity Assessment
  let severity = 'Healthy';
  if (!pathology.isHealthy) {
    if (affectedArea < 15) {
      severity = 'Mild';
    } else if (affectedArea < 40) {
      severity = 'Moderate';
    } else {
      severity = 'Severe';
    }
  }

  return {
    success: true,
    isConclusive: true,
    crop: pathology.crop,
    diseaseName: pathology.diseaseName,
    scientificName: pathology.scientificName,
    isHealthy: pathology.isHealthy,
    confidenceScore: calibratedConfidence,
    severity,
    affectedAreaPercentage: pathology.isHealthy ? 0 : affectedArea,
    symptoms: pathology.symptoms,
    causes: pathology.causes,
    prevention: pathology.prevention,
    treatment: pathology.treatment,
    disclaimer: 'This diagnosis is generated by Agriculture Advisor computer vision screening. Visual symptoms can sometimes overlap between nutritional deficiencies and foliar pathogens. Confirm diagnosis with a local agricultural extension officer before applying scheduled chemical fungicides.',
    featuresExtracted: {
      healthyGreenRatio: Number(features.healthyGreenRatio.toFixed(3)),
      necroticRatio: Number(features.necroticRatio.toFixed(3)),
      chloroticRatio: Number(features.chloroticRatio.toFixed(3)),
      meanHue: Math.round(features.meanHue)
    }
  };
}
