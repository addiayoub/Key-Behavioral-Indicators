import React from 'react';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL;
import logo from '/Picture2.png'; // Assurez-vous que le chemin est correct

const ExportPDFButton = ({ responses = [], clientData = {}, asDiv = false }) => {
  const generatePDF = () => {
    try {
      // Vérification des données
      if (!clientData || !clientData.companyName) {
        throw new Error("Données client manquantes");
      }

      if (!Array.isArray(responses)) {
        throw new Error("Les réponses doivent être un tableau");
      }

      // Initialisation du PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuration
      const margin = 15;
      let yPosition = margin;
      const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
      const pageHeight = doc.internal.pageSize.getHeight();

      // Styles basés sur AssessmentComponent (couleurs orange et fond noir)
      const styles = {
        title: { size: 20, color: [255, 165, 0], font: 'helvetica', style: 'bold' }, // Orange
        sectionTitle: { size: 14, color: [255, 255, 255], bgColor: [55, 65, 81] }, // Gris foncé comme dans AssessmentComponent
        subSection: { size: 12, color: [255, 165, 0], font: 'helvetica', style: 'bold' }, // Orange
        text: { size: 10, color: [255, 255, 255], font: 'helvetica', style: 'normal' }, // Blanc
        footer: { size: 8, color: [200, 200, 200] }, // Gris clair
        accent: { color: [255, 165, 0] }, // Orange pour les accents
        background: { color: [0, 0, 0] }, // Noir pour le fond
        cardBg: { color: [31, 41, 55] }, // Gris foncé pour les cartes
        border: { color: [75, 85, 99] } // Gris moyen pour les bordures
      };

      // Fonction pour appliquer le fond noir à chaque page
      const applyBlackBackground = () => {
        doc.setFillColor(...styles.background.color);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
      };

      // Fonction pour vérifier l'espace disponible et créer une nouvelle page si nécessaire
      const checkPageBreak = (neededSpace) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          doc.addPage();
          applyBlackBackground(); // Appliquer le fond noir
          yPosition = margin;
          addHeader(); // Ajouter l'en-tête sur la nouvelle page
        }
      };

      // Ajouter l'en-tête avec le logo
      const addHeader = () => {
        // Logo avec fond blanc pour la visibilité
        try {
          // Créer un fond blanc pour le logo
          doc.roundedRect(margin, yPosition, 42, 17, 2, 2, 'F');
          doc.addImage(logo, 'PNG', margin + 1, yPosition + 1, 40, 15);
        } catch (error) {
          console.error("Erreur de chargement du logo:", error);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, yPosition, 80, 15, 2, 2, 'F');
          doc.setFont(styles.text.font, styles.text.style);
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(clientData.companyName, margin + 5, yPosition + 10);
        }

        // Titre principal en orange
        doc.setFont(styles.title.font, styles.title.style);
        doc.setFontSize(styles.title.size);
        doc.setTextColor(...styles.title.color);
        doc.text('Rapport des Réponses', pageWidth / 2 + margin, yPosition + 10, { align: 'center' });

        // Informations client en blanc
        doc.setFont(styles.text.font, styles.text.style);
        doc.setFontSize(styles.text.size);
        doc.setTextColor(...styles.text.color);
        doc.text(`Client: ${clientData.companyName}`, margin, yPosition + 25);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, yPosition + 25, { align: 'right' });

        yPosition += 35;
      };

      // Ajouter un titre de section avec style AssessmentComponent
      const addSectionTitle = (title) => {
        checkPageBreak(15);
        doc.setFontSize(styles.sectionTitle.size);
        doc.setTextColor(...styles.sectionTitle.color);
        doc.setFillColor(...styles.sectionTitle.bgColor);
        doc.roundedRect(margin, yPosition, pageWidth, 10, 3, 3, 'F');
        
        // Bordure orange subtile
        doc.setDrawColor(...styles.accent.color);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPosition, pageWidth, 10, 3, 3);
        
        doc.text(title, margin + 5, yPosition + 7);
        yPosition += 15;
      };

      // Ajouter une sous-section
      const addSubSection = (title) => {
        checkPageBreak(10);
        doc.setFontSize(styles.subSection.size);
        doc.setTextColor(...styles.subSection.color);
        doc.setFont(styles.subSection.font, styles.subSection.style);
        doc.text(title, margin, yPosition);
        yPosition += 7;
      };

      // Ajouter les statistiques globales avec style sombre
      const addGlobalStats = () => {
        checkPageBreak(30);

        // Calcul des statistiques
        const totalResponses = responses.length;
        const avgScore = Math.round(responses.reduce((sum, r) => sum + (r.score || 0), 0) / totalResponses) || 0;
        const avgKBI = Math.round(responses.reduce((sum, r) => sum + (r.KBICONSO || 0), 0) / totalResponses) || 0;
        
        const industries = new Set(responses.map(r => r.keyResponses?.industry).filter(Boolean));
        const orgTypes = new Set(responses.map(r => r.keyResponses?.organizationType).filter(Boolean));

        // En-tête du tableau avec couleur orange
        doc.setFillColor(...styles.accent.color);
        doc.roundedRect(margin, yPosition, pageWidth, 8, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Noir sur fond orange
        doc.text('Statistique', margin + 2, yPosition + 5);
        doc.text('Valeur', pageWidth - 10, yPosition + 5, { align: 'right' });
        yPosition += 8;

        // Corps du tableau
        doc.setFontSize(10);
        doc.setTextColor(...styles.text.color);
        doc.setFont('helvetica', 'normal');

        const stats = [
          { label: 'Total des réponses', value: totalResponses },
          { label: 'Score moyen', value: `${avgScore}%` },
          { label: 'Score KBI moyen', value: `${avgKBI}%` },
          { label: 'Industries représentées', value: industries.size },
          { label: 'Types d\'organisation', value: orgTypes.size }
        ];

        stats.forEach((stat, i) => {
          // Alternance avec couleurs sombres
          if (i % 2 === 0) {
            doc.setFillColor(...styles.cardBg.color);
          } else {
            doc.setFillColor(55, 65, 81); // Gris plus clair
          }
          doc.roundedRect(margin, yPosition, pageWidth, 8, 1, 1, 'F');
          
          // Bordure subtile
          doc.setDrawColor(...styles.border.color);
          doc.setLineWidth(0.2);
          doc.roundedRect(margin, yPosition, pageWidth, 8, 1, 1);
          
          doc.setTextColor(...styles.text.color);
          doc.text(stat.label, margin + 2, yPosition + 5);
          
          // Valeur en orange
          doc.setTextColor(...styles.accent.color);
          doc.text(stat.value.toString(), pageWidth - 10, yPosition + 5, { align: 'right' });
          
          yPosition += 8;
        });

        yPosition += 15;
      };

      const addEmployeePage = (response, index) => {
        // Nouvelle page pour chaque employé
        if (index > 0) {
          doc.addPage();
          applyBlackBackground(); // Appliquer le fond noir
          yPosition = margin;
          addHeader();
        }

        addSubSection(`Employé ${index + 1}/${responses.length}: ${response.employeeName || response.employeeId}`);

        // Informations de base sous forme de tableau avec style sombre
        const employeeInfo = [
          { label: 'ID Employé', value: response.employeeId },
          { label: 'Email', value: response.employeeEmail || '-' },
          { label: 'Industrie', value: response.keyResponses?.industry || '-' },
          { label: 'Type Organisation', value: response.keyResponses?.organizationType || '-' },
          { label: 'Score Total', value: `${Math.round(response.score || 0)}%` },
          { label: 'KBI CONSO', value: `${Math.round(response.KBICONSO || 0)}%` },
          { label: 'Date', value: new Date(response.createdAt).toLocaleDateString('fr-FR') },
        ];

        // Configuration du tableau
        const cellPadding = 2;
        const lineHeight = 7;
        const col1Width = 40;
        const col2Width = pageWidth - col1Width;

        doc.setFontSize(10);
        doc.setDrawColor(...styles.border.color);

        // En-tête du tableau avec couleur orange
        doc.setFillColor(...styles.accent.color);
        doc.roundedRect(margin, yPosition, col1Width, lineHeight, 1, 1, 'F');
        doc.roundedRect(margin + col1Width, yPosition, col2Width, lineHeight, 1, 1, 'F');
        
        doc.setTextColor(0, 0, 0); // Noir sur fond orange
        doc.text('Champ', margin + cellPadding, yPosition + 5);
        doc.text('Valeur', margin + col1Width + cellPadding, yPosition + 5);
        
        yPosition += lineHeight;

        // Corps du tableau avec style sombre
        employeeInfo.forEach((info, i) => {
          // Alternance des couleurs de fond sombres
          if (i % 2 === 0) {
            doc.setFillColor(...styles.cardBg.color);
          } else {
            doc.setFillColor(55, 65, 81);
          }
          
          // Dessiner les cellules avec fond
          doc.roundedRect(margin, yPosition, col1Width, lineHeight, 1, 1, 'F');
          doc.roundedRect(margin + col1Width, yPosition, col2Width, lineHeight, 1, 1, 'F');
          
          // Bordures subtiles
          doc.setDrawColor(...styles.border.color);
          doc.setLineWidth(0.2);
          doc.roundedRect(margin, yPosition, col1Width, lineHeight, 1, 1);
          doc.roundedRect(margin + col1Width, yPosition, col2Width, lineHeight, 1, 1);
          
          // Texte du label en blanc
          doc.setTextColor(...styles.text.color);
          doc.text(info.label, margin + cellPadding, yPosition + 5);
          
          // Valeur en orange
          doc.setTextColor(...styles.accent.color);
          doc.text(info.value, margin + col1Width + cellPadding, yPosition + 5);
          
          yPosition += lineHeight;
        });

        yPosition += 10;

        // Scores par catégorie avec style AssessmentComponent
        if (response.categoryScores?.length > 0) {
          addSubSection('Scores par catégorie');
          
          const barHeight = 6;
          const maxBarWidth = pageWidth * 0.6;
          
          response.categoryScores.forEach(category => {
            const score = Math.round(category.score || 0);
            const barWidth = (score / 100) * maxBarWidth;
            
            // Nom de la catégorie en blanc
            doc.setTextColor(...styles.text.color);
            doc.text(`${category.categoryShort || category.categoryAngShort}:`, margin, yPosition + barHeight/2 + 1);
            
            // Barre de fond sombre
            doc.setFillColor(75, 85, 99);
            doc.roundedRect(margin + 20, yPosition, maxBarWidth, barHeight, 2, 2, 'F');
            
            // Barre de score avec couleurs adaptées au thème sombre
            if (score >= 75) {
              doc.setFillColor(34, 197, 94); // Vert plus vif
            } else if (score >= 50) {
              doc.setFillColor(255, 165, 0); // Orange vif
            } else if (score >= 25) {
              doc.setFillColor(255, 126, 0); // Orange-rouge
            } else {
              doc.setFillColor(239, 68, 68); // Rouge
            }
            
            doc.roundedRect(margin + 20, yPosition, barWidth, barHeight, 2, 2, 'F');
            
            // Texte du score en blanc
            doc.setTextColor(...styles.text.color);
            doc.text(`${score}%`, margin + 25 + maxBarWidth, yPosition + barHeight/2 + 1);
            
            yPosition += 10;
          });
        }
      };

      // Ajouter le pied de page
      const addFooter = () => {
        doc.setFontSize(styles.footer.size);
        doc.setTextColor(...styles.footer.color);
        doc.text(
          `Rapport généré par KBI-Lytics - © ${new Date().getFullYear()} - ${clientData.companyName}`,
          margin,
          doc.internal.pageSize.getHeight() - 10
        );
      };

      // Génération du contenu PDF
      applyBlackBackground(); // Appliquer le fond noir à la première page
      addHeader();
      addSectionTitle('Statistiques Globales');
      addGlobalStats();

      // Ajouter une page par employé
      addSectionTitle('Détails par Employé');
      responses.forEach((response, index) => {
        addEmployeePage(response, index);
      });

      // Ajouter le pied de page à chaque page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter();
      }

      // Sauvegarder le PDF
      const fileName = `reponses_employes_${clientData.companyName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  const buttonClasses = "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer";
  const isDisabled = !clientData || responses.length === 0;

  if (asDiv) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isDisabled ? undefined : generatePDF}
        className={`${buttonClasses} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
            e.preventDefault();
            generatePDF();
          }
        }}
      >
        <Download className="h-4 w-4" />
        Exporter en PDF
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={generatePDF}
      className={buttonClasses}
      disabled={isDisabled}
    >
      <Download className="h-4 w-4" />
      Exporter en PDF
    </motion.button>
  );
};

export default ExportPDFButton;