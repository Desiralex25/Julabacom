/**
 * Service d'envoi de SMS via Wassoya
 * Documentation: https://wassoya.com/docs
 * 
 * API Endpoint: POST /sms/messages
 * Paramètres requis:
 * - from: Nom de l'expéditeur (11 caractères max)
 * - to: Numéro du destinataire (format international: 2250700000000)
 * - content: Contenu du message (160 caractères max)
 * - notifyUrl: URL de callback (optionnel)
 */

interface WassoyaSMSResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

interface WassoyaAPIResponse {
  messageId?: string;
  message?: string;
  error?: string;
  status?: string;
}

/**
 * Envoyer un SMS via l'API Wassoya
 * @param phone - Numéro de téléphone (format: 0701020304 ou +2250701020304)
 * @param message - Message à envoyer (max 160 caractères)
 * @returns Promise avec le résultat de l'envoi
 */
export async function sendSMS(phone: string, message: string): Promise<WassoyaSMSResponse> {
  const apiKey = Deno.env.get('WASSOYA_API_KEY');
  const apiUrl = Deno.env.get('WASSOYA_API_URL') || 'https://api.wassoya.com/sms/messages';
  const senderId = Deno.env.get('WASSOYA_SENDER_ID') || 'JULABA';

  // Vérifier que l'API key existe
  if (!apiKey) {
    console.error('❌ WASSOYA_API_KEY non configurée');
    return {
      success: false,
      error: 'Service SMS non configuré - WASSOYA_API_KEY manquante'
    };
  }

  // Valider le sender ID (11 caractères max selon la doc Wassoya)
  if (senderId.length > 11) {
    console.error(`❌ WASSOYA_SENDER_ID trop long: ${senderId.length} caractères (max 11)`);
    return {
      success: false,
      error: `Sender ID trop long: ${senderId.length}/11 caractères`
    };
  }

  // Valider le message (160 caractères max selon la doc Wassoya)
  if (message.length > 160) {
    console.warn(`⚠️ Message tronqué: ${message.length} caractères (max 160)`);
    message = message.substring(0, 160);
  }

  // Formater le numéro au format international Wassoya: 2250XXXXXXXXX
  let formattedPhone = phone.replace(/\s+/g, ''); // Enlever les espaces
  
  if (formattedPhone.startsWith('0')) {
    // Format local: 0701020304 → 2250701020304
    formattedPhone = `225${formattedPhone}`;
  } else if (formattedPhone.startsWith('+225')) {
    // International avec +: +2250701020304 → 2250701020304
    formattedPhone = formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('225')) {
    // Déjà au format international: 2250701020304
    formattedPhone = formattedPhone;
  } else if (formattedPhone.match(/^\d{10}$/)) {
    // Numéro à 10 chiffres sans indicatif (7287892982) → ajouter 225 + 0
    formattedPhone = `2250${formattedPhone}`;
  } else {
    console.error(`❌ Format de numéro invalide: ${phone}`);
    return {
      success: false,
      error: `Format de numéro invalide: ${phone}. Formats acceptés: 0701020304, +2250701020304, 2250701020304, ou 7287892982`
    };
  }

  // Valider le format final (doit être 2250 + 10 chiffres = 14 chiffres total)
  if (!formattedPhone.match(/^2250\d{9}$/)) {
    console.error(`❌ Numéro invalide après formatage: ${formattedPhone}`);
    console.error(`⚠️ Attendu: 2250XXXXXXXXX (14 chiffres commençant par 2250)`);
    return {
      success: false,
      error: `Numéro invalide: doit être au format 2250XXXXXXXXX (reçu: ${formattedPhone})`
    };
  }

  // Préparer le body de la requête
  const requestBody = {
    from: senderId,
    to: formattedPhone,
    content: message,
  };

  console.log(`📱 Envoi SMS via Wassoya`);
  console.log(`📤 URL: ${apiUrl}`);
  console.log(`📤 From: "${senderId}"`);
  console.log(`📤 To: "${formattedPhone}"`);
  console.log(`📤 Content: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
  console.log(`📤 Body complet:`, JSON.stringify(requestBody));

  try {
    // Appel API Wassoya selon la documentation officielle
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // Header alternatif au cas où Wassoya utilise X-API-Key
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 Wassoya response status: ${response.status}`);

    // Lire la réponse (text d'abord pour debug)
    const responseText = await response.text();
    console.log(`📥 Wassoya response body:`, responseText);

    let data: WassoyaAPIResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON response:', parseError);
      return {
        success: false,
        error: `Réponse invalide de Wassoya: ${responseText.substring(0, 100)}`
      };
    }

    if (!response.ok) {
      console.error(`❌ Erreur HTTP ${response.status} de Wassoya:`, data);
      return {
        success: false,
        error: data.message || data.error || `Erreur HTTP ${response.status}`
      };
    }

    console.log('✅ SMS envoyé avec succès via Wassoya:', data);
    return {
      success: true,
      messageId: data.messageId,
      message: data.message || 'SMS envoyé avec succès'
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API Wassoya:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi SMS'
    };
  }
}

/**
 * Valider un numéro de téléphone ivoirien
 * @param phone - Numéro à valider
 * @returns true si le numéro est valide
 */
export function isValidIvoryCoastPhone(phone: string): boolean {
  // Formats acceptés:
  // - 0701020304 (local avec 0)
  // - 7287892982 (local sans 0 - 10 chiffres)
  // - +2250701020304 (international avec +)
  // - 2250701020304 (international sans +)
  
  const patterns = [
    /^0[0-9]{9}$/,           // 0701020304
    /^[0-9]{10}$/,           // 7287892982 (10 chiffres sans 0)
    /^\+2250[0-9]{9}$/,      // +2250701020304
    /^2250[0-9]{9}$/,        // 2250701020304
  ];

  return patterns.some(pattern => pattern.test(phone));
}
