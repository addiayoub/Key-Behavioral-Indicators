const EmployeeResponse = require('../models/EmployeeResponse');
const UserResponse = require('../models/UserResponse'); // Ajout de l'import
const Client = require('../models/Client');
const Employee = require('../models/Employee');
const Question = require('../models/Question');
const Ponderation = require('../models/Ponderation');

exports.saveResponse = async (req, res) => {
  try {
    const { sessionId, clientId, responses, employeeName, employeeEmail, userId, metadata } = req.body;
    
    console.log('Received payload:', { 
      sessionId, 
      clientId, 
      userId,
      responsesCount: responses ? responses.length : 0,
      employeeName, 
      employeeEmail,
      completionTime: metadata?.completionTime
    });
    
    // Validation des données essentielles
    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        message: 'SessionId est requis' 
      });
    }
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Réponses manquantes ou invalides' 
      });
    }
    
    // Vérifier si la session existe déjà
    const existingResponse = await EmployeeResponse.findOne({ sessionId });
    if (existingResponse) {
      return res.status(400).json({ 
        success: false,
        message: 'Session déjà utilisée' 
      });
    }
    
    let employeeId = null;
    let client = null;
    let userIdForUserResponse = null; // ID à utiliser pour UserResponse
    
    // Gérer les deux cas: employé authentifié vs utilisateur anonyme
    if (clientId) {
      console.log('Processing authenticated employee response');
      client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ 
          success: false,
          message: 'Client non trouvé' 
        });
      }
      
      if (client.currentEmployees >= client.maxEmployees) {
        return res.status(400).json({ 
          success: false,
          message: 'Nombre maximum de participants atteint' 
        });
      }
      
      let employee = null;
      if (employeeName || employeeEmail) {
        employee = await Employee.findOne({
          clientId: clientId,
          $or: [
            { username: employeeName },
            { email: employeeEmail }
          ]
        });
      }
      
      if (employee) {
        employeeId = employee._id;
        userIdForUserResponse = employee._id.toString(); // Convertir ObjectId en string pour UserResponse
        await Employee.findByIdAndUpdate(employee._id, { 
          hasCompletedSurvey: true 
        });
      } else {
        employeeId = sessionId;
        userIdForUserResponse = sessionId; // Utiliser sessionId comme userId pour UserResponse
      }
      
      await Client.findByIdAndUpdate(clientId, { 
        $inc: { currentEmployees: 1 } 
      });
    } else if (userId) {
      console.log('Processing anonymous user response');
      employeeId = userId;
      userIdForUserResponse = userId; // Utiliser directement le userId fourni
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'ClientId ou UserId requis' 
      });
    }

    // Récupérer toutes les questions pour calculer les scores
    const allQuestions = await Question.find();
    const questionMap = new Map();
    allQuestions.forEach(q => questionMap.set(q.id, q));

    // Récupérer toutes les pondérations
    const allPonderations = await Ponderation.find();
    console.log(`Nombre de pondérations trouvées: ${allPonderations.length}`);
    
    if (allPonderations.length === 0) {
      console.warn("ATTENTION: Aucune pondération n'a été trouvée dans la base de données!");
    }

    // Extraire les réponses spécifiques (6, 8, 9)
    const keyResponses = {};
    const keyResponsesAng = {};
    
    for (const response of responses) {
      if ([6, 8, 9].includes(response.questionId)) {
        const question = questionMap.get(response.questionId);
        if (question) {
          const answerText = question.answers[response.answerId] || response.answerText;
          keyResponses[response.questionId] = answerText;
          const answerTextAng = question.answersAng[response.answerId] || response.answerTextAng;
          keyResponsesAng[response.questionId] = answerTextAng;
          console.log(`Question ${response.questionId} (EN): ${answerTextAng}`);
        }
      }
    }

    // Trouver la pondération applicable
    let applicablePonderation = null;
    if (keyResponsesAng[6] && keyResponsesAng[8] && keyResponsesAng[9]) {
      const industry = keyResponsesAng[6].trim();
      const orgType = keyResponsesAng[8].trim();
      const changePhase = keyResponsesAng[9].trim();
      
      console.log("Recherche de pondération pour:", JSON.stringify([industry, orgType, changePhase]));
      
      applicablePonderation = allPonderations.find(p => 
        p.possibilite && Array.isArray(p.possibilite) && p.possibilite.length >= 3 &&
        p.possibilite[0] === industry && 
        p.possibilite[1] === orgType && 
        p.possibilite[2] === changePhase
      );
      
      if (!applicablePonderation) {
        console.log("Aucune correspondance exacte, essai avec recherche insensible à la casse...");
        applicablePonderation = allPonderations.find(p => 
          p.possibilite && Array.isArray(p.possibilite) && p.possibilite.length >= 3 &&
          p.possibilite[0].toLowerCase() === industry.toLowerCase() && 
          p.possibilite[1].toLowerCase() === orgType.toLowerCase() && 
          p.possibilite[2].toLowerCase() === changePhase.toLowerCase()
        );
      }
      
      if (applicablePonderation) {
        console.log(`Pondération trouvée: ID ${applicablePonderation.id}`);
      }
    }

    // Préparer les réponses avec les scores
    const processedResponses = [];
    const categoriesMap = new Map();

    for (const response of responses) {
      const { questionId, answerId, answerText, answerTextAng } = response;
      const question = questionMap.get(questionId);
      
      if (!question) {
        console.warn(`Question ${questionId} non trouvée`);
        continue;
      }

      let score = 0;
      if (question.answers.length === 0 || 
          (answerId !== undefined && 
          (question.answers[answerId] === "Autre" || question.answersAng[answerId] === "Other"))) {
        score = question.Note[answerId] || 0;
      } else {
        score = question.Note[answerId] || 0;
      }
      
      const finalAnswerText = answerText || question.answers[answerId] || "";
      const finalAnswerTextAng = answerTextAng || question.answersAng[answerId] || "";
      
      processedResponses.push({
        questionId,
        answerId,
        answerText: finalAnswerText,
        answerTextAng: finalAnswerTextAng,
        questionText: question.question,
        questionTextAng: question.questionAng,
        score,
        category: question.category,
        categoryAng: question.categoryAng,
        categoryShort: question.category.substring(0, 2),
        categoryAngShort: question.categoryAng.substring(0, 2)
      });

      if (question.category.toLowerCase() !== "basic") {
        if (!categoriesMap.has(question.category)) {
          categoriesMap.set(question.category, {
            category: question.category,
            categoryAng: question.categoryAng,
            categoryShort: question.category.substring(0, 2),
            categoryAngShort: question.categoryAng.substring(0, 2),
            score: 0,
            maxPossible: 0,
            count: 0
          });
        }
        
        const categoryData = categoriesMap.get(question.category);
        categoryData.score += score;
        const maxPossibleScore = Math.max(...question.Note);
        categoryData.maxPossible += maxPossibleScore;
        categoryData.count += 1;
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

    // Préparer les données KBI scores
    let profileText = '';
    let prScore = 0;
    let coScore = 0;
    let opScore = 0;
    let adScore = 0;
    let ciScore = 0;
    let kbiConsScore = 0;

    if (applicablePonderation) {
      profileText = `${keyResponsesAng[6]} - ${keyResponsesAng[8]} - ${keyResponsesAng[9]}`;
      
      prScore = categoryScores.find(c => c.categoryAngShort === 'Pr')?.score || 0;
      coScore = categoryScores.find(c => c.categoryAngShort === 'Co')?.score || 0;
      opScore = categoryScores.find(c => c.categoryAngShort === 'Op')?.score || 0;
      adScore = categoryScores.find(c => c.categoryAngShort === 'Ad')?.score || 0;
      ciScore = categoryScores.find(c => c.categoryAngShort === 'Ci')?.score || 0;
      
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

    // ============ SAUVEGARDE DANS EMPLOYEERESPONSE ============
    const employeeResponseData = {
      clientId: clientId || null,
      employeeId: employeeId,
      sessionId,
      userId: userId || null,
      responses: processedResponses,
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
      employeeName: employeeName || null,
      employeeEmail: employeeEmail || null,
      keyResponses: {
        industry: keyResponses[6],
        industryAng: keyResponsesAng[6],
        organizationType: keyResponses[8],
        organizationTypeAng: keyResponsesAng[8],
        changePhase: keyResponses[9],
        changePhaseAng: keyResponsesAng[9]
      },
      metadata: {
        completionTime: metadata?.completionTime || 0,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || null,
        language: 'fr',
        ponderationFound: !!applicablePonderation,
        ponderationId: applicablePonderation?.id || null
      },
      createdAt: new Date()
    };

    // ============ SAUVEGARDE DANS USERRESPONSE ============
    // Supprimer l'ancienne réponse si elle existe
    await UserResponse.deleteOne({ userId: userIdForUserResponse });

    const userResponseData = {
      userId: userIdForUserResponse,
      responses: processedResponses,
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
      // Champs supplémentaires d'EmployeeResponse
      clientId: clientId || null,
      employeeId: employeeId,
      sessionId,
      employeeName: employeeName || null,
      employeeEmail: employeeEmail || null,
      keyResponses: {
        industry: keyResponses[6],
        industryAng: keyResponsesAng[6],
        organizationType: keyResponses[8],
        organizationTypeAng: keyResponsesAng[8],
        changePhase: keyResponses[9],
        changePhaseAng: keyResponsesAng[9]
      },
      metadata: {
        completionTime: metadata?.completionTime || 0,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || null,
        language: 'fr',
        ponderationFound: !!applicablePonderation,
        ponderationId: applicablePonderation?.id || null
      },
      createdAt: new Date()
    };
    
    // Sauvegarder dans les deux collections
    const [newEmployeeResponse, newUserResponse] = await Promise.all([
      EmployeeResponse.create(employeeResponseData),
      UserResponse.create(userResponseData)
    ]);
    
    console.log(`Données sauvegardées avec succès:
    - EmployeeResponse ID: ${newEmployeeResponse._id}
    - UserResponse ID: ${newUserResponse._id}
    - UserId utilisé: ${userIdForUserResponse}`);
    
    res.status(201).json({
      success: true,
      message: 'Réponses sauvegardées avec succès dans les deux collections',
      data: {
        employeeResponseId: newEmployeeResponse._id,
        userResponseId: newUserResponse._id,
        sessionId: newEmployeeResponse.sessionId,
        employeeId: employeeId,
        clientId: clientId,
        userId: userIdForUserResponse,
        totalResponses: responses ? responses.length : 0,
        categoryScores,
        totalScore: {
          score: totalPercentage,
          rawScore: totalRawScore,
          maxPossible: totalMaxPossible
        },
        kbiScores: {
          profile: profileText,
          Pr: prScore,
          Co: coScore,
          Op: opScore,
          Ad: adScore,
          Ci: ciScore,
          KBICONSO: kbiConsScore
        },
        keyResponses: {
          industry: keyResponses[6],
          industryAng: keyResponsesAng[6],
          organizationType: keyResponses[8],
          organizationTypeAng: keyResponsesAng[8],
          changePhase: keyResponses[9],
          changePhaseAng: keyResponsesAng[9]
        },
        ponderationFound: !!applicablePonderation,
        ponderationId: applicablePonderation?.id || null,
        completionTime: newEmployeeResponse.metadata.completionTime
      }
    });
    
  } catch (error) {
    console.error('Erreur saveResponse:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la sauvegarde',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};