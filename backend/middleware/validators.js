const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

// ============= AUTH VALIDATORS =============

const registerRules = [
  body('type')
    .isIn(['bailleur', 'locataire', 'professionnel'])
    .withMessage('Type de compte invalide'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('phone')
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Numéro de téléphone invalide (6-20 caractères)')
    .matches(/^[0-9+\s()-]+$/)
    .withMessage('Le numéro ne doit contenir que des chiffres, +, espaces, () ou -'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('country')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 })
    .withMessage('Pays trop long'),
  body('city')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 })
    .withMessage('Ville trop longue'),
  body('quarter')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 })
    .withMessage('Quartier trop long'),
  // Professional fields
  body('structureName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Nom de structure trop long'),
  body('niu')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('NIU trop long'),
];

const loginRules = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
  body('type')
    .optional()
    .isIn(['bailleur', 'locataire', 'professionnel'])
    .withMessage('Type de compte invalide'),
];

// ============= LISTING VALIDATORS =============

const createListingRules = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le titre doit contenir entre 5 et 200 caractères'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La description doit contenir entre 10 et 2000 caractères'),
  body('type')
    .isIn(['chambre', 'studio', 'appartement', 'maison', 'terrain', 'plan3d', 'service'])
    .withMessage('Type de bien invalide'),
  body('category')
    .isIn(['location', 'vente', 'terrain', 'construction', 'meuble', 'electromenager', 'decoration'])
    .withMessage('Catégorie invalide'),
  body('price')
    .isInt({ min: 0, max: 999999999 })
    .withMessage('Le prix doit être un nombre positif'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Le pays est requis')
    .isLength({ max: 60 }),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('La ville est requise')
    .isLength({ max: 60 }),
  body('quarter')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 }),
  body('rooms')
    .optional({ values: 'falsy' })
    .isInt({ min: 0, max: 100 })
    .withMessage('Nombre de pièces invalide'),
  body('contactPhone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[0-9+\s()-]*$/)
    .withMessage('Numéro de contact invalide'),
];

const updateListingRules = [
  param('id').isMongoId().withMessage('ID annonce invalide'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le titre doit contenir entre 5 et 200 caractères'),
  body('price')
    .optional()
    .isInt({ min: 0, max: 999999999 })
    .withMessage('Le prix doit être un nombre positif'),
];

// ============= REVIEW VALIDATORS =============

const reviewRules = [
  body('listingId')
    .isMongoId()
    .withMessage('ID annonce invalide'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être entre 1 et 5'),
  body('comment')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le commentaire ne doit pas dépasser 500 caractères'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createListingRules,
  updateListingRules,
  reviewRules
};
