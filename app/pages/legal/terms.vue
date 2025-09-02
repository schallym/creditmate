<script setup lang="ts">
const { locale } = useI18n();

useHead({
  title: $t('meta.terms.title'),
  meta: [
    { name: 'description', content: $t('meta.terms.description') }
  ]
});
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
      Conditions Générales d’Utilisation (CGU) – CreditMate
    </h1>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Date de dernière mise à jour : 25 juillet 2025
      </p>
      <p class="mb-4">
        Les présentes conditions générales d’utilisation (ci-après « CGU ») ont pour objet de définir les modalités d’accès et d’utilisation de l’application <b>CreditMate</b>, accessible à l’adresse : <ULink to="https://www.creditmate.fr">www.creditmate.fr</ULink>
      </p>
      <p>
        L’utilisation de l’application implique l’acceptation pleine et entière des présentes CGU.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Présentation de CreditMate
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        <b>CreditMate</b> est une application web permettant aux utilisateurs d’analyser, de suivre et de mieux comprendre l’évolution de leurs crédits (immobilier, consommation, auto, etc.) grâce à des visualisations graphiques et des outils de simulation financière.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Accès au service
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        L’accès à l’application est réservé aux utilisateurs disposant d’un compte personnel. Pour créer un compte, l’utilisateur doit fournir des informations exactes et les maintenir à jour.
      </p>
      <p class="mb-4">
        L’accès peut se faire via un navigateur web moderne depuis un ordinateur, une tablette ou un smartphone connecté à Internet.
      </p>
      <p class="mb-4">
        L’éditeur se réserve le droit de suspendre ou de supprimer un compte utilisateur en cas de non-respect des présentes CGU.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Création de compte et sécurité
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        L’utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute connexion via ces identifiants est réputée avoir été faite par l’utilisateur lui-même.
      </p>
      <p class="mb-4">
        En cas de suspicion d’utilisation frauduleuse de son compte, l’utilisateur doit en informer l’éditeur sans délai.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Utilisation autorisée
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      L’utilisateur s’engage à utiliser <b>CreditMate</b> :
      <ul class="list-disc ms-10 mb-4">
        <li>Uniquement à des fins personnelles et non commerciales</li>
        <li>Conformément aux lois en vigueur</li>
        <li>Sans compromettre la sécurité ou l’intégrité de la plateforme</li>
      </ul>
      Il est strictement interdit de :
      <ul class="list-disc ms-10 mb-4">
        <li>Extraire ou copier massivement les données de l’application</li>
        <li>Utiliser l’application à des fins de démarchage ou de publicité non sollicitée</li>
        <li>Introduire de virus ou tout code malveillant</li>
      </ul>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Fonctionnalités proposées
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      L’application propose notamment :
      <ul class="list-disc ms-10 mb-4">
        <li>Une visualisation graphique de l’évolution du crédit</li>
        <li>Un simulateur de remboursement anticipé</li>
        <li>Une mise en relation facultative avec des partenaires spécialisés</li>
      </ul>
      <p class="mb-4">
        Certaines fonctionnalités peuvent nécessiter l’activation volontaire ou un consentement préalable de l’utilisateur.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Responsabilité
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        L’application fournit des outils d’aide à la décision, mais ne constitue pas un conseil financier personnalisé. L’utilisateur reste seul responsable de l’usage des données et simulations fournies par l’application.
      </p>
      <b>CreditMate</b> s’efforce de maintenir le service disponible et sécurisé, mais ne peut être tenu responsable :
      <ul class="list-disc ms-10 mb-4">
        <li>D’éventuelles interruptions ou dysfonctionnements techniques</li>
        <li>D’erreurs dans les données saisies par l’utilisateur</li>
        <li>De pertes ou dommages indirects résultant de l’usage de l’application</li>
      </ul>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Propriété intellectuelle
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Tous les contenus, marques, logos, graphismes et fonctionnalités présents sur <b>CreditMate</b> sont protégés par le droit de la propriété intellectuelle et sont la propriété exclusive de l’éditeur.
      </p>
      <p class="mb-4">
        Toute reproduction, modification ou diffusion sans autorisation écrite est interdite.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Données personnelles
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        L’utilisation de <b>CreditMate</b> implique la collecte de certaines données personnelles. Leur traitement est décrit dans la Politique de confidentialité, accessible ici : <ULink to="/privacy">Politique de confidentialité</ULink>.
      </p>
      <p class="mb-4">
        L’utilisateur dispose de droits d’accès, de rectification, de suppression et d’opposition conformément au RGPD.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Durée, résiliation et suppression de compte
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Les présentes CGU sont conclues pour une durée indéterminée à compter de l’inscription de l’utilisateur.
      </p>
      <p class="mb-4">
        L’utilisateur peut résilier son compte à tout moment depuis les paramètres de son espace personnel ou en contactant le support.
      </p>
      <p class="mb-4">
        L’éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des CGU, sans préavis.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Modification des CGU
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        L’éditeur peut modifier à tout moment les présentes CGU. L’utilisateur sera informé de toute modification importante lors de sa prochaine connexion. L’utilisation continue du service vaut acceptation des nouvelles CGU.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Loi applicable et juridiction compétente
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social de l’éditeur, sauf disposition légale contraire.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Contact
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Pour toute question relative aux CGU ou au service, vous pouvez contacter :
      </p>
      <p class="mb-4">
        Email : <ULink to="mailto:maximilien.schall@gmail.com">maximilien.schall@gmail.com</ULink>
      </p>
    </div>
  </section>
</template>
