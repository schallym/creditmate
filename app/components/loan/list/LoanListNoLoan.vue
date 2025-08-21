<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-8">
    <div class="max-w-4xl mx-auto text-center">
      <div class="mb-8">
        <div class="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <UIcon
            name="i-lucide-euro"
            class="w-10 h-10 text-blue-500"
          />
        </div>
      </div>

      <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        <span class="text-gray-800 dark:text-gray-200">{{ $t('common.welcomeOn') }} </span>
        <span class="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          CreditMate !
        </span>
      </h1>

      <p class="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
        {{ $t('loan.list.noLoans.description') }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <NoLoanFeature
          :title="$t('loan.list.noLoans.featureOne.title')"
          :description="$t('loan.list.noLoans.featureOne.description')"
          icon="i-heroicons-calculator"
        />
        <NoLoanFeature
          :title="$t('loan.list.noLoans.featureTwo.title')"
          :description="$t('loan.list.noLoans.featureTwo.description')"
          icon="i-heroicons-chart-bar-square"
        />
        <NoLoanFeature
          :title="$t('loan.list.noLoans.featureThree.title')"
          :description="$t('loan.list.noLoans.featureThree.description')"
          icon="i-heroicons-calendar-days"
        />
      </div>

      <div class="mb-6">
        <UButton
          size="xl"
          variant="solid"
          to="/loans/add"
        >
          <template #leading>
            <UIcon
              name="i-heroicons-plus"
              class="w-5 h-5"
            />
          </template>
          {{ $t('loan.list.noLoans.cta.addFirstLoan') }}
        </UButton>
      </div>

      <p class="text-gray-500 text-sm">
        {{ $t('loan.list.noLoans.footer.text') }}
      </p>
    </div>
  </div>
</template>
