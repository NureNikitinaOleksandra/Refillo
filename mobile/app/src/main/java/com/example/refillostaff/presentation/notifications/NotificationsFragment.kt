package com.example.refillostaff.presentation.notifications

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.refillostaff.data.local.SessionManager
import com.example.refillostaff.data.remote.ApiClient
import com.example.refillostaff.databinding.FragmentNotificationsBinding
import com.example.refillostaff.domain.model.NotificationResponse
import com.example.refillostaff.presentation.main.MainActivity
import com.example.refillostaff.presentation.notifications.NotificationAdapter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var notificationAdapter: NotificationAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        setupRecyclerView()
        loadNotifications()

        binding.btnReadAll.setOnClickListener {
            val token = sessionManager.fetchAuthToken() ?: return@setOnClickListener
            viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val response = ApiClient.apiService.markAllNotificationsAsRead(token)
                    if (response.isSuccessful) {
                        loadNotifications() // Перезавантажуємо список після успіху
                    }
                } catch (e: Exception) {
                    // Обробка помилки
                }
            }
        }
    }

    private fun loadNotifications() {
        val token = sessionManager.fetchAuthToken() ?: return

        binding.progressBar.visibility = View.VISIBLE
        binding.tvEmptyState.visibility = View.GONE

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.apiService.getNotifications(token)

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE

                    if (response.isSuccessful && response.body() != null) {
                        val list = response.body()!!

                        if (list.isEmpty()) {
                            binding.tvEmptyState.visibility = View.VISIBLE
                        } else {
                            notificationAdapter.updateData(list)
                        }
                    } else {
                        Toast.makeText(requireContext(), "Помилка завантаження", Toast.LENGTH_SHORT)
                            .show()
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

    // Під час ініціалізації адаптера передаємо роль та лямбду:
    private fun setupRecyclerView() {
        val role = sessionManager.fetchUserRole() ?: "EMPLOYEE"
        notificationAdapter = NotificationAdapter(emptyList(), role) { notificationId ->
            markAsRead(notificationId)
        }
        binding.rvNotifications.adapter = notificationAdapter
    }

    // Коли приходять дані з сервера:
    private fun handleSuccessfulResponse(list: List<NotificationResponse>) {
        if (list.isEmpty()) {
            binding.tvEmptyState.visibility = View.VISIBLE
        } else {
            notificationAdapter.updateData(list)
        }

        // Рахуємо непрочитані та оновлюємо бейдж на нижній панелі!
        val unreadCount = list.count { !it.isRead }
        (requireActivity() as? MainActivity)?.updateNotificationsBadge(unreadCount)
    }

    // Функція для кліку на одне сповіщення
    private fun markAsRead(id: String) {
        val token = sessionManager.fetchAuthToken() ?: return
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.apiService.markNotificationAsRead(token, id)
                if (response.isSuccessful) {
                    // Просто перезавантажуємо список
                    loadNotifications()
                }
            } catch (e: Exception) { /* обробка помилки */ }
        }
    }
}