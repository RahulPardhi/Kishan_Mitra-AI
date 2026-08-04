# Kisan Mitra AI - API Documentation

## Base URL

http://localhost:5000/api

---

# Authentication APIs

### Register User

**Method:** POST

**Endpoint:**
/auth/register

**Description:**
Create a new user account.

---

### Login User

**Method:** POST

**Endpoint:**
/auth/login

**Description:**
Authenticate user and return login response.

---

# Crop Disease Detection APIs

### Upload Crop Image

**Method:** POST

**Endpoint:**
/disease/upload

**Description:**
Upload a crop or leaf image for AI disease detection.

---

### Analyze Disease

**Method:** POST

**Endpoint:**
/disease/analyze

**Description:**
Analyze the uploaded image and return:
- Disease Name
- Disease Description
- Recommended Pesticides

---

# AI Chatbot APIs

### Ask AI

**Method:** POST

**Endpoint:**
/chat

**Description:**
Send farming-related questions to the AI chatbot.

---

# Soil Analyzer APIs

### Analyze Soil

**Method:** POST

**Endpoint:**
/soil/analyze

**Description:**
Analyze soil information and recommend:
- Suitable Crop
- Best Seed
- Sowing Time

---

# Weather APIs

### Get Weather

**Method:** GET

**Endpoint:**
/weather

**Description:**
Fetch current weather information including:
- Temperature
- Humidity
- Wind Speed
- Rain Prediction

---

# Voice Assistant APIs

### Voice Query

**Method:** POST

**Endpoint:**
/voice

**Description:**
Receive voice input, convert speech to text, process the request, and return an AI response.

---

# Language APIs

### Get Languages

**Method:** GET

**Endpoint:**
/language

**Description:**
Return available application languages.

---

### Update Language

**Method:** PUT

**Endpoint:**
/language

**Description:**
Update the user's preferred language.