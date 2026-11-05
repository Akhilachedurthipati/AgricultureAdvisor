# AGRICULTURE ADVISOR – SYSTEM ARCHITECTURE

## 1. High-Level Architecture Overview

Agriculture Advisor is an AI-powered, multilingual agricultural advisory web application built on the MERN stack with machine learning, image classification, weather intelligence, and conversational AI.

```mermaid
graph TD
    User["Farmer / User (Browser / Mobile / Desktop)"]
    
    subgraph Frontend["Frontend Layer (React + Vite)"]
        UI["Modern Nature-Themed UI (Tailwind CSS + Lucide Icons)"]
        STT["Speech Recognition API (Voice Input)"]
        TTS["Speech Synthesis API (Voice Output)"]
        i18n["Multilingual Engine (i18next - 8+ Indian Languages)"]
        AxiosClient["Axios HTTP Client"]
    end

    subgraph Backend["Backend Layer (Node.js + Express REST API)"]
        AuthMiddleware["JWT Authentication & Security Middleware"]
        CropController["Crop Recommendation Controller"]
        FertController["Fertilizer Recommendation Controller"]
        DiseaseController["Disease Detection Controller (Multer)"]
        WeatherController["Weather Service Controller"]
        ChatController["Multilingual AI Farming Chat Controller"]
        HistoryController["Recommendation History Controller"]
    end

    subgraph Intelligence["AI & ML Services"]
        CropML["Crop ML Pipeline (Decision Tree / Random Forest / Agronomy Rules)"]
        DiseaseModel["Crop Disease Inference Engine"]
        WeatherAPI["OpenWeatherMap / Weather Intelligence API"]
        GenAI["Google Gemini / LLM Farming Assistant"]
    end

    subgraph Database["Database Layer (MongoDB)"]
        UserCol["Users Collection"]
        CropCol["Crop Recommendations"]
        FertCol["Fertilizer Recommendations"]
        DiseaseCol["Disease Reports"]
        ChatCol["Chat Histories"]
    end

    User --> UI
    UI --> STT
    UI --> TTS
    UI --> i18n
    UI --> AxiosClient
    
    AxiosClient --> Backend
    Backend --> AuthMiddleware
    
    CropController --> CropML
    FertController --> CropML
    DiseaseController --> DiseaseModel
    WeatherController --> WeatherAPI
    ChatController --> GenAI
    
    Backend --> Database
```

---

## 2. Directory Structure

```
Agriculture-Advisor/
├── client/
│   ├── public/
│   │   ├── images/
│   │   └── models/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   └── forms/
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── LanguageContext.jsx
│       ├── hooks/
│       │   ├── useSpeechRecognition.js
│       │   └── useSpeechSynthesis.js
│       ├── i18n/
│       │   ├── config.js
│       │   └── locales/ (en, te, hi, ta, kn, ml, mr, bn)
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── CropRecommendation.jsx
│       │   ├── FertilizerRecommendation.jsx
│       │   ├── DiseaseDetection.jsx
│       │   ├── WeatherMonitoring.jsx
│       │   ├── AIFarmingAssistant.jsx
│       │   ├── RecommendationHistory.jsx
│       │   └── UserProfile.jsx
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── cropService.js
│       │   ├── fertilizerService.js
│       │   ├── diseaseService.js
│       │   ├── weatherService.js
│       │   ├── chatService.js
│       │   └── historyService.js
│       ├── utils/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── crop.controller.js
│   │   │   ├── fertilizer.controller.js
│   │   │   ├── disease.controller.js
│   │   │   ├── weather.controller.js
│   │   │   ├── chat.controller.js
│   │   │   └── history.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── CropRecommendation.js
│   │   │   ├── FertilizerRecommendation.js
│   │   │   ├── DiseaseReport.js
│   │   │   └── ChatHistory.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── crop.routes.js
│   │   │   ├── fertilizer.routes.js
│   │   │   ├── disease.routes.js
│   │   │   ├── weather.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── history.routes.js
│   │   │   └── health.routes.js
│   │   ├── services/
│   │   │   ├── ai.service.js
│   │   │   ├── weather.service.js
│   │   │   └── fertilizer.service.js
│   │   ├── ml/
│   │   │   ├── cropPredictor.js
│   │   │   └── diseaseClassifier.js
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
│
├── docs/
├── PROJECT_STATUS.md
├── DEVELOPMENT_LOG.md
├── NEXT_SESSION.md
├── TASK_CHECKLIST.md
├── ARCHITECTURE.md
├── README.md
└── .gitignore
```

---

## 3. Database Schema Specifications

### `User`
- `name`: String, required, trimmed
- `email`: String, required, unique, lowercase, trimmed
- `password`: String, required (hashed via bcryptjs)
- `phone`: String, optional
- `preferredLanguage`: String, default 'en'
- `location`: { `state`: String, `district`: String, `city`: String }
- `timestamps`: true

### `CropRecommendation`
- `userId`: ObjectId (ref: 'User'), required, indexed
- `inputs`: {
    `soilType`: String,
    `season`: String,
    `temperature`: Number,
    `humidity`: Number,
    `ph`: Number,
    `rainfall`: Number
  }
- `recommendation`: {
    `cropName`: String,
    `confidenceScore`: Number,
    `suitabilityReason`: String,
    `cultivationTips`: String
  }
- `disclaimer`: String
- `timestamps`: true

### `FertilizerRecommendation`
- `userId`: ObjectId (ref: 'User'), required, indexed
- `inputs`: {
    `soilType`: String,
    `season`: String,
    `crop`: String,
    `nitrogen`: Number,
    `phosphorus`: Number,
    `potassium`: Number,
    `landArea`: Number,
    `landAreaUnit`: String
  }
- `recommendation`: {
    `fertilizerName`: String,
    `reason`: String,
    `nutrientAnalysis`: String,
    `applicationGuidance`: String,
    `safetyPrecautions`: [String]
  }
- `disclaimer`: String
- `timestamps`: true

### `DiseaseReport`
- `userId`: ObjectId (ref: 'User'), required, indexed
- `imageMetadata`: {
    `filename`: String,
    `fileSize`: Number,
    `mimetype`: String
  }
- `detection`: {
    `diseaseName`: String,
    `isHealthy`: Boolean,
    `confidenceScore`: Number,
    `symptoms`: [String],
    `causes`: [String],
    `prevention`: [String],
    `treatment`: [String]
  }
- `disclaimer`: String
- `timestamps`: true

### `ChatHistory`
- `userId`: ObjectId (ref: 'User'), required, indexed
- `title`: String
- `language`: String
- `messages`: [
    {
      `role`: String ('user' | 'assistant'),
      `content`: String,
      `timestamp`: Date
    }
  ]
- `timestamps`: true

---

## 4. Key Security & Operational Principles
1. **Never Commit Secrets:** All API keys and secrets stored strictly in `.env`.
2. **Input Validation:** Zod schemas validate all API request payloads before execution.
3. **Data Isolation:** History endpoints strictly enforce `userId` filtering from verified JWT tokens.
4. **Advisory Clarification:** Agricultural recommendations provide clear disclaimers that output is advisory and not a replacement for certified soil testing or localized agricultural extension officers.

