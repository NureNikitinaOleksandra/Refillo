package com.example.refillostaff.presentation.queue

import android.content.res.ColorStateList
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.refillostaff.R
import com.example.refillostaff.data.local.SessionManager
import com.example.refillostaff.data.remote.ApiClient
import com.example.refillostaff.databinding.FragmentOrderDetailBinding
import com.example.refillostaff.domain.model.OrderResponse
import com.example.refillostaff.domain.model.StatusUpdateRequest
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class OrderDetailFragment : Fragment() {

    private var _binding: FragmentOrderDetailBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var order: OrderResponse
    private lateinit var role: String

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrderDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        role = sessionManager.fetchUserRole() ?: "EMPLOYEE"

        // Розпаковуємо отримані дані замовлення з JSON
        val orderJson = arguments?.getString("ORDER_DATA")
        if (orderJson == null) {
            findNavController().popBackStack()
            return
        }
        order = Gson().fromJson(orderJson, OrderResponse::class.java)

        binding.btnBack.setOnClickListener {
            findNavController().popBackStack()
        }

        setupUI()
    }

    private fun setupUI() {
        binding.tvOrderNumber.text = "Замовлення №${order.orderNumber}"
        binding.tvStatus.text = "Статус: ${translateStatus(order.orderStatus)}"

        // Налаштування інтерфейсу під роль
        if (role == "COURIER") {
            binding.cardAddress.visibility = View.VISIBLE
            binding.cardItems.visibility = View.GONE
            binding.tvAddress.text = order.deliveryAddress ?: "Адреса відсутня"
            binding.btnAction.backgroundTintList = ColorStateList.valueOf(ContextCompat.getColor(requireContext(), R.color.brand_orange))
        } else {
            binding.cardAddress.visibility = View.GONE
            binding.cardItems.visibility = View.VISIBLE
            binding.rvOrderItems.adapter = OrderDetailItemAdapter(order.orderItems)
            binding.btnAction.backgroundTintList = ColorStateList.valueOf(ContextCompat.getColor(requireContext(), R.color.brand_yellow))
        }

        // Розрахунок стану динамічної кнопки
        val nextAction = getNextAction(order.orderStatus, role)
        if (nextAction != null) {
            binding.btnAction.visibility = View.VISIBLE
            binding.btnAction.text = nextAction.first // Назва кнопки (напр. "Взяти в обробку")

            binding.btnAction.setOnClickListener {
                executeStatusUpdate(nextAction.second) // Наступний статус (напр. "IN_PROCESS")
            }
        } else {
            // Якщо для цієї ролі дій більше немає (наприклад замовлення вже зібрано працівником)
            binding.btnAction.visibility = View.GONE
        }
    }

    // Наша логіка кінцевого автомата (State Machine)
    private fun getNextAction(currentStatus: String, userRole: String): Pair<String, String>? {
        return when (userRole) {
            "EMPLOYEE" -> when (currentStatus) {
                "CREATED" -> Pair("Взяти в обробку", "IN_PROCESS")
                "IN_PROCESS" -> Pair("Зібрано", "COLLECTED")
                else -> null
            }
            "COURIER" -> when (currentStatus) {
                "COLLECTED" -> Pair("Отримати замовлення", "ACCEPTED_BY_COURIER")
                "ACCEPTED_BY_COURIER" -> Pair("Почати доставку", "EN_ROUTE")
                "EN_ROUTE" -> Pair("Доставлено (Оплачено)", "DELIVERED")
                else -> null
            }
            else -> null
        }
    }

    private fun executeStatusUpdate(nextStatus: String) {
        val token = sessionManager.fetchAuthToken() ?: return
        binding.btnAction.isEnabled = false

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.apiService.updateOrderStatus(
                    token, order.id, StatusUpdateRequest(nextStatus)
                )

                withContext(Dispatchers.Main) {
                    binding.btnAction.isEnabled = true

                    if (response.isSuccessful) {
                        Toast.makeText(requireContext(), "Статус успішно змінено!", Toast.LENGTH_SHORT).show()
                        order = order.copy(orderStatus = nextStatus)
                        setupUI()

                        // Якщо це КІНЦЕВИЙ статус - тільки тоді закриваємо екран
                        if (nextStatus == "COLLECTED" || nextStatus == "DELIVERED") {
                            Toast.makeText(requireContext(), "Замовлення завершено!", Toast.LENGTH_SHORT).show()
                            findNavController().popBackStack()
                        }
                    } else {
                        binding.btnAction.isEnabled = true
                        Toast.makeText(requireContext(), "Помилка зміни статусу", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.btnAction.isEnabled = true
                    Toast.makeText(requireContext(), "Помилка мережі", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun translateStatus(status: String): String {
        return when (status) {
            "CREATED" -> "Створено"
            "IN_PROCESS" -> "В обробці"
            "COLLECTED" -> "Зібрано"
            "ACCEPTED_BY_COURIER" -> "Прийнято кур'єром"
            "EN_ROUTE" -> "В дорозі"
            "DELIVERED" -> "Доставлено"
            else -> status
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}