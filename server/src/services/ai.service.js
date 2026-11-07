/**
 * Multilingual AI Agricultural Assistant Service
 * Provides intelligent, scientifically validated farming recommendations,
 * disease management, fertilizer timing, and seasonal crop advice.
 * Supports English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, and Bengali.
 */

// Category classifications
export const QUERY_CATEGORIES = {
  CROP: 'crop',
  FERTILIZER: 'fertilizer',
  DISEASE: 'disease',
  WEATHER: 'weather',
  PEST_CONTROL: 'pest_control',
  SCHEMES: 'schemes',
  GENERAL: 'general'
};

// Non-agricultural keywords for safety guardrails
const NON_AGRI_PATTERNS = [
  /\b(crypto|bitcoin|ethereum|stock market|forex|day trading)\b/i,
  /\b(movie|cinema|actor|actress|hollywood|bollywood|song|lyrics)\b/i,
  /\b(cricket match|football score|world cup|ipl|fifa)\b/i,
  /\b(programming|javascript|python code|react component|html|css|bug in code)\b/i,
  /\b(politics|election candidate|vote for|political party|prime minister)\b/i,
  /\b(recipe for cake|pizza|dating|romance|horoscope|astrology)\b/i
];

// Curated Agricultural Knowledge Base
const AGRONOMIC_KNOWLEDGE_BASE = [
  {
    category: QUERY_CATEGORIES.CROP,
    keywords: ['black soil', 'regur', 'cotton soil', 'clay soil', 'నల్ల రేగడి', 'काली मिट्टी'],
    responses: {
      en: 'Black soils (Regur) are highly fertile, moisture-retentive, and rich in calcium carbonate, magnesium, and potash. They are ideal for Cotton, Soybean, Pigeon pea (Tur/Arhar), Sorghum (Jowar), Sunflower, and Wheat under irrigation. Ensure good field surface drainage during peak monsoon to prevent root waterlogging.',
      hi: 'काली मिट्टी (रेगुर) अत्यधिक उपजाऊ और नमी धारण करने वाली होती है। यह कपास, सोयाबीन, अरहर (तुअर), ज्वार, सूरजमुखी और गेहूं की खेती के लिए सबसे उपयुक्त है। भारी बारिश के दौरान जलभराव रोकने के लिए जल निकासी की उचित व्यवस्था करें।',
      te: 'నల్ల రేగడి నేలలు అధిక సారం మరియు తేమను నిలుపుకునే గుణం కలవి. ఇవి పత్తి, సోయాబీన్, కంది, జొన్న, పొద్దుతిరుగుడు మరియు గోధుమ పంటలకు అత్యంత అనుకూలమైనవి. అధిక వర్షాల సమయంలో వేరుకుళ్ళు రాకుండా మురుగునీటి పారుదల కాలువలు ఏర్పాటు చేసుకోవాలి.',
      ta: 'கரிசல் மண் அதிக ஈரப்பதத்தைத் தக்கவைத்துக்கொள்ளும் வளமான மண். இது பருத்தி, சோயாபீன்ஸ், துவரை, சோளம் மற்றும் சூரியகாந்தி சாகுபடிக்கு மிகச் சிறந்தது. மழைக்காலத்தில் வேர் அழுகலைத் தடுக்க வடிகால் வசதி செய்யுங்கள்.',
      kn: 'ಕಪ್ಪು ಮಣ್ಣು (ರೆಗುರ್) ತೇವಾಂಶವನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಫಲವತ್ತಾದ ಮಣ್ಣು. ಇದು ಹತ್ತಿ, ಸೋಯಾಬೀನ್, ತೊಗರಿ, ಜೋಳ ಮತ್ತು ಸೂರ್ಯಕಾಂತಿ ಬೆಳೆಗಳಿಗೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ಮಳೆಗಾಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆ ನಿರ್ಮಿಸಿ.',
      ml: 'കറുത്ത മണ്ണ് ഈർപ്പം നിലനിർത്താൻ ശേഷിയുള്ളതാണ്. പരുത്തി, സോയാബീൻ, തുവര, ചോളം എന്നിവയുടെ കൃഷിക്ക് ഇത് ഏറ്റവും അനുയോജ്യമാണ്. വേരുചീയൽ തടയാൻ മികച്ച നീർവാർച്ച ഉറപ്പാക്കുക.',
      mr: 'काळी माती (रेगूर) ओलावा टिकवून ठेवणारी अत्यंत सुपीक जमीन आहे. ही कापूस, सोयाबीन, तूर, ज्वारी आणि सूर्यफूल पिकांसाठी उत्तम आहे. मुळांमध्ये पाणी साचू नये म्हणून पावसाळ्यात पाण्याचा निचरा व्यवस्थित ठेवा.',
      bn: 'কালো মাটি আর্দ্রতা ধরে রাখতে সক্ষম এবং অত্যন্ত উর্বর। এটি তুলা, সয়াবিন, অড়হর, জোয়ার এবং সূর্যমুখী চাষের জন্য আদর্শ। বর্ষাকালে জল নিষ্কাশনের উপযুক্ত ব্যবস্থা রাখুন।'
    }
  },
  {
    category: QUERY_CATEGORIES.CROP,
    keywords: ['red soil', 'laterite', 'sandy loam', 'ఎర్ర నేలలు', 'लाल मिट्टी'],
    responses: {
      en: 'Red and laterite soils are porous with good drainage but generally low in nitrogen, phosphorus, and organic matter. They are best suited for Groundnut, Maize, Finger Millet (Ragi), Pulses, Sesame, Potato, and Horticultural crops (Mango, Cashew). Incorporate 3-4 tonnes/acre of Farmyard Manure (FYM) to improve water retention.',
      hi: 'लाल मिट्टी में जल निकासी अच्छी होती है लेकिन इसमें नाइट्रोजन, फास्फोरस और जैविक कार्बन की कमी होती है। यह मूंगफली, मक्का, रागी, दालें, तिल और बागवानी फसलों के लिए उत्कृष्ट है। मिट्टी की उर्वरता और नमी बढ़ाने के लिए 3-4 टन/एकड़ गोबर की खाद (FYM) मिलाएं।',
      te: 'ఎర్ర నేలలు మరియు ఇసుక నేలలు మంచి నీటి పారుదల కలిగి ఉంటాయి కానీ సేంద్రీయ కర్బనం మరియు నత్రజని తక్కువగా ఉంటాయి. ఇవి వేరుశనగ, మొక్కజొన్న, రాగులు, పప్పుదినుసులు, నువ్వులు మరియు పండ్ల తోటలకు అనువైనవి. తేమ నిలుపుదల కోసం ఎకరాకు 3-4 టన్నుల పశువుల ఎరువు తప్పనిసరిగా వాడాలి.',
      ta: 'செம்மண் நல்ல வடிகால் வசதி கொண்டது. இது நிலக்கடலை, மக்காச்சோளம், கேழ்வரகு, பயறு வகைகள் மற்றும் காய்கறி பயிர்களுக்கு மிகவும் ஏற்றது. மண்ணின் வளத்தை அதிகரிக்க ஏக்கருக்கு 3-4 டன் மக்கிய தொழுவுரம் இடுங்கள்.',
      kn: 'ಕೆಂಪು ಮಣ್ಣು ಉತ್ತಮ ನೀರು ಬಸಿದುಹೋಗುವ ಗುಣವನ್ನು ಹೊಂದಿದೆ. ಇದು ಕಡಲೆಕಾಯಿ, ಮೆಕ್ಕೆಜೋಳ, ರಾಗಿ, ದ್ವಿದಳ ಧಾನ್ಯಗಳು ಮತ್ತು ತರಕಾರಿಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ. ಸಾವಯವ ಗೊಬ್ಬರವನ್ನು ಎಕರೆಗೆ 3-4 ಟನ್ ಬೆರೆಸಿ ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಿ.',
      ml: 'ചുവന്ന മണ്ണ് നിലക്കടല, ചോളം, റാഗി, പയറുവർഗ്ഗങ്ങൾ എന്നിവയ്ക്ക് അനുയോജ്യമാണ്. ജൈവാംശം വർദ്ധിപ്പിക്കാൻ സെന്റൊന്നിന് ചാണകപ്പൊടിയോ കമ്പോസ്റ്റോ ചേർക്കുക.',
      mr: 'तांबडी जमीन भुसभुशीत असते. ही भुईमूग, मका, नाचणी, कडधान्ये आणि फळबागांसाठी उपयुक्त आहे. जमिनीची पाणी धरून ठेवण्याची क्षमता वाढवण्यासाठी शेणखताचा मुबलक वापर करा.',
      bn: 'লাল মাটি চীনাবাদাম, ভুট্টা, বাজরা ও ডাল জাতীয় ফসলের জন্য উপযুক্ত। মাটিতে জৈব সারের পরিমাণ বাড়াতে একর প্রতি ৩-৪ টন গোবর সার প্রয়োগ করুন।'
    }
  },
  {
    category: QUERY_CATEGORIES.CROP,
    keywords: ['kharif', 'monsoon season', 'sowing time', 'ఖరీఫ్', 'खरीफ'],
    responses: {
      en: 'Kharif crops are sown with the onset of the southwest monsoon (June to July) and harvested in autumn (September to October). Major Kharif crops include Paddy (Rice), Cotton, Maize, Soybean, Groundnut, Pigeon Pea (Tur), and Green Gram. Ensure timely nursery raising for paddy so transplanting occurs at 21-25 days of seedling age.',
      hi: 'खरीफ की बुवाई दक्षिण-पश्चिम मानसून की शुरुआत (जून से जुलाई) में होती है और कटाई सितंबर-अक्टूबर में होती है। मुख्य फसलें धान, कपास, मक्का, सोयाबीन, मूंगफली और अरहर हैं। धान की नर्सरी समय पर डालें ताकि 21-25 दिन की पौध रोपी जा सके।',
      te: 'ఖరీఫ్ పంటలను నైరుతి రుతుపవనాలు ప్రారంభమైనప్పుడు (జూన్-జూలై) విత్తుతారు మరియు సెప్టెంబర్-అక్టోబర్‌లో కోస్తారు. ప్రధాన పంటలు వరి, పత్తి, మొక్కజొన్న, సోయాబీన్, వేరుశనగ మరియు కంది. వరి నారును 21-25 రోజుల వయస్సులో మాత్రమే నాటుకోవాలి.',
      ta: 'காரீப் பருவம் ஜூன்-ஜூலை மாதங்களில் தென்மேற்கு பருவமழையுடன் தொடங்குகிறது. நெல், பருத்தி, மக்காச்சோளம், சோயாபீன்ஸ் மற்றும் நிலக்கடலை முக்கிய பயிர்கள் ஆகும்.',
      kn: 'ಮುಂಗಾರು (ಖಾರೀಫ್) ಹಂಗಾಮಿನಲ್ಲಿ ಜೂನ್-ಜುಲೈ ತಿಂಗಳಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಲಾಗುತ್ತದೆ. ಭತ್ತ, ಹತ್ತಿ, ಮೆಕ್ಕೆಜೋಳ, ಸೋಯಾಬೀನ್ ಮತ್ತು ಕಡಲೆಕಾಯಿ ಮುಖ್ಯ ಬೆಳೆಗಳು. ಭತ್ತದ ಸಸಿ 21-25 ದಿನಗಳಿದ್ದಾಗ ನಾಟಿ ಮಾಡಿ.',
      ml: 'ഖാരിഫ് സീസൺ ജൂൺ-ജൂലൈ മാസങ്ങളിൽ ആരംഭിക്കുന്നു. നെല്ല്, ചോളം, പരുത്തി എന്നിവയാണ് പ്രധാന വിളകൾ.',
      mr: 'खरीप हंगामाची पेरणी मान्सूनच्या आगमनानंतर (जून-जुलೈ) केली जाते. भात, कापूस, मका, सोयाबीन आणि तूर ही प्रमुख पिके आहेत. भाताची पुनर्लागवड रोपे २१ ते २५ दिवसांची असतानाच करावी.',
      bn: 'খারিফ মরসুমের বপন জুন-জুলাই মাসে বর্ষা শুরুর সাথে শুরু হয়। প্রধান ফসল হল ধান, তুলা, ভুট্টা, সয়াবিন ও বাদাম।'
    }
  },
  {
    category: QUERY_CATEGORIES.FERTILIZER,
    keywords: ['urea', 'nitrogen application', 'top dressing', 'యూరియా', 'यूरिया', 'split dose'],
    responses: {
      en: 'Never apply 100% of Urea at sowing time because excess nitrogen leaches into groundwater and volatilizes as ammonia gas. For field crops like Paddy, Wheat, and Cotton, split Urea into 3 applications: 25% Basal, 50% at active tillering / vegetative branching, and 25% at panicle initiation or flowering stage. Apply Urea when field soil is moist but avoid standing water.',
      hi: 'बुवाई के समय यूरिया की पूरी मात्रा कभी न डालें, इससे नाइट्रोजन नष्ट हो जाती है। धान, गेहूं और कपास में यूरिया को 3 भागों में बांटें: 25% बुवाई के समय, 50% कल्ले फूटते/शाखाएं बनते समय, और 25% बालियां/फूल निकलते समय। यूरिया हमेशा नम मिट्टी में डालें, भरे पानी में नहीं।',
      te: 'యూరియాను ఎప్పుడూ ఒకేసారి వేయకూడదు; దీనివల్ల నత్రజని ఆవిరైపోతుంది లేదా భూమిలోకి ఇంకి వృధా అవుతుంది. వరి, పత్తి, గోధుమ పంటలలో యూరియాను 3 దఫాలుగా వేయాలి: 25% విత్తేటప్పుడు, 50% పిలకల దశలో (శాఖీయ దశ), 25% చిరుపొట్ట లేదా పూత దశలో. నేలలో తగినంత తేమ ఉన్నప్పుడు మాత్రమే యూరియా వేయాలి.',
      ta: 'அனைத்து யூரியாவையும் விதைக்கும் போதே இடக்கூடாது. பயிர்களுக்கு 3 பிரிவுகளாக இடவும்: 25% அடியുரமாக, 50% தூர் கட்டும் பருவத்தில், 25% பூக்கும் பருவத்தில். ஈரப்பதம் உள்ள நிலத்தில் மட்டும் இடவும்.',
      kn: 'ಯೂರಿಯಾವನ್ನು ಒಮ್ಮೆಲೆ ಹಾಕಬಾರದು. 3 ಕಂತುಗಳಲ್ಲಿ ಹಾಕಿ: 25% ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ, 50% ಕವಲು ಒಡೆಯುವ ಹಂತದಲ್ಲಿ, ಮತ್ತು 25% ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ. ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿದ್ದಾಗ ಮಾತ್ರ ಯೂರಿಯಾ ಹಾಕಿ.',
      ml: 'യൂറിയ ഒറ്റയടിക്ക് പ്രയോഗിക്കരുത്. മൂന്ന് തവണകളായി വിഭജിച്ചു നൽകുക: നടീൽ സമയത്ത് 25%, വളർച്ചാ ഘട്ടത്തിൽ 50%, പൂവിടുന്ന ഘട്ടത്തിൽ 25%.',
      mr: 'युरिया एकाच वेळी कधीही टाकू नका. तो ३ हप्त्यांमध्ये विभागून द्या: २५% पेरणीच्या वेळी, ५०% फुटवे फुटताना आणि २५% पीक फुलोऱ्यात असताना. जमिनीत पुरेसा ओलावा असतानाच युरिया द्यावा.',
      bn: 'একবারে সব ইউরিয়া প্রয়োগ করবেন না। এটি ৩ কিস্তিতে দিন: ২৫% রোপণের সময়, ৫০% কুশি বের হওয়ার সময় এবং ২৫% শীষ আসার সময়।'
    }
  },
  {
    category: QUERY_CATEGORIES.FERTILIZER,
    keywords: ['dap', 'phosphorus', 'basal fertilizer', 'డిఎపి', 'डीएपी', 'ssp'],
    responses: {
      en: 'DAP (18-46-0) and SSP (Single Super Phosphate) are phosphatic fertilizers that should be applied strictly as a BASAL dose during field preparation or at the time of seed sowing. Phosphorus does not move easily through soil water; placing it 4-5 cm below the seed allows the young germinating root system to absorb it directly for robust root growth.',
      hi: 'डीएपी (18-46-0) और एसएसपी को हमेशा बुवाई के समय \\\'बेसल डोज\\\' (अंतिम जुताई या बुवाई) के रूप में देना चाहिए। फास्फोरस मिट्टी में ज्यादा हिलता नहीं है, इसलिए इसे बीज से 4-5 सेमी नीचे देना चाहिए ताकि अंकुरित जड़ें इसे आसानी से अवशोषित कर सकें।',
      te: 'డిఎపి (18-46-0) మరియు ఎస్ఎస్‌పి (సింగిల్ సూపర్ ఫాస్ఫేట్) లను విత్తే సమయంలో ఆఖరి దుక్కిలో \\\'అడుగెరువు\\\' (బాసల్ డోస్) గా మాత్రమే వేయాలి. భాస్వరం నేలలో కదలదు కాబట్టి, విత్తనానికి 4-5 సెం.మీ లోతులో పడేలా వేస్తే మొలకెత్తిన వేర్లు దృఢంగా పెరుగుతాయి.',
      ta: 'டிஏபி மற்றும் எஸ்எஸ்பி உரங்களை விதைக்கும் போது அடியுரமாக மட்டுமே இட வேண்டும். இது பயிர்களின் வேர் வளர்ச்சியை விரைவுபடுத்துகிறது.',
      kn: 'ಡಿಎಪಿ ಮತ್ತು ಎಸ್ಎಸ್ಪಿ ರಂಜಕಯುಕ್ತ ರಸಗೊಬ್ಬರಗಳನ್ನು ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಅಡಿಯುರವಾಗಿ ಮಾತ್ರ ಹಾಕಬೇಕು. ಇದು ಬೇರುಗಳು ಆಳವಾಗಿ ಮತ್ತು ಬಲವಾಗಿ ಬೆಳೆಯಲು ಸಹಕರಿಸುತ್ತದೆ.',
      ml: 'ഡിഎപിയും എസ്എസ്പിയും നടീൽ സമയത്ത് അടിവളമായി മാത്രം പ്രയോഗിക്കുക. ഇത് ശക്തമായ വേരുകൾ വളരാൻ സഹായിക്കുന്നു.',
      mr: 'डीएपी आणि एसएसपी खते पेरणीच्या वेळी किंवा शेवटच्या नांगरणीच्या वेळी \\\'तळाचे खत\\\' (बेसल डोस) म्हणून द्यावीत. यामुळे मुळांची वाढ वेगाने होते.',
      bn: 'ডিএপি এবং এসএসপি সারগুলি বীজ বপনের সময় বা জমি তৈরির সময় তলানি সার হিসেবে প্রয়োগ করা উচিত। এটি মূলের বৃদ্ধি ত্বরান্বিত করে।'
    }
  },
  {
    category: QUERY_CATEGORIES.PEST_CONTROL,
    keywords: ['whitefly', 'aphids', 'sucking pest', 'తెల్లదోమ', 'सफेद मक्खी', 'neem oil', 'leaf curl'],
    responses: {
      en: 'Sucking pests like Whiteflies, Aphids, and Thrips feed on foliar sap and transmit debilitating viral diseases (like Leaf Curl and Yellow Mosaic). Integrated Management (IPM):\n1. Install yellow and blue sticky traps (10-15 per acre) across the crop canopy.\n2. Spray cold-pressed Neem Oil (10,000 ppm) at 3 ml/litre of water with 1 ml liquid soap at first observation.\n3. For severe infestations, spray Diafenthiuron 50% WP (1.25 g/L) or Flonicamid 50% WG (0.3 g/L). Avoid excessive nitrogen fertilizer which makes foliage succulent and attracts pests.',
      hi: 'सफेद मक्खी और माहू (एफिड्स) पत्तियों का रस चूसते हैं और मरोड़िया रोग (लीफ कर्ल) फैलाते हैं। एकीकृत प्रबंधन:\n1. खेत में 10-12 पीले चिपचिपे ट्रैप (येलो स्टिकी ट्रैप) लगाएं।\n2. प्रारंभिक अवस्था में नीम का तेल (10,000 ppm) 3 मिली प्रति लीटर पानी में मिलाकर छिड़कें।\n3. भारी प्रकोप होने पर डायफेन्थियूरॉन 50% WP (1.25 ग्राम/लीटर) या फ्लोनिकामिड 50% WG (0.3 ग्राम/लीटर) का छिड़काव करें। अधिक यूरिया का प्रयोग न करें।',
      te: 'తెల్లదోమ, పేనుబంక మరియు తామర పురుగులు రసం పీల్చి ఆకు ముడత వైరస్‌ను వ్యాపింపజేస్తాయి. నివారణ చర్యలు:\n1. ఎకరాకు 10-15 పసుపు, నీలిరంగు జిగురు అట్టలను పైరు ఎత్తులో అమర్చండి.\n2. మొదటి దశలో వేప నూనె (10,000 ppm) 3 మి.లీ లీటరు నీటికి కలిపి పిచికారీ చేయండి.\n3. ఉధృతి ఎక్కువగా ఉంటే డయాఫెంథియురాన్ 50% WP (1.25 గ్రా/లీ) లేదా ఫ్లోనికామిడ్ 50% WG (0.3 గ్రా/లీ) పిచికారీ చేయాలి. అధిక యూరియా వాడకాన్ని తగ్గించండి.',
      ta: 'வெள்ளை ஈக்கள் மற்றும் அசுவணிகள் சாற்றை உறிஞ்சி இலைச்சுருள் நோயை உண்டாக்குகின்றன. ஏக்கருக்கு 10 மஞ்சள் ஒட்டும் பொறிகளை வைக்கவும். வேப்ப எண்ணெய் 3 மி.லி/லிட்டர் தெளிக்கவும்.',
      kn: 'ಬಿಳಿ ನೊಣ ಮತ್ತು ಗಿಡಹೇನುಗಳು ರಸಹೀರಿ ಎಲೆ ಮುದುರು ರೋಗವನ್ನು ಹರಡುತ್ತವೆ. ಎಕರೆಗೆ 10 ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ. ಬೇವಿನ ಎಣ್ಣೆ 3 ಮಿಲಿ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.',
      ml: 'വെള്ളീച്ചയും മുഞ്ഞയും ഇലപ്പേനുകളും ഇലച്ചുരുൾ വൈറസ് പരത്തുന്നു. മഞ്ഞക്കെണികൾ സ്ഥാപിക്കുക. വേപ്പെണ്ണ മിശ്രിതം തളിക്കുക.',
      mr: 'पांढरी माशी आणि मावा कीड पानांमधील रस शोषून घेतात व लीफ कर्ल व्हायरस पसरवतात. एकरी १०-१२ पिवळे चिकट सापळे लावा. सुरुवातीला निंबोळी अर्क (३ मिली/लिटर) फवारा.',
      bn: 'সাদা মাছি এবং এফিড পাতার রস চুষে নেয় এবং লিফ কার্ল রোগ ছড়ায়। একর প্রতি ১০টি হলুদ আঠালো ফাঁদ ব্যবহার করুন। নিম তেল ৩ মিলি/লিটার স্প্রে করুন।'
    }
  },
  {
    category: QUERY_CATEGORIES.DISEASE,
    keywords: ['yellow leaves', 'chlorosis', 'yellowing', 'ఆకులు పసుపు', 'पीली पत्तियां', 'nitrogen deficiency'],
    responses: {
      en: 'Foliar yellowing occurs due to multiple distinct causes:\n1. Older lower leaves turning pale yellow starting at leaf tip: Nitrogen deficiency (Top-dress urea or spray 1-2% urea solution).\n2. Interveinal yellowing (veins remain green): Iron or Magnesium deficiency (Spray Ferrous Sulphate 0.5% + Citric Acid 0.1% or Magnesium Sulphate 1%).\n3. Patchy bright yellow and green mosaic: Viral infection transmitted by whitefly (Rogue out infected plants immediately and spray neem oil).\n4. Yellow halos with brown necrotic centers: Foliar fungal blight (Spray Copper Oxychloride 2.5 g/L or Mancozeb 2.5 g/L).',
      hi: 'पत्तियों के पीले होने के मुख्य कारण:\n1. निचली पुरानी पत्तियां नोक से पीली पड़ना: नाइट्रोजन की कमी (1-2% यूरिया का छिड़काव करें)।\n2. पत्तियों की नसें हरी और बीच का भाग पीला: आयरन या मैग्नीशियम की कमी (फेरस सल्फेट 5 ग्राम/लीटर)।\n3. चितकबरा पीला-हरा मोज़ेक: वायरस रोग (सफेद मक्खी नियंत्रण करें और ग्रसित पौधे उखाड़ दें)।\n4. पीले घेरे के साथ भूरे धब्बे: फफूंद जनित अंगमारी (कॉपर ऑक्सीक्लोराइड 2.5 ग्राम/लीटर)।',
      te: 'ఆకులు పసుపు రంగులోకి మారడానికి గల కారణాలు మరియు నివారణ:\n1. క్రింది పాత ఆకులు మొదట పసుపుగా మారితే: నత్రజని లోపం (యూరియా 2% ద్రావణం పిచికారీ చేయండి).\n2. ఈనెలు ఆకుపచ్చగా ఉండి మధ్య భాగం పసుపుగా మారితే: ఇనుము లేదా మెగ్నీషియం లోపం (అన్నభేది 5 గ్రా/లీటర్ + నిమ్మప్పు 1 గ్రా కలిపి పిచికారీ చేయాలి).\n3. ఆకులపై పసుపు మరియు ఆకుపచ్చ మచ్చల మొజాయిక్: తెల్లదోమ ద్వారా వ్యాపించే వైరస్ (రోగం సోకిన మొక్కలను పీకి నాశనం చేయండి).\n4. పసుపు వలయాలతో కూడిన నల్లటి మచ్చలు: శిలీంధ్ర ఆకుమచ్చ తెగులు (మాంకోజెబ్ 2.5 గ్రా/లీటర్ పిచికారీ చేయండి).',
      ta: 'இலைகள் மஞ்சள் நிறமாவதற்கு முக்கிய காரணங்கள்: பழைய இலைகள் மஞ்சளானால் தழைச்சத்து (நைட்ரஜன்) பற்றாக்குறை. இரும்புச்சத்து குறைபாட்டிற்கு பெர்ரஸ் சல்பேட் தெளிக்கவும்.',
      kn: 'ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಸಾರಜನಕದ ಕೊರತೆ ಅಥವಾ ಕಬ್ಬಿಣದ ಕೊರತೆ ಕಾರಣವಿರಬಹುದು. ಹಳೆಯ ಎಲೆಗಳು ಹಳದಿಯಾದರೆ 2% ಯೂರಿಯಾ ಸಿಂಪಡಿಸಿ.',
      ml: 'ഇലകൾ മഞ്ഞളിക്കുന്നത് നൈട്രജൻ അല്ലെങ്കിൽ ഇരുമ്പിന്റെ കുറവ് മൂലമാകാം. 2% യൂറിയ അല്ലെങ്കിൽ ഫെറസ് സൾഫേറ്റ് ലായനി തളിക്കുക.',
      mr: 'पाने पिवळी पडण्याची मुख्य कारणे: खालची पाने पिवळी पडल्यास नत्राची कमतरता (युरिया फवारा). शिरांमधील भाग पिवळा झाल्यास फेरस सल्फेट ५ ग्रॅम/लिटर फवारा.',
      bn: 'পাতা হলুদ হওয়ার কারণ: নিচের পাতা হলুদ হলে নাইট্রোজেনের ঘাটতি (ইউরিয়া স্প্রে করুন)। লোহার ঘাটতির জন্য ফেরাস সালফেট স্প্রে করুন।'
    }
  },
  {
    category: QUERY_CATEGORIES.WEATHER,
    keywords: ['heavy rain', 'storm', 'cyclone', 'lodging', 'waterlogging', 'భారీ వర్షాలు', 'भारी बारिश'],
    responses: {
      en: 'Pre-storm and heavy rainfall precautions for standing crops:\n1. Clear farm boundary channels and drains to allow surplus water to evacuate rapidly; standing water for >24 hours suffocates crop root hair.\n2. In tall crops like Maize, Cotton, and Banana, earth up soil around stems and stake plants with bamboo to avoid lodging.\n3. Do not apply chemical fertilizers or pesticide sprays when rain is forecasted within 24 hours.\n4. After water recedes, spray 1% Urea + 0.5% Zinc Sulphate to revive shock-stressed root systems.',
      hi: 'भारी बारिश और आंधी से फसलों की सुरक्षा:\n1. खेतों में जल निकासी नालियां तुरंत साफ करें ताकि 24 घंटे से अधिक पानी न भरे।\n2. मक्का, गन्ना और केले जैसी लंबी फसलों में पौधों पर मिट्टी चढ़ाएं (अर्थिंग अप) और सहारा दें।\n3. बारिश की संभावना होने पर कोई भी रासायनिक खाद या कीटनाशक न छिड़कें।\n4. पानी उतरने के बाद फसल को उबारने के लिए 1% यूरिया का पर्णीय छिड़काव करें।',
      te: 'భారీ వర్షాలు మరియు తుఫానుల నుండి పంటల రక్షణ:\n1. పొలంలో నీరు నిల్వ ఉండకుండా వెంటనే మురుగునీటి కాలువలను తెరిచి ఉంచండి; 24 గంటలకు మించి నీరు నిలిస్తే వేరుకుళ్ళు వస్తుంది.\n2. మొక్కజొన్న, చెరకు, అరటి మరియు పత్తి పంటలలో మొక్కల మొదళ్లకు మట్టిని ఎగదోయండి.\n3. వర్ష సూచన ఉన్నప్పుడు ఎట్టి పరిస్థితుల్లోనూ ఎరువులు లేదా పురుగుమందులు పిచికారీ చేయవద్దు.\n4. వర్షాలు తగ్గాక మొక్కల కోలుకోవడానికి 1% యూరియా లేదా 19-19-19 ద్రావణం పిచికారీ చేయండి.',
      ta: 'கனமழைக்கு முன் நிலத்தில் தேங்கும் தண்ணீரை வெளியேற்ற வடிகால் அமைக்கவும். மழை நிற்கும் வரை பூச்சிக்கொல்லி தெளிப்பதை தவிர்க்கவும்.',
      kn: 'ಭಾರೀ ಮಳೆಯಿಂದ ರಕ್ಷಣೆಗೆ ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಮಳೆ ಮುನ್ಸೂಚನೆ ಇರುವಾಗ ಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ.',
      ml: 'കനത്ത മഴ മുന്നറിയിപ്പുണ്ടെങ്കിൽ കൃഷിയിടത്തിൽ വെള്ളം കെട്ടിക്കിടക്കാതെ ഓവുചാലുകൾ കീറുക. വളപ്രയോഗം ഒഴിവാക്കുക.',
      mr: 'मुसळधार पाऊस होण्यापूर्वी शेतातून पाणी वाहून जाण्यासाठी चर तयार ठेवा. मका, ऊस यासारख्या पिकांना मातीची भर लावा. पावसाचा अंदाज असताना फवारणी करू नका.',
      bn: 'ভারী বৃষ্টির আগে জমি থেকে অতিরিক্ত জল নিষ্কাশনের জন্য নালার ব্যবস্থা করুন। বৃষ্টি চলাকালীন কীটনাশক স্প্রে করবেন না।'
    }
  },
  {
    category: QUERY_CATEGORIES.SCHEMES,
    keywords: ['pm kisan', 'pmfby', 'insurance', 'soil health card', 'rythu bandhu', 'రైతు బంధు', 'योजना'],
    responses: {
      en: 'Key Government Farmer Welfare Initiatives in India:\n1. PM-KISAN: Direct income support of Rs. 6,000/year in three equal installments to eligible landholding farmers.\n2. PMFBY (Pradhan Mantri Fasal Bima Yojana): Low-premium comprehensive crop insurance (2% for Kharif, 1.5% for Rabi, 5% for commercial crops) against unpreventable natural perils.\n3. Soil Health Card Scheme: Provides free soil nutrient testing every 2-3 years through local Krishi Vigyan Kendras (KVKs).\n4. Kisan Credit Card (KCC): Concessional institutional credit at 4% interest rate (with prompt repayment incentive).',
      hi: 'भारत सरकार की प्रमुख किसान कल्याणकारी योजनाएं:\n1. पीएम-किसान (PM-KISAN): पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आर्थिक सहायता।\n2. पीएम फसल बीमा योजना (PMFBY): प्राकृतिक आपदाओं, कीटों और बेमौसम बारिश से नुकसान पर सुरक्षा।\n3. मृदा स्वास्थ्य कार्ड (Soil Health Card): खेत की मिट्टी की जांच और संतुलित उर्वरक मार्गदर्शन।\n4. किसान क्रेडिट कार्ड (KCC): समय पर भुगतान करने पर मात्र 4% ब्याज दर पर आसान कृषि ऋण।',
      te: 'ప్రభుత్వ ముఖ్యమైన రైతు సంక్షేమ పథకాలు:\n1. పిఎం-కిసాన్: అర్హులైన రైతులకు సంవత్సరానికి ₹6,000 నేరుగా బ్యాంక్ ఖాతాలో జమ.\n2. ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY): అతి తక్కువ ప్రీమియంతో పంట నష్ట పరిహార బీమా.\n3. సాయిల్ హెల్త్ కార్డ్: ఉచిత భూసార పరీక్ష మరియు ఎరువుల సమగ్ర సిఫార్సులు.\n4. కిసాన్ క్రెడిట్ కార్డ్ (KCC): 4% రాయితీ వడ్డీకే పంట రుణాలు. తెలంగాణ రైతులకు \\\'రైతు బంధు / రైతు భరోసా\\\' పంట పెట్టుబడి సాయం అందిస్తుంది.',
      ta: 'முக்கிய வேளாண் திட்டங்கள்: பிஎம்-கிசான் திட்டத்தில் ஆண்டுக்கு ₹6,000 உதவித்தொகை. பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY) இயற்கை இடர்பாடுகளிலிருந்து பாதுகாக்கிறது.',
      kn: 'ಪ್ರಮುಖ ರೈತ ಯೋಜನೆಗಳು: ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆಯಡಿ ವಾರ್ಷಿಕ ₹6,000 ಧನಸಹಾಯ. ಪ್ರಧಾನಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆಯಡಿ ಬೆಳೆ ವಿಮೆ ಸೌಲಭ್ಯ ದೊರೆಯುತ್ತದೆ.',
      ml: 'പിഎം-കിസാൻ പദ്ധതി വഴി പ്രതിവർഷം ₹6,000 നേരിട്ട് ലഭിക്കുന്നു. വിള ഇൻഷുറൻസ് പദ്ധതികൾ പ്രകൃതിക്ഷോഭങ്ങളിൽ നിന്ന് കർഷകർക്ക് സംരക്ഷണം നൽകുന്നു.',
      mr: 'महत्त्वाच्या शेतकरी योजना: पीएम-किसान अंतर्गत वर्षाला ₹६,००० अनुदान. पीक विमा योजना (PMFBY) नैसर्गिक आपत्तीत नुकसान भरपाई देते. मृदा आरोग्य पत्रिका (Soil Health Card) जमिनीची सुपीकता तपासण्यासाठी उपयुक्त आहे.',
      bn: 'প্রধান কৃষক কল্যাণ প্রকল্প: পিএম-কিসান প্রকল্পে বছরে ₹৬,০০০ আর্থিক সহায়তা। প্রধানমন্ত্রী ফসল বিমা যোজনা (PMFBY) প্রাকৃতিক দুর্যোগে ফসলের সুরক্ষা দেয়।'
    }
  }
];

/**
 * Identify query category and relevant keywords
 */
function analyzeQueryIntent(query) {
  const normalized = query.toLowerCase().trim();

  // Check safety guardrail first
  for (const pattern of NON_AGRI_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isOffTopic: true, category: QUERY_CATEGORIES.GENERAL, matchedItem: null };
    }
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const item of AGRONOMIC_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.length; // prioritize specific phrases
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    return { isOffTopic: false, category: bestMatch.category, matchedItem: bestMatch };
  }

  // Fallback category heuristic
  let fallbackCategory = QUERY_CATEGORIES.GENERAL;
  if (/crop|soil|seed|sow|harvest|paddy|wheat|cotton|maize|tomato|potato|వరి|పత్తి|फसल/i.test(normalized)) {
    fallbackCategory = QUERY_CATEGORIES.CROP;
  } else if (/fertilizer|urea|dap|npk|potash|manure|ఎరువు|खाद/i.test(normalized)) {
    fallbackCategory = QUERY_CATEGORIES.FERTILIZER;
  } else if (/disease|fungus|blight|rot|spot|leaf|తెగులు|रोग/i.test(normalized)) {
    fallbackCategory = QUERY_CATEGORIES.DISEASE;
  } else if (/pest|insect|worm|borer|spray|పురుగు|कीट/i.test(normalized)) {
    fallbackCategory = QUERY_CATEGORIES.PEST_CONTROL;
  } else if (/rain|weather|temperature|wind|storm|వరద|मौसम/i.test(normalized)) {
    fallbackCategory = QUERY_CATEGORIES.WEATHER;
  }

  return { isOffTopic: false, category: fallbackCategory, matchedItem: null };
}

/**
 * Generate off-topic deflection message in user's language
 */
function getDeflectionMessage(lang = 'en') {
  const deflections = {
    en: 'I am your specialized AI Agriculture Advisor. I can only assist with farming questions, such as crop selection, soil health, fertilizer dosage, pest control, plant pathology, and agricultural weather alerts. How can I help with your farm today?',
    hi: 'मैं आपका समर्पित एआई कृषि सलाहकार हूं। मैं केवल खेती, फसल चयन, मिट्टी की उर्वरता, खाद की मात्रा, कीट नियंत्रण, पौध रोग और कृषि मौसम से जुड़े प्रश्नों में आपकी सहायता कर सकता हूं। कृपया अपनी खेती से संबंधित प्रश्न पूछें।',
    te: 'నేను మీ ప్రత్యేక ఏఐ వ్యవసాయ సలహాదారుడిని (AI Agriculture Advisor). నేను కేవలం పంటల ఎంపిక, నేల స్వభావం, ఎరువుల యాజమాన్యం, తెగుళ్ల నివారణ మరియు వ్యవసాయ వాతావరణానికి సంబంధించిన సందేహాలకు మాత్రమే సహాయపడగలను. దయచేసి మీ వ్యవసాయానికి సంబంధించిన ప్రశ్న అడగండి.',
    ta: 'நான் உங்கள் விவசாய ஏஐ ஆலோசகர். பயிர் சாகுபடி, உரம், பூச்சி மேலாண்மை மற்றும் வானிலை தொடர்பான விவசாய கேள்விகளுக்கு மட்டுமே என்னால் பதிலளிக்க முடியும். உங்கள் விவசாயம் குறித்து கேளுங்கள்.',
    kn: 'ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಎಐ ಸಲಹೆಗಾರ. ಬೆಳೆ ನಿರ್ವಹಣೆ, ರಸಗೊಬ್ಬರ, ಕೀಟ ನಿಯಂತ್ರಣ ಮತ್ತು ಕೃಷಿ ಹವಾಮಾನ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಬಲ್ಲೆ. ನಿಮ್ಮ ಕೃಷಿ ಕುರಿತು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.',
    ml: 'ഞാൻ നിങ്ങളുടെ കൃഷി സഹായിയാണ്. കൃഷി, വളപ്രയോഗം, കീടനിയന്ത്രണം എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് മാത്രമേ എനിക്ക് ഉത്തരം നൽകാൻ കഴിയൂ.',
    mr: 'मी आपला समर्पित एआय शेती सल्लागार आहे. मी फक्त पिके, मातीचे आरोग्य, खत व्यवस्थापन, कीड नियंत्रण आणि शेती हवामानाशी संबंधित प्रश्नांची उत्तरे देऊ शकतो. कृपया आपला शेतीविषयक प्रश्न विचारा.',
    bn: 'আমি আপনার নিবেদিত এআই কৃষি উপদেষ্টা। আমি কেবল ফসল চাষ, মাটি, সার প্রয়োগ, রোগ দমন ও আবহাওয়া সংক্রান্ত কৃষি প্রশ্নের উত্তর দিতে পারি। আপনার কৃষিকাজ সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন।'
  };
  return deflections[lang] || deflections.en;
}

/**
 * Synthesize answer from domain agronomy base or general heuristic
 */
function synthesizeAgronomicResponse(query, category, matchedItem, lang = 'en') {
  if (matchedItem && matchedItem.responses[lang]) {
    return matchedItem.responses[lang];
  }
  if (matchedItem && matchedItem.responses.en) {
    return matchedItem.responses.en;
  }

  // Context-aware structured responses based on category
  const generalResponses = {
    crop: {
      en: `Regarding "${query}": Optimal crop growth requires matching soil pH (6.0 - 7.5), adequate organic matter, and selecting certified high-yielding varieties. Always rotate deep-rooted crops with shallow-rooted pulses to maintain nitrogen balance and break soil-borne disease cycles.`,
      hi: `"${query}" के संबंध में: बेहतर फसल उत्पादन के लिए मिट्टी की सही जांच, 6.0 से 7.5 का पीएच, और प्रमाणित रोगरोधी बीजों का चयन करें। मिट्टी की उर्वरता बनाए रखने के लिए दलहनी फसलों के साथ फसल चक्र (Crop Rotation) अवश्य अपनाएं।`,
      te: `"${query}" విషయంలో: మంచి దిగుబడి సాధించడానికి నేల ఉదజని సూచిక (pH 6.0-7.5) సరిచూసుకోవాలి, సర్టిఫైడ్ విత్తనాలను ఎంచుకోవాలి. నేల సారం తగ్గకుండా ఉండటానికి ప్రధాన పంటల తర్వాత పప్పుదినుసుల పంటలతో పంట మార్పిడి చేపట్టండి.`
    },
    fertilizer: {
      en: `Regarding "${query}": Implement balanced Soil Test Crop Response (STCR) nutrition. Supply Nitrogen in 2-3 split applications, keep Phosphorus as basal, and apply Potassium at sowing and pre-flowering. Supplement with 5 tonnes/acre of compost to improve nutrient use efficiency.`,
      hi: `"${query}" के संबंध में: संतुलित खाद प्रबंधन अपनाएं। नाइट्रोजन को 2-3 भागों में दें, फास्फोरस बुवाई के समय डालें और पोटाश को शुरुआती व फूल आते समय दें। सूक्ष्म पोषक तत्वों की कमी के लिए जिंक और बोरॉन का प्रयोग करें।`,
      te: `"${query}" విషయంలో: భూసార పరీక్ష ఆధారంగా సమతుల్య ఎరువులు వాడాలి. నత్రజనిని 2-3 దఫాలుగా, భాస్వరాన్ని ఆఖరి దుక్కిలో, పొటాష్‌ను విత్తేటప్పుడు మరియు పూత సమయంలో వేయాలి.`
    },
    pest_control: {
      en: `Regarding "${query}": Practice Integrated Pest Management (IPM). Start with mechanical traps (pheromone or sticky traps), conserve natural beneficial predators like ladybird beetles, and use bio-pesticides (Neem oil or Trichoderma) before resorting to synthetic chemicals.`,
      hi: `"${query}" के संबंध में: एकीकृत कीट प्रबंधन (IPM) अपनाएं। शुरुआती अवस्था में फेरोमोन ट्रैप और नीम के तेल का प्रयोग करें। रासायनिक कीटनाशकों का प्रयोग केवल आर्थिक नुकसान सीमा (ETL) पार होने पर ही अनुशंसित मात्रा में करें।`,
      te: `"${query}" విషయంలో: సమగ్ర సస్యరక్షణ (IPM) విధానం పాటించండి. లింగాకర్షక బుట్టలు, జిగురు అట్టలు వాడండి. మొదటి దశలో వేప నూనె లేదా ట్రైకోడెర్మా వంటి జీవ నియంత్రణ మందులను పిచికారీ చేయండి.`
    },
    disease: {
      en: `Regarding "${query}": Foliar diseases thrive in high humidity and warm temperatures. Remove and burn heavily infected foliage, ensure adequate row spacing for sunlight penetration, and apply protective copper or mancozeb fungicides at first symptom onset.`,
      hi: `"${query}" के संबंध में: पौधों की बीमारियां अधिक नमी और तापमान में तेजी से फैलती हैं। रोगग्रस्त पत्तियों को काटकर नष्ट करें, खेत में हवा और धूप का आवागमन बनाए रखें, और शुरुआती लक्षण दिखने पर अनुशंसित फफूंदनाशक का छिड़काव करें।`,
      te: `"${query}" విషయంలో: ఆకుమచ్చ లేదా బూడిద తెగుళ్లు అధిక తేమ ఉన్నప్పుడు ఎక్కువగా వస్తాయి. తెగులు సోకిన భాగాలను తీసివేయండి, పైరుకు గాలి వెలుతురు తగిలేలా చూడండి మరియు మాంకోజెబ్ లేదా కాపర్ ఆక్సిక్లోరైడ్ పిచికారీ చేయండి.`
    },
    weather: {
      en: `Regarding "${query}": Monitor daily weather alerts closely. Avoid foliar chemical sprays when high winds (>20 km/h) or rainfall are expected within 24 hours. During prolonged dry spells, apply light frequent irrigations in evening hours.`,
      hi: `"${query}" के संबंध में: कृषि मौसम का ध्यान रखें। तेज हवा या बारिश की संभावना में कीटनाशक छिड़काव न करें। लंबे सूखे के दौरान शाम के समय हल्की सिंचाई करें।`,
      te: `"${query}" విషయంలో: వాతావరణ మార్పులను గమనిస్తూ ఉండండి. వర్షం లేదా ఈదురుగాలులు ఉన్నప్పుడు ఎరువులు, పురుగుమందుల పిచికారీ ఆపండి. వేసవిలో సాయంత్రం వేళల్లోనే నీటి తడులు ఇవ్వండి.`
    },
    schemes: {
      en: `Regarding "${query}": Indian farmers can access subsidized institutional credit via Kisan Credit Card (KCC), direct PM-KISAN financial transfers, and risk protection through Pradhan Mantri Fasal Bima Yojana (PMFBY). Contact your nearest Agricultural Extension Officer or CSC center.`,
      hi: `"${query}" के संबंध में: किसान क्रेडिट कार्ड (KCC), पीएम-किसान सम्मान निधि, और फसल बीमा योजना (PMFBY) का लाभ उठाने के लिए अपने नजदीकी कृषि विकास अधिकारी (ADO) या जन सेवा केंद्र (CSC) से संपर्क करें।`,
      te: `"${query}" విషయంలో: పీఎం-కిసాన్, పంట బీమా యోజన, కిసాన్ క్రెడిట్ కార్డుల ద్వారా ప్రభుత్వం రాయితీలు మరియు పెట్టుబడి సహాయాన్ని అందిస్తోంది. పూర్తి వివరాలకు మండల వ్యవసాయ అధికారిని లేదా రైతు వేదికను సంప్రదించండి.`
    },
    general: {
      en: `Regarding "${query}": Sustainable farming depends on regular soil health testing, balanced fertilization, integrated pest control, and water conservation (drip/sprinkler). Always confirm specific chemical recommendations with your local agricultural university or extension officer.`,
      hi: `"${query}" के संबंध में: सफल और टिकाऊ खेती के लिए नियमित मिट्टी जांच, संतुलित खाद, जैविक कीट प्रबंधन और जल संरक्षण आवश्यक है। स्थानीय कृषि विज्ञान केंद्र (KVK) के परामर्श से ही खेती की योजना बनाएं।`,
      te: `"${query}" విషయంలో: స్థిరమైన వ్యవసాయం కోసం క్రమం తప్పకుండా భూసార పరీక్షలు చేయడం, సమతుల్య ఎరువులు వాడటం మరియు నీటి యాజమాన్యం పాటించడం చాలా ముఖ్యం. స్థానిక వ్యవసాయ అధికారుల సలహాలను అనుసరించండి.`
    }
  };

  const catMap = generalResponses[category] || generalResponses.general;
  return catMap[lang] || catMap.en;
}

/**
 * Optional Gemini generative AI invocation with strict agricultural guardrails
 */
async function callGeminiIfAvailable(query, lang = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are the AI Agriculture Advisor for Indian farmers. Answer the following question accurately, safely, and concisely (under 120 words).
Focus strictly on agronomy, crops, soil health, fertilizer timing, pest management, and farming precautions.
Target language: ${lang} (Provide response in this language using its standard script).
Question: "${query}"
Rules:
1. If the question is NOT related to agriculture or farming, refuse politely in the target language and invite farming questions.
2. Never invent chemical mixtures. Use standard ICAR/agricultural university recommendations.
3. Conclude with a brief reminder that recommendations are advisory.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.3 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    }
    return null;
  } catch {
    return null; // Graceful fallback to offline agronomy engine
  }
}

/**
 * Main Agricultural AI Query Processor
 */
export async function processFarmingQuery({ message, language = 'en', isVoice = false }) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message query must not be empty.');
  }

  const cleanMessage = message.trim();
  const normalizedLang = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn'].includes(language) 
    ? language 
    : 'en';

  // 1. Analyze query intent and check guardrails
  const { isOffTopic, category, matchedItem } = analyzeQueryIntent(cleanMessage);

  if (isOffTopic) {
    return {
      message: cleanMessage,
      response: getDeflectionMessage(normalizedLang),
      language: normalizedLang,
      category: QUERY_CATEGORIES.GENERAL,
      isVoice,
      tokensUsed: 15,
      source: 'guardrail_engine'
    };
  }

  // 2. Try Gemini API if key is configured
  const geminiResponse = await callGeminiIfAvailable(cleanMessage, normalizedLang);
  if (geminiResponse) {
    return {
      message: cleanMessage,
      response: geminiResponse,
      language: normalizedLang,
      category,
      isVoice,
      tokensUsed: 120,
      source: 'gemini_generative_ai'
    };
  }

  // 3. Robust domain agronomy knowledge synthesis
  const localResponse = synthesizeAgronomicResponse(cleanMessage, category, matchedItem, normalizedLang);

  return {
    message: cleanMessage,
    response: localResponse,
    language: normalizedLang,
    category,
    isVoice,
    tokensUsed: 45,
    source: 'agronomy_knowledge_engine'
  };
}
