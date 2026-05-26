package com.example.refillostaff.presentation.main

import android.content.res.ColorStateList
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.example.refillostaff.R
import com.example.refillostaff.data.local.SessionManager
import com.example.refillostaff.data.remote.ApiClient
import com.example.refillostaff.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        setupBottomNavigation()
        applyThemeByRole()

        checkUnreadNotifications()
    }

    private fun setupBottomNavigation() {
        // Знаходимо наш NavController
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController

        // Автоматично зв'язуємо панель з фрагментами!
        binding.bottomNavigationView.setupWithNavController(navController)
    }

    private fun applyThemeByRole() {
        val role = sessionManager.fetchUserRole() ?: "EMPLOYEE"

        // 1. Визначаємо колір для КРУЖЕЧКА (фону вибраної іконки)
        val indicatorColorRes = if (role == "COURIER") R.color.brand_orange else R.color.brand_yellow
        binding.bottomNavigationView.itemActiveIndicatorColor = ColorStateList.valueOf(
            ContextCompat.getColor(this, indicatorColorRes)
        )

        // 2. Налаштовуємо колір САМИХ ІКОНОК
        val iconColorStateList = ColorStateList(
            arrayOf(
                intArrayOf(android.R.attr.state_checked), // Стан: Вибрано
                intArrayOf(-android.R.attr.state_checked) // Стан: Не вибрано
            ),
            intArrayOf(
                ContextCompat.getColor(this, R.color.white),       // Вибрана іконка буде білою
                ContextCompat.getColor(this, R.color.brand_dark)   // Невибрані будуть темними
            )
        )

        binding.bottomNavigationView.itemIconTintList = iconColorStateList
    }

    private fun checkUnreadNotifications() {
        val token = sessionManager.fetchAuthToken() ?: return

        // Використовуємо lifecycleScope (переконайся, що імпортувала androidx.lifecycle.lifecycleScope та kotlinx.coroutines.*)
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.apiService.getNotifications(token)
                if (response.isSuccessful && response.body() != null) {
                    val unreadCount = response.body()!!.count { !it.isRead }
                    withContext(Dispatchers.Main) {
                        updateNotificationsBadge(unreadCount)
                    }
                }
            } catch (e: Exception) { /* Ігноруємо помилку в фоні */ }
        }
    }

    fun updateNotificationsBadge(unreadCount: Int) {
        val badge = binding.bottomNavigationView.getOrCreateBadge(R.id.notificationsFragment)
        if (unreadCount > 0) {
            badge.isVisible = true
            badge.number = unreadCount
            val role = sessionManager.fetchUserRole()
            badge.backgroundColor = ContextCompat.getColor(
                this,
                if (role == "COURIER") R.color.brand_orange else R.color.brand_yellow
            )
            badge.badgeTextColor = ContextCompat.getColor(this, R.color.white)
        } else {
            badge.isVisible = false
        }
    }
}