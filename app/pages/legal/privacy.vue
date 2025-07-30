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
      Politique de confidentialité – CreditMate
    </h1>
    <p class="mb-4 text-gray-700 dark:text-gray-300">
      Date de dernière mise à jour : 25 juillet 2025
    </p>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Préambule
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        La présente politique de confidentialité a pour objectif d’informer les utilisateurs de l’application <b>CreditMate</b> sur la manière dont leurs données personnelles sont collectées, utilisées, conservées et protégées.
      </p>
      <p class="mb-4">
        <b>CreditMate</b> est une application web qui agit comme un coach financier visuel pour aider les emprunteurs à mieux suivre et comprendre l’évolution de leur crédit.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Responsable du traitement
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-2">
        Le responsable du traitement des données est : Maximilien Schall-Fonteilles, développeur de l'application <b>CreditMate</b>.
      </p>
      <p class="mb-4">
        Email : <ULink to="mailto:maximilien.schall@gmail.com">maximilien.schall@gmail.com</ULink>
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Données collectées
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <div class="mb-4">
        L’application peut collecter les types de données suivants :
        <ul class="list-disc ms-10">
          <li>Données d’identification : prénom, nom, adresse e-mail, mot de passe (chiffré).</li>
          <li>Données financières : montant du crédit, taux d’intérêt, échéancier, durée, capital remboursé, mensualités, données d’assurance.</li>
          <li>Données techniques : type de navigateur, adresse IP, données de navigation.</li>
        </ul>
      </div>
      <p>
        Certaines données sont saisies directement par l’utilisateur ; d’autres peuvent être collectées automatiquement pour améliorer le service.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Finalités du traitement
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <div class="mb-4">
        Les données collectées sont utilisées pour :
        <ul class="list-disc ms-10">
          <li>Fournir un tableau de bord visuel de suivi de crédit.</li>
          <li>Générer des simulations personnalisées de remboursement anticipé.</li>
          <li>Améliorer l’ergonomie et les performances de l’application.</li>
          <li>Proposer, avec consentement explicite, des liens vers des partenaires de renégociation ou rachat de crédit.</li>
        </ul>
      </div>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Base légale du traitement
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      Le traitement des données repose sur :
      <ul class="list-disc ms-10">
        <li>L’exécution du service demandé par l’utilisateur (article 6.1.b du RGPD).</li>
        <li>Le consentement de l’utilisateur pour les fonctionnalités facultatives comme les notifications ou la mise en relation avec des partenaires (article 6.1.a).</li>
        <li>L’intérêt légitime pour des statistiques d’usage anonymisées (article 6.1.f).</li>
      </ul>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Durée de conservation
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Les données sont conservées pendant la durée d’utilisation du service, puis supprimées ou anonymisées dans un délai de 12 mois après la dernière activité.
      </p>
      <p>
        Les données nécessaires à des obligations légales ou comptables peuvent être conservées plus longtemps.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Partage des données
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      Aucune donnée personnelle n’est vendue. Les données peuvent être transmises uniquement :
      <ul class="list-disc ms-10">
        <li>Aux partenaires de renégociation avec votre consentement explicite.</li>
        <li>À des sous-traitants techniques (hébergement, analytics) dans le respect du RGPD.</li>
      </ul>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Hébergement et sécurité
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Les données sont hébergées dans l’Union Européenne sur des serveurs sécurisés. Des mesures de sécurité (chiffrement, accès restreint) sont mises en place pour garantir la confidentialité et l’intégrité des données.
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Droits des utilisateurs
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      Conformément au RGPD, vous disposez des droits suivants :
      <ul class="list-disc ms-10">
        <li>Droit d’accès à vos données</li>
        <li>Droit de rectification ou d’effacement</li>
        <li>Droit d’opposition ou de limitation</li>
        <li>Droit à la portabilité</li>
        <li>Droit de retirer votre consentement à tout moment</li>
      </ul>
      <p>
        Pour exercer vos droits, vous pouvez nous contacter à l'adresse: <ULink to="mailto:maximilien.schall@gmail.com">maximilien.schall@gmail.com</ULink>
      </p>
      <p class="mt-4">
        Vous avez également le droit d’introduire une réclamation auprès de la CNIL :
        <ULink to="https://www.cnil.fr">
          www.cnil.fr
        </ULink>
      </p>
    </div>

    <h2 class="text-xl font-semibold mt-8 mb-2">
      Modifications de la politique de confidentialité
    </h2>
    <div class="text-gray-700 dark:text-gray-300">
      <p class="mb-4">
        Cette politique peut être modifiée à tout moment. En cas de changement majeur, les utilisateurs seront notifiés via l’application ou par email.
      </p>
    </div>
  </section>
</template>
