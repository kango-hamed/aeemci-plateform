-- ===================================
-- Template d'exemple pour tester la génération d'affiches
-- ===================================

-- Récupérer l'ID du type "Annonce"
DO $$
DECLARE
    annonce_id UUID;
BEGIN
    SELECT id INTO annonce_id FROM types_contenus WHERE nom = 'Annonce';
    
    -- Insérer un template d'exemple
    INSERT INTO templates (
        type_contenu_id,
        nom,
        description,
        html_structure,
        css_styles,
        champs_config,
        largeur,
        hauteur,
        format,
        actif,
        ordre
    ) VALUES (
        annonce_id,
        'Annonce Moderne - Gradient',
        'Template moderne avec dégradé vert pour les annonces d''événements',
        '<div class="poster-container">
  <div class="logo-section">
    <div class="logo-circle">A</div>
    <div class="logo-text">
      <div class="logo-title">AEEMCI</div>
      <div class="logo-subtitle">Section ESATIC</div>
    </div>
  </div>
  
  <div class="main-content">
    <h1 class="titre">{{titre}}</h1>
    
    <div class="info-section">
      <div class="info-item">
        <span class="info-icon">📅</span>
        <span class="info-label">Date:</span>
        <span class="info-value">{{date}}</span>
      </div>
      
      <div class="info-item">
        <span class="info-icon">🕐</span>
        <span class="info-label">Heure:</span>
        <span class="info-value">{{heure}}</span>
      </div>
      
      <div class="info-item">
        <span class="info-icon">📍</span>
        <span class="info-label">Lieu:</span>
        <span class="info-value">{{lieu}}</span>
      </div>
    </div>
    
    <div class="message-section">
      <p class="message">{{message}}</p>
    </div>
  </div>
  
  <div class="footer">
    <div class="footer-line"></div>
    <p class="footer-text">Votre participation compte • AEEMCI-ESATIC</p>
  </div>
</div>',
        '.poster-container {
  width: 1080px;
  height: 1080px;
  background: linear-gradient(135deg, #1a5f3f 0%, #2d8659 50%, #1a5f3f 100%);
  position: relative;
  font-family: ''Poppins'', sans-serif;
  padding: 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 80px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: #1a5f3f;
}

.logo-text {
  color: white;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.logo-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 4px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.titre {
  font-size: 64px;
  font-weight: 700;
  color: white;
  text-align: center;
  line-height: 1.2;
  margin-bottom: 60px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.info-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 40px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  color: white;
  font-size: 28px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 36px;
}

.info-label {
  font-weight: 500;
  opacity: 0.9;
}

.info-value {
  font-weight: 700;
  margin-left: auto;
}

.message-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.message {
  font-size: 24px;
  color: white;
  line-height: 1.6;
  margin: 0;
}

.footer {
  margin-top: auto;
}

.footer-line {
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.footer-text {
  text-align: center;
  color: white;
  font-size: 18px;
  opacity: 0.8;
  margin: 0;
}',
        '[
          {
            "name": "titre",
            "label": "Titre de l''annonce",
            "type": "text",
            "required": true,
            "maxLength": 60,
            "placeholder": "Ex: Conférence sur l''entrepreneuriat"
          },
          {
            "name": "date",
            "label": "Date",
            "type": "date",
            "required": true
          },
          {
            "name": "heure",
            "label": "Heure",
            "type": "time",
            "required": true
          },
          {
            "name": "lieu",
            "label": "Lieu",
            "type": "text",
            "required": true,
            "maxLength": 80,
            "placeholder": "Ex: Amphithéâtre ESATIC"
          },
          {
            "name": "message",
            "label": "Message (optionnel)",
            "type": "textarea",
            "required": false,
            "maxLength": 200,
            "placeholder": "Ajoutez un message d''invitation ou des détails supplémentaires"
          }
        ]'::jsonb,
        1080,
        1080,
        'square',
        true,
        1
    );
END $$;
