package com.example.refillostaff.presentation.history

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.refillostaff.R
import com.example.refillostaff.data.local.SessionManager
import com.example.refillostaff.data.remote.ApiClient
import com.example.refillostaff.databinding.FragmentHistoryBinding
import com.example.refillostaff.presentation.queue.OrderAdapter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class HistoryFragment : Fragment() {

    private var _binding: FragmentHistoryBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var historyAdapter: OrderAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        setupRecyclerView()
        loadHistoryData()
    }

    private fun setupRecyclerView() {
        val role = sessionManager.fetchUserRole() ?: "EMPLOYEE"

        // Використовуємо той самий OrderAdapter!
        historyAdapter = OrderAdapter(emptyList(), role) { order ->
            val bundle = Bundle().apply {
                putString("ORDER_DATA", com.google.gson.Gson().toJson(order))
            }
            // Переходимо на деталі. Кнопка дій там АВТОМАТИЧНО сховається,
            // бо статус уже "COLLECTED" або "DELIVERED"
            findNavController().navigate(R.id.orderDetailFragment, bundle)
        }
        binding.rvOrders.adapter = historyAdapter
    }

    private fun loadHistoryData() {
        val token = sessionManager.fetchAuthToken() ?: return

        binding.progressBar.visibility = View.VISIBLE
        binding.tvEmptyState.visibility = View.GONE

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                // ТУТ ЄДИНА ВІДМІННІСТЬ: викликаємо getStaffHistory замість getWorkQueue
                val response = ApiClient.apiService.getStaffHistory(token)

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE

                    if (response.isSuccessful && response.body() != null) {
                        val orders = response.body()!!

                        if (orders.isEmpty()) {
                            binding.tvEmptyState.visibility = View.VISIBLE
                        } else {
                            historyAdapter.updateData(orders)
                        }
                    } else {
                        Toast.makeText(requireContext(), "Помилка завантаження історії", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(requireContext(), "Помилка мережі", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}