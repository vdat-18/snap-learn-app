# SnapLearn — AI-Powered Vocabulary Camera

> **Turn passive screen time into active vocabulary building** — Point your camera at anything, capture the word, learn to pronounce it, build your collection.

**LotusHack x HackHarvard 2026 | Edtech Track**

---

## The Problem

Smartphones are everywhere. Kids use them to consume passive, low-value content on TikTok and YouTube. Parents feel guilty but have no compelling alternative.

In Vietnam specifically:
- **8 million** kids aged 6-10 learning English
- Parents spend **$50-200/month** on tutoring
- Between classes? Zero engaging practice
- Result: Vietnam ranks **58th globally** in English proficiency

## The Solution

SnapLearn turns that same smartphone into an active exploration tool:

1. **📷 Snap** — Point camera at any object
2. **🤖 Learn** — AI identifies it in Vietnamese + English
3. **🔊 Listen** — TTS plays the pronunciation
4. **🎤 Speak** — Child pronounces the word
5. **⭐ Collect** — AI checks pronunciation, awards points, adds to collection

Kids explore, collect, level up, and compete — Pokémon Go for vocabulary.

## Demo Video

[Coming soon]

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Flutter + Dart |
| **Backend** | FastAPI (Python) |
| **Vision AI** | Claude Sonnet 3.5 |
| **Text-to-Speech** | Google Cloud TTS |
| **Speech-to-Text** | Google Cloud STT |
| **Database** | Supabase (PostgreSQL) |

## Quick Start

### Prerequisites

- Flutter SDK 3.x
- Python 3.11+
- Supabase account
- API keys: Anthropic (Claude), Google Cloud (TTS/STT)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/snap-learn-app.git
cd snap-learn-app

# Backend setup
cd app/be
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn main:app --reload

# Frontend setup (new terminal)
cd ../fe
flutter pub get
flutter run
```

### Environment Variables

```bash
# Backend .env
ANTHROPIC_API_KEY=your_key
GOOGLE_CLOUD_PROJECT=your_project
GOOGLE_CLOUD_KEY_FILE=path_to_service_account.json
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

## Features

### Core Loop (Hackathon MVP)
- 📷 **Camera capture** — Point and snap any object
- 🤖 **AI identification** — Vision API recognizes objects in Vietnamese + English
- 🔊 **Audio playback** — TTS speaks both languages
- 🎤 **Pronunciation check** — ASR validates speech ("if the AI understands you, a native speaker would too")
- ⭐ **Rarity & points** — Common → Uncommon → Rare → Epic → Legendary
- 📖 **Words Vault** — Collection of captured vocabulary cards
- 🏆 **Leaderboard** — Global ranking

### The Innovation

The camera creates **shared visual context** between child and AI. The snap is a disguised prompt — the child doesn't feel like they're talking to a chatbot. The AI feels proactive, responding to a shared discovery in the real world.

### Coming Soon
- 🇨🇳 Chinese language support
- 🎯 Daily/weekly missions
- 👨‍👩‍👧 Parent dashboard
- 🏫 School deployments
- 💬 Conversational AI ("Is that your cat? What's its name?")
- 🧸 Hardware devices (SnapBear plush toy)

## Team

We're 4 enterprise AI engineers who build AI systems professionally. For this hackathon, we challenged ourselves with a consumer problem — where the user is a 6-year-old who can't read and the UX must be purely intuitive.

| Name | Role |
|------|------|
| TBD | Product & Design |
| TBD | AI Engineer |
| TBD | AI Engineer |
| TBD | AI Engineer |

## Why We Built This

> "My daughter is two and a half. She already grabs my phone and demands YouTube. I wanted to build something where handing over the phone feels like good parenting — not guilt."

## License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with ❤️ for Vietnamese kids learning English | [LotusHack 2026](https://lotushack.dev)
>>>>>>> 692338d (docs(readme): add detailed project overview and setup instructions)
# SnapLearn — AI-Powered Vocabulary Camera

> **Turn passive screen time into active vocabulary building** — Point your camera at anything, capture the word, learn to pronounce it, build your collection.

**LotusHack x HackHarvard 2026 | Edtech Track**

---

## The Problem

Smartphones are everywhere. Kids use them to consume passive, low-value content on TikTok and YouTube. Parents feel guilty but have no compelling alternative.

In Vietnam specifically:
- **8 million** kids aged 6-10 learning English
- Parents spend **$50-200/month** on tutoring
- Between classes? Zero engaging practice
- Result: Vietnam ranks **58th globally** in English proficiency

## The Solution

SnapLearn turns that same smartphone into an active exploration tool:

1. **📷 Snap** — Point camera at any object
2. **🤖 Learn** — AI identifies it in Vietnamese + English
3. **🔊 Listen** — TTS plays the pronunciation
4. **🎤 Speak** — Child pronounces the word
5. **⭐ Collect** — AI checks pronunciation, awards points, adds to collection

Kids explore, collect, level up, and compete — Pokémon Go for vocabulary.

## Demo Video

[Coming soon]

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Flutter + Dart |
| **Backend** | FastAPI (Python) |
| **Vision AI** | Claude Sonnet 3.5 |
| **Text-to-Speech** | Google Cloud TTS |
| **Speech-to-Text** | Google Cloud STT |
| **Database** | Supabase (PostgreSQL) |

## Quick Start

### Run on Your Phone 📱

Follow these simple steps to see the app on your phone.

#### Step 1: Same WiFi
Connect your **Computer** and your **Phone** to the **same WiFi** network. This is very important!

#### Step 2: Start the App
On your computer, open the Terminal and run this command:
```bash
cd app/fe
npm run dev -- --host
```

#### Step 3: Find the Address
Look at your computer screen. You will see something like this:
- **Local:** http://localhost:5173
- **Network:** http://192.168.1.5:5173  <-- **Copy this one!**

#### Step 4: Open on Phone
1. Open the Browser (Safari or Chrome) on your phone.
2. Type the **Network address** (from Step 3) into your phone.
3. Now you can play SnapLearn on your phone!

---
**Note:** If it does not work, check your computer's Firewall or make sure the WiFi is really the same.

### Prerequisites

- Flutter SDK 3.x
- Python 3.11+
- Supabase account
- API keys: Anthropic (Claude), Google Cloud (TTS/STT)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/snap-learn-app.git
cd snap-learn-app

# Backend setup
cd app/be
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn main:app --reload

# Frontend setup (new terminal)
cd ../fe
flutter pub get
flutter run
```

### Environment Variables

```bash
# Backend .env
ANTHROPIC_API_KEY=your_key
GOOGLE_CLOUD_PROJECT=your_project
GOOGLE_CLOUD_KEY_FILE=path_to_service_account.json
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

## Features

### Core Loop (Hackathon MVP)
- 📷 **Camera capture** — Point and snap any object
- 🤖 **AI identification** — Vision API recognizes objects in Vietnamese + English
- 🔊 **Audio playback** — TTS speaks both languages
- 🎤 **Pronunciation check** — ASR validates speech ("if the AI understands you, a native speaker would too")
- ⭐ **Rarity & points** — Common → Uncommon → Rare → Epic → Legendary
- 📖 **Words Vault** — Collection of captured vocabulary cards
- 🏆 **Leaderboard** — Global ranking

### The Innovation

The camera creates **shared visual context** between child and AI. The snap is a disguised prompt — the child doesn't feel like they're talking to a chatbot. The AI feels proactive, responding to a shared discovery in the real world.

### Coming Soon
- 🇨🇳 Chinese language support
- 🎯 Daily/weekly missions
- 👨‍👩‍👧 Parent dashboard
- 🏫 School deployments
- 💬 Conversational AI ("Is that your cat? What's its name?")
- 🧸 Hardware devices (SnapBear plush toy)

## Team

We're 4 enterprise AI engineers who build AI systems professionally. For this hackathon, we challenged ourselves with a consumer problem — where the user is a 6-year-old who can't read and the UX must be purely intuitive.

| Name | Role |
|------|------|
| TBD | Product & Design |
| TBD | AI Engineer |
| TBD | AI Engineer |
| TBD | AI Engineer |

## Why We Built This

> "My daughter is two and a half. She already grabs my phone and demands YouTube. I wanted to build something where handing over the phone feels like good parenting — not guilt."

## License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with ❤️ for Vietnamese kids learning English | [LotusHack 2026](https://lotushack.dev)
=======
# SnapLearn — AI-Powered Vocabulary Camera

> **Turn passive screen time into active vocabulary building** — Point your camera at anything, capture the word, learn to pronounce it, build your collection.

**LotusHack x HackHarvard 2026 | Edtech Track**

---

## The Problem

Smartphones are everywhere. Kids use them to consume passive, low-value content on TikTok and YouTube. Parents feel guilty but have no compelling alternative.

In Vietnam specifically:
- **8 million** kids aged 6-10 learning English
- Parents spend **$50-200/month** on tutoring
- Between classes? Zero engaging practice
- Result: Vietnam ranks **58th globally** in English proficiency

## The Solution

SnapLearn turns that same smartphone into an active exploration tool:

1. **📷 Snap** — Point camera at any object
2. **🤖 Learn** — AI identifies it in Vietnamese + English
3. **🔊 Listen** — TTS plays the pronunciation
4. **🎤 Speak** — Child pronounces the word
5. **⭐ Collect** — AI checks pronunciation, awards points, adds to collection

Kids explore, collect, level up, and compete — Pokémon Go for vocabulary.

## Demo Video

[Coming soon]

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Flutter + Dart |
| **Backend** | FastAPI (Python) |
| **Vision AI** | Claude Sonnet 3.5 |
| **Text-to-Speech** | Google Cloud TTS |
| **Speech-to-Text** | Google Cloud STT |
| **Database** | Supabase (PostgreSQL) |

## Quick Start

### Prerequisites

- Flutter SDK 3.x
- Python 3.11+
- Supabase account
- API keys: Anthropic (Claude), Google Cloud (TTS/STT)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/snap-learn-app.git
cd snap-learn-app

# Backend setup
cd app/be
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn main:app --reload

# Frontend setup (new terminal)
cd ../fe
flutter pub get
flutter run
```

### Environment Variables

```bash
# Backend .env
ANTHROPIC_API_KEY=your_key
GOOGLE_CLOUD_PROJECT=your_project
GOOGLE_CLOUD_KEY_FILE=path_to_service_account.json
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

## Features

### Core Loop (Hackathon MVP)
- 📷 **Camera capture** — Point and snap any object
- 🤖 **AI identification** — Vision API recognizes objects in Vietnamese + English
- 🔊 **Audio playback** — TTS speaks both languages
- 🎤 **Pronunciation check** — ASR validates speech ("if the AI understands you, a native speaker would too")
- ⭐ **Rarity & points** — Common → Uncommon → Rare → Epic → Legendary
- 📖 **Words Vault** — Collection of captured vocabulary cards
- 🏆 **Leaderboard** — Global ranking

### The Innovation

The camera creates **shared visual context** between child and AI. The snap is a disguised prompt — the child doesn't feel like they're talking to a chatbot. The AI feels proactive, responding to a shared discovery in the real world.

### Coming Soon
- 🇨🇳 Chinese language support
- 🎯 Daily/weekly missions
- 👨‍👩‍👧 Parent dashboard
- 🏫 School deployments
- 💬 Conversational AI ("Is that your cat? What's its name?")
- 🧸 Hardware devices (SnapBear plush toy)

## Team

We're 4 enterprise AI engineers who build AI systems professionally. For this hackathon, we challenged ourselves with a consumer problem — where the user is a 6-year-old who can't read and the UX must be purely intuitive.

| Name | Role |
|------|------|
| TBD | Product & Design |
| TBD | AI Engineer |
| TBD | AI Engineer |
| TBD | AI Engineer |

## Why We Built This

> "My daughter is two and a half. She already grabs my phone and demands YouTube. I wanted to build something where handing over the phone feels like good parenting — not guilt."

## License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with ❤️ for Vietnamese kids learning English | [LotusHack 2026](https://lotushack.dev)
>>>>>>> 692338d (docs(readme): add detailed project overview and setup instructions)
