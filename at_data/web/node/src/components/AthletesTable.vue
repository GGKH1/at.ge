<template>
  <div class="container mx-auto p-4">
    <!-- Error Alert -->
    <div v-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <span class="block sm:inline">{{ error }}</span>
      <span class="absolute top-0 right-0 px-4 py-3" @click="error = ''">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
        </svg>
      </span>
    </div>

    <!-- Search Bar -->
    <div class="mb-4">
      <input
        type="text"
        v-model="search"
        placeholder="Search athletes..."
        class="w-full max-w-sm px-4 py-2 border rounded"
        @input="filterAthletes"
      />
    </div>

    <!-- Add Athlete Form -->
    <form @submit.prevent="addAthlete" class="mb-4">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <input
          v-model="newAthlete.name"
          placeholder="Name"
          class="px-4 py-2 border rounded"
          required
        />
        <select
          v-model="newAthlete.gender"
          class="px-4 py-2 border rounded"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          v-model="newAthlete.sport"
          placeholder="Sport"
          class="px-4 py-2 border rounded"
          required
        />
        <input
          v-model.number="newAthlete.age"
          type="number"
          placeholder="Age"
          class="px-4 py-2 border rounded"
          required
        />
        <input
          v-model="newAthlete.country"
          placeholder="Country"
          class="px-4 py-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Adding...' : 'Add Athlete' }}
      </button>
    </form>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Athletes Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border">
        <thead>
          <tr>
            <th class="px-6 py-3 border-b bg-gray-100">Name</th>
            <th class="px-6 py-3 border-b bg-gray-100">Gender</th>
            <th class="px-6 py-3 border-b bg-gray-100">Sport</th>
            <th class="px-6 py-3 border-b bg-gray-100">Age</th>
            <th class="px-6 py-3 border-b bg-gray-100">Country</th>
            <th class="px-6 py-3 border-b bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="athlete in filteredAthletes" :key="athlete.id">
            <td class="px-6 py-4 border-b">{{ athlete.name }}</td>
            <td class="px-6 py-4 border-b">{{ athlete.gender }}</td>
            <td class="px-6 py-4 border-b">{{ athlete.sport }}</td>
            <td class="px-6 py-4 border-b">{{ athlete.age }}</td>
            <td class="px-6 py-4 border-b">{{ athlete.country }}</td>
            <td class="px-6 py-4 border-b">
              <button
                @click="confirmDelete(athlete)"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                :disabled="isLoading"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="filteredAthletes.length === 0">
            <td colspan="6" class="px-6 py-4 text-center border-b">
              {{ search ? 'No athletes match your search' : 'No athletes available' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">Confirm Deletion</h3>
        <p>Are you sure you want to delete {{ athleteToDelete?.name }}?</p>
        <div class="mt-4 flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            @click="deleteAthlete"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AthletesTable',
  setup() {
    const athletes = ref([])
    const search = ref('')
    const error = ref('')
    const isLoading = ref(false)
    const showDeleteModal = ref(false)
    const athleteToDelete = ref(null)
    const newAthlete = ref({
      name: '',
      gender: '',
      sport: '',
      age: '',
      country: ''
    })

    // Computed property for filtered athletes
    const filteredAthletes = computed(() => {
      if (!search.value) return athletes.value
      const searchTerm = search.value.toLowerCase()
      return athletes.value.filter(athlete => 
        athlete.name.toLowerCase().includes(searchTerm) ||
        athlete.sport.toLowerCase().includes(searchTerm) ||
        athlete.country.toLowerCase().includes(searchTerm)
      )
    })

    const fetchAthletes = async () => {
      isLoading.value = true
      error.value = ''
      try {
        const response = await axios.get('http://localhost:3000/api/athletes')
        console.log('Response:', response);
        athletes.value = response.data.data || []
      } catch (err) {
        error.value = 'Failed to fetch athletes. Please try again later.'
        console.error('Error fetching athletes:', err);
      } finally {
        isLoading.value = false
      }
    }

    const addAthlete = async () => {
      isLoading.value = true
      error.value = ''
      try {
        await axios.post('http://localhost:3000/api/athletes', newAthlete.value)
        newAthlete.value = { name: '', gender: '', sport: '', age: '', country: '' }
        await fetchAthletes()
      } catch (err) {
        error.value = 'Failed to add athlete. Please try again.'
        console.error('Error adding athlete:', err)
      } finally {
        isLoading.value = false
      }
    }

    const confirmDelete = (athlete) => {
      athleteToDelete.value = athlete
      showDeleteModal.value = true
    }

    const deleteAthlete = async () => {
      if (!athleteToDelete.value) return

      isLoading.value = true
      error.value = ''
      try {
        await axios.delete(`http://localhost:3000/api/athletes/${athleteToDelete.value.id}`)
        await fetchAthletes()
        showDeleteModal.value = false
        athleteToDelete.value = null
      } catch (err) {
        error.value = 'Failed to delete athlete. Please try again.'
        console.error('Error deleting athlete:', err)
      } finally {
        isLoading.value = false
      }
    }

    const filterAthletes = () => {
      // Debounce could be added here if needed
      // For now, filtering happens instantly through computed property
    }

    onMounted(fetchAthletes)

    return {
      athletes,
      filteredAthletes,
      search,
      newAthlete,
      error,
      isLoading,
      showDeleteModal,
      athleteToDelete,
      addAthlete,
      deleteAthlete,
      confirmDelete,
      filterAthletes
    }
  }
}
</script>