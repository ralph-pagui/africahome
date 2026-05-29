// Realistic demo data for AfricaHome (Empty for Production)
export const defaultData = {
  users: [
    { id:'admin', type:'admin', name:'Admin AfricaHome', phone:'000000000', email:'admin@africahome.com', verified:true, joinDate:'2025-01-01' }
  ],
  listings: [],
  reviews: [],
  favorites: [],
  notifications: [],
  currentUser: null
};


// Generate notifications per user
export function getNotificationsForUser(user, listings) {
  if (!user) return [];
  const now = new Date();
  const base = [
    { id:'n0', text:'🎉 Bienvenue sur AfricaHome ! Explorez les annonces disponibles.', time:'Lors de l\'inscription', read:true, date: user.joinDate },
  ];
  if (user.type === 'locataire') {
    return [...base,
      { id:'n1', text:'🏠 Nouvelle annonce à Douala : Appartement 3P à Akwa — 85 000 FCFA/mois', time:'Il y a 2h', read:false },
      { id:'n2', text:'🔥 Annonce populaire : Studio Meublé à Bonanjo — déjà 403 vues !', time:'Il y a 5h', read:false },
      { id:'n3', text:'🆕 3 nouvelles annonces correspondent à vos critères de recherche', time:'Il y a 1j', read:false },
      { id:'n4', text:'💡 Astuce : ajoutez des annonces en favoris pour les retrouver facilement', time:'Il y a 2j', read:true },
      { id:'n5', text:'⭐ Votre avis compte ! Notez les logements que vous avez visités', time:'Il y a 3j', read:true },
    ];
  } else if (user.type === 'bailleur') {
    const myListings = listings.filter(l => l.userId === user.id);
    const totalViews = myListings.reduce((s,l) => s+(l.views||0), 0);
    return [...base,
      { id:'n1', text:`👁 Vos annonces ont atteint ${totalViews} vues au total !`, time:'Il y a 1h', read:false },
      { id:'n2', text:'⭐ Nouveau avis sur votre annonce « '+( myListings[0]?.title || 'Annonce') +' »', time:'Il y a 3h', read:false },
      { id:'n3', text:'📊 Rapport hebdomadaire : vos annonces performent bien cette semaine', time:'Il y a 1j', read:false },
      { id:'n4', text:'💳 Rappel : votre abonnement expire le '+(user.subscription?.end||'bientôt'), time:'Il y a 2j', read:true },
      { id:'n5', text:'📸 Conseil : ajoutez plus de photos pour augmenter vos vues de 40%', time:'Il y a 4j', read:true },
    ];
  } else { // professionnel
    const myListings = listings.filter(l => l.userId === user.id);
    return [...base,
      { id:'n1', text:'🏆 Votre structure est maintenant vérifiée ✅ — plus de visibilité !', time:'Il y a 2h', read:false },
      { id:'n2', text:`📈 ${myListings.length} annonces actives · Performance en hausse de 15%`, time:'Il y a 6h', read:false },
      { id:'n3', text:'⭐ 2 nouveaux avis reçus cette semaine sur vos annonces', time:'Il y a 1j', read:false },
      { id:'n4', text:'🔔 Un locataire a ajouté votre annonce en favoris', time:'Il y a 1j', read:true },
      { id:'n5', text:'💼 Abonnement Pro actif jusqu\'au '+(user.subscription?.end||'bientôt'), time:'Il y a 3j', read:true },
    ];
  }
}
