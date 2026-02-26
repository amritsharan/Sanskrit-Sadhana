# Sanskrita Sadhana (संस्कृत साधना)

Master the divine sounds of Sanskrit with AI-guided precision. Sanskrita Sadhana is an intelligent pronunciation evaluator that helps users perfect their recitation of ancient shlokas through advanced phonetic analysis.

## 🌟 Features

- **Phonetic Evaluation**: Real-time analysis of your pronunciation against standard Sanskrit phonetic rules.
- **Reference Audio**: High-quality archival audio for every shloka to guide your practice.
- **Custom Practice**: Type in English (IAST) and instantly manifest Devanagari script for any custom verse.
- **Detailed Insights**: Granular feedback on specific phonemes, showing exactly where your pronunciation differs from the reference.
- **Premium UI**: A glassmorphic, responsive design with Light/Dark mode transitions.
- **Session History**: Track your practice journey with a persistent login history.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Auth**: Custom Context-based Auth System with LocalStorage persistence.

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Logic**: Custom G2P (Grapheme-to-Phoneme) and Phonetic Alignment algorithms.
- **Platform**: Python 3.x

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python main.py
   ```

## 📖 How to Use
1. **Sign Up/Login**: Create a simple account to begin.
2. **Select a Verse**: Choose from the library of classic shlokas.
3. **Listen**: Press the "Reference" button to hear how the verse should sound.
4. **Record**: Click the Microphone icon and recite the verse.
5. **Analyze**: Let the AI evaluate your performance and provide detailed phonetic insights.

---
*Developed with devotion to the preserving the sounds of the ancient world.*
