require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const Review = require('./models/Review');
const Payment = require('./models/Payment');

async function clearDatabase() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté.');

    console.log('🧹 Début de la suppression des données démo...');

    // 1. Supprimer les avis
    const reviewRes = await Review.deleteMany({});
    console.log(`❌ Avis supprimés: ${reviewRes.deletedCount}`);

    // 2. Supprimer les annonces
    const listingRes = await Listing.deleteMany({});
    console.log(`❌ Annonces supprimées: ${listingRes.deletedCount}`);

    // 3. Supprimer les paiements
    const paymentRes = await Payment.deleteMany({});
    console.log(`❌ Paiements supprimés: ${paymentRes.deletedCount}`);

    // 4. Supprimer les utilisateurs non-admin
    const userRes = await User.deleteMany({ type: { $ne: 'admin' } });
    console.log(`❌ Utilisateurs supprimés (sauf admin): ${userRes.deletedCount}`);

    // 5. S'assurer que le compte admin existe toujours
    const adminExists = await User.findOne({ type: 'admin' });
    if (!adminExists) {
      await User.create({
        type: 'admin',
        name: 'Admin AfricaHome',
        phone: '000000000',
        email: 'admin@africahome.com',
        password: 'admin2026',
        country: 'Cameroun',
        city: 'Douala',
        verified: true
      });
      console.log('🛡️ Compte admin recréé automatiquement (phone: 000000000, mot de passe: admin2026)');
    } else {
      console.log('🛡️ Le compte admin existant a été conservé.');
    }

    console.log('🎉 Base de données nettoyée avec succès et prête pour la production !');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de la base de données.');
  }
}

clearDatabase();
