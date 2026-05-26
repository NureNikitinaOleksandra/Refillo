package com.example.refillostaff.presentation.login

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.refillostaff.data.local.SessionManager
import com.example.refillostaff.data.remote.ApiClient
import com.example.refillostaff.databinding.ActivityLoginBinding
import com.example.refillostaff.domain.model.LoginRequest
import com.example.refillostaff.presentation.main.MainActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Використовуємо ViewBinding
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // Перевіряємо, чи вже є токен (щоб не логінитись щоразу)
        if (sessionManager.fetchAuthToken() != null) {
            navigateToMain()
        }

        binding.btnLogin.setOnClickListener {
            performLogin()
        }
    }

    private fun performLogin() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Заповніть всі поля", Toast.LENGTH_SHORT).show()
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.btnLogin.isEnabled = false

        // Запускаємо корутину для мережевого запиту
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val request = LoginRequest(email, password)
                val response = ApiClient.apiService.login(request)

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body() != null) {
                        val userRole = response.body()!!.user.role

                        // Перевіряємо роль: дозволяємо тільки Працівникам та Кур'єрам
                        if (userRole == "EMPLOYEE" || userRole == "COURIER") {
                            sessionManager.saveAuthToken("Bearer ${response.body()!!.token}")
                            sessionManager.saveUserRole(userRole)
                            navigateToMain()
                        } else {
                            // Якщо це CUSTOMER (або хтось інший)
                            Toast.makeText(this@LoginActivity, "Доступ заборонено: додаток лише для персоналу", Toast.LENGTH_LONG).show()
                        }
                    } else {
                        Toast.makeText(this@LoginActivity, "Невірний email або пароль", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.btnLogin.isEnabled = true
                    Toast.makeText(this@LoginActivity, "Помилка мережі", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun navigateToMain() {
        Toast.makeText(this, "Успішний вхід!", Toast.LENGTH_SHORT).show()
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }
}