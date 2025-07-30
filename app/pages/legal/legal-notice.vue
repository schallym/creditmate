<script setup lang="ts">
const { locale } = useI18n();
</script>

<template>
  <section class="max-w-5xl mx-auto py-12 px-4">
    <UAlert
      v-if="locale !== 'fr'"
      title="We are sorry!"
      icon="i-lucide-languages"
      variant="subtle"
      description="This section is currently only available in French 🇫🇷"
      color="warning"
      class="mb-4"
    />

    <h1 class="text-3xl font-bold mb-6">
      Mentions légales – CreditMate
    </h1>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Date de dernière mise à jour : 25 juillet 2025
      </p>
      <p class="mb-4">
        Conformément aux dispositions des articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la confiance
        dans l’économie numérique (LCEN), les présentes mentions légales sont portées à la connaissance des utilisateurs
        du site/app Credit Mate.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Éditeur du site
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p>L’application Credit Mate est un projet open source maintenu à titre personnel et sans but commercial par :</p>
      <p>Nom : Maximilien Schall-Fonteilles</p>
      <p>Email de contact : maximlilien.schall@gmail.com</p>
      <p>Statut : Particulier – projet personnel, sans immatriculation commerciale</p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Hébergement
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p>L’application est hébergée par :</p>
      <p>Nom de l’hébergeur : Vercel</p>
      <p>Adresse : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, United States</p>
      <p>
        Site web :
        <ULink
          to="https://vercel.com"
          target="_blank"
        >www.vercel.com
        </ULink>
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Propriété intellectuelle
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Tous les contenus, marques, logos, graphismes et fonctionnalités présents sur <b>CreditMate</b> sont protégés
        par le droit de la propriété intellectuelle et sont la propriété exclusive de l’éditeur.
      </p>
      <p class="mb-4">
        Toute reproduction, modification ou diffusion sans autorisation écrite est interdite.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Responsabilité
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        L’application fournit des outils d’aide à la décision, mais ne constitue pas un conseil financier personnalisé.
        L’utilisateur reste seul responsable de l’usage des données et simulations fournies par l’application.
      </p>
      <b>CreditMate</b> s’efforce de maintenir le service disponible et sécurisé, mais ne peut être tenu responsable :
      <ul class="list-disc ms-10 mb-4">
        <li>D’éventuelles interruptions ou dysfonctionnements techniques</li>
        <li>D’erreurs dans les données saisies par l’utilisateur</li>
        <li>De pertes ou dommages indirects résultant de l’usage de l’application</li>
      </ul>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Données personnelles
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        L’utilisation de <b>CreditMate</b> implique la collecte de certaines données personnelles. Leur traitement est
        décrit dans la Politique de confidentialité, accessible ici :
        <ULink to="/privacy">Politique de confidentialité</ULink>
        .
      </p>
      <p class="mb-4">
        L’utilisateur dispose de droits d’accès, de rectification, de suppression et d’opposition conformément au RGPD.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Cookies
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p>
        L’application peut utiliser des cookies ou le stockage local pour améliorer l’expérience utilisateur (ex :
        conserver vos préférences). Aucun traqueur tiers n’est utilisé à des fins publicitaires.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Liens externes
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p>
        L’application peut contenir des liens vers des sites tiers (simulateurs, articles, etc.). Ces liens sont
        proposés à titre informatif. L’auteur ne saurait être tenu responsable du contenu ou des pratiques de ces sites.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Droit applicable
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p>
        Les présentes mentions légales sont régies par le droit français.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Contact
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p>
        Pour toute question ou demande d’information, vous pouvez contacter l’auteur à l’adresse email suivante :
        <ULink to="mailto:maximilien.schall@gmail.com">maximilien.schall@gmail.com</ULink>
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Modifications
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p>
        Ces mentions légales peuvent être modifiées à tout moment. La version en vigueur est celle accessible sur
        l’application.
      </p>
    </div>
  </section>
</template>
