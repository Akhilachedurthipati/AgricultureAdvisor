# 🌾 AGRICULTURE ADVISOR – EXAMINER QUICK CHEAT SHEET
## 1-Page Rapid Reference Card for Viva Voce & Code Review

---

### 1. Project At A Glance
- **Title:** AGRICULTURE ADVISOR: Smart Multilingual Agricultural Decision Support System
- **Level:** B.Tech Major Project in Computer Science and Engineering (AI & ML)
- **Primary Architecture:** MERN (React 18 + Node.js/Express + MongoDB) + Pure-Node Embedded ML Models
- **Test Coverage:** **10 Test Suites, 90 Automated Tests, 100% Passing**

---

### 2. Key Architecture Files
| Module / Capability | Core Files | Key Technology |
|---|---|---|
| **Module 1: Crop ML** | `server/src/ml/cropPredictor.js`<br>`server/src/ml/model/crop_model.json` | Gaussian Naive Bayes / Random Forest (98.86% acc), Log-Sum-Exp Softmax |
| **Module 2: Fertilizer Engine** | `server/src/services/fertilizer.service.js` | ICAR/STCR formulas, 50-kg bags, Urea-DAP nitrogen deduction |
| **Module 3: Multi-Crop Disease** | `server/src/ml/diseaseClassifier.js`<br>`server/src/ml/model/disease_model.json` | 8-D foliar feature extraction (ExG, HSV, necrosis), 26 classes, 7 crops |
| **Module 4: Weather Alerts** | `server/src/services/weather.service.js` | Open-Meteo API, 10-min cache, 6 agricultural early warning triggers |
| **Module 5: AI Voice Assistant** | `server/src/services/ai.service.js`<br>`client/src/pages/AIFarmingAssistant.jsx` | Web Speech STT/TTS, 7-category knowledge base, safety guardrail regex |
| **Module 6: Multilingual UI** | `client/src/i18n/config.js`<br>`client/src/i18n/locales/` (8 languages) | `i18next`, 8 Indian languages (en, hi, te, ta, kn, ml, mr, bn), profile sync |
| **Module 7: Authentication** | `server/src/middleware/auth.middleware.js`<br>`server/src/controllers/auth.controller.js` | JWT, bcryptjs (10 rounds), Zod input schemas, Helmet security |
| **Module 8: History & Isolation** | `server/src/controllers/history.controller.js`<br>`client/src/pages/RecommendationHistory.jsx` | Unified aggregation across 4 models, 403 multi-tenant isolation, disk cleanup |

---

### 3. Key Mathematical & Algorithmic Formulations

#### A. Crop Prediction Posterior Probability
$$P(C_k \mid \mathbf{x}) = \frac{P(C_k) \prod_{i=1}^n P(x_i \mid C_k)}{\sum_{j=1}^K P(C_j) \prod_{i=1}^n P(x_i \mid C_j)}$$
Evaluated using log probabilities to prevent numerical underflow:
$$\ln P(C_k \mid \mathbf{x}) = \ln P(C_k) + \sum_{i=1}^n \ln P(x_i \mid C_k) - \text{LogSumExp}_j$$

#### B. Precision Nitrogen Balance with DAP Deduction
$$\text{DAP Required (kg)} = \frac{\text{Target } P_2O_5 \text{ (kg)}}{0.46}$$
$$\text{Starter N from DAP (kg)} = \text{DAP Required (kg)} \times 0.18$$
$$\text{Net Urea Required (kg)} = \frac{\text{Target N (kg)} - \text{Starter N from DAP (kg)}}{0.46}$$
$$\text{Commercial 50-kg Bags} = \left\lceil \frac{\text{Net Fertilizer (kg)}}{50} \right\rceil$$

#### C. Foliar Chlorophyll & Pathology Feature Extraction
$$\text{Excess Green Index (ExG)} = 2G - R - B$$
$$\text{Healthy Chlorophyll Condition: } \text{ExG} > 10 \quad \land \quad H \in [70^\circ, 165^\circ]$$
$$\text{Necrotic Lesion Condition: } H \in [10^\circ, 42^\circ] \quad \lor \quad V \le 0.28$$
$$\text{Pathology Guardrail: } \text{necroticRatio} \ge 0.07 \implies P(\text{Healthy} \mid \mathbf{x}) \leftarrow -\infty$$

---

### 4. How To Run Commands For Examiner

#### A. Run Dev Servers
```powershell
# In Root directory:
npm run server    # Backend on http://localhost:5000
npm run client    # Frontend on http://localhost:5173
```

#### B. Run All 10 Automated Test Suites (90 Tests)
```powershell
npm test --prefix server
# or from root:
npm run test:server
```

#### C. Run Master End-to-End System Integration Test
```powershell
npm run test:master
```

#### D. Verify Production Client Build
```powershell
npm run build:client
```
