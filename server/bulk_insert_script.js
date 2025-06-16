const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Import des modèles
const EmployeeResponse = require('./models/EmployeeResponse');
const UserResponse = require('./models/UserResponse');
const Question = require('./models/Question');
const Ponderation = require('./models/Ponderation');

// Configuration de la base de données
const MONGODB_URI = 'mongodb://root:Nhancit.com%402025@138.201.153.41:27017/survey_db?authSource=admin'; // Remplacez par votre URI MongoDB
const CLIENT_ID = '68484bb6b0653865b23f878f'; // Remplacez par un vrai ObjectId de client

// Données fixes pour les questions 6, 8, 9
const FIXED_RESPONSES = {
  6: {
    answerId: 0, // Index de la réponse
    answerText: "Banking / Insurance / Finance",
    answerTextAng: "Banking / Insurance / Finance"
  },
  8: {
    answerId: 0, // Index de la réponse  
    answerText: "Phase de changement",
    answerTextAng: "Change Phase"
  },
  9: {
    answerId: 0, // Index de la réponse
    answerText: "Organisation mature",
    answerTextAng: "Mature Organization"
  }
};

// Fonction pour générer un nom d'employé aléatoire
function generateRandomName() {
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Paul', 'Claire', 'Michel', 'Anne', 'François', 'Sylvie', 'David', 'Nathalie', 'Thomas', 'Catherine', 'Philippe', 'Isabelle', 'Alain', 'Martine', 'Bernard', 'Christine'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

// Fonction pour générer un email basé sur le nom
function generateEmail(name) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const domains = ['company.com', 'enterprise.fr', 'business.com', 'corp.fr'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${cleanName}@${domain}`;
}

// Fonction pour générer une réponse aléatoire pour une question
function generateRandomResponse(question) {
  const numAnswers = question.answers.length;
  if (numAnswers === 0) {
    return {
      answerId: 0,
      answerText: "Réponse libre",
      answerTextAng: "Free response"
    };
  }
  
  const answerId = Math.floor(Math.random() * numAnswers);
  return {
    answerId,
    answerText: question.answers[answerId],
    answerTextAng: question.answersAng[answerId]
  };
}

// Fonction principale pour insérer les réponses
async function insertBulkResponses() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Récupérer toutes les questions
    console.log('Récupération des questions...');
    const allQuestions = await Question.find().sort({ id: 1 });
    console.log(`${allQuestions.length} questions trouvées`);

    if (allQuestions.length === 0) {
      console.error('Aucune question trouvée dans la base de données');
      return;
    }

    // Créer une map des questions pour un accès rapide
    const questionMap = new Map();
    allQuestions.forEach(q => questionMap.set(q.id, q));

    // Récupérer les pondérations
    console.log('Récupération des pondérations...');
    const allPonderations = await Ponderation.find();
    console.log(`${allPonderations.length} pondérations trouvées`);

    const employeeResponses = [];
    const userResponses = [];

    console.log('Génération de 50 réponses fictives...');
    
    for (let i = 1; i <= 50; i++) {
      const sessionId = `session_${Date.now()}_${i}_${uuidv4()}`;
      const employeeName = generateRandomName();
      const employeeEmail = generateEmail(employeeName);
      const userId = `user_${Date.now()}_${i}`;
      const employeeId = `emp_${Date.now()}_${i}`;

      console.log(`Génération de la réponse ${i}/50 pour ${employeeName}...`);

      // Générer les réponses pour toutes les questions
      const responses = [];
      const categoriesMap = new Map();

      for (const question of allQuestions) {
        let responseData;
        
        // Utiliser les réponses fixes pour les questions 6, 8, 9
        if (FIXED_RESPONSES[question.id]) {
          responseData = FIXED_RESPONSES[question.id];
        } else {
          responseData = generateRandomResponse(question);
        }

        // Calculer le score
        const score = question.Note[responseData.answerId] || 0;

        const processedResponse = {
          questionId: question.id,
          answerId: responseData.answerId,
          answerText: responseData.answerText,
          answerTextAng: responseData.answerTextAng,
          questionText: question.question,
          questionTextAng: question.questionAng,
          score: score,
          category: question.category,
          categoryAng: question.categoryAng,
          categoryShort: question.category.substring(0, 2),
          categoryAngShort: question.categoryAng.substring(0, 2)
        };

        responses.push(processedResponse);

        // Calculer les scores par catégorie (exclure "basic")
        if (question.category.toLowerCase() !== "basic") {
          if (!categoriesMap.has(question.category)) {
            categoriesMap.set(question.category, {
              category: question.category,
              categoryAng: question.categoryAng,
              categoryShort: question.category.substring(0, 2),
              categoryAngShort: question.categoryAng.substring(0, 2),
              score: 0,
              maxPossible: 0
            });
          }
          
          const categoryData = categoriesMap.get(question.category);
          categoryData.score += score;
          const maxPossibleScore = Math.max(...question.Note);
          categoryData.maxPossible += maxPossibleScore;
        }
      }

      // Préparer les scores par catégorie
      const categoryScores = Array.from(categoriesMap.values()).map(({ category, categoryAng, categoryShort, categoryAngShort, score, maxPossible }) => {
        const percentageScore = maxPossible > 0 ? (score * 100) / maxPossible : 0;
        
        return {
          category,
          categoryAng,
          categoryShort,
          categoryAngShort,
          score: percentageScore,
          rawScore: score,
          maxPossible
        };
      });

      // Calculer le score total
      const totalRawScore = categoryScores.reduce((sum, cat) => sum + cat.rawScore, 0);
      const totalMaxPossible = categoryScores.reduce((sum, cat) => sum + cat.maxPossible, 0);
      const totalPercentage = totalMaxPossible > 0 ? (totalRawScore * 100) / totalMaxPossible : 0;

      // Chercher une pondération applicable
      const keyResponsesAng = {
        6: FIXED_RESPONSES[6].answerTextAng,
        8: FIXED_RESPONSES[8].answerTextAng,
        9: FIXED_RESPONSES[9].answerTextAng
      };

      let applicablePonderation = null;
      if (allPonderations.length > 0) {
        applicablePonderation = allPonderations.find(p => 
          p.possibilite && Array.isArray(p.possibilite) && p.possibilite.length >= 3 &&
          p.possibilite[0] === keyResponsesAng[6] && 
          p.possibilite[1] === keyResponsesAng[8] && 
          p.possibilite[2] === keyResponsesAng[9]
        );
      }

      // Calculer les scores KBI
      let profileText = `${keyResponsesAng[6]} - ${keyResponsesAng[8]} - ${keyResponsesAng[9]}`;
      let prScore = categoryScores.find(c => c.categoryAngShort === 'Pr')?.score || 0;
      let coScore = categoryScores.find(c => c.categoryAngShort === 'Co')?.score || 0;
      let opScore = categoryScores.find(c => c.categoryAngShort === 'Op')?.score || 0;
      let adScore = categoryScores.find(c => c.categoryAngShort === 'Ad')?.score || 0;
      let ciScore = categoryScores.find(c => c.categoryAngShort === 'Ci')?.score || 0;
      let kbiConsScore = 0;

      if (applicablePonderation) {
        const weightedPr = prScore * (applicablePonderation.Pr / 100);
        const weightedCo = coScore * (applicablePonderation.Co / 100);
        const weightedOp = opScore * (applicablePonderation.Op / 100);
        const weightedAd = adScore * (applicablePonderation.Ad / 100);
        const weightedCi = ciScore * (applicablePonderation.Ci / 100);
        
        kbiConsScore = weightedPr + weightedCo + weightedOp + weightedAd + weightedCi;
        
        prScore = weightedPr;
        coScore = weightedCo;
        opScore = weightedOp;
        adScore = weightedAd;
        ciScore = weightedCi;
      }

      // Temps de completion aléatoire entre 5 et 30 minutes
      const completionTime = Math.floor(Math.random() * (30 - 5 + 1) + 5) * 60;

      // Préparer les données pour EmployeeResponse
      const employeeResponseData = {
        clientId: CLIENT_ID,
        employeeId: employeeId,
        sessionId: sessionId,
        userId: userId,
        responses: responses,
        categoryScores: categoryScores,
        score: totalPercentage,
        rawScore: totalRawScore,
        maxPossible: totalMaxPossible,
        profile: profileText,
        Pr: prScore,
        Co: coScore,
        Op: opScore,
        Ad: adScore,
        Ci: ciScore,
        KBICONSO: kbiConsScore,
        employeeName: employeeName,
        employeeEmail: employeeEmail,
        keyResponses: {
          industry: FIXED_RESPONSES[6].answerText,
          industryAng: FIXED_RESPONSES[6].answerTextAng,
          organizationType: FIXED_RESPONSES[8].answerText,
          organizationTypeAng: FIXED_RESPONSES[8].answerTextAng,
          changePhase: FIXED_RESPONSES[9].answerText,
          changePhaseAng: FIXED_RESPONSES[9].answerTextAng
        },
        metadata: {
          completionTime: completionTime,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          language: 'fr',
          ponderationFound: !!applicablePonderation,
          ponderationId: applicablePonderation?.id || null
        },
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Dates aléatoires dans les 30 derniers jours
      };

      // Préparer les données pour UserResponse
      const userResponseData = {
        userId: userId,
        responses: responses,
        categoryScores: categoryScores,
        score: totalPercentage,
        rawScore: totalRawScore,
        maxPossible: totalMaxPossible,
        profile: profileText,
        Pr: prScore,
        Co: coScore,
        Op: opScore,
        Ad: adScore,
        Ci: ciScore,
        KBICONSO: kbiConsScore,
        clientId: CLIENT_ID,
        employeeId: employeeId,
        sessionId: sessionId,
        employeeName: employeeName,
        employeeEmail: employeeEmail,
        keyResponses: {
          industry: FIXED_RESPONSES[6].answerText,
          industryAng: FIXED_RESPONSES[6].answerTextAng,
          organizationType: FIXED_RESPONSES[8].answerText,
          organizationTypeAng: FIXED_RESPONSES[8].answerTextAng,
          changePhase: FIXED_RESPONSES[9].answerText,
          changePhaseAng: FIXED_RESPONSES[9].answerTextAng
        },
        metadata: {
          completionTime: completionTime,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          language: 'fr',
          ponderationFound: !!applicablePonderation,
          ponderationId: applicablePonderation?.id || null
        },
        createdAt: employeeResponseData.createdAt
      };

      employeeResponses.push(employeeResponseData);
      userResponses.push(userResponseData);
    }

    console.log('Insertion des réponses dans EmployeeResponse...');
    const insertedEmployeeResponses = await EmployeeResponse.insertMany(employeeResponses);
    console.log(`${insertedEmployeeResponses.length} réponses insérées dans EmployeeResponse`);

    console.log('Insertion des réponses dans UserResponse...');
    const insertedUserResponses = await UserResponse.insertMany(userResponses);
    console.log(`${insertedUserResponses.length} réponses insérées dans UserResponse`);

    console.log('\n=== RÉSUMÉ ===');
    console.log(`Total de réponses générées: 50`);
    console.log(`EmployeeResponse insérées: ${insertedEmployeeResponses.length}`);
    console.log(`UserResponse insérées: ${insertedUserResponses.length}`);
    console.log(`Client ID utilisé: ${CLIENT_ID}`);
    console.log(`Réponses fixes utilisées:`);
    console.log(`  - Question 6: ${FIXED_RESPONSES[6].answerTextAng}`);
    console.log(`  - Question 8: ${FIXED_RESPONSES[8].answerTextAng}`);
    console.log(`  - Question 9: ${FIXED_RESPONSES[9].answerTextAng}`);
    
    // Afficher quelques exemples
    console.log('\n=== EXEMPLES DE DONNÉES INSÉRÉES ===');
    for (let i = 0; i < Math.min(3, insertedEmployeeResponses.length); i++) {
      const response = insertedEmployeeResponses[i];
      console.log(`\nExemple ${i + 1}:`);
      console.log(`  - Nom: ${response.employeeName}`);
      console.log(`  - Email: ${response.employeeEmail}`);
      console.log(`  - Score total: ${response.score.toFixed(2)}%`);
      console.log(`  - Score KBI CONSO: ${response.KBICONSO.toFixed(2)}`);
      console.log(`  - Temps de completion: ${Math.floor(response.metadata.completionTime / 60)} minutes`);
      console.log(`  - Nombre de réponses: ${response.responses.length}`);
    }

  } catch (error) {
    console.error('Erreur lors de l\'insertion:', error);
  } finally {
    console.log('\nFermeture de la connexion MongoDB...');
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

// Fonction pour nettoyer les données de test (optionnel)
async function cleanTestData() {
  try {
    console.log('Connexion à MongoDB pour le nettoyage...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('Suppression des données de test...');
    const employeeDeleteResult = await EmployeeResponse.deleteMany({
      userId: { $regex: /^user_/ }
    });
    
    const userDeleteResult = await UserResponse.deleteMany({
      userId: { $regex: /^user_/ }
    });
    
    console.log(`${employeeDeleteResult.deletedCount} documents supprimés de EmployeeResponse`);
    console.log(`${userDeleteResult.deletedCount} documents supprimés de UserResponse`);
    
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Exécution du script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    console.log('Mode nettoyage activé');
    cleanTestData();
  } else {
    console.log('Démarrage de l\'insertion des données de test...');
    insertBulkResponses();
  }
}

module.exports = {
  insertBulkResponses,
  cleanTestData
};