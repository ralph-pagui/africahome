// AfricaHome AI Chatbot - Powered by Groq
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Tu es l'assistant IA officiel d'AfricaHome, la plateforme immobilière leader en Afrique. Tu t'appelles "Afi" (Assistant AfricaHome Intelligence).

🏠 À PROPOS D'AFRICAHOME :
- Plateforme immobilière couvrant le Cameroun, Sénégal, Côte d'Ivoire, RD Congo, Gabon, Congo, Mali, Burkina Faso
- Types de biens : Chambres, Studios, Appartements, Maisons, Terrains, Plans 3D
- Catégories : Location, Vente, Terrain, Construction
- Services pro : Construction, Électricité, Plomberie, Maçonnerie, Électroménager, Meubles, Décoration

👥 TYPES DE COMPTES :
1. Locataire — Paiement unique 1 500 FCFA pour accéder aux contacts des annonces
2. Bailleur — Abonnement mensuel (2 500 FCFA) ou annuel (15 000 FCFA) pour publier des annonces
3. Professionnel — Abonnement mensuel (15 000 FCFA) ou annuel (120 000 FCFA), nécessite vérification d'identité (CNI, NIU, document officiel)

🔐 VÉRIFICATION PROFESSIONNELLE :
- Les pros doivent soumettre : Photo CNI, Numéro CNI, NIU/RCCM, Document officiel
- Processus : Soumission → En attente → Revue admin → Approuvé/Rejeté
- Un admin vérifie manuellement les 6 critères de vérification

💳 PAIEMENT :
- Orange Money / Mobile Money
- Flutterwave pour les paiements en ligne

📱 FONCTIONNALITÉS :
- Recherche par pays, ville, quartier, type de bien
- Géolocalisation des biens sur carte
- Favoris et notifications
- Système d'avis et notes
- Tableau de bord personnalisé par type de compte
- Photos et vidéos des biens

RÈGLES :
- Réponds TOUJOURS en français
- Sois chaleureux, professionnel et concis
- Si on te pose une question hors sujet (pas liée à l'immobilier ou AfricaHome), réponds poliment que tu es spécialisé dans l'aide immobilière sur AfricaHome
- Utilise des emojis modérément pour rendre les réponses agréables
- Ne donne JAMAIS de fausses informations sur les prix ou fonctionnalités
- Propose toujours des actions concrètes (ex: "Consultez nos annonces sur la page Annonces")
- Reste bref : 2-4 phrases max par réponse sauf si l'utilisateur demande plus de détails`;

let chatHistory = [];
let isOpen = false;
let isLoading = false;

export function initChatbot() {
  const container = document.createElement('div');
  container.id = 'chatbot-root';
  container.innerHTML = getChatbotHTML();
  document.body.appendChild(container);

  // Event listeners
  document.getElementById('chat-toggle').addEventListener('click', toggleChat);
  document.getElementById('chat-close').addEventListener('click', toggleChat);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  document.getElementById('chat-send').addEventListener('click', sendMessage);

  // Quick action buttons
  document.querySelectorAll('.chat-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      document.getElementById('chat-input').value = msg;
      sendMessage();
    });
  });
}

function getChatbotHTML() {
  return `
    <!-- CHAT TOGGLE BUBBLE -->
    <button id="chat-toggle" class="chat-bubble" aria-label="Ouvrir le chat">
      <div class="chat-bubble-icon">
        <i class="fas fa-comments"></i>
      </div>
      <div class="chat-bubble-pulse"></div>
      <div class="chat-bubble-badge" id="chat-badge" style="display:none">1</div>
    </button>

    <!-- CHAT WINDOW -->
    <div id="chat-window" class="chat-window">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="chat-avatar">
            <img src="/logo.jpg" alt="Afi" />
            <div class="chat-online-dot"></div>
          </div>
          <div>
            <div class="chat-header-name">Afi · Assistant IA</div>
            <div class="chat-header-status"><i class="fas fa-bolt" style="font-size:.55rem"></i> Propulsé par IA</div>
          </div>
        </div>
        <button id="chat-close" class="chat-close-btn" aria-label="Fermer">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" id="chat-messages">
        <!-- Welcome message -->
        <div class="chat-msg chat-msg-bot">
          <div class="chat-msg-avatar"><img src="/logo.jpg" alt="Afi" /></div>
          <div class="chat-msg-content">
            <div class="chat-msg-bubble">
              Bonjour ! 👋 Je suis <strong>Afi</strong>, votre assistant AfricaHome. Comment puis-je vous aider aujourd'hui ?
            </div>
            <div class="chat-msg-time">Maintenant</div>
          </div>
        </div>
        <!-- Quick actions -->
        <div class="chat-quick-actions">
          <button class="chat-quick-btn" data-msg="Comment publier une annonce ?"><i class="fas fa-plus-circle"></i> Publier une annonce</button>
          <button class="chat-quick-btn" data-msg="Quels sont vos tarifs ?"><i class="fas fa-tag"></i> Voir les tarifs</button>
          <button class="chat-quick-btn" data-msg="Comment devenir professionnel vérifié ?"><i class="fas fa-shield-alt"></i> Vérification Pro</button>
          <button class="chat-quick-btn" data-msg="Comment trouver un logement ?"><i class="fas fa-search"></i> Chercher un bien</button>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <textarea id="chat-input" placeholder="Posez votre question..." rows="1"></textarea>
          <button id="chat-send" class="chat-send-btn" aria-label="Envoyer">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="chat-powered">
          <i class="fas fa-robot" style="font-size:.6rem"></i> IA AfricaHome · Réponses instantanées
        </div>
      </div>
    </div>
  `;
}

function toggleChat() {
  isOpen = !isOpen;
  const win = document.getElementById('chat-window');
  const bubble = document.getElementById('chat-toggle');
  const badge = document.getElementById('chat-badge');

  if (isOpen) {
    win.classList.add('open');
    bubble.classList.add('hidden');
    badge.style.display = 'none';
    setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
  } else {
    win.classList.remove('open');
    bubble.classList.remove('hidden');
  }
}

function addMessage(content, isUser = false) {
  const container = document.getElementById('chat-messages');
  const quickActions = container.querySelector('.chat-quick-actions');
  if (quickActions) quickActions.remove();

  const now = new Date();
  const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-bot'}`;

  if (isUser) {
    msgDiv.innerHTML = `
      <div class="chat-msg-content">
        <div class="chat-msg-bubble">${escapeHtml(content)}</div>
        <div class="chat-msg-time">${time}</div>
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="chat-msg-avatar"><img src="/logo.jpg" alt="Afi" /></div>
      <div class="chat-msg-content">
        <div class="chat-msg-bubble">${formatBotMessage(content)}</div>
        <div class="chat-msg-time">${time}</div>
      </div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  return msgDiv;
}

function addTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg chat-msg-bot chat-typing';
  typing.id = 'chat-typing';
  typing.innerHTML = `
    <div class="chat-msg-avatar"><img src="/logo.jpg" alt="Afi" /></div>
    <div class="chat-msg-content">
      <div class="chat-msg-bubble">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById('chat-typing')?.remove();
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg || isLoading) return;

  input.value = '';
  input.style.height = 'auto';
  isLoading = true;

  // Add user message
  addMessage(msg, true);

  // Add to history
  chatHistory.push({ role: 'user', content: msg });

  // Show typing indicator
  addTypingIndicator();

  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      removeTypingIndicator();
      addMessage("⚠️ La clé API Groq n'est pas configurée. Ajoutez `VITE_GROQ_API_KEY` dans votre fichier `.env` pour activer l'assistant IA.");
      isLoading = false;
      return;
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(-10) // Keep last 10 messages for context
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 512,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erreur ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    removeTypingIndicator();
    addMessage(reply);
    chatHistory.push({ role: 'assistant', content: reply });

  } catch (error) {
    removeTypingIndicator();
    addMessage(`❌ Erreur : ${error.message}. Veuillez réessayer.`);
  }

  isLoading = false;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatBotMessage(text) {
  // Convert markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}
