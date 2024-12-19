<template>
    <div class="min-h-screen bg-gray-50">
      <header class="bg-blue-600 text-white p-4 mb-6">
        <h1 class="text-2xl font-bold">Sports Management System</h1>
      </header>
  
      <main class="container mx-auto px-4">
        <!-- Athletes Section -->
        <section class="mb-8">
          <h2 class="text-xl font-bold mb-4">Athletes Management</h2>
          <div class="bg-white rounded-lg shadow p-6">
            <AthletesTable />
          </div>
        </section>
  
        <!-- Coaches Section -->
        <section class="mb-8">
          <h2 class="text-xl font-bold mb-4">Coaches Management</h2>
          <div class="bg-white rounded-lg shadow p-6">
            <CoachesTable />
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script>
  import AthletesTable from './components/AthletesTable.vue'
  import CoachesTable from './components/CoachesTable.vue'
  
  export default {
    name: 'App',
    components: {
      AthletesTable,
      CoachesTable
    }
  }
  </script>