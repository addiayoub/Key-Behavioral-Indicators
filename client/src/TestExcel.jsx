import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import api from "./api";

const ExcelToJsonConverter = () => {
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [responseCount, setResponseCount] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  // Définition des catégories et leurs versions courtes
  const categories = [
    { 
      name: 'Basic',
      shortName: 'Ba',
      questions: 9,
      startIdx: 0
    },
    {
      name: 'Proactivity: Willingness to Take Initiative',
      shortName: 'Pr',
      questions: 10,
      startIdx: 9
    },
    {
      name: 'Collaboration: Effective Teamwork',
      shortName: 'Co',
      questions: 10,
      startIdx: 19
    },
    {
      name: 'Openness to feedback: Receptiveness to Input',
      shortName: 'Op',
      questions: 10,
      startIdx: 29
    },
    {
      name: 'Adaptability: Flexibility in change',
      shortName: 'Ad',
      questions: 10,
      startIdx: 39
    },
    {
      name: 'Citing continuous improvement: striving for excellence',
      shortName: 'Ci',
      questions: 10,
      startIdx: 49
    }
  ];

  // Récupérer les questions depuis l'API MongoDB
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('/api/questions');
        // Trier les questions par ID pour maintenir l'ordre
        const sortedQuestions = response.data.sort((a, b) => a.id - b.id);
        // Extraire uniquement les textes des questions en anglais
        const questionTexts = sortedQuestions.map(q => q.questionAng);
        setQuestions(questionTexts);
      } catch (error) {
        console.error('Erreur lors de la récupération des questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const getCategoryForQuestionIndex = (index) => {
    for (const category of categories) {
      if (index >= category.startIdx && index < category.startIdx + category.questions) {
        return {
          categoryAng: category.name,
          categoryAngShort: category.shortName
        };
      }
    }
    return { categoryAng: 'Unknown', categoryAngShort: 'Un' };
  };

  // Fonction pour extraire la valeur numérique d'un pourcentage
  const parsePercentage = (value) => {
    if (value === null || value === undefined) return 0;
    
    const strValue = String(value);
    
    // Si la valeur contient un '%', extraire le nombre
    if (strValue.includes('%')) {
      return parseInt(strValue.replace('%', ''), 10);
    }
    
    // Si c'est déjà un nombre, le retourner tel quel
    const numValue = parseFloat(strValue);
    
    // Si le nombre est entre 0 et 1, on suppose que c'est un pourcentage décimal
    // et on le convertit en pourcentage entier
    if (numValue > 0 && numValue <= 1) {
      return Math.round(numValue * 100);
    }
    
    // Sinon, on retourne la valeur arrondie
    return Math.round(numValue);
  };
  const saveToDatabase = async () => {
    if (!jsonData || jsonData.length === 0) {
      alert('Aucune donnée à sauvegarder');
      return;
    }
  
    setLoading(true);
    setSaveStatus(null);
  
    try {
      // Diviser les données en lots de 50 utilisateurs
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < jsonData.length; i += batchSize) {
        batches.push(jsonData.slice(i, i + batchSize));
      }
  
      const results = [];
      for (const [index, batch] of batches.entries()) {
        const response = await api.post('/responses/import', {
          importedData: batch
        });
        results.push(response.data);
        
        // Mettre à jour le statut après chaque lot
        setSaveStatus({
          success: true,
          message: `Envoi en cours... Lot ${index + 1}/${batches.length} terminé`,
          details: {
            total: jsonData.length,
            processed: (index + 1) * batchSize,
            ...response.data
          }
        });
      }
  
      setSaveStatus({
        success: true,
        message: `Tous les lots ont été sauvegardés avec succès!`,
        details: {
          total: jsonData.length,
          batches: results
        }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus({
        success: false,
        message: 'Erreur lors de la sauvegarde',
        details: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    setLoading(true);
  
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
        if (questions.length === 0) {
          throw new Error("Les questions n'ont pas été chargées depuis l'API");
        }
  
        if (excelData.length > 0) {
          const allUsersData = [];
          
          for (let rowIndex = 0; rowIndex < excelData.length; rowIndex++) {
            const row = excelData[rowIndex];
            
            if (!row || row.length < 109) continue; // S'assurer qu'on a assez de colonnes
  
            const userId = `user_${Date.now()}-${rowIndex + 1}`;
            const userResponses = [];
            
            // 1. Extraire les réponses textuelles (premières 59 colonnes)
            const answers = row.slice(0, 59);
            
            // 2. Extraire les scores individuels (colonnes 59 à 108)
            const individualScores = row.slice(59, 109).map(score => parseInt(score) || 0);
            
            // 3. Construire les réponses avec questions + scores
            for (let i = 0; i < questions.length; i++) {
              const { categoryAng, categoryAngShort } = getCategoryForQuestionIndex(i);
              
              userResponses.push({
                questionId: i + 1,
                answerTextAng: answers[i] || '',
                score: i < 9 ? 0 : (individualScores[i - 9] || 0), // Les 9 premières ont score=0
                questionTextAng: questions[i],
                categoryAng: categoryAng,
                categoryAngShort: categoryAngShort
              });
            }
  
            // 4. Extraire les métriques globales (dernières colonnes)
            const profile = row[109] || 'Inconnu';
            const rawScores = [
              parseInt(row[110]) || 0,
              parseInt(row[111]) || 0,
              parseInt(row[112]) || 0,
              parseInt(row[113]) || 0,
              parseInt(row[114]) || 0
            ];
            const percentScores = [
              parsePercentage(row[115]),
              parsePercentage(row[116]),
              parsePercentage(row[117]),
              parsePercentage(row[118]),
              parsePercentage(row[119])
            ];
            const categoryPercentages = [
              parsePercentage(row[120]),
              parsePercentage(row[121]),
              parsePercentage(row[122]),
              parsePercentage(row[123]),
              parsePercentage(row[124])
            ];
            const kbiConso = parsePercentage(row[125]);
  
            // 5. Calculer les scores par catégorie
            const categoryScores = categories.slice(1).map((category, i) => ({
              categoryAng: category.name,
              categoryAngShort: category.shortName,
              score: percentScores[i] || 0,
              rawScore: rawScores[i] || 0,
              maxPossible: 50 // 10 questions × 5 points max
            }));
  
            // 6. Calculer le score total
            const totalRawScore = rawScores.reduce((sum, score) => sum + score, 0);
            const totalScore = percentScores.reduce((sum, score) => sum + score, 0) / 5;
  
            // 7. Construire l'objet final
            const userData = {
              userId,
              responses: userResponses,
              categoryScores,
              score: Math.round(totalScore),
              rawScore: totalRawScore,
              maxPossible: 250, // 5 catégories × 50
              profile,
              Pr: categoryPercentages[0],
              Co: categoryPercentages[1],
              Op: categoryPercentages[2],
              Ad: categoryPercentages[3],
              Ci: categoryPercentages[4],
              KBICONSO: kbiConso,
              createdAt: new Date().toISOString()
            };
  
            allUsersData.push(userData);
          }
  
          setJsonData(allUsersData);
          setResponseCount(allUsersData.length);
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert(`Erreur lors du traitement: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  const downloadJson = () => {
    if (!jsonData) return;
    
    const dataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${fileName.split('.')[0]}.json`;
    link.href = url;
    link.click();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Convertisseur Excel vers JSON</h1>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Importer un fichier Excel
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="w-full border border-gray-300 p-2 rounded-md"
          disabled={questions.length === 0}
        />
        {questions.length === 0 && (
          <p className="text-yellow-600 mt-2">Chargement des questions depuis l'API...</p>
        )}
      </div>
      
      {loading && (
  <div className="mb-4">
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ 
          width: saveStatus?.details?.processed 
            ? `${(saveStatus.details.processed / jsonData.length) * 100}%` 
            : '0%' 
        }}
      ></div>
    </div>
    {saveStatus?.message && (
      <p className="text-sm mt-1">{saveStatus.message}</p>
    )}
  </div>
)}
      
      {jsonData && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Résultat JSON - {responseCount} réponse(s) trouvée(s)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={downloadJson}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Télécharger JSON
              </button>
              <button
                onClick={saveToDatabase}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                disabled={loading}
              >
                Sauvegarder en base
              </button>
            </div>
          </div>
          
          {/* Afficher le statut de sauvegarde */}
          {saveStatus && (
            <div className={`p-4 mb-4 rounded-md ${
              saveStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">{saveStatus.message}</p>
              {saveStatus.details && (
                <pre className="text-xs mt-2 overflow-auto max-h-32">
                  {JSON.stringify(saveStatus.details, null, 2)}
                </pre>
              )}
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            <pre className="text-sm">{JSON.stringify(jsonData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelToJsonConverter;