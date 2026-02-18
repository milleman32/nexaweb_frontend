/**
 * NexaWeb Agency — contact-form.js
 * Version finale corrigée
 */

const CONFIG = {
  API_URL:    'https://nexaweb-agency.onrender.com/contact',
  WA_NUMBER:  '261327743094',
  WA_DELAY_MS: 3000,
};

document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('contactForm');
  const successDiv = document.getElementById('successMsg');
  const submitBtn  = form?.querySelector('.form-submit');
  
  if (!form) {
    console.error('Formulaire #contactForm introuvable');
    return;
  }
  
  console.log('Form trouvé:', form);
  console.log('SuccessDiv trouvé:', successDiv);

  // ── VALIDATION TEMPS RÉEL ──────────────────────────────────
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
    field.addEventListener('blur',  () => validateField(field));
    field.addEventListener('input', () => clearFieldError(field));
  });

  function validateField(field) {
    const val = field.value.trim();
    if (field.required && !val) {
      setFieldError(field, getFieldLabel(field) + ' est requis(e).');
      return false;
    }
    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setFieldError(field, 'Adresse email invalide.');
      return false;
    }
    clearFieldError(field);
    return true;
  }

  function getFieldLabel(field) {
    const label = field.closest('.form-group')?.querySelector('label');
    return label ? label.textContent.replace('*','').trim() : 'Ce champ';
  }

  function setFieldError(field, msg) {
    clearFieldError(field);
    field.style.borderColor = '#E84040';
    field.style.boxShadow   = '0 0 0 3px rgba(232,64,64,0.1)';
    const err = document.createElement('span');
    err.className   = 'field-error';
    err.textContent = msg;
    err.style.cssText = 'color:#E84040;font-size:.76rem;margin-top:5px;display:block;font-weight:500;';
    field.parentNode.appendChild(err);
  }

  function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
    field.parentNode.querySelector('.field-error')?.remove();
  }

  // ── SOUMISSION ─────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valider tous les champs requis
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      if (!validateField(f)) valid = false;
    });
    if (!valid) {
      form.querySelector('.field-error')
        ?.closest('.form-group')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // État loading
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Envoi en cours...';

    // Construire FormData depuis les attributs name du HTML
    const formData = new FormData(form);

    // Ajouter les cases à cocher manuellement
    const checkedFeats = [...form.querySelectorAll('.checkbox-item input:checked')]
      .map(cb => cb.nextElementSibling?.textContent?.trim())
      .filter(Boolean).join(', ');
    formData.set('fonctionnalites', checkedFeats);

    // Log pour debug
    console.log('Données envoyées :');
    for (let [key, val] of formData.entries()) {
      console.log(' ', key, ':', val);
    }

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        body:   formData,
      });

      const result = await response.json();
      console.log('Réponse serveur :', result);

      if (result.success) {
        showSuccess(result);
      } else {
        showError(result.message || 'Erreur d\'envoi.', result.wa_url);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

    } catch (err) {
      console.error('Erreur réseau:', err);
      showError('Problème de connexion.', null);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  // ── SUCCÈS ─────────────────────────────────────────────────
  function showSuccess(result) {
    console.log('showSuccess appelé');
    
    // Cacher le formulaire
    form.style.display = 'none';
    
    // Si successDiv existe, l'afficher
    if (successDiv) {
      successDiv.style.display = 'block';
      successDiv.classList.add('show');
      
      // Supprimer les anciens boutons WA si présents
      successDiv.querySelectorAll('.wa-btn-block').forEach(el => el.remove());
      
      // Ajouter le bouton WhatsApp
      if (result.wa_url) {
        const waBlock = document.createElement('div');
        waBlock.className = 'wa-btn-block';
        waBlock.style.cssText = 'margin-top:28px;text-align:center;';
        waBlock.innerHTML = `
          <p style="font-size:.9rem;color:#6B7A8D;margin-bottom:16px;line-height:1.6;">
            Pour une réponse encore plus rapide, confirmez aussi votre demande sur WhatsApp :
          </p>
          <a href="${result.wa_url}" target="_blank" style="
            display:inline-flex;align-items:center;gap:10px;
            background:#25D366;color:#fff;padding:14px 32px;
            border-radius:10px;font-weight:700;font-size:.95rem;
            text-decoration:none;box-shadow:0 4px 16px rgba(37,211,102,0.3);
            transition:transform 0.2s;
          ">
            💬 Ouvrir WhatsApp
          </a>
        `;
        successDiv.appendChild(waBlock);

        // Scroll vers le message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Ouvrir WhatsApp automatiquement après délai
       
      
    } else {
      // Fallback si successDiv n'existe pas - créer un message
      console.warn('successDiv introuvable - création dynamique');
      const fallbackMsg = document.createElement('div');
      fallbackMsg.style.cssText = `
        background:#E6F7EB;border:2px solid #2BA84A;border-radius:16px;
        padding:40px 32px;text-align:center;margin:32px auto;max-width:600px;
      `;
      fallbackMsg.innerHTML = `
        <div style="font-size:3rem;margin-bottom:16px;">🎉</div>
        <h3 style="color:#1A7C36;font-size:1.4rem;margin-bottom:12px;">Message envoyé avec succès !</h3>
        <p style="color:#6B7A8D;font-size:.95rem;margin-bottom:24px;">
          Merci pour votre message. Notre équipe vous contactera dans les 24h avec un devis personnalisé.
        </p>
        ${result.wa_url ? `
          <p style="font-size:.9rem;color:#6B7A8D;margin-bottom:16px;">
            Pour une réponse encore plus rapide :
          </p>
          <a href="${result.wa_url}" target="_blank" style="
            display:inline-flex;align-items:center;gap:10px;
            background:#25D366;color:#fff;padding:14px 32px;
            border-radius:10px;font-weight:700;font-size:.95rem;
            text-decoration:none;
          ">💬 Ouvrir WhatsApp</a>
        ` : ''}
      `;
      form.parentNode.insertBefore(fallbackMsg, form.nextSibling);
      fallbackMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      if (result.wa_url) {
        setTimeout(() => window.open(result.wa_url, '_blank'), CONFIG.WA_DELAY_MS);
      }
    }
  }

  // ── ERREUR + FALLBACK WHATSAPP ─────────────────────────────
  function showError(msg, waUrl) {
    const fallbackUrl = waUrl ||
      `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent('Bonjour NexaWeb Agency ! Je souhaite un devis pour mon projet web.')}`;

    form.querySelector('.error-banner')?.remove();

    const banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.style.cssText = `
      background:#FEF0E7;border:2px solid #F47C30;border-radius:12px;
      padding:18px 22px;margin-bottom:24px;
    `;
    banner.innerHTML = `
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:1.5rem;flex-shrink:0;">⚠️</span>
        <div>
          <strong style="color:#C45B10;display:block;margin-bottom:5px;">
            Problème d'envoi — ne vous inquiétez pas !
          </strong>
          <span style="font-size:.87rem;color:#6B7A8D;">${msg}</span>
          <div style="margin-top:14px;">
            <a href="${fallbackUrl}" target="_blank" style="
              display:inline-flex;align-items:center;gap:8px;
              background:#25D366;color:#fff;padding:10px 22px;
              border-radius:8px;font-weight:700;font-size:.88rem;text-decoration:none;
            ">💬 Nous contacter sur WhatsApp</a>
          </div>
        </div>
      </div>
    `;
    form.prepend(banner);
    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Ouvrir WhatsApp automatiquement après délai
        
      }
    }
  });

// Fonction globale WhatsApp
window.openWA = function(msg) {
  const text = msg || 'Bonjour NexaWeb Agency 👋\n\nJe souhaite un devis pour mon projet web.';
  window.open(`https://wa.me/261327743094?text=${encodeURIComponent(text)}`, '_blank');
};
