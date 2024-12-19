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
    <input
      type="text"
      v-model="search"
      placeholder="Search coaches..."
      class="w-full px-4 py-2 mb-4 border rounded-lg"
      @input="filterCoaches"
    />

    <!-- Add Coach Form -->
    <form @submit.prevent="addCoach">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <input
          v-model="newCoach.name"
          placeholder="Name"
          class="px-4 py-2 border rounded-lg"
          required
        />
        <select
          v-model="newCoach.gender"
          class="px-4 py-2 border rounded-lg"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          v-model="newCoach.sport"
          placeholder="Sport"
          class="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          v-model.number="newCoach.age"
          placeholder="Age"
          class="px-4 py-2 border rounded-lg"
          required
        />
        <input
          v-model="newCoach.country"
          placeholder="Country"
          class="px-4 py-2 border rounded-lg"
          required
        />
      </div>
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-6 disabled:bg-blue-300"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Adding...' : 'Add Coach' }}
      </button>
    </form>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Coaches Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="text-left px-6 py-3">Name</th>
            <th class="text-left px-6 py-3">Gender</th>
            <th class="text-left px-6 py-3">Sport</th>
            <th class="text-left px-6 py-3">Age</th>
            <th class="text-left px-6 py-3">Country</th>
            <th class="text-left px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coach in filteredCoaches" :key="coach.id" class="border-t">
            <td class="px-6 py-4">{{ coach.name }}</td>
            <td class="px-6 py-4">{{ coach.gender }}</td>
            <td class="px-6 py-4">{{ coach.sport }}</td>
            <td class="px-6 py-4">{{ coach.age }}</td>
            <td class="px-6 py-4">{{ coach.country }}</td>
            <td class="px-6 py-4">
              <button
                @click="confirmDelete(coach)"
                class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-red-300"
                :disabled="isLoading"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="filteredCoaches.length === 0">
            <td colspan="6" class="px-6 py-4 text-center">
              {{ search ? 'No coaches match your search' : 'No coaches available' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">Confirm Deletion</h3>
        <p>Are you sure you want to delete {{ coachToDelete?.name }}?</p>
        <div class="mt-4 flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            @click="deleteCoach"
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
  name: 'CoachesTable',
  setup() {
    const coaches = ref([])
    const search = ref('')
    const error = ref('')
    const isLoading = ref(false)
    const showDeleteModal = ref(false)
    const coachToDelete = ref(null)
    const newCoach = ref({
      name: '',
      gender: '',
      sport: '',
      age: '',
      country: ''
    })

    // Computed property for filtered coaches
    const filteredCoaches = computed(() => {
      if (!search.value) return coaches.value
      const searchTerm = search.value.toLowerCase()
      return coaches.value.filter(coach => 
        coach.name.toLowerCase().includes(searchTerm) ||
        coach.sport.toLowerCase().includes(searchTerm) ||
        coach.country.toLowerCase().includes(searchTerm)
      )
    })

    const fetchCoaches = async () => {
      isLoading.value = true
      error.value = ''
      try {
        const response = await axios.get('http://localhost:3000/api/coaches')
        coaches.value = response.data.data || []
      } catch (err) {
        error.value = 'Failed to fetch coaches. Please try again later.'
        console.error('Error fetching coaches:', err)
      } finally {
        isLoading.value = false
      }
    }

    const addCoach = async () => {
      isLoading.value = true
      error.value = ''
      try {
        await axios.post('http://localhost:3000/api/coaches', newCoach.value)
        newCoach.value = { name: '', gender: '', sport: '', age: '', country: '' }
        await fetchCoaches()
      } catch (err) {
        error.value = 'Failed to add coach. Please try again.'
        console.error('Error adding coach:', err)
      } finally {
        isLoading.value = false
      }
    }

    const confirmDelete = (coach) => {
      coachToDelete.value = coach
      showDeleteModal.value = true
    }

    const deleteCoach = async () => {
      if (!coachToDelete.value) return

      isLoading.value = true
      error.value = ''
      try {
        await axios.delete(`http://localhost:3000/api/coaches/${coachToDelete.value.id}`)
        await fetchCoaches()
        showDeleteModal.value = false
        coachToDelete.value = null
      } catch (err) {
        error.value = 'Failed to delete coach. Please try again.'
        console.error('Error deleting coach:', err)
      } finally {
        isLoading.value = false
      }
    }

    const filterCoaches = () => {
      // Filtering happens through computed property
    }

    onMounted(fetchCoaches)

    return {
      coaches,
      filteredCoaches,
      search,
      newCoach,
      error,
      isLoading,
      showDeleteModal,
      coachToDelete,
      addCoach,
      deleteCoach,
      confirmDelete,
      filterCoaches
    }
  }
}
</script>