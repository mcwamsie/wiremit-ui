import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Transaction, 
  TransactionData, 
  Currency,
  TransactionStatus,
  ApiResponse
} from '@/types'

export const useTransactionStore = defineStore('transactions', () => {
  // State
  const transactions = ref<Transaction[]>([])
  const isLoading = ref<boolean>(false)

  // Computed
  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const completedTransactions = computed(() => {
    return transactions.value.filter(t => t.status === 'Completed')
  })

  const pendingTransactions = computed(() => {
    return transactions.value.filter(t => t.status === 'Pending')
  })

  const totalAmount = computed(() => {
    return completedTransactions.value.reduce((sum, t) => sum + t.amount, 0)
  })

  // Actions
  const addTransaction = async (transactionData: TransactionData): Promise<ApiResponse<Transaction>> => {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newTransaction: Transaction = {
        id: Date.now(),
        ...transactionData,
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        status: (Math.random() > 0.1 ? 'Completed' : 'Pending') as TransactionStatus, // 90% success rate
        reference: Math.random().toString(36).substring(2, 8).toUpperCase()
      }
      
      transactions.value.unshift(newTransaction)
      
      // Save to localStorage
      localStorage.setItem('wiremit_transactions', JSON.stringify(transactions.value))
      
      return { success: true, data: newTransaction }
    } catch (error) {
      console.error('Transaction error:', error)
      return { success: false, error: 'Transaction failed. Please try again.' }
    } finally {
      isLoading.value = false
    }
  }

  const updateTransactionStatus = (id: number, status: TransactionStatus): void => {
    const transaction = transactions.value.find(t => t.id === id)
    if (transaction) {
      transaction.status = status
      localStorage.setItem('wiremit_transactions', JSON.stringify(transactions.value))
    }
  }

  const deleteTransaction = (id: number): void => {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index > -1) {
      transactions.value.splice(index, 1)
      localStorage.setItem('wiremit_transactions', JSON.stringify(transactions.value))
    }
  }

  const loadTransactions = (): void => {
    const saved = localStorage.getItem('wiremit_transactions')
    if (saved) {
      try {
        transactions.value = JSON.parse(saved) as Transaction[]
      } catch (error) {
        console.error('Failed to parse saved transactions:', error)
        generateMockTransactions()
      }
    } else {
      generateMockTransactions()
    }
  }

  const generateMockTransactions = (): void => {
    const mockData: Transaction[] = []
    
    const currencies: Array<{ code: Currency; country: string; rate: number }> = [
      { code: 'GBP', country: 'United Kingdom', rate: 0.74 },
      { code: 'ZAR', country: 'South Africa', rate: 17.75 }
    ]
    
    const recipients: string[] = [
      'John Smith - University of Oxford',
      'Sarah Johnson - University of Cape Town', 
      'Mike Brown - Imperial College London',
      'Lisa Davis - Stellenbosch University',
      'Tom Wilson - King\'s College London',
      'Emma White - University of Witwatersrand',
      'David Lee - Cambridge University',
      'Anna Taylor - Rhodes University',
      'James Wilson - London School of Economics',
      'Sophie Brown - University of Edinburgh',
      'Alex Thompson - University of Johannesburg',
      'Rachel Green - Durham University',
      'Daniel Clark - Warwick University',
      'Olivia Martinez - University of Bath',
      'Lucas Anderson - University of Pretoria'
    ]
    
    for (let i = 0; i < 18; i++) {
      const currency = currencies[Math.floor(Math.random() * currencies.length)]
      const amount = Number((Math.random() * 800 + 100).toFixed(2))
      const fee = currency.code === 'GBP' ? 0.1 : 0.2
      const convertedAmount = Math.ceil((amount * (1 - fee)) * currency.rate)
      const daysAgo = Math.floor(Math.random() * 90)
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      
      mockData.push({
        id: i + 1,
        recipient: recipients[Math.floor(Math.random() * recipients.length)],
        amount,
        currency: currency.code,
        convertedAmount,
        fee: (amount * fee).toFixed(2),
        status: (Math.random() > 0.15 ? 'Completed' : 'Pending') as TransactionStatus,
        date: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric'
        }),
        createdAt: date.toISOString(),
        reference: Math.random().toString(36).substring(2, 8).toUpperCase(),
        exchangeRate: currency.rate
      })
    }
    
    transactions.value = mockData
    localStorage.setItem('wiremit_transactions', JSON.stringify(transactions.value))
  }

  const clearTransactions = (): void => {
    transactions.value = []
    localStorage.removeItem('wiremit_transactions')
  }

  // Getters
  const getTransactionById = (id: number): Transaction | undefined => {
    return transactions.value.find(t => t.id === id)
  }

  const getTransactionsByStatus = (status: TransactionStatus): Transaction[] => {
    return transactions.value.filter(t => t.status === status)
  }

  const getTransactionsByCurrency = (currency: Currency): Transaction[] => {
    return transactions.value.filter(t => t.currency === currency)
  }

  return {
    // State
    transactions: sortedTransactions,
    isLoading,
    
    // Computed
    completedTransactions,
    pendingTransactions,
    totalAmount,
    
    // Actions
    addTransaction,
    updateTransactionStatus,
    deleteTransaction,
    loadTransactions,
    generateMockTransactions,
    clearTransactions,
    
    // Getters
    getTransactionById,
    getTransactionsByStatus,
    getTransactionsByCurrency
  }
})