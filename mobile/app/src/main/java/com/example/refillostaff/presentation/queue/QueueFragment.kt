package com.example.refillostaff.presentation.queue

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
import com.example.refillostaff.databinding.FragmentQueueBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class QueueFragment : Fragment() {

    private var _binding: FragmentQueueBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var orderAdapter: OrderAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentQueueBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        setupRecyclerView()
        loadQueueData()
    }

    private fun setupRecyclerView() {
        val role = sessionManager.fetchUserRole() ?: "EMPLOYEE"

        orderAdapter = OrderAdapter(emptyList(), role) { order ->
            // ПАКУЄМО ОБ'ЄКТ У JSON ТА ПЕРЕХОДИМО НА ЕКРАН ДЕТАЛЕЙ
            val bundle = Bundle().apply {
                putString("ORDER_DATA", com.google.gson.Gson().toJson(order))
            }
            findNavController().navigate(R.id.orderDetailFragment, bundle)
        }
        binding.rvOrders.adapter = orderAdapter
    }

    private fun loadQueueData() {
        val token = sessionManager.fetchAuthToken() ?: return

        binding.progressBar.visibility = View.VISIBLE
        binding.tvEmptyState.visibility = View.GONE

        // Корутина для безпечного мережевого запиту
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.apiService.getWorkQueue(token)

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE

                    if (response.isSuccessful && response.body() != null) {
                        val orders = response.body()!!

                        if (orders.isEmpty()) {
                            binding.tvEmptyState.visibility = View.VISIBLE
                        } else {
                            orderAdapter.updateData(orders)
                        }
                    } else {
                        Toast.makeText(requireContext(), "Помилка завантаження черги", Toast.LENGTH_SHORT).show()
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