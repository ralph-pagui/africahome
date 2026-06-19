const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validators');

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', registerRules, validate, async (req, res) => {
  try {
    const { type, name, phone, whatsapp, email, password, country, city, quarter,
            structureName, niu, representativeName, cniNumber, officialDocUrl, cniPhotoUrl } = req.body;

    // Check if phone exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ce numéro de téléphone est déjà utilisé' });
    }

    const userData = {
      type, name, phone, whatsapp: whatsapp || phone, email, password,
      country, city, quarter
    };

    // Professional extra fields
    if (type === 'professionnel') {
      userData.structureName = structureName;
      userData.niu = niu;
      userData.representativeName = representativeName;
      userData.cniNumber = cniNumber;
      if (officialDocUrl) userData.officialDocUrl = officialDocUrl;
      if (cniPhotoUrl) userData.cniPhotoUrl = cniPhotoUrl;
      // Set verification status based on documents submitted
      if (officialDocUrl || cniPhotoUrl) {
        userData.verificationStatus = 'en_attente';
        userData.verificationHistory = [
          { action: 'en_attente', date: new Date(), by: 'Système', note: 'Documents soumis lors de l\'inscription' }
        ];
      } else {
        userData.verificationStatus = 'non_soumis';
      }
    }

    const user = await User.create(userData);
    const token = user.getSignedJwt();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, token, user: userObj });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', loginRules, validate, async (req, res) => {
  try {
    const { phone, password, type } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Numéro et mot de passe requis' });
    }

    const query = { phone };
    if (type) query.type = type;

    let user = await User.findOne(query).select('+password');
    if (!user && type === 'admin') {
      user = await User.findOne({
        type: 'admin',
        $or: [
          { phone: '000000000' },
          { phone: '+237000000000' }
        ]
      }).select('+password');
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Numéro non reconnu' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
    }

    const token = user.getSignedJwt();
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @route   PUT /api/auth/me
// @desc    Update user profile
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    const fields = ['name', 'email', 'whatsapp', 'country', 'city', 'quarter',
                    'structureName', 'niu', 'representativeName', 'cniNumber',
                    'officialDocUrl', 'cniPhotoUrl'];
    
    fields.forEach(f => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      user.password = req.body.password;
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/google-auth
// @desc    Authenticate with Google (Sign in, Register, or Link Account)
router.post('/google-auth', async (req, res) => {
  try {
    const { googleId, email, name, linkConfirmPassword, setupData } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ success: false, message: 'Google ID et email requis' });
    }

    // 1. Try to find user by googleId
    let user = await User.findOne({ googleId });
    if (user) {
      const token = user.getSignedJwt();
      return res.json({ success: true, token, user });
    }

    // 2. Try to find user by email
    user = await User.findOne({ email }).select('+password');
    if (user) {
      // User exists but has no googleId linked yet
      if (linkConfirmPassword) {
        // User provided password to confirm linkage
        const isMatch = await user.matchPassword(linkConfirmPassword);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        }
        // Link Google ID
        user.googleId = googleId;
        await user.save();
        
        const token = user.getSignedJwt();
        const userObj = user.toObject();
        delete userObj.password;
        return res.json({ success: true, token, user: userObj, linked: true });
      } else {
        // Inform frontend that password confirmation is required to link
        return res.json({
          success: true,
          requireLinkConfirmation: true,
          message: 'Un compte classique existe déjà avec cette adresse email. Veuillez saisir votre mot de passe pour lier votre compte Google.'
        });
      }
    }

    // 3. User does not exist at all -> Registration flow
    if (setupData) {
      // Setup data provided -> Create user!
      const { type, phone, whatsapp, country, city, quarter } = setupData;

      if (!type || !phone || !country || !city) {
        return res.status(400).json({ success: false, message: 'Type de compte, téléphone, pays et ville requis' });
      }

      // Check if phone already exists
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Ce numéro de téléphone est déjà associé à un autre compte' });
      }

      const userData = {
        type,
        name: name || email.split('@')[0],
        email,
        googleId,
        phone,
        whatsapp: whatsapp || phone,
        country,
        city,
        quarter
      };

      const newUser = await User.create(userData);
      const token = newUser.getSignedJwt();
      return res.status(201).json({ success: true, token, user: newUser });
    } else {
      // Setup data not provided -> Require profile setup!
      return res.json({
        success: true,
        requireProfileSetup: true,
        message: 'Première connexion Google réussie. Veuillez compléter votre profil.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/reset-admin-temp
// @desc    TEMPORARY: Reset admin credentials to default (delete this route after use!)
router.get('/reset-admin-temp', async (req, res) => {
  try {
    let admin = await User.findOne({ type: 'admin' });
    if (!admin) {
      admin = new User({
        type: 'admin',
        country: 'Cameroun',
        city: 'Douala',
        verified: true
      });
    }
    admin.phone = '+237000000000';
    admin.password = 'admin2026';
    admin.name = 'Admin AfricaHome';
    admin.email = 'admin@africahome.com';
    await admin.save();
    res.send('<h1>✅ Admin réinitialisé avec succès !</h1><p>Téléphone : <strong>+237000000000</strong><br>Mot de passe : <strong>admin2026</strong></p>');
  } catch (err) {
    res.status(500).send('Erreur : ' + err.message);
  }
});

module.exports = router;
