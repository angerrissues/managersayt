---
description: Architecture, deployment, RAG pipeline, and operation rules for BOTTGMGR and Agency 82 MANAGERsayt
---

# BOTTGMGR & Agency 82 Management System Architecture

## 1. System Components & Architecture

### Backend (`e:\allproject\BOTTGMGR`)
- **Telethon Listener (`listener/userbot.py`, `listener/handlers.py`)**:
  - Uses session `nanocka_session.session`.
  - Stealth device parameters (Samsung Galaxy S23, Android 14, App 10.14.5).
  - **Telegram Chat Categorization Rules (`sync_folders()`)**:
    - `blogger`: all personal dialogs in the Telegram folder `'блогеры 🤩'` (64 chats).
    - `project`: all topic forums in the Telegram folder `'проекты 💗'` (30 chats).
    - `advertiser`: all unpinned, non-archived user and group dialogs in the main dialog list not belonging to blogger, project, or cosmetic folders (237+ chats).
    - `other`: Telegram folder `'косметика'`, pinned agency channels (`+82 AGENCY`, `82 agency работа`, `money +82`, `bothelpernanamg_bot`), general archive, bots, and announcement channels.
  - Ingests all messages to PostgreSQL (`messages` table) and asynchronous vectorization to ChromaDB (`messages_embeddings`, 126k+ vectors).
  - Implements an `unanswered_reminder_scheduler` checking chats every minute; triggers Telegram notifications to Manager ID `7915041131` if >5 hours have elapsed with no reply (work hours 10:00-22:00 MSK on weekdays).
  - Implements `ai_analyzer_job`: Runs 5x daily (every ~4.8 hours / 17,280 sec), targets STRICTLY `folder_category = 'advertiser'` silent > 7 days (excluding universal blacklist `ignored_chats_config`), analyzes dialog via DeepSeek, generates `/opt/bottgmgr/ai_reports/chat_{id}.txt`, saves status/summary/template in `ai_analyzed_chats`, and alerts Telegram Manager ID `7915041131`.
  - Implements internal aiohttp REST API on port `8080` secured by `X-API-Key: SECURE_API_KEY_82AGENCY_9918231`.
    - Routes: `/api/sync`, `/api/sync_folders`, `/api/ignore_status`, `/api/ignored_chats` (GET/POST/DELETE), `/api/ai_analyzed_chats`, `/api/ai_ignored_chats`, etc.

- **Aiogram 3 Public Assistant Bot (`public_bot/bot_main.py`, `public_bot/routers.py`)**:
  - Protected by `WhiteListMiddleware` (Manager IDs: `7915041131`, `1965048346`, `938375437`).
  - Handles `/start`, `/update` (manual sync trigger), Task Management menu (`📋 Задачи`), inline callbacks to edit/close tasks.
  - Passes user questions to `ai_rag/llm_router.py:answer_manager_question`.

- **AI RAG Pipeline (`ai_rag/`)**:
  - `llm_router.py`: Intent routing (`TASK_CREATION`, `BLOGGER_CROSS_SEARCH`, `USER_CHAT`, `GROUP_CHAT`, `GLOBAL_SEARCH`).
  - **Blogger & Financial Cross Search (`handle_blogger_cross_search`)**:
    - Triggered whenever a financial/deal keyword (`доход`, `рекламы`, `сделки`, `посчитай`, `заработал`, `гонорар`, `бюджет`) accompanies any name or chat title.
    - Contour 1: Blogger private chat/channel history (1,500 messages).
    - Contour 2: SQL full-text ILIKE across all advertiser, project, and group chats for blogger mentions.
    - Contour 3: ChromaDB vector semantic search for deals/offers.
    - MapReduce synthesis distinguishing confirmed deals (`[СОГЛАСОВАН]`), offers (`[ПРЕДЛОЖЕН]`), rejections (`[ОТКАЗ]`), unpaid (`[НЕ ОПЛАЧЕН]`).
  - `analyzer.py`: Dead advertiser chat sales audit and re-engagement template generation.
  - `prompts.py`: Detailed system prompts ensuring zero hallucination, strict timestamp preservation, and deal calculation.
  - `search.py` & `db/chroma_client.py`: Vector embeddings with `paraphrase-multilingual-MiniLM-L12-v2`.

### Frontend (`e:\allproject\MANAGERsayt\agency-82`)
- Next.js Admin Panel at `/admin` (`src/app/admin/page.tsx`).
- Connected to Telegram login & password auth (`actions/admin.ts`).
- Tabs: Задачи, Напоминания, Рассылка, Чат с ИИ, Генератор, Игнор-радар, Игнор-чаты, AI Аналитика.
- Deployed to Vercel from GitHub repository: `https://github.com/angerrissues/managersayt.git`.

## 2. Infrastructure & Deployment

### Production Server
- **Host**: `176.124.204.55` (Aeza Linux)
- **User**: `root`
- **Systemd Services**:
  - `bottgmgr-listener.service` (`/opt/bottgmgr/listener/userbot.py`)
  - `bottgmgr-bot.service` (`/opt/bottgmgr/public_bot/bot_main.py`)
- **Deploying backend**:
  - Transfer changed files to `/opt/bottgmgr/` via SFTP (paramiko).
  - Restart services: `systemctl restart bottgmgr-listener` and `systemctl restart bottgmgr-bot`.
- **Deploying frontend**:
  - Commit & push to `main` branch of `agency-82` git repo (auto-deployed on Vercel).

### Database (PostgreSQL)
- Hosted on Supabase AWS London pooler (`aws-1-eu-west-2.pooler.supabase.com:5432`).
- Primary tables: `chats`, `messages`, `reminders`, `tasks`, `ignored_dialogs`, `ignored_chats_config`, `ai_analyzed_chats`.
