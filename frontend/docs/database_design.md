# Database Design

## Database
MongoDB

## Collections

### 1. Users

Fields:
- _id
- fullName
- email
- password
- language
- createdAt

---

### 2. Disease Reports

Fields:
- _id
- userId
- image
- diseaseName
- description
- pesticides
- createdAt

---

### 3. Chat History

Fields:
- _id
- userId
- question
- answer
- createdAt

---

### 4. Soil Analysis

Fields:
- _id
- userId
- soilType
- location
- recommendedCrop
- sowingTime
- createdAt