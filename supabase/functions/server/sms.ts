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

  // Formater le numéro au format international Wassoya: 2250700000000
  let formattedPhone = phone;
  if (phone.startsWith('0')) {
    // 0701020304 → 2250701020304
    formattedPhone = `225${phone.substring(1)}`;
  } else if (phone.startsWith('+225')) {
    // +2250701020304 → 2250701020304
    formattedPhone = phone.substring(1);
  } else if (phone.startsWith('225')) {
    // Déjà au bon format: 2250701020304
    formattedPhone = phone;
  } else {
    console.error(`❌ Format de numéro invalide: ${phone}`);
    return {
      success: false,
      error: `Format de numéro invalide: ${phone}`
    };
  }

  // Valider le format du numéro (doit être 225 + 10 chiffres)
  if (!formattedPhone.match(/^225\d{10}$/)) {
    console.error(`❌ Numéro invalide après formatage: ${formattedPhone}`);
    return {
      success: false,
      error: `Numéro invalide: doit être au format 2250XXXXXXXXX`
    };
  }

  console.log(`📱 Envoi SMS via Wassoya à ${formattedPhone}: "${message}"`);
  console.log(`📤 Paramètres: from="${senderId}", to="${formattedPhone}", content="${message.substring(0, 50)}..."`);

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
      body: JSON.stringify({
        from: senderId,           // Nom de l'expéditeur (11 caractères max)
        to: formattedPhone,       // Numéro format international (2250700000000)
        content: message,         // Contenu du message (160 caractères max)
        // notifyUrl: optionnel - on peut l'ajouter plus tard si nécessaire
      })
    });

    const data: WassoyaAPIResponse = await response.json();

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
  // - 0701020304 (local)
  // - +2250701020304 (international avec +)
  // - 2250701020304 (international sans +)
  
  const patterns = [
    /^0[0-9]{9}$/,           // 0701020304
    /^\+225[0-9]{10}$/,      // +2250701020304
    /^225[0-9]{10}$/,        // 2250701020304
  ];

  return patterns.some(pattern => pattern.test(phone));
}
