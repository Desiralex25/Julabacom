/**
 * Service d'envoi de SMS via Wassoya
 * Documentation: https://wassoya.com/api-documentation
 */

interface WassoyaSMSResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Envoyer un SMS via l'API Wassoya
 * @param phone - Numéro de téléphone (format: 0701020304 ou +2250701020304)
 * @param message - Message à envoyer
 * @returns Promise avec le résultat de l'envoi
 */
export async function sendSMS(phone: string, message: string): Promise<WassoyaSMSResponse> {
  const apiKey = Deno.env.get('WASSOYA_API_KEY');
  const apiUrl = Deno.env.get('WASSOYA_API_URL') || 'https://api.wassoya.com/v1/sms/send';
  const senderId = Deno.env.get('WASSOYA_SENDER_ID') || 'JULABA';

  // Vérifier que l'API key existe
  if (!apiKey) {
    console.error('❌ WASSOYA_API_KEY non configurée');
    return {
      success: false,
      error: 'Service SMS non configuré'
    };
  }

  // Formater le numéro au format international
  let formattedPhone = phone;
  if (phone.startsWith('0')) {
    formattedPhone = `225${phone.substring(1)}`; // Retirer le 0 et ajouter 225
  } else if (phone.startsWith('+225')) {
    formattedPhone = phone.substring(1); // Retirer le +
  } else if (phone.startsWith('225')) {
    formattedPhone = phone; // Déjà au bon format
  }

  console.log(`📱 Envoi SMS via Wassoya à ${formattedPhone}: "${message}"`);

  try {
    // Format 1 : JSON (le plus courant pour les API modernes)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // Certains services utilisent aussi :
        // 'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
        sender: senderId,
        // Paramètres optionnels selon l'API Wassoya :
        // from: senderId,
        // text: message,
        // recipient: formattedPhone,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur Wassoya:', data);
      return {
        success: false,
        error: data.message || data.error || `Erreur HTTP ${response.status}`
      };
    }

    console.log('✅ SMS envoyé avec succès via Wassoya:', data);
    return {
      success: true,
      message: data.message || 'SMS envoyé'
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API Wassoya:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Format alternatif si Wassoya utilise x-www-form-urlencoded
 * Décommentez cette fonction et commentez celle ci-dessus si nécessaire
 */
/*
export async function sendSMS(phone: string, message: string): Promise<WassoyaSMSResponse> {
  const apiKey = Deno.env.get('WASSOYA_API_KEY');
  const apiUrl = Deno.env.get('WASSOYA_API_URL') || 'https://api.wassoya.com/v1/sms/send';
  const senderId = Deno.env.get('WASSOYA_SENDER_ID') || 'JULABA';

  if (!apiKey) {
    return { success: false, error: 'Service SMS non configuré' };
  }

  let formattedPhone = phone;
  if (phone.startsWith('0')) {
    formattedPhone = `225${phone.substring(1)}`;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('api_key', apiKey);
    formData.append('to', formattedPhone);
    formData.append('message', message);
    formData.append('sender', senderId);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur Wassoya:', data);
      return { success: false, error: data.message || `Erreur HTTP ${response.status}` };
    }

    console.log('✅ SMS envoyé avec succès via Wassoya');
    return { success: true, message: 'SMS envoyé' };

  } catch (error) {
    console.error('❌ Erreur Wassoya:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
*/
