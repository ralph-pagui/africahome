require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cloudinary = require('cloudinary').v2;
const connectDB = require('./config/db');

// Connect to Database
connectDB().then(async () => {
  // Auto-create admin user if none exists
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ type: 'admin' });
    if (!adminExists) {
      await User.create({
        type: 'admin',
        name: 'Admin AfricaHome',
        phone: '+237000000000',
        email: 'admin@africahome.com',
        password: 'admin2026',
        country: 'Cameroun',
        city: 'Douala',
        verified: true
      });
      console.log('🛡️ Compte admin créé automatiquement (phone: +237000000000, mot de passe: admin2026)');
    }
  } catch (err) {
    console.log('ℹ️ Admin check:', err.message);
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable CSP for now (frontend loads external fonts/icons)
}));

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost',       // Android Capacitor WebView
    'capacitor://localhost',  // iOS Capacitor WebView
    /\.vercel\.app$/
  ],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 2000,
  message: { success: false, message: 'Trop de requêtes, réessayez dans 15 minutes' }
});
app.use('/api/', limiter);

// Static files
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'AfricaHome API', version: '1.0.0' });
});

// Seed demo data route (development only)
app.post('/api/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Route disabled in production' });
  }
  try {
    const User = require('./models/User');
    const Listing = require('./models/Listing');

    // Check if already seeded
    const count = await User.countDocuments();
    if (count > 0) return res.json({ message: 'Database already seeded' });

    // Create demo users
    const bailleur = await User.create({
      type: 'bailleur', name: 'Jean Mbarga', phone: '651810270',
      whatsapp: '651810270', email: 'jean@email.com', password: 'demo123456',
      country: 'Cameroun', city: 'Douala', quarter: 'Akwa',
      subscription: { plan: 'annual', active: true, startDate: new Date(), endDate: new Date(Date.now() + 365*24*60*60*1000) }
    });

    const bailleur2 = await User.create({
      type: 'bailleur', name: 'Fatou Diallo', phone: '771234567',
      whatsapp: '771234567', email: 'fatou@email.com', password: 'demo123456',
      country: 'Sénégal', city: 'Dakar', quarter: 'Plateau',
      subscription: { plan: 'monthly', active: true, startDate: new Date(), endDate: new Date(Date.now() + 30*24*60*60*1000) }
    });

    const pro = await User.create({
      type: 'professionnel', name: 'Immobilière du Soleil', phone: '690112233',
      whatsapp: '690112233', email: 'soleil@email.com', password: 'demo123456',
      country: 'Cameroun', city: 'Yaoundé', quarter: 'Bastos',
      structureName: 'Immobilière du Soleil SARL', niu: 'P012345678',
      representativeName: 'Marc Atangana', cniNumber: '123456789',
      cniPhotoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample_id_card.jpg',
      officialDocUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample_business_doc.jpg',
      verified: true,
      verificationStatus: 'approuve',
      verificationChecklist: {
        cniPhotoLisible: true, cniNumeroValide: true, niuVerifie: true,
        docOfficielAuthentique: true, representantCorrespond: true, structureVerifiee: true
      },
      verificationHistory: [
        { action: 'en_attente', date: new Date(Date.now() - 30*24*60*60*1000), by: 'Système', note: 'Documents soumis lors de l\'inscription' },
        { action: 'en_cours', date: new Date(Date.now() - 28*24*60*60*1000), by: 'Admin AfricaHome', note: 'Début de la vérification' },
        { action: 'approuve', date: new Date(Date.now() - 27*24*60*60*1000), by: 'Admin AfricaHome', note: 'Tous les documents validés. Compte professionnel certifié.' }
      ],
      subscription: { plan: 'annual', active: true, startDate: new Date(), endDate: new Date(Date.now() + 365*24*60*60*1000) }
    });

    await User.create({
      type: 'locataire', name: 'Paul Essono', phone: '655998877',
      email: 'paul@email.com', password: 'demo123456', accessPaid: true
    });

    // Create demo listings
    const demoListings = [
      { user: bailleur._id, type: 'appartement', category: 'location', title: 'Bel Appartement 3 Pièces à Akwa', description: 'Spacieux appartement de 3 pièces avec salon, cuisine équipée et 2 salles de bain. Quartier calme et sécurisé.', price: 85000, country: 'Cameroun', city: 'Douala', quarter: 'Akwa', distanceRoute: '200m', rooms: 3, images: ['/images/apartment.png'], contactPhone: '651810270', contactWhatsapp: '651810270' },
      { user: bailleur2._id, type: 'maison', category: 'vente', title: 'Villa Moderne 5 Pièces avec Jardin', description: 'Magnifique villa de 5 pièces avec jardin, piscine et garage. Construction récente.', price: 45000000, country: 'Sénégal', city: 'Dakar', quarter: 'Almadies', distanceRoute: '100m', rooms: 5, images: ['/images/villa.png'], contactPhone: '771234567', contactWhatsapp: '771234567' },
      { user: pro._id, type: 'terrain', category: 'terrain', title: 'Terrain 500m² Bien Situé', description: 'Terrain plat de 500m², titré et borné. Idéal pour construction.', price: 12000000, country: 'Cameroun', city: 'Yaoundé', quarter: 'Odza', distanceRoute: '50m', rooms: 0, images: ['/images/terrain.png'], contactPhone: '690112233', contactWhatsapp: '690112233' },
      { user: bailleur._id, type: 'studio', category: 'location', title: 'Studio Meublé Centre-Ville', description: 'Studio meublé et équipé, idéal pour étudiant ou jeune professionnel.', price: 50000, country: 'Cameroun', city: 'Douala', quarter: 'Bonanjo', distanceRoute: '300m', rooms: 1, images: ['/images/studio.png'], contactPhone: '651810270', contactWhatsapp: '651810270' },
      { user: pro._id, type: 'plan3d', category: 'construction', title: 'Plan 3D Villa Moderne - 4 Chambres', description: 'Conception 3D professionnelle pour villa moderne de 4 chambres.', price: 250000, country: 'Cameroun', city: 'Yaoundé', quarter: 'Bastos', rooms: 4, images: ['/images/plan3d.png'], contactPhone: '690112233', contactWhatsapp: '690112233' },
      { user: bailleur2._id, type: 'chambre', category: 'location', title: 'Chambre Moderne Climatisée', description: 'Grande chambre climatisée avec salle de bain privée.', price: 35000, country: 'Sénégal', city: 'Dakar', quarter: 'Mermoz', distanceRoute: '150m', rooms: 1, images: ['/images/apartment.png'], contactPhone: '771234567', contactWhatsapp: '771234567' },
    ];
    await Listing.insertMany(demoListings);

    res.json({ success: true, message: 'Demo data seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AfricaHome API running on port ${PORT}`);
});
